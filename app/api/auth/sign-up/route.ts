import { NextResponse } from "next/server";

import { getSignupRatelimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
import {
  turnstileConfigured,
  turnstileRequired,
  turnstileSiteKeyPresent,
  verifyTurnstile,
} from "@/lib/turnstile";

/**
 * Registration endpoint.
 *
 * Why this exists at all, instead of calling `supabase.auth.signUp` from the
 * browser as before:
 *
 *   1. Turnstile can only be verified with a secret, so it must happen here.
 *   2. The per-IP budget lives here, where it cannot be bypassed.
 *   3. The response is deliberately uniform. Supabase already returns a
 *      synthetic user for an address that exists when confirmation is on, and
 *      we normalise every "account exists" case to the same 200 the visitor
 *      gets on success — so this endpoint cannot be used to enumerate accounts.
 *
 * No session is created here: the visitor must confirm the address first.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Reads deploy-time configuration, so it must never be cached at build time.
export const dynamic = "force-dynamic";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

/**
 * Public capability probe, no secrets involved: the form uses it to disable
 * itself with an honest message instead of letting people fill in a form that
 * cannot succeed.
 */
export async function GET() {
  const required = turnstileRequired();
  const secretPresent = turnstileConfigured();
  const widgetPresent = turnstileSiteKeyPresent();

  return NextResponse.json({
    captchaRequired: required,
    // "ready" | "unconfigured" | "widget-missing" | "optional"
    captcha:
      !secretPresent && required
        ? "unconfigured"
        : secretPresent && !widgetPresent
          ? "widget-missing"
          : secretPresent
            ? "ready"
            : "optional",
  });
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  const limiter = getSignupRatelimit();
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    } catch {
      /* Redis outage must not block registration */
    }
  }

  let payload: {
    fullName?: unknown;
    email?: unknown;
    password?: unknown;
    turnstileToken?: unknown;
    locale?: unknown;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const fullName = typeof payload.fullName === "string" ? payload.fullName.trim().slice(0, 120) : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
  const locale = typeof payload.locale === "string" && /^[a-z]{2}$/.test(payload.locale) ? payload.locale : "en";

  if (fullName.length < 2) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  // Mirrors the client-side rule; the server never trusts the client's.
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  /* Unconditional: the helper decides whether a captcha is required in this
     environment. In production a missing secret refuses the request instead of
     quietly accepting it. */
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.ok) {
    if (captcha.reason === "unconfigured" || captcha.reason === "unavailable") {
      return NextResponse.json(
        {
          error:
            captcha.reason === "unconfigured" ? "captcha_unconfigured" : "captcha_unavailable",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "captcha_failed", codes: captcha.codes },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/${locale}/dashboard`,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("rate limit") || message.includes("too many")) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (message.includes("invalid") && message.includes("email")) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    // Anything else is reported generically: a specific message here would
    // leak whether the address is already registered.
    return NextResponse.json({ error: "signup_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
