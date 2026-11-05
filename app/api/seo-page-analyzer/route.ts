import { NextRequest, NextResponse } from "next/server";

import { getAnalyzeRatelimit } from "@/lib/ratelimit";
import { SafeFetchError, safeFetchHtml } from "@/lib/safe-fetch";
import { extractSeo } from "@/lib/seo-html";

/**
 * Page-level SEO inspector (the "SEO Page Analyzer" tool).
 *
 * This endpoint used to fetch whatever URL it was given with no validation,
 * no rate limit, no timeout and no size cap. It now shares the same hardened
 * fetcher and HTML parser as the main analyzer.
 */

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";

  const limiter = getAnalyzeRatelimit();
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return errorResponse(
          "RATE_LIMITED",
          "Too many SEO analysis requests. Please wait a moment and try again.",
          429,
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
    return errorResponse("INVALID_REQUEST", "Please enter a URL.", 400);
  }

  if (!rawUrl) {
    return errorResponse("INVALID_URL", "Please enter a URL.", 400);
  }

  const normalizedUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    const page = await safeFetchHtml(normalizedUrl);
    const extract = extractSeo(page.html, page.finalUrl);

    return NextResponse.json({
      ok: page.status < 400,
      state: page.status < 400 ? "analyzed" : "http_error",
      requestedUrl: normalizedUrl,
      finalUrl: page.finalUrl,
      status: page.status,
      redirects: page.redirects,
      title: extract.title,
      titleLength: extract.titleLength,
      description: extract.description,
      descriptionLength: extract.descriptionLength,
      canonical: extract.canonical,
      canonicalIsSelf: extract.canonicalIsSelf,
      robots: extract.robots,
      h1: extract.h1,
      h1Count: extract.h1Count,
      h2Count: extract.h2Count,
      totalLinks: extract.links.total,
      internalLinks: extract.links.internal,
      externalLinks: extract.links.external,
      totalImages: extract.images.total,
      imagesWithoutAlt: extract.images.missingAlt,
      imagesWithEmptyAlt: extract.images.emptyAlt,
      openGraph: extract.og,
      lang: extract.lang,
      pageSizeKb: Math.round(page.bytes / 1024),
    });
  } catch (error) {
    if (error instanceof SafeFetchError) {
      return errorResponse(error.code, error.message, error.httpStatus);
    }

    console.error("Page analyzer error:", error);
    return errorResponse("UPSTREAM_ERROR", "Unable to analyze this page.", 502);
  }
}
