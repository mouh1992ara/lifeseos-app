import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    /* Legacy WordPress URLs are handled in proxy.ts, not here.
     *
     * next.config redirects run before middleware, so a rule here wins outright
     * — and the old table got two things wrong that only middleware can get
     * right: it dropped the locale (`/fr/keyword-density-checker` →
     * `/tools/...`, an English page, though `/fr/tools/...` exists), and it
     * answered unsupported language roots by redirecting to the homepage, which
     * is a soft 404 that keeps the dead URL alive.
     *
     * Only redirects that need no locale awareness belong here.
     */
    return [
      // The guide was renamed; the slug moved rather than the content.
      {
        source: "/blog/http-status-codes-seo",
        destination: "/blog/http-status-codes-seo-guide",
        permanent: true,
      },
    ];
  },

  /* Static image assets were served with `max-age=0, must-revalidate`, so the
     78 KB favicon re-downloaded on every single page view. Next only sets
     immutable caching on content-hashed output under /_next/static; files it
     serves from app/ fall through to the default.

     Why a week and not a year:
     Next does version its metadata icons — the rendered tag is
     `/icon.png?icon.<hash>.png` — so an immutable year would be safe for the
     versioned URL. But `/icon.png` is also reachable directly (a bookmark, a
     crawler, a pasted link), and that bare URL has no version query. A one-year
     immutable policy there would pin an updated logo for a year with no way to
     recover short of renaming the file.

     One week plus a month of stale-while-revalidate removes the per-page-view
     cost that was the actual bug, while guaranteeing a new icon is picked up
     within seven days. Repeat visitors within the week — the overwhelming
     majority — never re-download it at all. */
  async headers() {
    const ICON_CACHE = "public, max-age=604800, stale-while-revalidate=2592000";
    const headers = [{ key: "Cache-Control", value: ICON_CACHE }];

    return [
      { source: "/icon.png", headers },
      { source: "/favicon.ico", headers },
      { source: "/apple-icon.png", headers },
      {
        source: "/:file(favicon-.*\\\\.png|apple-touch-icon.*\\\\.png|icon-.*\\\\.png)",
        headers,
      },
    ];
  },
};

export default withNextIntl(nextConfig);