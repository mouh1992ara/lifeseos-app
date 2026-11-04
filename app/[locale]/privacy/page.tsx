import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import LegalPage, { type LegalItem } from "@/components/legal-page";
import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

const SECTION_COUNT = 18;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal.privacy" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = "/privacy";
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
      type: "website",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
      images: [
        { url: "/social/privacy.png", width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social/privacy.png"],
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");

  const items: LegalItem[] = Array.from({ length: SECTION_COUNT }, (_, index) => {
    const id = `s${index + 1}`;
    const base = `privacy.sections.${id}`;
    return {
      id,
      title: t(`${base}.title`),
      // Sections that legitimately have no bullets have no key at all, so
      // `t.raw` is guarded by `t.has` to avoid a hard error.
      paragraphs: t.has(`${base}.paragraphs`)
        ? (t.raw(`${base}.paragraphs`) as string[])
        : undefined,
      bullets: t.has(`${base}.bullets`)
        ? (t.raw(`${base}.bullets`) as string[])
        : undefined,
    };
  });

  return (
    <LegalPage
      locale={locale}
      badge={t("privacy.badge")}
      title={t("privacy.title")}
      subtitle={t("privacy.subtitle")}
      updated={t("privacy.updated", { date: t("privacy.updatedValue") })}
      tocTitle={t("privacy.tocTitle")}
      notice={t("authoritative")}
      noticeTitle={t("legalNoticeTitle")}
      cta={{
        eyebrow: t("cta.eyebrow"),
        title: t("cta.title"),
        body: t("cta.body"),
        button: t("cta.button"),
      }}
      items={items}
    />
  );
}