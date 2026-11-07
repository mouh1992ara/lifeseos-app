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

  /* `next` is normally absent: `emailRedirectTo` carries no query string so that
     it matches the Supabase allow-list literally (a query breaks the match and
     Supabase substitutes the Site URL). The locale is taken from user metadata
     instead, so a visitor who signed up in Arabic still lands in Arabic.
     An explicit `?next=` is still honoured when a caller supplies one. */
  const requestedNext = safePath(searchParams.get("next"), "");
  const next = requestedNext || "/dashboard";

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

  /* A bare /dashboard drops the visitor's language, because the locale lives in
     the path. Rebuild the target from the metadata recorded at sign-up — that is
     why sign-up now stores `locale` alongside `full_name`. An explicit `?next=`
     still wins, for callers that know better. */
  const metaLocale = String(
    (user?.user_metadata as Record<string, unknown> | undefined)?.locale ?? "",
  );
  const target =
    requestedNext || !metaLocale
      ? next
      : safePath(`/${metaLocale}/dashboard`, "/dashboard");

  const verifiedUrl = `${origin}/${localeOf(target)}/auth/verified?next=${encodeURIComponent(target)}`;

  if (!user || !confirmed) return NextResponse.redirect(verifiedUrl);

  const isHttps =
    new URL(origin).protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  return attachHandoff(NextResponse.redirect(verifiedUrl), user.id, {
    secure: isHttps,
  });
}
