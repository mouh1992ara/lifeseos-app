import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getBaiduRatelimit } from "@/lib/ratelimit";

/**
 * Baidu URL submission (普通收录 API).
 *
 * Gated by a shared token so it can never be used as an open proxy, and limited
 * to URLs on our own host: the endpoint only forwards our pages to Baidu, it
 * does not fetch anything itself.
 *
 * Required environment variables (set them in Vercel, never in the repo):
 *   BAIDU_PUSH_TOKEN  — token from ziyuan.baidu.com → 普通收录 → API 提交
 *   BAIDU_SITE        — optional override for the `site=` parameter. The bare
 *                       registered domain is emitted either way, because Baidu
 *                       rejects a scheme in `site`. Defaults to the host of
 *                       NEXT_PUBLIC_SITE_URL, i.e. `www.lifeseos.com`.
 *   NEXT_PUBLIC_SITE_URL — optional, defaults to https://www.lifeseos.com
 */

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

/**
 * The `site=` value, in the form Baidu documents.
 *
 * Baidu's 平台工具使用手册 (§2 普通收录) uses the bare registered domain in every
 * example — `site=www.example.com`, `site=www.58.com` — never a full URL. Passing
 * `site=https://www.example.com` is the well-documented cause of
 * `{"error":400,"message":"site init fail"}`.
 *
 * Note the console's own 接口调用地址 line does show `site=https://…`; that
 * displayed string is not accepted by the API. We normalise to the bare host, so
 * either form can be supplied via BAIDU_SITE and the emitted value stays correct.
 *
 * Only the query parameter uses this value. The URL allowlist below stays on the
 * canonical host, so a wrong value here can never turn the endpoint into a
 * submitter for third-party URLs.
 */
function resolveSubmitSite() {
  const raw = process.env.BAIDU_SITE?.trim() || siteUrl;
  return raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

const submitSite = resolveSubmitSite();

const pushToken = process.env.BAIDU_PUSH_TOKEN?.trim() ?? "";

// Baidu has no sandbox endpoint and every rejected call burns daily quota, so the
// upstream URL is overridable for tests. Unset in production → Baidu is used.
const pushEndpoint =
  process.env.BAIDU_PUSH_ENDPOINT?.trim() || "http://data.zz.baidu.com/urls";

const MAX_URLS = 50;

function tokenMatches(provided: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(pushToken);
  // timingSafeEqual throws on length mismatch, so compare lengths first.
  return a.length === b.length && timingSafeEqual(a, b);
}

function normaliseCandidate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `${siteUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`);
    const site = new URL(siteUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Only our own host: this endpoint must never submit third-party URLs.
    if (url.host !== site.host) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/** Reports whether the integration is configured; never returns the token. */
export async function GET() {
  return NextResponse.json({
    configured: pushToken.length > 0,
    site: siteUrl,
    // The literal `site=` value sent to Baidu — the thing that has to match the
    // property the token belongs to.
    submitSite,
    endpoint: pushEndpoint,
    maxUrlsPerRequest: MAX_URLS,
  });
}

export async function POST(request: Request) {
  if (!pushToken) {
    return NextResponse.json(
      {
        error: "Baidu submission is not configured on this deployment.",
        code: "NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";

  const limiter = getBaiduRatelimit();
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many submissions. Try again later.", code: "RATE_LIMITED" },
          { status: 429 },
        );
      }
    } catch {
      // A limiter outage must not block a legitimate submission.
    }
  }

  const provided = request.headers.get("x-baidu-token") ?? "";
  if (!tokenMatches(provided)) {
    return NextResponse.json(
      { error: "Invalid submission token.", code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON.", code: "INVALID_REQUEST" },
      { status: 400 },
    );
  }

  const raw = Array.isArray(payload)
    ? payload
    : typeof payload === "object" && payload !== null && Array.isArray((payload as { urls?: unknown }).urls)
      ? (payload as { urls: unknown[] }).urls
      : typeof payload === "string"
        ? payload.split(/\r?\n/)
        : [];

  const urls = Array.from(
    new Set(
      raw
        .map(normaliseCandidate)
        .filter((value): value is string => Boolean(value)),
    ),
  ).slice(0, MAX_URLS);

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "No valid URL on this host was provided.", code: "NO_VALID_URLS" },
      { status: 400 },
    );
  }

  const separator = pushEndpoint.includes("?") ? "&" : "?";
  const endpoint = `${pushEndpoint}${separator}site=${encodeURIComponent(
    submitSite,
  )}&token=${encodeURIComponent(pushToken)}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: urls.join("\n"),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    const text = await response.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* Baidu occasionally answers with plain text */
    }

    // Baidu reports per-request results (success / remain / not_same_site /
    // not_valid). Passing them through keeps a successful submission visibly
    // separate from an actual index (which this API does not confirm).
    return NextResponse.json(
      {
        submitted: urls,
        upstreamStatus: response.status,
        result: parsed,
        note: "Submission accepted by Baidu does not confirm indexing.",
      },
      { status: response.ok ? 200 : 502 },
    );
  } catch {
    return NextResponse.json(
      { error: "Baidu did not respond in time.", code: "UPSTREAM_ERROR" },
      { status: 504 },
    );
  }
}
