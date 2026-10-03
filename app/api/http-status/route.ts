import { NextRequest, NextResponse } from "next/server";

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
        "User-Agent": "LifeSeos-HTTP-Status-Checker/1.0",
      },
    });

    return NextResponse.json({
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      statusText: response.statusText,
      redirected: response.redirected,
      ok: response.ok,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to reach this URL. Check the address and try again.",
      },
      { status: 500 }
    );
  }
}