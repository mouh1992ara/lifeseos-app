import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import ToolsClient from "./tools-client";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tools.meta" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = "/tools";
  const title = t("indexTitle");
  const description = t("indexDescription");

  return {
    title,
    description,
    alternates: {
      canonical: localizePath(locale as Locale, path),
      languages: buildLanguageAlternates(siteUrl, path),
    },
    openGraph: {
      title,
      description,
      url: siteUrl + localizePath(locale as Locale, path),
      siteName: "LifeSeos",
      type: "website",
      locale: meta.ogLocale,
      images: [
        { url: "/social/home.png", width: 1200, height: 630, alt: "LifeSeos" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social/home.png"],
    },
  };
}

const TOOL_SLUGS: Record<string, string> = {
  seoAnalyzer: "seo-analyzer",
  seoPageAnalyzer: "seo-page-analyzer",
  robotsTxtGenerator: "robots-txt-generator",
  xmlSitemapGenerator: "xml-sitemap-generator",
  schemaMarkupGenerator: "schema-markup-generator",
  metaTagGenerator: "meta-tag-generator",
  serpSnippetPreview: "serp-snippet-preview",
  keywordDensityChecker: "keyword-density-checker",
  articleRewriter: "article-rewriter",
  httpStatusChecker: "http-status-checker",
  pageSpeed: "page-speed",
  contentAnalyzer: "content-analyzer",
  youtubeKeywordIdeas: "youtube-keyword-ideas",
  youtubeTitleGenerator: "youtube-title-generator",
  youtubeTitleAnalyzer: "youtube-title-analyzer",
  youtubeDescriptionGenerator: "youtube-description-generator",
  youtubeScriptWriter: "youtube-script-writer",
};

export default async function ToolsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Tools.meta");
  const catalog = await getTranslations("Tools.catalog");
  const keys = Object.keys(TOOL_SLUGS);

  const toolsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("indexTitle"),
    url: siteUrl + localizePath(locale as Locale, "/tools"),
    inLanguage: locale,
    description: t("indexDescription"),
    publisher: {
      "@type": "Organization",
      name: "LifeSeos",
      url: "https://www.lifeseos.com",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: keys.length,
      itemListElement: keys.map((key, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: catalog(`${key}.title`),
        url: `${siteUrl}/tools/${TOOL_SLUGS[key]}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsJsonLd) }}
      />
      <ToolsClient />
    </>
  );
}