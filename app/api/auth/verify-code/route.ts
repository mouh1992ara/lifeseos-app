import { NextResponse } from "next/server";

import { getVerifyRatelimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

/**
 * Verify a numeric code emailed by Supabase.
 *
 * Only reachable when the project's "Confirm signup" template includes
 * `{{ .Token }}` (see docs/auth.md). The token is verified by Supabase itself
 * via verifyOtp — there is no bespoke token format, no local comparison, and
 * nothing is marked confirmed by this code.
 *
 * On success Supabase writes the session cookies through the server client, so
 * the caller can navigate straight to the dashboard.
 */

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  const limiter = getVerifyRatelimit();
  if (limiter) {
    try {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    } catch {
      /* Redis outage must not block a legitimate verification */
    }
  }

  let payload: { email?: unknown; token?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const token = typeof payload.token === "string" ? payload.token.replace(/\s+/g, "") : "";

  if (!email || !/^\d{6,10}$/.test(token)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("expired")) {
      return NextResponse.json({ error: "expired_code" }, { status: 400 });
    }
    if (message.includes("rate limit") || message.includes("too many")) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    // Wrong code and unknown address look identical on purpose.
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
