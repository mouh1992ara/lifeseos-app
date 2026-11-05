import { NextResponse } from "next/server";

import { getPageSpeedRatelimit } from "@/lib/ratelimit";
import { SafeFetchError, validateTargetUrl } from "@/lib/safe-fetch";

type LighthouseAudit = {
  displayValue?: string;
  numericValue?: number;
};

type PageSpeedResponse = {
  lighthouseResult?: {
    finalDisplayedUrl?: string;
    categories?: {
      performance?: {
        score?: number;
      };
    };
    audits?: {
      "first-contentful-paint"?: LighthouseAudit;
      "largest-contentful-paint"?: LighthouseAudit;
      "cumulative-layout-shift"?: LighthouseAudit;
      "total-blocking-time"?: LighthouseAudit;
      "speed-index"?: LighthouseAudit;
    };
  };
};

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";

  const limiter = getPageSpeedRatelimit();
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          {
            error: "Too many PageSpeed checks. Please wait a moment and try again.",
            code: "RATE_LIMITED",
          },
          { status: 429 },
        );
      }
    } catch {
      // Limiter outages must not break the tool.
    }
  }

  try {
    const body = await request.json();

    const rawUrl =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    if (!rawUrl) {
      return NextResponse.json(
        { error: "Please enter a website URL.", code: "INVALID_URL" },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      // Same structural validation the fetchers use: scheme, credentials and
      // internal hostnames are rejected before anything is sent upstream.
      parsedUrl = validateTargetUrl(rawUrl);
    } catch (error) {
      if (error instanceof SafeFetchError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.httpStatus },
        );
      }
      return NextResponse.json(
        { error: "Please enter a valid full URL.", code: "INVALID_URL" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      url: parsedUrl.toString(),
      strategy: "mobile",
      category: "performance",
    });

    const apiKey =
      process.env.GOOGLE_PAGESPEED_API_KEY;

    if (apiKey) {
      params.set("key", apiKey);
    }

    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
      }
    );

    const data =
      (await response.json()) as PageSpeedResponse & {
        error?: {
          message?: string;
        };
      };

    if (!response.ok) {
      const rateLimited = response.status === 429;
      return NextResponse.json(
        {
          error:
            data.error?.message ||
            "Unable to run PageSpeed analysis.",
          code: rateLimited ? "RATE_LIMITED" : "UPSTREAM_ERROR",
        },
        { status: rateLimited ? 429 : 502 }
      );
    }

    const lighthouse = data.lighthouseResult;
    const audits = lighthouse?.audits;

    if (!lighthouse || !audits) {
      return NextResponse.json(
        {
          error:
            "PageSpeed did not return a valid Lighthouse result.",
          code: "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }

    const performanceScore =
      typeof lighthouse.categories?.performance?.score ===
      "number"
        ? Math.round(
            lighthouse.categories.performance.score * 100
          )
        : null;

    return NextResponse.json({
      requestedUrl: parsedUrl.toString(),
      finalUrl:
        lighthouse.finalDisplayedUrl ||
        parsedUrl.toString(),
      performanceScore,
      firstContentfulPaint:
        audits["first-contentful-paint"]
          ?.displayValue || "N/A",
      largestContentfulPaint:
        audits["largest-contentful-paint"]
          ?.displayValue || "N/A",
      cumulativeLayoutShift:
        audits["cumulative-layout-shift"]
          ?.displayValue || "N/A",
      totalBlockingTime:
        audits["total-blocking-time"]
          ?.displayValue || "N/A",
      speedIndex:
        audits["speed-index"]?.displayValue ||
        "N/A",
      strategy: "mobile",
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to run PageSpeed analysis.",
      },
      { status: 500 }
    );
  }
}
