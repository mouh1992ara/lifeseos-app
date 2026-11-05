/**
 * One registry for the whole tools library.
 *
 * Structure only — every visible string lives in `Tools.catalog` and
 * `Tools.categories`, so the page filters on localized text. `keywords` are
 * English search aids only: they let "sitemap" or "schema" find a tool even in
 * a locale whose title words the visitor would not think to type.
 */

export type ToolCategory =
  | "technical"
  | "onPage"
  | "crawling"
  | "performance"
  | "content"
  | "youtube";

export type ToolEntry = {
  /** Catalog key, also the icon key. */
  key: string;
  /** Real URL path, locale-less. */
  slug: string;
  /** Category shown on the card and used as the primary filter bucket. */
  primary: ToolCategory;
  /** Extra buckets this tool genuinely serves; filtering only, never labelled. */
  also?: ToolCategory[];
  /** English search aids. */
  keywords: string[];
};

export const TOOL_CATEGORY_ORDER: ToolCategory[] = [
  "technical",
  "onPage",
  "crawling",
  "performance",
  "content",
  "youtube",
];

export const TOOLS: ToolEntry[] = [
  {
    key: "seoAnalyzer",
    slug: "seo-analyzer",
    primary: "technical",
    also: ["onPage", "performance"],
    keywords: ["audit", "website", "health", "crawl", "issues", "inspection", "search"],
  },
  {
    key: "seoPageAnalyzer",
    slug: "seo-page-analyzer",
    primary: "onPage",
    also: ["technical"],
    keywords: ["titles", "headings", "links", "meta", "on-page", "page", "html"],
  },
  {
    key: "robotsTxtGenerator",
    slug: "robots-txt-generator",
    primary: "crawling",
    keywords: ["robots", "crawler", "disallow", "bot", "indexing", "txt"],
  },
  {
    key: "xmlSitemapGenerator",
    slug: "xml-sitemap-generator",
    primary: "crawling",
    keywords: ["sitemap", "xml", "network", "indexing", "urls", "discovery"],
  },
  {
    key: "schemaMarkupGenerator",
    slug: "schema-markup-generator",
    primary: "technical",
    keywords: ["schema", "structured", "data", "json-ld", "rich", "results", "code"],
  },
  {
    key: "httpStatusChecker",
    slug: "http-status-checker",
    primary: "technical",
    also: ["crawling"],
    keywords: ["http", "status", "redirect", "404", "500", "server", "ping", "response"],
  },
  {
    key: "metaTagGenerator",
    slug: "meta-tag-generator",
    primary: "onPage",
    keywords: ["meta", "tags", "title", "description", "open", "graph", "social"],
  },
  {
    key: "serpSnippetPreview",
    slug: "serp-snippet-preview",
    primary: "onPage",
    keywords: ["serp", "snippet", "preview", "google", "results", "desktop", "mobile"],
  },
  {
    key: "pageSpeed",
    slug: "page-speed",
    primary: "performance",
    also: ["technical"],
    keywords: ["speed", "performance", "lighthouse", "core", "web", "vitals", "loading", "gauge"],
  },
  {
    key: "keywordDensityChecker",
    slug: "keyword-density-checker",
    primary: "content",
    keywords: ["keyword", "density", "frequency", "target", "research", "text", "words"],
  },
  {
    key: "articleRewriter",
    slug: "article-rewriter",
    primary: "content",
    keywords: ["rewrite", "article", "writing", "rephrase", "tone", "readability"],
  },
  {
    key: "contentAnalyzer",
    slug: "content-analyzer",
    primary: "content",
    also: ["onPage"],
    keywords: ["content", "readability", "document", "writing", "quality", "analysis"],
  },
  {
    key: "youtubeKeywordIdeas",
    slug: "youtube-keyword-ideas",
    primary: "youtube",
    keywords: ["youtube", "video", "keyword", "ideas", "tags", "topics", "long-tail"],
  },
  {
    key: "youtubeTitleGenerator",
    slug: "youtube-title-generator",
    primary: "youtube",
    keywords: ["youtube", "title", "generator", "video", "click", "headline"],
  },
  {
    key: "youtubeTitleAnalyzer",
    slug: "youtube-title-analyzer",
    primary: "youtube",
    keywords: ["youtube", "title", "analyzer", "score", "length", "clarity"],
  },
  {
    key: "youtubeDescriptionGenerator",
    slug: "youtube-description-generator",
    primary: "youtube",
    keywords: ["youtube", "description", "hashtags", "cta", "video"],
  },
  {
    key: "youtubeScriptWriter",
    slug: "youtube-script-writer",
    primary: "youtube",
    keywords: ["youtube", "script", "writer", "hook", "outline", "video", "story"],
  },
];

export function toolHref(tool: ToolEntry) {
  return `/tools/${tool.slug}`;
}

/** Does the tool live in the selected bucket? */
export function inCategory(tool: ToolEntry, category: ToolCategory) {
  return tool.primary === category || (tool.also?.includes(category) ?? false);
}

export function countByCategory(category: ToolCategory) {
  return TOOLS.filter((t) => inCategory(t, category)).length;
}