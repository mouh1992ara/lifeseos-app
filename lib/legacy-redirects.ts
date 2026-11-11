/**
 * Legacy URL resolution.
 *
 * The previous site was WordPress with flat tool slugs and language prefixes
 * (`/fr/online-ping-website-tool`), plus `/page/...` for static pages. Those
 * URLs are still in search results and in backlinks, so each one needs a
 * deliberate answer rather than the generic 404 it was getting.
 *
 * Three outcomes, and only three:
 *
 *   redirect  a genuinely equivalent page exists → permanent redirect to it
 *   gone      the thing no longer exists → 410, so Google drops it quickly
 *   null      not a legacy URL → let the app decide
 *
 * Two rules the previous hand-written table broke and this one keeps:
 *
 *   1. A supported locale keeps its locale. `/fr/x` goes to `/fr/tools/x`,
 *      never to the English page — the French page exists, so sending a French
 *      searcher to English throws away both the language and the intent.
 *   2. Never redirect to the homepage as a catch-all. A 410 says "this is gone"
 *      once; a redirect to `/` says it a thousand times and looks like a soft
 *      404.
 *
 * An unsupported language still redirects to the English *tool* when the tool
 * itself exists, because the content is equivalent even though the language is
 * not. The language *root* has no equivalent, so it is gone.
 */

/** Every tool that actually exists today (directories with a page.tsx). */
export const TOOL_SLUGS = [
  "article-rewriter",
  "content-analyzer",
  "http-status-checker",
  "keyword-density-checker",
  "meta-tag-generator",
  "page-speed",
  "robots-txt-generator",
  "schema-markup-generator",
  "seo-analyzer",
  "seo-page-analyzer",
  "serp-snippet-preview",
  "xml-sitemap-generator",
  "youtube-description-generator",
  "youtube-keyword-ideas",
  "youtube-script-writer",
  "youtube-title-analyzer",
  "youtube-title-generator",
] as const;

const TOOL_SET = new Set<string>(TOOL_SLUGS);

/** Locales the old site published that this site does not. */
const LEGACY_LOCALES = new Set(["es", "de", "it", "pt", "ru", "nl", "pl", "tr"]);

/** Locales this site actually serves. */
const LIVE_LOCALES = new Set(["en", "ar", "fr", "zh"]);

/**
 * Old tool names that map onto a tool we still have. The left side is the old
 * slug, the right side the current one — the two are not always equal because
 * some tools were renamed rather than removed.
 */
const LEGACY_TOOL_ALIASES: Record<string, string> = {
  /* "server-status-checker" and "check-http-status" really did report HTTP
     response codes, so the status checker is their equivalent. */
  "server-status-checker": "http-status-checker",
  "check-http-status": "http-status-checker",
  "seo-content-analyzer": "content-analyzer",
  "content-analyzer-tool": "content-analyzer",
  "google-meta-tag-generator": "meta-tag-generator",
  "meta-tags-generator": "meta-tag-generator",
  "sitemap-generator": "xml-sitemap-generator",
  "xml-sitemap-builder": "xml-sitemap-generator",
  "robots-generator": "robots-txt-generator",
  "robots-txt-builder": "robots-txt-generator",
  "schema-generator": "schema-markup-generator",
  "schema-markup-builder": "schema-markup-generator",
  "serp-preview": "serp-snippet-preview",
  "snippet-preview": "serp-snippet-preview",
  "article-spinner": "article-rewriter",
  "article-rewrite": "article-rewriter",
  "page-speed-test": "page-speed",
  "website-speed-test": "page-speed",
  "seo-page-analyzer": "seo-page-analyzer",
  "website-seo-analyzer": "seo-analyzer",
  "seo-checker": "seo-analyzer",
  "youtube-keyword-tool": "youtube-keyword-ideas",
  "youtube-tag-generator": "youtube-keyword-ideas",
  "youtube-title-maker": "youtube-title-generator",
  "youtube-script-generator": "youtube-script-writer",
  "youtube-description-writer": "youtube-description-generator",
};

/**
 * Old tools with no equivalent here. These are 410 rather than 404 because we
 * know they existed and know they are not coming back — claiming "not found"
 * invites Google to keep re-crawling, while "gone" is a settled answer.
 */
const GONE_TOOLS = new Set<string>([
  /* A "ping" tool reports reachability and round-trip time. The status checker
     reports a response code and a redirect chain — the elapsed time is computed
     but never shown, and no locale has a label for it. Redirecting a ping
     search here answers a latency question with a status code, so these are
     gone rather than moved. */
  "online-ping-website-tool",
  "ping-website",
  "website-ping",
  "ping-test",
  "online-md5-generator",
  "md5-generator",
  "link-price-calculator",
  "keyword-position-checker",
  "keyword-position-tool",
  "rank-checker",
  "backlink-checker",
  "domain-authority-checker",
  "whois-lookup",
  "ip-lookup",
]);

/** Static pages the old site published under `/page/...`. */
const LEGACY_PAGES: Record<string, string> = {
  "about-us": "/about",
  "about": "/about",
  "contact-us": "/contact",
  "contact": "/contact",
  "privacy-policy": "/privacy",
  "privacy": "/privacy",
  "terms-of-service": "/terms",
  "terms-and-conditions": "/terms",
  "terms": "/terms",
};

export type LegacyResult =
  | { kind: "redirect"; to: string }
  | { kind: "gone" };

/**
 * Resolve a request path against the legacy map.
 *
 * `localePrefix` is the locale already detected on the incoming path, or null
 * when the path has none. It is passed in because the caller has already done
 * the splitting and duplicating that logic invites drift.
 */
export function resolveLegacy(
  path: string,
  localePrefix: string | null,
): LegacyResult | null {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  /* `path` arrives with a live locale already stripped, so the locale can only
     come from the caller. Legacy locales (es/de/…) are NOT stripped, which is
     why they still appear as the first segment below. */
  const pathLocaleInUrl = localePrefix;

  const [first, ...rest] = segments;

  /* Paths that belong to the app keep their existing behaviour. Checked first
     so a legacy slug can never shadow a real route. */
  const APP_ROOTS = new Set([
    "tools", "blog", "about", "contact", "privacy", "terms", "editorial",
    "dashboard", "admin", "auth", "api", "for", "protected", "_next",
  ]);
  if (APP_ROOTS.has(first)) return null;

  /* /page/about-us → /about. The old CMS put static pages under /page/. */
  if (first === "page" && rest.length === 1) {
    const target = LEGACY_PAGES[rest[0]];
    return target ? { kind: "redirect", to: target } : { kind: "gone" };
  }

  /* A legacy language prefix on a path with no legitimate locale. */
  if (LEGACY_LOCALES.has(first) && !LIVE_LOCALES.has(first)) {
    const tail = rest.join("/");

    // Language root: nothing equivalent exists in that language.
    if (!tail) return { kind: "gone" };

    const tailSegments = tail.split("/");

    /* /pt/page/about-us → /about. The language prefix and the CMS /page/ prefix
       stack, and the old table only ever modelled them one at a time. */
    if (tailSegments[0] === "page" && tailSegments.length === 2) {
      const target = LEGACY_PAGES[tailSegments[1]];
      return target ? { kind: "redirect", to: target } : { kind: "gone" };
    }

    const maybeTool = tailSegments[0];
    const mapped = LEGACY_TOOL_ALIASES[maybeTool] ?? maybeTool;

    if (GONE_TOOLS.has(maybeTool)) return { kind: "gone" };
    if (TOOL_SET.has(mapped) && tail.split("/").length === 1) {
      // Content is equivalent even though the language is not, so the English
      // tool is a better answer than a 410.
      return { kind: "redirect", to: `/tools/${mapped}` };
    }
    if (LEGACY_PAGES[maybeTool]) {
      return { kind: "redirect", to: LEGACY_PAGES[maybeTool] };
    }
    return { kind: "gone" };
  }

  /* A legacy slug under a live locale: /fr/online-ping-website-tool. This used
     to fall through to `null`, which handed the request to the i18n middleware
     and produced a page; the gone check has to happen before the length test,
     not inside it. */
  if (pathLocaleInUrl && rest.length === 1) {
    const slug = rest[0];
    if (GONE_TOOLS.has(slug)) return { kind: "gone" };
    const mapped = LEGACY_TOOL_ALIASES[slug] ?? slug;
    if (TOOL_SET.has(mapped)) {
      return { kind: "redirect", to: `/${pathLocaleInUrl}/tools/${mapped}` };
    }
    if (LEGACY_PAGES[slug]) return { kind: "redirect", to: LEGACY_PAGES[slug] };
    return null;
  }

  /* A legacy flat slug under a live locale: /fr/keyword-density-checker →
     /fr/tools/keyword-density-checker. Locale is preserved. */
  if (segments.length === 1) {
    const slug = first;
    const mapped = LEGACY_TOOL_ALIASES[slug] ?? slug;

    if (GONE_TOOLS.has(slug)) return { kind: "gone" };
    if (TOOL_SET.has(mapped)) {
      const base = localePrefix ? `/${localePrefix}` : "";
      return { kind: "redirect", to: `${base}/tools/${mapped}` };
    }
    if (LEGACY_PAGES[slug]) return { kind: "redirect", to: LEGACY_PAGES[slug] };
    return null;
  }

  return null;
}
