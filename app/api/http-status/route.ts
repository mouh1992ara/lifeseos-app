import { NextRequest, NextResponse } from "next/server";

import { getStatusRatelimit } from "@/lib/ratelimit";
import { SafeFetchError, safeFetch } from "@/lib/safe-fetch";

/**
 * HTTP status checker.
 *
 * Fetches headers only (no body) through the shared SSRF-safe fetcher, so a
 * visitor cannot use this endpoint to probe internal networks.
 */

const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  410: "Gone",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";

  const limiter = getStatusRatelimit();
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          {
            error: "Too many status checks. Please wait a moment and try again.",
            code: "RATE_LIMITED",
          },
          { status: 429 },
        );
      }
    } catch {
      // Limiter outages must not break the tool.
    }
  }

  let rawUrl: string;
  try {
    const body = await request.json();
    rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json({ error: "Please enter a valid URL.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  if (!rawUrl) {
    return NextResponse.json({ error: "Please enter a URL.", code: "INVALID_URL" }, { status: 400 });
  }

  const normalizedUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    const result = await safeFetch(normalizedUrl, {
      wantBody: false,
      accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
      userAgent: "LifeSeos-HTTP-Status-Checker/1.0 (+https://www.lifeseos.com)",
    });

    return NextResponse.json({
      requestedUrl: normalizedUrl,
      finalUrl: result.finalUrl,
      status: result.status,
      statusText: STATUS_TEXT[result.status] ?? "",
      redirected: result.redirects.length > 0,
      redirects: result.redirects,
      ok: result.status >= 200 && result.status < 400,
      elapsedMs: result.elapsedMs,
    });
  } catch (error) {
    if (error instanceof SafeFetchError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }

    return NextResponse.json(
      { error: "Unable to reach this URL. Check the address and try again.", code: "UPSTREAM_ERROR" },
      { status: 502 },
    );
  }
}
