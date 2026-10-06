import ToolsClient from "./tools-client";

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

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolsJsonLd),
        }}
      />

      <ToolsClient />
    </>
  );
}