import ToolsClient from "./tools-client";

const toolsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "LifeSeos Free SEO Tools",
  url: "https://www.lifeseos.com/tools",
  description:
    "A collection of free SEO tools for website analysis, technical SEO, content optimization, structured data, page speed, search visibility and YouTube SEO.",
  publisher: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: 17,
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
        name: "Schema Markup Generator",
        url: "https://www.lifeseos.com/tools/schema-markup-generator",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Meta Tag Generator",
        url: "https://www.lifeseos.com/tools/meta-tag-generator",
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "SERP Snippet Preview",
        url: "https://www.lifeseos.com/tools/serp-snippet-preview",
      },
      {
        "@type": "ListItem",
        position: 8,
        name: "Keyword Density Checker",
        url: "https://www.lifeseos.com/tools/keyword-density-checker",
      },
      {
        "@type": "ListItem",
        position: 9,
        name: "SEO Article Rewriter",
        url: "https://www.lifeseos.com/tools/article-rewriter",
      },
      {
        "@type": "ListItem",
        position: 10,
        name: "HTTP Status Checker",
        url: "https://www.lifeseos.com/tools/http-status-checker",
      },
      {
        "@type": "ListItem",
        position: 11,
        name: "Page Speed Analyzer",
        url: "https://www.lifeseos.com/tools/page-speed",
      },
      {
        "@type": "ListItem",
        position: 12,
        name: "Content Analyzer",
        url: "https://www.lifeseos.com/tools/content-analyzer",
      },
      {
        "@type": "ListItem",
        position: 13,
        name: "YouTube Keyword Ideas",
        url: "https://www.lifeseos.com/tools/youtube-keyword-ideas",
      },
      {
        "@type": "ListItem",
        position: 14,
        name: "YouTube Title Generator",
        url: "https://www.lifeseos.com/tools/youtube-title-generator",
      },
      {
        "@type": "ListItem",
        position: 15,
        name: "YouTube Title Analyzer",
        url: "https://www.lifeseos.com/tools/youtube-title-analyzer",
      },
      {
        "@type": "ListItem",
        position: 16,
        name: "YouTube Description Generator",
        url: "https://www.lifeseos.com/tools/youtube-description-generator",
      },
      {
        "@type": "ListItem",
        position: 17,
        name: "YouTube Script Writer",
        url: "https://www.lifeseos.com/tools/youtube-script-writer",
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
