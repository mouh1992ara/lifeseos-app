/**
 * Analytics event validation and recording.
 *
 * The governing rule: the browser is untrusted and the database should never
 * receive anything it would be embarrassing to read aloud. Every field that
 * reaches the database is either (a) chosen from a closed vocabulary defined
 * here, or (b) derived by the server from the request itself.
 *
 * A client can therefore send `locale: "xx"` or `device: "toaster"` and it is
 * discarded rather than stored. It cannot send a URL, an email or an IP —
 * there are no columns for them.
 *
 * `recordEvent` never throws. Analytics is not a feature of the page; a failed
 * insert must not fail a user's tool run.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Closed vocabulary. Adding a value here is a deliberate schema decision. */
export const EVENT_NAMES = [
  "page_view",
  "tool_start",
  "tool_use",      // a tool ran but the outcome is unknown (legacy beacons)
  "tool_success",
  "tool_error",
  "signup_view",
  "signup_submit",
  "signup_success",
  "verify_success",
  "signin_success",
  "report_saved",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export const LOCALES = ["en", "ar", "fr", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEVICES = ["mobile", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

export const OUTCOMES = ["success", "error"] as const;
export type Outcome = (typeof OUTCOMES)[number];

/**
 * Error categories, not error messages.
 *
 * A raw upstream message can contain the hostname the user submitted, or a
 * fragment of an upstream body. Storing it would quietly turn an analytics
 * table into a log of private URLs. The app maps to this set and the original
 * message stays in the server log, where it belongs.
 */
export const ERROR_CODES = [
  "INVALID_URL",
  "BLOCKED_ADDRESS",
  "RATE_LIMITED",
  "UPSTREAM_ERROR",
  "TIMEOUT",
  "TOO_LARGE",
  "NOT_HTML",
  "INVALID_REQUEST",
  "CAPTCHA_FAILED",
  "INTERNAL",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

const TOOL_KEYS = new Set([
  "seo-analyzer",
  "seo-page-analyzer",
  "schema-markup-generator",
  "robots-txt-generator",
  "xml-sitemap-generator",
  "meta-tag-generator",
  "serp-snippet-preview",
  "page-speed",
  "keyword-density-checker",
  "content-analyzer",
  "article-rewriter",
  "http-status-checker",
  "youtube-keyword-ideas",
  "youtube-title-generator",
  "youtube-title-analyzer",
  "youtube-description-generator",
  "youtube-script-writer",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pick<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/**
 * Coarse device bucket from the User-Agent.
 *
 * Three values only. This is not a fingerprint: it cannot distinguish two
 * iPhones, and it is combined with nothing else. Tablets are checked before
 * mobile because iPad UAs contain "Mobile".
 */
export function deviceFromUserAgent(ua: string | null): Device {
  if (!ua) return "desktop";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Locale from the path the request actually hit.
 *
 * Read from `pathname`, not from a client field, so it always matches the URL a
 * crawler or a user sees. English is unprefixed, so absence means `en`.
 */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/")[1] ?? "";
  return (pick(first, LOCALES) ?? "en") as Locale;
}

/** Strip query and hash: they can carry a submitted URL. */
export function normalisePath(pathname: string): string {
  const clean = pathname.split("?")[0].split("#")[0];
  return clean.slice(0, 200) || "/";
}

export type AnalyticsInput = {
  eventId?: unknown;
  eventName?: unknown;
  toolKey?: unknown;
  outcome?: unknown;
  errorCode?: unknown;
  durationMs?: unknown;
};

export type ValidatedEvent = {
  event_id: string;
  event_name: EventName;
  tool_key: string | null;
  locale: Locale;
  device: Device;
  outcome: Outcome | null;
  error_code: ErrorCode | null;
  duration_ms: number | null;
  path: string;
  session_key: string | null;
  user_id: string | null;
};

/**
 * Validate a client payload into a row, or return null.
 *
 * Returns null rather than throwing for anything unknown: an unrecognised event
 * name is not an error the caller can act on, and a 400 here would tempt
 * callers to retry, which is exactly the duplicate problem we are avoiding.
 */
export function validateEvent(
  input: AnalyticsInput,
  ctx: {
    pathname: string;
    userAgent: string | null;
    userId: string | null;
    sessionKey: string | null;
    forceEventId?: string;
  },
): ValidatedEvent | null {
  const eventName = pick(input.eventName, EVENT_NAMES);
  if (!eventName) return null;

  const toolKeyRaw = typeof input.toolKey === "string" ? input.toolKey : "";
  const toolKey = TOOL_KEYS.has(toolKeyRaw) ? toolKeyRaw : null;
  if (eventName.startsWith("tool_") && !toolKey) return null;

  const eventId =
    ctx.forceEventId ??
    (typeof input.eventId === "string" && UUID_RE.test(input.eventId)
      ? input.eventId
      : crypto.randomUUID());

  const duration =
    typeof input.durationMs === "number" && Number.isFinite(input.durationMs) && input.durationMs >= 0
      ? Math.min(Math.round(input.durationMs), 600_000)
      : null;

  const outcome =
    pick(input.outcome, OUTCOMES) ??
    (eventName === "tool_success" ? "success" : eventName === "tool_error" ? "error" : null);

  const errorCode = eventName === "tool_error" ? pick(input.errorCode, ERROR_CODES) : null;

  return {
    event_id: eventId,
    event_name: eventName,
    tool_key: toolKey,
    locale: localeFromPath(ctx.pathname),
    device: deviceFromUserAgent(ctx.userAgent),
    outcome,
    error_code: errorCode,
    duration_ms: duration,
    path: normalisePath(ctx.pathname),
    session_key: ctx.sessionKey,
    user_id: ctx.userId,
  };
}

/** Postgres `undefined_table` — the migration has not been applied yet. */
const UNDEFINED_TABLE = "42P01";

/**
 * Write one event. Resolves to whether it was stored.
 *
 * Two independent de-duplication layers:
 *   1. `upsert` on `event_id` with `ignoreDuplicates` — a retried beacon or a
 *      double click collides on the unique index and changes nothing.
 *   2. The endpoint computes a deterministic `event_id` for server-side events
 *      (see `deterministicEventId`), so the same logical action cannot be
 *      recorded twice even if the client never supplies an id.
 *
 * `missing table` is treated as success-with-no-write: the code ships before
 * the migration and must not look broken in the meantime.
 */
export async function recordEvent(
  admin: SupabaseClient | null,
  event: ValidatedEvent | null,
): Promise<boolean> {
  if (!event || !admin) return false;

  try {
    const { error } = await admin.from("analytics_events").upsert(event, {
      onConflict: "event_id",
      ignoreDuplicates: true,
    });

    if (error) {
      if (error.code === UNDEFINED_TABLE) return false; // migration pending
      console.error("analytics insert failed:", error.code ?? error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Stable id for an event the server generates, so a retry is idempotent.
 * Example: one page_view per path per session per minute.
 */
export function deterministicEventId(parts: (string | null | undefined)[]): string {
  const seed = parts.filter(Boolean).join("|");
  // Simple FNV-1a expanded into a UUID-shaped string. Collisions would merge
  // two analytics rows, which is acceptable; they would never merge user data.
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < seed.length; i += 1) {
    h1 ^= seed.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ seed.charCodeAt(i), 0x85ebca6b) >>> 0;
  }
  const hex = (n: number) => n.toString(16).padStart(8, "0");
  const a = hex(h1);
  const b = hex(h2);
  const c = hex((h1 ^ h2) >>> 0);
  const d = seed.length.toString(16).padStart(4, "0").slice(-4);
  return `${a}-${b.slice(0, 4)}-4${b.slice(4, 7)}-a${c.slice(0, 3)}-${d}${c.slice(3, 11)}`;
}

export const SESSION_COOKIE = "ls.sid";

/** A random, opaque, non-fingerprint session id. */
export function newSessionKey(): string {
  return crypto.randomUUID();
}

/* ==========================================================================
   Request guards
   --------------------------------------------------------------------------
   Both analytics endpoints are public, unauthenticated, and write with service
   role credentials. These guards exist because that combination is the most
   abusable shape a route can have.
   ========================================================================== */

/** Hard ceiling on a beacon body. Real payloads are ~120 bytes. */
export const MAX_BODY_BYTES = 2048;

/**
 * Client IP, for rate limiting only.
 *
 * Never stored. `x-forwarded-for` is read for the left-most hop because that is
 * what Vercel writes; a spoofed header can only move an attacker into a
 * different bucket, it cannot grant anything.
 */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (
    fwd?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

/**
 * Reject oversized bodies before parsing.
 *
 * `Content-Length` is checked first so a huge upload is refused without being
 * read; the header can lie, so the actual text length is re-checked after the
 * read as well.
 */
export function payloadTooLarge(request: Request, raw: string | null): boolean {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return true;
  if (raw && raw.length > MAX_BODY_BYTES) return true;
  return false;
}

/**
 * Session keys are grouping labels, never credentials.
 *
 * Validating the shape matters anyway: an attacker who could choose any string
 * could poison "distinct sessions" by writing a million unique values, or collide
 * deliberately with someone else's bucket. A UUID-restricted, length-capped value
 * makes that meaningless. This value grants no access — it is not read anywhere
 * for authorisation.
 */
export function safeSessionKey(value: unknown): string | null {
  return typeof value === "string" && UUID_RE.test(value) ? value.toLowerCase() : null;
}
