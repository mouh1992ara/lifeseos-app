import { NextRequest, NextResponse } from "next/server";

function extractFirstMatch(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1]?.trim() || "";
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let url = body.url?.trim();

    if (!url) {
      return NextResponse.json(
        { error: "Please enter a URL." },
        { status: 400 }
      );
    }

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "LifeSeos-SEO-Page-Analyzer/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `The page returned HTTP ${response.status}.`,
        },
        { status: 400 }
      );
    }

    const html = await response.text();

    const title = decodeHtml(
      extractFirstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
    );

    const description = decodeHtml(
      extractFirstMatch(
        html,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
      ) ||
        extractFirstMatch(
          html,
          /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i
        )
    );

    const canonical = extractFirstMatch(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
    );

    const robots = extractFirstMatch(
      html,
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );

    const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    const h2Matches = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
    const imgMatches = [...html.matchAll(/<img\b[^>]*>/gi)];
    const linkMatches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)];

    const cleanText = (value: string) =>
      decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

    const h1 = h1Matches.map((match) => cleanText(match[1])).filter(Boolean);
    const h2 = h2Matches.map((match) => cleanText(match[1])).filter(Boolean);

    const imagesWithoutAlt = imgMatches.filter((match) => {
      return !/\balt=["'][^"']*["']/i.test(match[0]);
    }).length;

    const pageSizeKb = Math.round(Buffer.byteLength(html, "utf8") / 1024);

    return NextResponse.json({
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      canonical,
      robots,
      h1,
      h1Count: h1.length,
      h2Count: h2.length,
      totalLinks: linkMatches.length,
      totalImages: imgMatches.length,
      imagesWithoutAlt,
      pageSizeKb,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to analyze this page.",
      },
      { status: 500 }
    );
  }
}