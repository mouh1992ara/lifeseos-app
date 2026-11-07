import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Blog: old HTTP status guide URL
      {
        source: "/blog/http-status-codes-seo",
        destination: "/blog/http-status-codes-seo-guide",
        permanent: true,
      },
      {
        source: "/es",
        destination: "/",
        permanent: true,
      },
      {
        source: "/es/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/fr/online-ping-website-tool",
        destination: "/tools/http-status-checker",
        permanent: true,
      },

      // Keyword Density Checker
      {
        source: "/keyword-density-checker",
        destination: "/tools/keyword-density-checker",
        permanent: true,
      },
      {
        source: "/fr/keyword-density-checker",
        destination: "/tools/keyword-density-checker",
        permanent: true,
      },
      {
        source: "/de/keyword-density-checker",
        destination: "/tools/keyword-density-checker",
        permanent: true,
      },
      {
        source: "/es/keyword-density-checker",
        destination: "/tools/keyword-density-checker",
        permanent: true,
      },

      // Robots.txt Generator
      {
        source: "/robots-txt-generator",
        destination: "/tools/robots-txt-generator",
        permanent: true,
      },
      {
        source: "/fr/robots-txt-generator",
        destination: "/tools/robots-txt-generator",
        permanent: true,
      },
      {
        source: "/de/robots-txt-generator",
        destination: "/tools/robots-txt-generator",
        permanent: true,
      },
      {
        source: "/es/robots-txt-generator",
        destination: "/tools/robots-txt-generator",
        permanent: true,
      },

      // XML Sitemap Generator
      {
        source: "/xml-sitemap-generator",
        destination: "/tools/xml-sitemap-generator",
        permanent: true,
      },
      {
        source: "/fr/xml-sitemap-generator",
        destination: "/tools/xml-sitemap-generator",
        permanent: true,
      },
      {
        source: "/de/xml-sitemap-generator",
        destination: "/tools/xml-sitemap-generator",
        permanent: true,
      },
      {
        source: "/es/xml-sitemap-generator",
        destination: "/tools/xml-sitemap-generator",
        permanent: true,
      },

      // Meta Tag Generator
      {
        source: "/meta-tag-generator",
        destination: "/tools/meta-tag-generator",
        permanent: true,
      },
      {
        source: "/fr/meta-tag-generator",
        destination: "/tools/meta-tag-generator",
        permanent: true,
      },
      {
        source: "/de/meta-tag-generator",
        destination: "/tools/meta-tag-generator",
        permanent: true,
      },
      {
        source: "/es/meta-tag-generator",
        destination: "/tools/meta-tag-generator",
        permanent: true,
      },

      // Server Status Checker
      {
        source: "/server-status-checker",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
      {
        source: "/fr/server-status-checker",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
      {
        source: "/de/server-status-checker",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
      {
        source: "/es/server-status-checker",
        destination: "/tools/http-status-checker",
        permanent: true,
      },

      // Online Ping Website Tool
      {
        source: "/online-ping-website-tool",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
      {
        source: "/es/online-ping-website-tool",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
      {
        source: "/de/online-ping-website-tool",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
      {
        source: "/pt/online-ping-website-tool",
        destination: "/tools/http-status-checker",
        permanent: true,
      },
      {
        source: "/it/online-ping-website-tool",
        destination: "/tools/http-status-checker",
        permanent: true,
      },

      // About
      {
        source: "/page/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/es/page/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/de/page/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/it/page/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/pt/page/about-us",
        destination: "/about",
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