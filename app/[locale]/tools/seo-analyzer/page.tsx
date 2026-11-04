import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";

import SEOAnalyzerClient from "./en-client";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

const PATH = "/tools/seo-analyzer";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tool.seoAnalyzer" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    alternates: {
      canonical: localizePath(locale as Locale, PATH),
      languages: buildLanguageAlternates(siteUrl, PATH),
    },
    openGraph: {
      title,
      description,
      url: siteUrl + localizePath(locale as Locale, PATH),
      type: "website",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
      images: [
        {
          url: "/social/seo-analyzer.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social/seo-analyzer.png"],
    },
  };
}

export default async function SeoAnalyzerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // One analyzer for every locale: all copy comes from Tool.seoAnalyzer.
  return <SEOAnalyzerClient />;
}
