import type { MetadataRoute } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.lifeseos.com"
).replace(/\/+$/, "");

const privatePaths = ["/admin", "/dashboard", "/auth", "/protected"];
const localePrefixes = ["/ar", "/fr", "/zh"];

export default function robots(): MetadataRoute.Robots {
  const both = (p: string) => [p, `${p}/`];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...privatePaths.flatMap(both),
        ...both("/api"),
        ...localePrefixes.flatMap((l) =>
          privatePaths.flatMap((p) => both(`${l}${p}`)),
        ),
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
