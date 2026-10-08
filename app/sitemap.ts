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

    {
      url: `${baseUrl}/tools/seo-analyzer`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/tools/seo-page-analyzer`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/tools/robots-txt-generator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/tools/xml-sitemap-generator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/tools/meta-tag-generator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/tools/keyword-density-checker`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/tools/http-status-checker`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/tools/page-speed`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/tools/content-analyzer`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

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