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
     78 KB favicon re-downloaded on every single page view. Next's immutable
     caching only applies to content-hashed `/_next/static` output; files under
     /public (and app/icon.png, which Next serves at /icon.png) fall through to
     the default.

     A one-year immutable cache is safe here because these paths are not
     content-hashed — but they are brand assets that change roughly never, and a
     rename forces a fresh fetch. HTML is deliberately untouched: it must keep
     revalidating so deploys are visible immediately. */
  async headers() {
    return [
      {
        source: "/icon.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:file(favicon-.*\\.png|apple-touch-icon.*\\.png|icon-.*\\.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);