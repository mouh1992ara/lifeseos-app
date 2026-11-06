import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { safePath } from "@/lib/safe-redirect";
import { attachHandoff } from "@/lib/verify-handoff";

/**
 * Handles both links Supabase can send:
 *
 *   ?code=…            PKCE flow (the default for @supabase/ssr)
 *   ?token_hash=…&type=…  OTP flow
 *
 * Both are exchanged for a real session server-side; nothing is marked verified
 * here, the provider does that. `next` is restricted to local paths so the
 * parameter cannot be used as an open redirect.
 */
const LOCALES = new Set(["en", "ar", "fr", "zh"]);

/** Language of the landing screen, derived from the requested destination. */
function localeOf(next: string) {
  const segment = next.split("/")[1] ?? "";
  return LOCALES.has(segment) ? segment : "en";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const next = safePath(searchParams.get("next"), "/dashboard");
  const failed = (code: string) =>
    NextResponse.redirect(
      `${origin}/${localeOf(next)}/auth/error?error=${encodeURIComponent(code)}`,
    );

  /* Supabase appends the failure to the redirect URL itself for links it never
     even tries to exchange — an expired or already-used link arrives as
     `?error=access_denied&error_code=otp_expired&error_description=…`. Reporting
     that as `missing_token` would tell the user the wrong thing. */
  const providerError =
    searchParams.get("error_code") ??
    searchParams.get("error_description") ??
    searchParams.get("error");
  if (providerError) return failed(providerError);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const landed = `${origin}/${localeOf(next)}/auth/verified?next=${encodeURIComponent(next)}`;

  /* Mint the handoff proof.
   *
   * Only after Supabase itself reports a confirmed address: `exchangeCodeForSession`
   * and `verifyOtp` both return the user, and a confirmation link is only useful
   * if `email_confirmed_at` is now set. Minting on a bare session would hand the
   * animation to an unconfirmed account.
   *
   * The `secure` flag follows the actual request scheme rather than NODE_ENV, so
   * a preview served over https gets a Secure cookie while local http still works.
   */
  const isHttps =
    new URL(origin).protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  const handoff = async (user: { id: string; email_confirmed_at?: string | null; confirmed_at?: string | null } | undefined) => {
    if (!user) return NextResponse.redirect(landed);

    const confirmed = Boolean(user.email_confirmed_at ?? user.confirmed_at);
    if (!confirmed) return NextResponse.redirect(landed);

    const response = NextResponse.redirect(landed);
    return attachHandoff(response, user.id, { secure: isHttps });
  };

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return handoff(data.user ?? undefined);

    /* PKCE keeps the code verifier in a cookie on the browser that started the
       sign-up. Opening the link on a phone — a different browser — cannot
       present it, and the exchange fails with a code-verifier error. That is a
       different situation from an expired link and deserves its own advice. */
    if (/code verifier|both auth code/i.test(error.message)) {
      return failed("pkce_cross_device");
    }
    return failed(error.message);
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return handoff(data.user ?? undefined);
    return failed(error.message);
  }

  return failed("missing_token");
}