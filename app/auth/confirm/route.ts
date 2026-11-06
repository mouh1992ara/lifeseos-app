import { createClient } from "@/lib/supabase/server";
import { safePath } from "@/lib/safe-redirect";
import { attachHandoff } from "@/lib/verify-handoff";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const LOCALES = new Set(["en", "ar", "fr", "zh"]);

function localeOf(next: string) {
  const segment = next.split("/")[1] ?? "";
  return LOCALES.has(segment) ? segment : "en";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safePath(searchParams.get("next"), "/dashboard");

  const failed = (code: string) =>
    NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(code)}`,
    );

  /* Provider-side failures are reported on the redirect itself. */
  const providerError =
    searchParams.get("error_code") ??
    searchParams.get("error_description") ??
    searchParams.get("error");
  if (providerError) return failed(providerError);

  if (!token_hash || !type) return failed("missing_token");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) return failed(error.message);

  /* Same rule as `/auth/callback`: no confirmed address, no handoff. This route is
     the one the cross-device email template uses, so it must mint the ticket too —
     otherwise a correct cross-device confirmation would silently skip the success
     screen and land on the dashboard. */
  const user = data.user;
  const confirmed = Boolean(user?.email_confirmed_at ?? user?.confirmed_at);
  if (!user || !confirmed) {
    return NextResponse.redirect(`${origin}/${localeOf(next)}/auth/verified?next=${encodeURIComponent(next)}`);
  }

  const isHttps =
    new URL(origin).protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  const response = NextResponse.redirect(
    `${origin}/${localeOf(next)}/auth/verified?next=${encodeURIComponent(next)}`,
  );

  return attachHandoff(response, user.id, { secure: isHttps });
}
