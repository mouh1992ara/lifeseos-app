import { NextResponse } from "next/server";

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
  try {
    const body = await request.json();

    const rawUrl =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    if (!rawUrl) {
      return NextResponse.json(
        { error: "Please enter a website URL." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid full URL." },
        { status: 400 }
      );
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are supported." },
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
      }
    );

    const data =
      (await response.json()) as PageSpeedResponse & {
        error?: {
          message?: string;
        };
      };

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error?.message ||
            "Unable to run PageSpeed analysis.",
        },
        { status: response.status }
      );
    }

    const lighthouse = data.lighthouseResult;
    const audits = lighthouse?.audits;

    if (!lighthouse || !audits) {
      return NextResponse.json(
        {
          error:
            "PageSpeed did not return a valid Lighthouse result.",
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
