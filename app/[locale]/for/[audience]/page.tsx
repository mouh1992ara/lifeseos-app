import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AudiencePage from "@/components/audience-page";
import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { audiences, audienceSlugs, type AudienceSlug } from "@/lib/audiences";

export const dynamicParams = false;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

export function generateStaticParams() {
  return audienceSlugs.map((audience) => ({ audience }));
}

type Props = { params: Promise<{ locale: string; audience: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, audience: slug } = await params;
  if (!(slug in audiences)) return {};

  const t = await getTranslations({ locale, namespace: `Audience.${slug}` });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = "/for/" + slug;
  const title = t("metaTitle");
  const description = t("metaDescription");

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
        {
          url: "/social/home.png",
          width: 1200,
          height: 630,
          alt: "LifeSeos SEO Tools",
        },
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

export default async function Page({ params }: Props) {
  const { locale, audience: slug } = await params;
  setRequestLocale(locale);
  if (!(slug in audiences)) notFound();

  return <AudiencePage slug={slug as AudienceSlug} />;
}