import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.lifeseos.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = [
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
  ];

  const weeklyTools = [
    "seo-analyzer",
    "seo-page-analyzer",
  ];

  const monthlyTools = [
    "robots-txt-generator",
    "xml-sitemap-generator",
    "meta-tag-generator",
    "serp-snippet-preview",
    "keyword-density-checker",
    "article-rewriter",
    "http-status-checker",
    "page-speed",
    "content-analyzer",
    "schema-markup-generator",
    "youtube-keyword-ideas",
    "youtube-title-generator",
    "youtube-title-analyzer",
    "youtube-description-generator",
    "youtube-script-writer",
  ];

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/tools`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    ...blogPosts.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    ...weeklyTools.map((slug) => ({
      url: `${baseUrl}/tools/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),

    ...monthlyTools.map((slug) => ({
      url: `${baseUrl}/tools/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
