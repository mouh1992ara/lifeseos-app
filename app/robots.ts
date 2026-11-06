import type { MetadataRoute } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.lifeseos.com"
).replace(/\/+$/, "");

const privatePaths = ["/admin", "/dashboard", "/auth", "/protected"];
const localePrefixes = ["/ar", "/fr", "/zh"];

export default function robots(): MetadataRoute.Robots {
  const both = (p: string) => [p, `${p}/`];

  const disallow = [
    ...privatePaths.flatMap(both),
    ...both("/api"),
    ...localePrefixes.flatMap((l) =>
      privatePaths.flatMap((p) => both(`${l}${p}`)),
    ),
  ];

  return {
    // Baidu is stated explicitly: an inherited "*" rule works, but an explicit
    // block documents the intent and survives future edits to the wildcard rule.
    rules: [
      { userAgent: "Baiduspider", allow: "/", disallow },
      { userAgent: "*", allow: "/", disallow },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
