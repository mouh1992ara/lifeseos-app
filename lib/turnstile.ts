/**
 * Cloudflare Turnstile — server-side verification.
 *
 * The site key alone proves nothing: a bot can call our sign-up endpoint
 * directly and skip the widget entirely. Only siteverify, called from the
 * server with the secret, produces a trustworthy answer.
 *
 * Failure policy, deliberately explicit:
 *
 *   production + no secret  → REFUSE the request. A registration endpoint that
 *                             silently drops its only bot control is worse than
 *                             one that is visibly down.
 *   production + Cloudflare unreachable → refuse too (fail closed): an attacker
 *                             could otherwise manufacture the outage.
 *   development             → `skipped`, so local work does not need keys.
 *
 * `TURNSTILE_REQUIRED=0` opts out of the production requirement for a specific
 * environment. That is an explicit, auditable decision — never a default.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true; skipped: false }
  | { ok: true; skipped: true }
  | {
      ok: false;
      skipped: false;
      codes: string[];
      reason: "rejected" | "unconfigured" | "unavailable";
    };

export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

/** The site key is only needed so the browser can render a widget. */
export function turnstileSiteKeyPresent(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

/**
 * Whether this deployment refuses to register without a captcha.
 *
 * Default: required in production, optional elsewhere. `TURNSTILE_REQUIRED=0|1`
 * overrides it per environment.
 */
export function turnstileRequired(): boolean {
  const flag = process.env.TURNSTILE_REQUIRED?.trim();
  if (flag === "0") return false;
  if (flag === "1") return true;
  return process.env.NODE_ENV === "production";
}

export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const required = turnstileRequired();

  if (!secret) {
    if (required) {
      // Fail closed: no silent pass, no half-protected production.
      return { ok: false, skipped: false, codes: ["not-configured"], reason: "unconfigured" };
    }
    return { ok: true, skipped: true };
  }

  if (!token || token.length > 2048) {
    return { ok: false, skipped: false, codes: ["missing-input-response"], reason: "rejected" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    const result = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (result.success) return { ok: true, skipped: false };
    return {
      ok: false,
      skipped: false,
      codes: result["error-codes"] ?? ["verification-failed"],
      reason: "rejected",
    };
  } catch {
    // With a secret configured, an unreachable Cloudflare is indistinguishable
    // from an attacker cutting the check. In production that means refuse.
    if (required) {
      return { ok: false, skipped: false, codes: ["verify-unreachable"], reason: "unavailable" };
    }
    return { ok: true, skipped: true };
  }
}
