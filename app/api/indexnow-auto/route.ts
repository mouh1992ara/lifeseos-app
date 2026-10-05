import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = "f328cb0c80a05063563e062b3288b368";
const SITE_URL = "https://www.lifeseos.com";
const HOST = "www.lifeseos.com";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const sitemapResponse = await fetch(`${SITE_URL}/sitemap.xml`, {
      cache: "no-store",
    });

    if (!sitemapResponse.ok) {
      return NextResponse.json(
        {
          error: "Unable to load sitemap.",
        },
        {
          status: 500,
        }
      );
    }

    const sitemap = await sitemapResponse.text();

    const matches = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)];

    const urls = matches
      .map((match) => match[1]?.trim())
      .filter((url): url is string => Boolean(url))
      .filter((url) => {
        try {
          const parsed = new URL(url);

          return (
            parsed.protocol === "https:" &&
            parsed.hostname === HOST
          );
        } catch {
          return false;
        }
      });

    if (urls.length === 0) {
      return NextResponse.json(
        {
          error: "No valid URLs found in sitemap.",
        },
        {
          status: 400,
        }
      );
    }

    const indexNowResponse = await fetch(
      "https://api.indexnow.org/indexnow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          host: HOST,
          key: INDEXNOW_KEY,
          keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: urls,
        }),
      }
    );

    return NextResponse.json(
      {
        success: indexNowResponse.ok,
        status: indexNowResponse.status,
        submitted: urls.length,
        urls,
      },
      {
        status: indexNowResponse.ok ? 200 : indexNowResponse.status,
      }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Automatic IndexNow submission failed.",
      },
      {
        status: 500,
      }
    );
  }
}
