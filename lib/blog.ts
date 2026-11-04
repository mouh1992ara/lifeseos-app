import "server-only";

import type { Locale } from "@/i18n/config";

export type ArticleSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  tip?: string;
  links?: { label: string; href: string }[];
  images?: { src: string; alt: string }[];
};

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  featuredImage: string;
  imageAlt: string;
  sections: ArticleSection[];
  toolName: string;
  toolUrl: string;
};

/** Stable reading order, independent of the active locale. */
export const ARTICLE_SLUGS = [
  "complete-seo-audit-guide",
  "seo-meta-tags-guide",
  "page-speed-seo-guide",
  "technical-seo-guide",
  "xml-sitemap-guide",
  "robots-txt-guide",
  "http-status-codes-seo-guide",
  "keyword-density-guide",
  "content-analysis-seo-guide",
  "on-page-seo-checklist",
] as const;

export type ArticleSlug = (typeof ARTICLE_SLUGS)[number];

// Explicit import maps keep every article statically analyzable at build time.
type Loader = () => Promise<BlogArticle>;

const loaders: Record<Locale, Record<ArticleSlug, Loader>> = {
  en: {
    "complete-seo-audit-guide": () =>
      import("@/content/blog/en/complete-seo-audit-guide.json").then((m) => m.default as BlogArticle),
    "seo-meta-tags-guide": () =>
      import("@/content/blog/en/seo-meta-tags-guide.json").then((m) => m.default as BlogArticle),
    "page-speed-seo-guide": () =>
      import("@/content/blog/en/page-speed-seo-guide.json").then((m) => m.default as BlogArticle),
    "technical-seo-guide": () =>
      import("@/content/blog/en/technical-seo-guide.json").then((m) => m.default as BlogArticle),
    "xml-sitemap-guide": () =>
      import("@/content/blog/en/xml-sitemap-guide.json").then((m) => m.default as BlogArticle),
    "robots-txt-guide": () =>
      import("@/content/blog/en/robots-txt-guide.json").then((m) => m.default as BlogArticle),
    "http-status-codes-seo-guide": () =>
      import("@/content/blog/en/http-status-codes-seo-guide.json").then((m) => m.default as BlogArticle),
    "keyword-density-guide": () =>
      import("@/content/blog/en/keyword-density-guide.json").then((m) => m.default as BlogArticle),
    "content-analysis-seo-guide": () =>
      import("@/content/blog/en/content-analysis-seo-guide.json").then((m) => m.default as BlogArticle),
    "on-page-seo-checklist": () =>
      import("@/content/blog/en/on-page-seo-checklist.json").then((m) => m.default as BlogArticle),
  },
  ar: {
    "complete-seo-audit-guide": () =>
      import("@/content/blog/ar/complete-seo-audit-guide.json").then((m) => m.default as BlogArticle),
    "seo-meta-tags-guide": () =>
      import("@/content/blog/ar/seo-meta-tags-guide.json").then((m) => m.default as BlogArticle),
    "page-speed-seo-guide": () =>
      import("@/content/blog/ar/page-speed-seo-guide.json").then((m) => m.default as BlogArticle),
    "technical-seo-guide": () =>
      import("@/content/blog/ar/technical-seo-guide.json").then((m) => m.default as BlogArticle),
    "xml-sitemap-guide": () =>
      import("@/content/blog/ar/xml-sitemap-guide.json").then((m) => m.default as BlogArticle),
    "robots-txt-guide": () =>
      import("@/content/blog/ar/robots-txt-guide.json").then((m) => m.default as BlogArticle),
    "http-status-codes-seo-guide": () =>
      import("@/content/blog/ar/http-status-codes-seo-guide.json").then((m) => m.default as BlogArticle),
    "keyword-density-guide": () =>
      import("@/content/blog/ar/keyword-density-guide.json").then((m) => m.default as BlogArticle),
    "content-analysis-seo-guide": () =>
      import("@/content/blog/ar/content-analysis-seo-guide.json").then((m) => m.default as BlogArticle),
    "on-page-seo-checklist": () =>
      import("@/content/blog/ar/on-page-seo-checklist.json").then((m) => m.default as BlogArticle),
  },
  fr: {
    "complete-seo-audit-guide": () =>
      import("@/content/blog/fr/complete-seo-audit-guide.json").then((m) => m.default as BlogArticle),
    "seo-meta-tags-guide": () =>
      import("@/content/blog/fr/seo-meta-tags-guide.json").then((m) => m.default as BlogArticle),
    "page-speed-seo-guide": () =>
      import("@/content/blog/fr/page-speed-seo-guide.json").then((m) => m.default as BlogArticle),
    "technical-seo-guide": () =>
      import("@/content/blog/fr/technical-seo-guide.json").then((m) => m.default as BlogArticle),
    "xml-sitemap-guide": () =>
      import("@/content/blog/fr/xml-sitemap-guide.json").then((m) => m.default as BlogArticle),
    "robots-txt-guide": () =>
      import("@/content/blog/fr/robots-txt-guide.json").then((m) => m.default as BlogArticle),
    "http-status-codes-seo-guide": () =>
      import("@/content/blog/fr/http-status-codes-seo-guide.json").then((m) => m.default as BlogArticle),
    "keyword-density-guide": () =>
      import("@/content/blog/fr/keyword-density-guide.json").then((m) => m.default as BlogArticle),
    "content-analysis-seo-guide": () =>
      import("@/content/blog/fr/content-analysis-seo-guide.json").then((m) => m.default as BlogArticle),
    "on-page-seo-checklist": () =>
      import("@/content/blog/fr/on-page-seo-checklist.json").then((m) => m.default as BlogArticle),
  },
  zh: {
    "complete-seo-audit-guide": () =>
      import("@/content/blog/zh/complete-seo-audit-guide.json").then((m) => m.default as BlogArticle),
    "seo-meta-tags-guide": () =>
      import("@/content/blog/zh/seo-meta-tags-guide.json").then((m) => m.default as BlogArticle),
    "page-speed-seo-guide": () =>
      import("@/content/blog/zh/page-speed-seo-guide.json").then((m) => m.default as BlogArticle),
    "technical-seo-guide": () =>
      import("@/content/blog/zh/technical-seo-guide.json").then((m) => m.default as BlogArticle),
    "xml-sitemap-guide": () =>
      import("@/content/blog/zh/xml-sitemap-guide.json").then((m) => m.default as BlogArticle),
    "robots-txt-guide": () =>
      import("@/content/blog/zh/robots-txt-guide.json").then((m) => m.default as BlogArticle),
    "http-status-codes-seo-guide": () =>
      import("@/content/blog/zh/http-status-codes-seo-guide.json").then((m) => m.default as BlogArticle),
    "keyword-density-guide": () =>
      import("@/content/blog/zh/keyword-density-guide.json").then((m) => m.default as BlogArticle),
    "content-analysis-seo-guide": () =>
      import("@/content/blog/zh/content-analysis-seo-guide.json").then((m) => m.default as BlogArticle),
    "on-page-seo-checklist": () =>
      import("@/content/blog/zh/on-page-seo-checklist.json").then((m) => m.default as BlogArticle),
  },
};

/** All articles for a locale, in the canonical reading order. */
export async function getArticles(locale: Locale): Promise<BlogArticle[]> {
  const load = loaders[locale] ?? loaders.en;
  return Promise.all(ARTICLE_SLUGS.map((slug) => load[slug]()));
}

export async function getArticle(
  locale: Locale,
  slug: string,
): Promise<BlogArticle | null> {
  if (!(ARTICLE_SLUGS as readonly string[]).includes(slug)) return null;
  const load = loaders[locale] ?? loaders.en;
  const article = await load[slug as ArticleSlug]();
  // Guard against a locale file accidentally keeping an English slug.
  return article.slug === slug ? article : { ...article, slug };
}

/** The three next articles in reading order, wrapping around. */
export async function getRelatedArticles(
  locale: Locale,
  slug: string,
  count = 3,
): Promise<BlogArticle[]> {
  const all = await getArticles(locale);
  const index = all.findIndex((a) => a.slug === slug);
  if (index === -1) return all.slice(0, count);
  return Array.from({ length: count }, (_, i) => all[(index + i + 1) % all.length]);
}