/**
 * Structure only — every visible string lives in the message catalogs under
 * `Audience.<slug>`, `Audience.toolDescriptions` and `Audience.guideTitles`.
 * Keeping copy out of these modules is what makes full localization possible.
 */

export type AudienceSlug = "youtubers" | "bloggers" | "agencies";

export const audienceSlugs: AudienceSlug[] = ["youtubers", "bloggers", "agencies"];

export type Audience = {
  slug: AudienceSlug;
  primaryCtaHref: string;
  tools: string[];
  guides: string[];
};

export const audiences: Record<AudienceSlug, Audience> = {
  youtubers: {
    slug: "youtubers",
    primaryCtaHref: "/tools/youtube-title-generator",
    tools: [
      "youtube-keyword-ideas",
      "youtube-title-generator",
      "youtube-title-analyzer",
      "youtube-description-generator",
      "youtube-script-writer",
      "meta-tag-generator",
      "seo-analyzer",
    ],
    guides: ["on-page-seo-checklist", "seo-meta-tags-guide", "keyword-density-guide"],
  },

  bloggers: {
    slug: "bloggers",
    primaryCtaHref: "/tools/content-analyzer",
    tools: [
      "content-analyzer",
      "keyword-density-checker",
      "meta-tag-generator",
      "serp-snippet-preview",
      "schema-markup-generator",
      "article-rewriter",
      "page-speed",
    ],
    guides: [
      "content-analysis-seo-guide",
      "keyword-density-guide",
      "on-page-seo-checklist",
      "seo-meta-tags-guide",
    ],
  },

  agencies: {
    slug: "agencies",
    primaryCtaHref: "/tools/seo-analyzer",
    tools: [
      "seo-analyzer",
      "seo-page-analyzer",
      "http-status-checker",
      "xml-sitemap-generator",
      "robots-txt-generator",
      "page-speed",
      "schema-markup-generator",
    ],
    guides: [
      "complete-seo-audit-guide",
      "technical-seo-guide",
      "http-status-codes-seo-guide",
      "xml-sitemap-guide",
      "robots-txt-guide",
    ],
  },
};

/** Tool slugs, used by the tools index and the sitemap. */
export const toolCatalogSlugs = [  "seo-analyzer",
  "seo-page-analyzer",
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
] as const;
/**
 * URL slug → message-catalog key for `Tools.catalog`.
 * Slugs are kebab-case for SEO; catalog keys are camelCase. Keeping the
 * mapping in one place avoids lookups that silently miss.
 */
export const toolKeyBySlug: Record<string, string> = {
  "seo-analyzer": "seoAnalyzer",
  "seo-page-analyzer": "seoPageAnalyzer",
  "page-speed": "pageSpeed",
  "content-analyzer": "contentAnalyzer",
  "http-status-checker": "httpStatusChecker",
  "xml-sitemap-generator": "xmlSitemapGenerator",
  "robots-txt-generator": "robotsTxtGenerator",
  "meta-tag-generator": "metaTagGenerator",
  "serp-snippet-preview": "serpSnippetPreview",
  "keyword-density-checker": "keywordDensityChecker",
  "schema-markup-generator": "schemaMarkupGenerator",
  "article-rewriter": "articleRewriter",
  "youtube-keyword-ideas": "youtubeKeywordIdeas",
  "youtube-title-generator": "youtubeTitleGenerator",
  "youtube-title-analyzer": "youtubeTitleAnalyzer",
  "youtube-description-generator": "youtubeDescriptionGenerator",
  "youtube-script-writer": "youtubeScriptWriter",
};

/** Catalog key for a tool slug, falling back to the slug itself. */
export function toolKeyForSlug(slug: string): string {
  return toolKeyBySlug[slug] ?? slug;
}

/** Catalog key for a `/tools/<slug>` URL. */
export function toolKeyForUrl(url: string): string {
  return toolKeyForSlug(url.replace(/^\/tools\//, "").replace(/\/+$/, ""));
}
