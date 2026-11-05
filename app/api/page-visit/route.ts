import { NextResponse } from "next/server";

/**
 * Visit logging is optional infrastructure, not a feature of the page.
 *
 * `lib/supabase/admin.ts` throws while being imported when the service-role key
 * is absent, which turned every page view into a 500 in the console. Import it
 * lazily and swallow the failure: a missing analytics key must never look like
 * a broken site, and it must never break the page that is reporting the visit.
 */
async function getAdmin() {
  if (!process.env.SUPABASE_SECRET_KEY) return null;
  try {
    const mod = await import("@/lib/supabase/admin");
    return mod.supabaseAdmin;
  } catch {
    return null;
  }
}

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
  const supabaseAdmin = await getAdmin();
  // Not configured: accept and drop. 204 keeps the console clean.
  if (!supabaseAdmin) {
    return new NextResponse(null, { status: 204 });
  }

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
      /* Logged server-side only. A beacon that cannot be stored is not a
         failure the visitor should see — and definitely not a console error on
         every page view. */
      console.error("Page visit insert error:", error.message);

      return new NextResponse(null, { status: 204 });
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
