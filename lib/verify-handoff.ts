import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";

/**
 * One-time handoff from the confirmation callback to the success screen.
 *
 * Why this exists: `/auth/verified` used to be reachable by anyone whose
 * `email_confirmed_at` was recent, which meant a bookmark or a typed URL within
 * the window still produced a "just verified" animation for an event that had
 * already happened. A time window is a guess about intent; a signed, single-use
 * ticket is evidence of one.
 *
 * The ticket is minted by the callback route only after Supabase confirms the
 * address, is bound to the user id, expires in two minutes, and is cleared by
 * the proxy the first time the success page serves it.
 *
 * Signing key, in order:
 *   1. `AUTH_VERIFY_SECRET`      — dedicated, preferred
 *   2. `SUPABASE_SECRET_KEY`     — already server-only and high-entropy
 * If neither is present the ticket is unavailable and the page falls back to the
 * freshness window. It never proceeds unverified.
 */

export const HANDOFF_COOKIE = "ls.verify";
const TTL_SECONDS = 120;

function signingKey(): string | null {
  const dedicated = process.env.AUTH_VERIFY_SECRET?.trim();
  if (dedicated && dedicated.length >= 16) return dedicated;

  const supabase = process.env.SUPABASE_SECRET_KEY?.trim();
  if (supabase && supabase.length >= 16) return supabase;

  return null;
}

/** Whether a signed handoff is possible in this environment. */
export function handoffAvailable(): boolean {
  return signingKey() !== null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export type HandoffTicket = { value: string; maxAge: number };

export type HandoffCheck =
  | { valid: true; nonce: string; ageSeconds: number }
  | { valid: false };

/**
 * Why `consumeHandoff` exists, and what it guarantees.
 *
 * A signature proves the ticket was minted here; it does not prove it has not
 * already been used. Clearing the cookie after rendering is not a fix either:
 * two requests that arrive together both read the cookie before either response
 * writes the deletion, so both render.
 *
 * `Redis SET key value NX EX ttl` is atomic on the server: exactly one caller
 * can create the key. That is what makes the handoff genuinely one-time, and it
 * is the only path the success page uses.
 */

/**
 * Mint a ticket for `userId`. The nonce makes two confirmations on the same
 * account distinguishable, so a replayed cookie from an earlier session is not
 * accepted for a later one.
 */
export function mintHandoff(userId: string): HandoffTicket | null {
  const key = signingKey();
  if (!key) return null;

  const body = JSON.stringify({
    u: userId,
    n: randomBytes(12).toString("base64url"),
    t: Math.floor(Date.now() / 1000),
  });
  const payload = Buffer.from(body).toString("base64url");

  return { value: `${payload}.${sign(payload, key)}`, maxAge: TTL_SECONDS };
}

/**
 * Verify a ticket against the user currently signed in.
 *
 * NOTE ON "SINGLE-USE": signature + expiry alone cannot be single-use. Two
 * concurrent requests carrying the same cookie both pass this check, and a
 * copied cookie works again inside the window. Genuine one-time use needs
 * shared state, which `consumeHandoff` provides. Call that, not this, from
 * anything that decides whether to show the success animation.
 */
export function verifyHandoff(
  raw: string | undefined | null,
  userId: string,
): HandoffCheck {
  const key = signingKey();
  if (!key || !raw) return { valid: false };

  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return { valid: false };

  const payload = raw.slice(0, dot);
  const provided = raw.slice(dot + 1);
  const expected = sign(payload, key);

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false };

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      u?: string;
      n?: string;
      t?: number;
    };

    if (parsed.u !== userId) return { valid: false };
    if (typeof parsed.t !== "number") return { valid: false };
    if (typeof parsed.n !== "string" || !parsed.n) return { valid: false };

    const age = Math.floor(Date.now() / 1000) - parsed.t;
    // Negative age means a clock skew beyond tolerance; refuse rather than guess.
    if (age < 0 || age > TTL_SECONDS) return { valid: false };

    return { valid: true, nonce: parsed.n, ageSeconds: age };
  } catch {
    return { valid: false };
  }
}

export const HANDOFF_MAX_AGE = TTL_SECONDS;

/**
 * Attach the handoff cookie to a redirect response.
 *
 * Both `/auth/callback` (PKCE code) and `/auth/confirm` (token_hash) call this
 * after Supabase reports a confirmed address, so the two entry points cannot
 * drift apart. Returning the response unchanged when no ticket could be minted is
 * deliberate: the success page will refuse to animate, which is the safe failure.
 */
export function attachHandoff<T extends { cookies: { set: (...args: never[]) => unknown } }>(
  response: T,
  userId: string,
  opts: { secure: boolean },
): T {
  const ticket = mintHandoff(userId);
  if (!ticket) return response;

  (response.cookies.set as unknown as (
    name: string,
    value: string,
    options: Record<string, unknown>,
  ) => void)(HANDOFF_COOKIE, ticket.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: opts.secure,
    path: "/",
    maxAge: ticket.maxAge,
  });

  return response;
}
const CONSUME_PREFIX = "lifeseos:verify-used:";

function redisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!/^https:\/\/.+/.test(url)) return null;
  return new Redis({ url, token });
}

let cached: Redis | null | undefined;

export type ConsumeResult =
  /** Ticket was valid and this call won the race — render the animation. */
  | { status: "consumed" }
  /** Ticket was valid but already spent (concurrent request, refresh, replay). */
  | { status: "replayed" }
  /** Bad signature, expired, wrong user, or missing. */
  | { status: "invalid" }
  /**
   * Redis is not configured, so atomicity cannot be guaranteed. The caller must
   * decide; this function never pretends the ticket was consumed exactly once.
   */
  | { status: "unverifiable" };

/**
 * Atomically spend a ticket.
 *
 * The key is the nonce, so two tickets for the same user are independent and a
 * replayed cookie is rejected. The TTL matches the ticket's own lifetime, so the
 * marker cannot outlive the thing it guards.
 */
export async function consumeHandoff(
  raw: string | undefined | null,
  userId: string,
): Promise<ConsumeResult> {
  const check = verifyHandoff(raw, userId);
  if (!check.valid) return { status: "invalid" };

  if (cached === undefined) cached = redisClient();
  const redis = cached;

  if (!redis) return { status: "unverifiable" };

  try {
    // SET NX returns "OK" when the key did not exist, null when it did.
    const result = await redis.set(`${CONSUME_PREFIX}${check.nonce}`, "1", {
      nx: true,
      ex: TTL_SECONDS,
    });
    return result === "OK" ? { status: "consumed" } : { status: "replayed" };
  } catch {
    // Redis unreachable: do not claim success, do not claim replay. The caller
    // treats this as unverifiable rather than fabricating a result.
    return { status: "unverifiable" };
  }
}
