import dnsPromises from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import { isIP, type LookupFunction } from "node:net";

/**
 * Server-side fetcher for user-supplied URLs.
 *
 * Every outbound request made on behalf of a visitor must go through here:
 *  - protocol / credential / hostname allow-list checks
 *  - DNS resolution before connecting, with every resolved address validated
 *  - the resolved address is pinned for the connection (the `lookup` hook runs
 *    the same check again), which closes DNS-rebinding holes
 *  - every redirect hop is re-validated and re-resolved
 *  - hard limits on redirects, wall-clock time, socket idle time and body size
 *
 * Never widen these checks to make a test pass: they are the only thing
 * standing between this site and an open proxy into private networks.
 */

export type FetchErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_PROTOCOL"
  | "CREDENTIALS_NOT_ALLOWED"
  | "BLOCKED_HOST"
  | "BLOCKED_ADDRESS"
  | "TOO_MANY_REDIRECTS"
  | "NOT_HTML"
  | "TOO_LARGE"
  | "TIMEOUT"
  | "UPSTREAM_ERROR";

export class SafeFetchError extends Error {
  code: FetchErrorCode;
  httpStatus: number;

  constructor(code: FetchErrorCode, message: string, httpStatus = 400) {
    super(message);
    this.name = "SafeFetchError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

const MAX_REDIRECTS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_TAGS = 200_000;
const TOTAL_TIMEOUT_MS = 10_000;
const SOCKET_IDLE_MS = 8_000;
const DNS_TIMEOUT_MS = 4_000;

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa", ".lan"];
const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "instance-data.ec2.internal",
  "kubernetes.default",
  "kubernetes.default.svc",
]);

/** IPv4 ranges that must never be reachable from a public analysis tool. */
function isBlockedIPv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    return true;
  }
  const [a, b, c] = parts;

  return (
    a === 0 || // "this network"
    a === 10 || // private
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // shared address space / CGNAT
    (a === 169 && b === 254) || // link-local (cloud metadata lives here)
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 0 && (c === 0 || c === 2)) || // IETF protocol assignments / TEST-NET-1
    (a === 192 && b === 88 && c === 99) || // 6to4 relay anycast
    (a === 192 && b === 168) || // private
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    (a === 198 && b === 51 && c === 100) || // TEST-NET-2
    (a === 203 && b === 0 && c === 113) || // TEST-NET-3
    a >= 224 // multicast, reserved, broadcast
  );
}

/** IPv6, including IPv4-mapped forms and NAT64. */
function isBlockedIPv6(ip: string) {
  const normalized = ip.toLowerCase().split("%")[0];

  if (normalized === "::" || normalized === "::1") return true;

  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice("::ffff:".length);
    if (isIP(mapped) === 4) return isBlockedIPv4(mapped);
    // ::ffff:7f00:1 style
    const hex = mapped.split(":");
    if (hex.length === 2) {
      const [hi, lo] = hex.map((h) => parseInt(h, 16));
      if (Number.isFinite(hi) && Number.isFinite(lo)) {
        const v4 = [(hi >> 8) & 255, hi & 255, (lo >> 8) & 255, lo & 255].join(".");
        return isBlockedIPv4(v4);
      }
    }
    return true;
  }

  // NAT64 well-known prefix (64:ff9b::/96) embeds an IPv4 address.
  if (normalized.startsWith("64:ff9b::")) return true;

  return (
    normalized.startsWith("fc") || // unique local fc00::/7
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) || // link-local fe80::/10
    normalized.startsWith("ff") || // multicast
    normalized.startsWith("2001:db8") || // documentation
    normalized.startsWith("2001:0") // teredo
  );
}

export function isBlockedAddress(address: string) {
  const version = isIP(address);
  if (version === 4) return isBlockedIPv4(address);
  if (version === 6) return isBlockedIPv6(address);
  // Anything we cannot classify is treated as unsafe.
  return true;
}

/** Structural validation: scheme, credentials, obviously-internal hostnames. */
export function validateTargetUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SafeFetchError("INVALID_URL", "Please enter a valid website URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SafeFetchError("UNSUPPORTED_PROTOCOL", "Only HTTP and HTTPS URLs are allowed.");
  }

  if (url.username || url.password) {
    throw new SafeFetchError("CREDENTIALS_NOT_ALLOWED", "URLs containing credentials are not allowed.");
  }

  // Normalise: lowercase, strip IPv6 brackets and the FQDN trailing dot.
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");

  if (!hostname) {
    throw new SafeFetchError("INVALID_URL", "Please enter a valid website URL.");
  }

  if (BLOCKED_HOSTS.has(hostname) || BLOCKED_HOST_SUFFIXES.some((s) => hostname.endsWith(s))) {
    throw new SafeFetchError("BLOCKED_HOST", "This website address is not allowed.");
  }

  if (isIP(hostname) && isBlockedAddress(hostname)) {
    throw new SafeFetchError(
      "BLOCKED_ADDRESS",
      "Private, loopback or internal network addresses are not allowed.",
    );
  }

  return url;
}

/** Resolve once, up front, so callers can fail fast with a precise message. */
async function resolvePublicAddresses(hostname: string): Promise<string[]> {
  if (isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new SafeFetchError(
        "BLOCKED_ADDRESS",
        "Private, loopback or internal network addresses are not allowed.",
      );
    }
    return [hostname];
  }

  let records: { address: string; family: number }[];
  try {
    records = await Promise.race([
      dnsPromises.lookup(hostname, { all: true, verbatim: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new SafeFetchError("UPSTREAM_ERROR", "Unable to resolve this website.")), DNS_TIMEOUT_MS),
      ),
    ]);
  } catch (error) {
    if (error instanceof SafeFetchError) throw error;
    throw new SafeFetchError("UPSTREAM_ERROR", "Unable to resolve this website.");
  }

  if (!records.length) {
    throw new SafeFetchError("UPSTREAM_ERROR", "Unable to resolve this website.");
  }

  const blocked = records.filter((r) => isBlockedAddress(r.address));
  if (blocked.length > 0) {
    throw new SafeFetchError(
      "BLOCKED_ADDRESS",
      "This address resolves to a private or internal network and cannot be analysed.",
    );
  }

  return records.map((r) => r.address);
}

/**
 * `lookup` hook used by the socket: it re-validates at connection time, so a
 * DNS answer that changes after our first resolution (rebinding) is rejected.
 */
function pinnedLookup(addresses: string[]) {
  const pin = addresses[0];
  const family = isIP(pin);

  type LookupCallback = (
    err: NodeJS.ErrnoException | null,
    address: string | { address: string; family: number }[],
    family?: number,
  ) => void;

  return (hostname: string, options: number | { all?: boolean }, callback: LookupCallback) => {
    if (typeof options !== "number" && options?.all) {
      callback(null, [{ address: pin, family }]);
      return;
    }
    callback(null, pin, family);
  };
}

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

export type SafeFetchResult = {
  status: number;
  finalUrl: string;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
  bytes: number;
  redirects: string[];
  elapsedMs: number;
  contentType: string;
};

type RequestOptions = {
  maxBytes?: number;
  wantBody?: boolean;
  /** Comma-separated Accept header; defaults to HTML. */
  accept?: string;
  userAgent?: string;
};

function requestOnce(url: URL, addresses: string[], options: Required<Pick<RequestOptions, "maxBytes" | "wantBody" | "accept" | "userAgent">>) {
  return new Promise<{
    status: number;
    headers: http.IncomingHttpHeaders;
    body: Buffer;
    truncated: boolean;
    location?: string;
  }>((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;

    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      reject(error);
    };
    const done = (value: {
      status: number;
      headers: http.IncomingHttpHeaders;
      body: Buffer;
      truncated: boolean;
      location?: string;
    }) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve(value);
    };

    // Covers headers *and* body: the old code only timed the handshake.
    const deadline = setTimeout(() => {
      request.destroy();
      fail(new SafeFetchError("TIMEOUT", "The website took too long to respond.", 504));
    }, TOTAL_TIMEOUT_MS);

    const request = transport.request(
      url,
      {
        method: "GET",
        headers: {
          Accept: options.accept,
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en;q=0.9,*;q=0.5",
          "User-Agent": options.userAgent,
        },
        lookup: pinnedLookup(addresses) as unknown as LookupFunction,
        servername: url.hostname,
        timeout: SOCKET_IDLE_MS,
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const headers = response.headers;

        if (REDIRECT_CODES.has(status) && headers.location) {
          response.resume();
          done({ status, headers, body: Buffer.alloc(0), truncated: false, location: headers.location });
          return;
        }

        if (!options.wantBody) {
          response.resume();
          done({ status, headers, body: Buffer.alloc(0), truncated: false });
          return;
        }

        const encoding = String(headers["content-encoding"] ?? "").toLowerCase();
        let stream: NodeJS.ReadableStream = response;

        if (encoding.includes("gzip")) stream = response.pipe(zlib.createGunzip());
        else if (encoding.includes("deflate")) stream = response.pipe(zlib.createInflate());
        else if (encoding.includes("br")) stream = response.pipe(zlib.createBrotliDecompress());

        const chunks: Buffer[] = [];
        let size = 0;
        let truncated = false;

        stream.on("data", (chunk: Buffer) => {
          if (truncated) return;
          size += chunk.length;
          if (size > options.maxBytes) {
            truncated = true;
            request.destroy();
            done({ status, headers, body: Buffer.concat(chunks), truncated: true });
            return;
          }
          chunks.push(chunk);
        });
        stream.on("end", () => done({ status, headers, body: Buffer.concat(chunks), truncated: false }));
        stream.on("error", () => fail(new SafeFetchError("UPSTREAM_ERROR", "Unable to read this website.", 502)));
        response.on("error", () => fail(new SafeFetchError("UPSTREAM_ERROR", "Unable to read this website.", 502)));
      },
    );

    request.on("timeout", () => {
      request.destroy();
      fail(new SafeFetchError("TIMEOUT", "The website took too long to respond.", 504));
    });
    request.on("error", (error) => {
      if (error instanceof SafeFetchError) return fail(error);
      fail(new SafeFetchError("UPSTREAM_ERROR", "Unable to reach this website.", 502));
    });

    request.end();
  });
}

/**
 * Fetch a URL with full SSRF protection. Throws `SafeFetchError` for anything
 * the caller should report to the visitor.
 */
export async function safeFetch(rawUrl: string, options: RequestOptions = {}): Promise<SafeFetchResult> {
  const started = Date.now();
  const maxBytes = options.maxBytes ?? MAX_BYTES;
  const wantBody = options.wantBody ?? true;
  const accept = options.accept ?? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5";
  const userAgent = options.userAgent ?? "LifeSeosBot/1.0 (+https://www.lifeseos.com)";

  let currentUrl = validateTargetUrl(rawUrl);
  const redirects: string[] = [];

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const addresses = await resolvePublicAddresses(currentUrl.hostname.replace(/^\[|\]$/g, ""));

    const result = await requestOnce(currentUrl, addresses, { maxBytes, wantBody, accept, userAgent });

    if (result.location) {
      if (redirects.length >= MAX_REDIRECTS) {
        throw new SafeFetchError("TOO_MANY_REDIRECTS", "This page redirects too many times.");
      }
      const next = new URL(result.location, currentUrl).toString();
      // Re-validate every hop: a public page must not bounce us into a private one.
      currentUrl = validateTargetUrl(next);
      redirects.push(currentUrl.toString());
      continue;
    }

    if (result.truncated) {
      throw new SafeFetchError("TOO_LARGE", "The webpage is too large to analyse.", 413);
    }

    const contentType = String(result.headers["content-type"] ?? "").toLowerCase();

    return {
      status: result.status,
      finalUrl: currentUrl.toString(),
      headers: result.headers,
      body: result.body,
      bytes: result.body.byteLength,
      redirects,
      elapsedMs: Date.now() - started,
      contentType,
    };
  }

  throw new SafeFetchError("TOO_MANY_REDIRECTS", "This page redirects too many times.");
}

/** Decode bytes using the charset advertised by the header or the document. */
export function decodeHtml(buffer: Buffer, contentType: string) {
  const fromHeader = /charset=["']?([\w-]+)/i.exec(contentType)?.[1];
  const head = buffer.subarray(0, 4096).toString("latin1");
  const fromMeta =
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
    /<meta[^>]+content=["'][^"']*charset=([\w-]+)/i.exec(head)?.[1];

  const label = (fromHeader ?? fromMeta ?? "utf-8").toLowerCase();

  try {
    return new TextDecoder(label, { fatal: false }).decode(buffer);
  } catch {
    return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  }
}

/** Fetch an HTML page, enforcing the content type before reading the body. */
export async function safeFetchHtml(rawUrl: string) {
  const result = await safeFetch(rawUrl);
  const isHtml =
    result.contentType === "" ||
    result.contentType.includes("text/html") ||
    result.contentType.includes("application/xhtml+xml");

  if (!isHtml) {
    throw new SafeFetchError("NOT_HTML", "The URL does not appear to be an HTML webpage.");
  }

  const html = decodeHtml(result.body, result.contentType);

  // A byte cap does not bound the DOM: markup with hundreds of thousands of
  // tiny elements can exhaust memory while parsing (measured: a 4 MB document
  // with 400k nodes peaks above 350 MB of heap). Guard the node count too.
  const tagCount = (html.match(/</g) || []).length;
  if (tagCount > MAX_TAGS) {
    throw new SafeFetchError("TOO_LARGE", "The webpage is too complex to analyse.", 413);
  }

  return { ...result, html };
}
