import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { getArticles } from "@/lib/blog";
import BlogClient from "./blog-client";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = "/blog";
  const title = t("meta.title");
  const description = t("meta.description");

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
      type: "website",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
      images: [
        { url: "/social/blog.png", width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social/blog.png"],
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const articles = await getArticles(locale as Locale);
  const t = await getTranslations("Blog");

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("meta.title"),
    url: siteUrl + localizePath(locale as Locale, "/blog"),
    inLanguage: locale,
    description: t("meta.description"),
    publisher: {
      "@type": "Organization",
      name: "LifeSeos",
      url: "https://www.lifeseos.com",
    },
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      url: siteUrl + localizePath(locale as Locale, `/blog/${article.slug}`),
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      inLanguage: locale,
      author: { "@type": "Organization", name: "LifeSeos" },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <BlogClient articles={articles} />
    </>
  );
}