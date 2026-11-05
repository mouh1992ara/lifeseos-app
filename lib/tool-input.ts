/**
 * Input normalisation shared by the generator tools.
 *
 * Both generators were emitting values Google rejects:
 *  - a <loc> without a scheme ("example.com/page") is invalid per the sitemap
 *    protocol, and duplicates are ignored but bloat the file;
 *  - "Disallow: admin" (no leading slash) is not a valid robots.txt rule.
 * Normalising here keeps the output copy-pasteable as-is.
 */

/** Returns an absolute http(s) URL, or null when the value cannot be one. */
export function normaliseUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    // Hash fragments are not part of a sitemap URL.
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/** robots.txt paths must start with "/" (or be "*"). */
export function normalisePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "*") return trimmed;
  const withoutHost = trimmed.replace(/^https?:\/\/[^/]+\//i, "/");
  return withoutHost.startsWith("/") ? withoutHost : `/${withoutHost}`;
}

/** Splits a textarea into trimmed, non-empty lines. */
export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Normalises, de-duplicates and validates a list of sitemap URLs.
 * Order is preserved so the output matches what the visitor typed.
 */
export function parseSitemapUrls(value: string): { valid: string[]; invalid: number } {
  const seen = new Set<string>();
  const valid: string[] = [];
  let invalid = 0;

  for (const line of splitLines(value)) {
    const url = normaliseUrl(line);
    if (!url) {
      invalid += 1;
      continue;
    }
    if (seen.has(url)) continue;
    seen.add(url);
    valid.push(url);
  }

  return { valid, invalid };
}

/** Text content inside <title>…</title>. */
export function escapeHtmlText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Attribute values: a raw quote used to break the generated tag. */
export function escapeHtmlAttribute(value: string) {
  return escapeHtmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
