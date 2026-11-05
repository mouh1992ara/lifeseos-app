import { NextResponse } from "next/server";

import { getAnalyzeRatelimit } from "@/lib/ratelimit";
import { SafeFetchError, safeFetchHtml } from "@/lib/safe-fetch";
import { extractSeo, scoreSeo, SENTINELS } from "@/lib/seo-html";

/**
 * SEO Analyzer endpoint.
 *
 * All fetching goes through `lib/safe-fetch` (SSRF guards, DNS pinning,
 * redirect re-validation, timeouts, size caps) and all parsing/scoring through
 * `lib/seo-html`, which uses a real HTML parser and a single score → grade →
 * status mapping.
 */

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: Request) {
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
      // Redis hiccup must not take the tool down for everyone.
    }
  }

  let rawUrl: string;
  try {
    const body = await request.json();
    rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  } catch {
    return errorResponse("INVALID_REQUEST", "Please enter a valid website URL.", 400);
  }

  if (!rawUrl) {
    return errorResponse("INVALID_URL", "URL is required", 400);
  }

  const normalizedUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    const page = await safeFetchHtml(normalizedUrl);
    const extract = extractSeo(page.html, page.finalUrl);
    const scoring = scoreSeo(extract, { httpStatus: page.status });

    return NextResponse.json({
      ok: page.status < 400,
      state: page.status < 400 ? "analyzed" : "http_error",
      httpStatus: page.status,
      url: page.finalUrl,
      requestedUrl: normalizedUrl,
      redirects: page.redirects,
      elapsedMs: page.elapsedMs,
      pageSizeKb: Math.round(page.bytes / 1024),

      score: scoring.score,
      grade: scoring.grade,
      status: scoring.status,
      indexable: scoring.indexable,

      title: extract.title || SENTINELS.title,
      description: extract.description || SENTINELS.description,
      h1: extract.h1[0] || SENTINELS.h1,
      images: {
        total: extract.images.total,
        missingAlt: extract.images.missingAlt,
        emptyAlt: extract.images.emptyAlt,
      },
      canonical: extract.canonical || SENTINELS.notFound,
      robots: extract.robots || SENTINELS.notFound,
      social: {
        ogTitle: extract.og.title || SENTINELS.notFound,
        ogDescription: extract.og.description || SENTINELS.notFound,
        ogImage: extract.og.image || SENTINELS.notFound,
        ogUrl: extract.og.url || SENTINELS.notFound,
        ogType: extract.og.type || SENTINELS.notFound,
      },
      meta: {
        titleLength: extract.titleLength,
        descriptionLength: extract.descriptionLength,
        h1Count: extract.h1Count,
        h2Count: extract.h2Count,
        canonicalIsSelf: extract.canonicalIsSelf,
        lang: extract.lang,
        https: extract.isHttps,
      },

      // Structured findings: severity + impact, for the UI and API consumers.
      issues: scoring.issues,

      passedIds: scoring.passedIds,
      passed: scoring.passed,
      errors: scoring.errors,
      warnings: scoring.warnings,
      recommendations: scoring.recommendations,
    });
  } catch (error) {
    if (error instanceof SafeFetchError) {
      return errorResponse(error.code, error.message, error.httpStatus);
    }

    console.error("SEO analyzer error:", error);
    return errorResponse("UPSTREAM_ERROR", "Unable to analyze website", 502);
  }
}
