import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  deterministicEventId,
  localeFromPath,
  recordEvent,
  validateEvent,
} from "@/lib/analytics";

/**
 * Tool analytics.
 *
 * `lib/supabase/admin.ts` throws during import when the service-role key is
 * missing, so it is imported lazily and a missing key simply means the event is
 * dropped instead of failing in the console.
 *
 * Two payload shapes are accepted on purpose: 17 tool clients already call this
 * endpoint and none of them should need editing.
 *
 *   legacy  { tool_name: "Schema Markup Generator" }
 *   current { tool_key: "schema-markup-generator", event_name: "tool_error",
 *             duration_ms: 812, error_code: "UPSTREAM_ERROR" }
 *
 * Legacy calls are mapped onto the same event stream rather than dropped, so
 * history keeps accumulating across the change instead of restarting at zero.
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

/** Display name → canonical slug, for legacy callers. */
const NAME_TO_KEY: Record<string, string> = {
  "Schema Markup Generator": "schema-markup-generator",
  "SEO Analyzer": "seo-analyzer",
  "SEO Page Analyzer": "seo-page-analyzer",
  "Robots.txt Generator": "robots-txt-generator",
  "XML Sitemap Generator": "xml-sitemap-generator",
  "Meta Tag Generator": "meta-tag-generator",
  "SERP Snippet Preview": "serp-snippet-preview",
  "Page Speed": "page-speed",
  "Keyword Density Checker": "keyword-density-checker",
  "Content Analyzer": "content-analyzer",
  "Article Rewriter": "article-rewriter",
  "HTTP Status Checker": "http-status-checker",
  "YouTube Keyword Ideas": "youtube-keyword-ideas",
  "YouTube Title Generator": "youtube-title-generator",
  "YouTube Title Analyzer": "youtube-title-analyzer",
  "YouTube Description Generator": "youtube-description-generator",
  "YouTube Script Writer": "youtube-script-writer",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const admin = await getAdmin();
    // Not configured: accept and drop. 204 keeps the console clean and avoids
    // teaching clients that a retry would help.
    if (!admin) return new NextResponse(null, { status: 204 });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const url = new URL(request.url);
    // Prefer the page path the beacon reported; fall back to this route's own
    // path, which is `/api/tool-events` and therefore only useful for locale.
    const pathname =
      (typeof body.path === "string" && body.path.slice(0, 200)) || url.pathname;
    const sessionKey =
      typeof body.session_key === "string" ? body.session_key.slice(0, 64) : null;
    const userAgent = request.headers.get("user-agent");

    // ---- legacy shape -----------------------------------------------------
    const legacyName =
      typeof body.tool_name === "string" ? body.tool_name.trim().slice(0, 100) : "";

    const toolKey =
      typeof body.tool_key === "string" && body.tool_key
        ? body.tool_key
        : (NAME_TO_KEY[legacyName] ?? null);

    // Legacy callers mean "this tool was used and produced a result", so they
    // are recorded as successes rather than left unattributed.
    const eventName =
      typeof body.event_name === "string" && body.event_name
        ? body.event_name
        : "tool_success";

    const event = validateEvent(
      {
        eventId: body.event_id,
        eventName,
        toolKey,
        outcome: body.outcome,
        errorCode: body.error_code,
        durationMs: body.duration_ms,
      },
      {
        pathname,
        userAgent,
        userId: user?.id ?? null,
        sessionKey,
        // Server-side idempotency for legacy beacons, which carry no id: at most
        // one success per tool per user per minute. Running a tool twice in the
        // same minute counts once — the honest trade for not being able to trust
        // a client-generated id.
        forceEventId: body.event_id
          ? undefined
          : deterministicEventId([
              "tool",
              toolKey,
              user?.id ?? sessionKey ?? "anon",
              new Date().toISOString().slice(0, 16),
            ]),
      },
    );

    if (!event) {
      return NextResponse.json({ error: "Unknown event." }, { status: 400 });
    }

    const stored = await recordEvent(admin, event);

    // Keep the legacy table fed while /admin still reads it. Failure here is
    // non-fatal: the new stream is the source of truth going forward.
    if (legacyName) {
      const legacyRow: Record<string, unknown> = {
        tool_name: legacyName,
        user_id: user?.id ?? null,
        locale: localeFromPath(pathname),
        event_id: event.event_id,
      };

      const { error } = await admin.from("tool_events").insert(legacyRow);
      // 42703 = undefined_column: the migration is not applied yet. Expected,
      // and not worth alarming anyone about.
      if (error && error.code !== "42703") {
        console.error("legacy tool_events insert failed:", error.code ?? error.message);
      }
    }

    return NextResponse.json({ ok: stored }, { status: 200 });
  } catch {
    // Tracking must never surface to the visitor.
    return new NextResponse(null, { status: 204 });
  }
}

export const dynamic = "force-dynamic";
