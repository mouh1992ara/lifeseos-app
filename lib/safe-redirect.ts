/**
 * Redirect targets taken from query strings.
 *
 * `next.startsWith("/")` is not enough. `//evil.example` also starts with a
 * slash, and browsers read it as a protocol-relative URL — so a link like
 * `/auth/login?next=//evil.example` would bounce the user off-site after a
 * successful sign-in. Backslashes and control characters are normalised into
 * slashes by some browsers, so they are rejected too.
 *
 * Rule: the value must be a single-slash absolute path, nothing else.
 */

const MAX_LENGTH = 512;

export function safePath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (raw.length > MAX_LENGTH) return fallback;

  // Control characters, whitespace, and backslashes are all rewritten by
  // browsers into something that may traverse; refuse rather than sanitise.
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;

  // Must start with exactly one slash.
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;

  // `/\` and `/%5c` variants resolve to `//` after decoding in some clients.
  if (/^\/[/\\]/.test(raw)) return fallback;

  return raw;
}

/** Convenience for the common locale-aware case. */
export function safePathOr(raw: string | null | undefined, fallback: string) {
  return safePath(raw, fallback);
}
