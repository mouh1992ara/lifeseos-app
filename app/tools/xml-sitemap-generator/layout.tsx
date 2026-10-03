import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML Sitemap Generator - Free SEO Sitemap Tool",
  description:
    "Create an XML sitemap structure for your website with the free LifeSeos XML Sitemap Generator and help search engines discover your pages.",
  alternates: {
    canonical: "/tools/xml-sitemap-generator",
  },
  openGraph: {
    title: "XML Sitemap Generator | LifeSeos",
    description:
      "Generate an XML sitemap structure to help search engines discover and crawl your website pages.",
    url: "/tools/xml-sitemap-generator",
    type: "website",
  },
};

export default function XMLSitemapGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
