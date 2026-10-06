import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SEO Tools - Website Analysis & Optimization",

  description:
    "Explore 9 free LifeSeos tools for website analysis, technical SEO, on-page SEO, metadata, keyword density, HTTP status checks, page speed, content analysis, robots.txt and XML sitemaps.",

  alternates: {
    canonical: "/tools",
  },

  openGraph: {
    title: "Free SEO Tools | LifeSeos",
    description:
      "Explore free SEO tools for website analysis, technical SEO, on-page optimization, content analysis, page speed, metadata, sitemaps and more.",
    url: "/tools",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/tools.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Free SEO Tools",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free SEO Tools | LifeSeos",
    description:
      "Explore free SEO tools for website analysis, technical SEO, content optimization, page speed, metadata and more.",
    images: ["/social/tools.png"],
  },
};

const toolsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "LifeSeos Free SEO Tools",
  url: "https://www.lifeseos.com/tools",
  description:
    "A collection of free SEO tools for website analysis, technical SEO, content optimization, metadata, page speed and search visibility.",
  publisher: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: 9,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "SEO Analyzer",
        url: "https://www.lifeseos.com/tools/seo-analyzer",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "SEO Page Analyzer",
        url: "https://www.lifeseos.com/tools/seo-page-analyzer",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Robots.txt Generator",
        url: "https://www.lifeseos.com/tools/robots-txt-generator",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "XML Sitemap Generator",
        url: "https://www.lifeseos.com/tools/xml-sitemap-generator",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Meta Tag Generator",
        url: "https://www.lifeseos.com/tools/meta-tag-generator",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Keyword Density Checker",
        url: "https://www.lifeseos.com/tools/keyword-density-checker",
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "HTTP Status Checker",
        url: "https://www.lifeseos.com/tools/http-status-checker",
      },
      {
        "@type": "ListItem",
        position: 8,
        name: "Page Speed Analyzer",
        url: "https://www.lifeseos.com/tools/page-speed",
      },
      {
        "@type": "ListItem",
        position: 9,
        name: "Content Analyzer",
        url: "https://www.lifeseos.com/tools/content-analyzer",
      },
    ],
  },
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolsJsonLd),
        }}
      />

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {children}
        </div>
      </section>
    </>
  );
}