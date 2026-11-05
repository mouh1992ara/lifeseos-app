import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { toolKeyForUrl } from "@/lib/audiences";
import { ARTICLE_SLUGS, getArticle, getRelatedArticles } from "@/lib/blog";
import ArticleView from "./article-view";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(locale as Locale, slug);
  if (!article) return {};

  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = `/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: localizePath(locale as Locale, path),
      languages: buildLanguageAlternates(siteUrl, path),
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: siteUrl + localizePath(locale as Locale, path),
      type: "article",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [article.featuredImage],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticle(locale as Locale, slug);
  if (!article) notFound();

  const related = await getRelatedArticles(locale as Locale, article.slug, 3);
  const t = await getTranslations("Blog");
  const tr = await getTranslations(`Tools.catalog.${toolKeyForUrl(article.toolUrl)}`);

  const path = `/blog/${article.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    image: siteUrl + article.featuredImage,
    url: siteUrl + localizePath(locale as Locale, path),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteUrl + localizePath(locale as Locale, path),
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: locale,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "LifeSeos",
      url: "https://www.lifeseos.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.lifeseos.com/icon.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleView
        article={article}
        relatedArticles={related}
        labels={{
          contents: t("contents"),
          relatedTool: t("relatedTool"),
          backToBlog: t("backToBlog"),
          moreGuides: t("moreGuides"),
          tip: t("tip"),
          published: t("published", { date: article.publishedAt }),
          updated: t("updated", { date: article.updatedAt }),
          byAuthor: t("byAuthor", { author: article.author }),
          readGuide: t("readGuide"),
          ctaTitle: t("articleCta.title"),
          ctaBody: t("articleCta.body"),
          toolLabel: tr("title"),
          readingProgress: t("readingProgress"),
        }}
      />
    </>
  );
}
