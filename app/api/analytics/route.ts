import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  deterministicEventId,
  newSessionKey,
  recordEvent,
  SESSION_COOKIE,
  validateEvent,
} from "@/lib/analytics";

/**
 * Funnel and page-view events.
 *
 * Distinct from /api/tool-events because the payloads answer different
 * questions: this endpoint is about a journey (signup, verification, page
 * arrival), the other is about a tool run.
 *
 * The session key exists so "did this browser come back?" is answerable without
 * fingerprinting. It is a random UUID in a first-party, httpOnly, SameSite=Lax
 * cookie — it carries no device information and cannot be combined with
 * anything to identify a person. Rotating it on sign-out is deliberate.
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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const admin = await getAdmin();
    if (!admin) return new NextResponse(null, { status: 204 });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Session key: read the cookie, mint one if absent. The mint is returned in
    // the response so the very first event is not lost.
    const existing = request.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1);

    const sessionKey = existing || newSessionKey();

    const pathname = typeof body.path === "string" ? body.path.slice(0, 200) : "/";
    const eventName = typeof body.event_name === "string" ? body.event_name : "";

    const event = validateEvent(
      { eventId: body.event_id, eventName },
      {
        pathname,
        userAgent: request.headers.get("user-agent"),
        userId: user?.id ?? null,
        sessionKey,
        // One page_view per path per session per minute; one signup step per
        // session per minute. Prevents reload spam from inflating a funnel.
        forceEventId: deterministicEventId([
          eventName,
          pathname,
          user?.id ?? sessionKey,
          new Date().toISOString().slice(0, 16),
        ]),
      },
    );

    if (!event) {
      return NextResponse.json({ error: "Unknown event." }, { status: 400 });
    }

    const stored = await recordEvent(admin, event);

    const response = NextResponse.json({ ok: stored }, { status: 200 });

    if (!existing) {
      response.cookies.set(SESSION_COOKIE, sessionKey, {
        httpOnly: true,
        sameSite: "lax",
        secure: new URL(request.url).protocol === "https:",
        path: "/",
        // 30 days: enough to answer "returning within a month", short enough
        // that it is not a permanent identifier.
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

export const dynamic = "force-dynamic";
