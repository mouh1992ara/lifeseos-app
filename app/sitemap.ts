import type { MetadataRoute } from "next";

import {
  buildLanguageAlternates,
  defaultLocale,
  locales,
  localizePath,
} from "@/i18n/config";
import { audienceSlugs } from "@/lib/audiences";
import { ARTICLE_SLUGS } from "@/lib/blog";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

type Freq = "daily" | "weekly" | "monthly" | "yearly";

const PAGES: { path: string; freq: Freq; priority: number }[] = [
  { path: "/", freq: "weekly", priority: 1 },
  { path: "/tools", freq: "weekly", priority: 0.9 },
  { path: "/blog", freq: "weekly", priority: 0.9 },
  // Trust page: explains how the tools are built, tested and corrected.
  { path: "/editorial", freq: "monthly", priority: 0.7 },

  ...audienceSlugs.map((slug) => ({
    path: `/for/${slug}`,
    freq: "monthly" as Freq,
    priority: 0.8,
  })),

  ...ARTICLE_SLUGS.map((slug) => ({
    path: `/blog/${slug}`,
    freq: "monthly" as Freq,
    priority: 0.8,
  })),

  // High-demand tools are crawled more often.
  { path: "/tools/seo-analyzer", freq: "weekly", priority: 0.9 },
  { path: "/tools/seo-page-analyzer", freq: "weekly", priority: 0.9 },

  ...[
    "page-speed",
    "content-analyzer",
    "http-status-checker",
    "xml-sitemap-generator",
    "meta-tag-generator",
    "serp-snippet-preview",
    "robots-txt-generator",
    "keyword-density-checker",
    "schema-markup-generator",
    "article-rewriter",
    "youtube-keyword-ideas",
    "youtube-title-generator",
    "youtube-title-analyzer",
    "youtube-description-generator",
    "youtube-script-writer",
  ].map((slug) => ({
    path: `/tools/${slug}`,
    freq: "monthly" as Freq,
    priority: 0.8,
  })),

  { path: "/about", freq: "monthly", priority: 0.6 },
  { path: "/contact", freq: "monthly", priority: 0.6 },
  { path: "/privacy", freq: "yearly", priority: 0.3 },
  { path: "/terms", freq: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of PAGES) {
    // Every locale carries the full hreflang cluster so search engines can pick
    // the right regional variant for any page.
    const languages = buildLanguageAlternates(baseUrl, page.path);

    for (const locale of locales) {
      entries.push({
        url: baseUrl + localizePath(locale, page.path),
        changeFrequency: page.freq,
        priority: locale === defaultLocale ? page.priority : Number((page.priority * 0.9).toFixed(2)),
        alternates: { languages },
      });
    }
  }

  return entries;
}
