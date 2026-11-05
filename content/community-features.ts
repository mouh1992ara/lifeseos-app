/**
 * Cards shown in the community slot until real customer reviews exist.
 *
 * Every entry is a shipped tool: the slug is a live route and the copy comes
 * from the existing `Tools.catalog` translations, so nothing here is invented.
 * Swap this list out by filling `TESTIMONIALS` in `content/testimonials.ts` —
 * the carousel prefers real reviews automatically once that array is non-empty.
 */

import type { ToolCategory } from "@/lib/tool-catalog";

export type FeatureCard = {
  /** Catalog key: also selects the icon and accent used by the tool cards. */
  key: string;
  /** Real, live route. */
  href: string;
  category: ToolCategory;
};

export const FEATURE_CARDS: FeatureCard[] = [
  { key: "seoAnalyzer", href: "/tools/seo-analyzer", category: "technical" },
  { key: "pageSpeed", href: "/tools/page-speed", category: "performance" },
  { key: "httpStatusChecker", href: "/tools/http-status-checker", category: "technical" },
  {
    key: "schemaMarkupGenerator",
    href: "/tools/schema-markup-generator",
    category: "technical",
  },
  { key: "xmlSitemapGenerator", href: "/tools/xml-sitemap-generator", category: "crawling" },
  {
    key: "youtubeKeywordIdeas",
    href: "/tools/youtube-keyword-ideas",
    category: "youtube",
  },
];
