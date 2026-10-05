import { NextResponse } from "next/server";

const INDEXNOW_KEY = "f328cb0c80a05063563e062b3288b368";
const SITE_URL = "https://www.lifeseos.com";
const HOST = "www.lifeseos.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const urls = Array.isArray(body.urls) ? body.urls : [];

    if (urls.length === 0) {
      return NextResponse.json(
        {
          error: "Please provide at least one URL.",
        },
        {
          status: 400,
        }
      );
    }

    if (urls.length > 10000) {
      return NextResponse.json(
        {
          error: "IndexNow allows a maximum of 10,000 URLs per request.",
        },
        {
          status: 400,
        }
      );
    }

    const validUrls = urls.filter((url: unknown): url is string => {
      if (typeof url !== "string") {
        return false;
      }

      try {
        const parsedUrl = new URL(url);

        return (
          parsedUrl.protocol === "https:" &&
          parsedUrl.hostname === HOST
        );
      } catch {
        return false;
      }
    });

    if (validUrls.length !== urls.length) {
      return NextResponse.json(
        {
          error: `All URLs must belong to ${SITE_URL}.`,
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
          urlList: validUrls,
        }),
      }
    );

    if (!indexNowResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: indexNowResponse.status,
          message: "IndexNow rejected the submission.",
        },
        {
          status: indexNowResponse.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      status: indexNowResponse.status,
      submitted: validUrls.length,
      urls: validUrls,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }
}
