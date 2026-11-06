import { NextResponse } from "next/server";

import { getResendRatelimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

/**
 * Resend the verification email.
 *
 * Returns 200 for every address, existing or not: a different status for
 * "unknown email" would turn this into an account-existence oracle. The only
 * honest failure we can surface is our own rate limit.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  const limiter = getResendRatelimit();
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    } catch {
      /* Redis outage must not block a legitimate resend */
    }
  }

  let payload: { email?: unknown; locale?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const locale = typeof payload.locale === "string" && /^[a-z]{2}$/.test(payload.locale) ? payload.locale : "en";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const supabase = await createClient();

  try {
    await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=/${locale}/dashboard` },
    });
  } catch {
    /* Swallowed on purpose: see the note about enumeration above. */
  }

  return NextResponse.json({ ok: true });
}
