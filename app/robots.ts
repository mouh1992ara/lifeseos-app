import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.lifeseos.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/dashboard",
        "/dashboard/",
        "/auth",
        "/auth/",
        "/protected",
        "/protected/",
        "/api",
        "/api/",
      ],
    },

    sitemap: `${baseUrl}/sitemap.xml`,
  };
}