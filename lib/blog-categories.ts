/**
 * Stable category keys for the blog.
 *
 * The article JSON carries a *localized* `category` label, which cannot be used
 * for filtering (it changes per locale). These keys never change, and the UI
 * takes its label from `Blog.categories.*` so the pills stay translated.
 *
 * Only categories with real content are exposed — inventing empty buckets makes
 * a library look bigger than it is.
 */

export type BlogCategoryKey = "technical" | "onPage" | "content" | "audits";

export const CATEGORY_BY_SLUG: Record<string, BlogCategoryKey> = {
  "complete-seo-audit-guide": "audits",
  "content-analysis-seo-guide": "content",
  "keyword-density-guide": "content",
  "on-page-seo-checklist": "onPage",
  "seo-meta-tags-guide": "onPage",
  "http-status-codes-seo-guide": "technical",
  "page-speed-seo-guide": "technical",
  "robots-txt-guide": "technical",
  "technical-seo-guide": "technical",
  "xml-sitemap-guide": "technical",
};

/** Display order for the filter rail. */
export const CATEGORY_ORDER: BlogCategoryKey[] = [
  "technical",
  "onPage",
  "content",
  "audits",
];

export function categoryOf(slug: string): BlogCategoryKey | null {
  return CATEGORY_BY_SLUG[slug] ?? null;
}
