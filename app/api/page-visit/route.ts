import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

function getCountryName(countryCode: string) {
  if (!countryCode) {
    return "Unknown";
  }

  try {
    return (
      new Intl.DisplayNames(["en"], {
        type: "region",
      }).of(countryCode.toUpperCase()) ?? "Unknown"
    );
  } catch {
    return "Unknown";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const path =
      typeof body.path === "string"
        ? body.path.trim().slice(0, 500)
        : "/";

    const countryCode =
      request.headers.get("x-vercel-ip-country")?.trim().toUpperCase() ||
      "XX";

    const countryName =
      countryCode === "XX"
        ? "Unknown"
        : getCountryName(countryCode);

    const { error } = await supabaseAdmin
      .from("page_visits")
      .insert({
        country_code: countryCode,
        country_name: countryName,
        path,
      });

    if (error) {
      console.error("Page visit insert error:", error);

      return NextResponse.json(
        {
          error: "Failed to record page visit.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
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
