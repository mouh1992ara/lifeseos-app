import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

/**
 * Builds fully localized metadata for a page from the catalog.
 *
 * `path` is locale-less (e.g. `/tools/page-speed`); the canonical, the
 * hreflang cluster and the Open Graph locale are all derived from it so a
 * single call keeps every language variant correct.
 */
export async function buildPageMetadata({
  locale,
  path,
  namespace,
  image = "/social/home.png",
}: {
  locale: string;
  path: string;
  /** Catalog namespace holding `title` and `description`. */
  namespace: string;
  image?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const title = t("title");
  const description = t("description");
  const canonical = localizePath(locale as Locale, path);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(siteUrl, path),
    },
    openGraph: {
      title,
      description,
      url: siteUrl + canonical,
      type: "website",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Same as `buildPageMetadata`, but for pages whose key lives in `Tools.catalog`. */
export async function buildToolMetadata({
  locale,
  path,
  toolKey,
  image,
}: {
  locale: string;
  path: string;
  toolKey: string;
  image?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Tools.catalog" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const title = t(`${toolKey}.title`);
  const description = t(`${toolKey}.long`);
  const canonical = localizePath(locale as Locale, path);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(siteUrl, path),
    },
    openGraph: {
      title,
      description,
      url: siteUrl + canonical,
      type: "website",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
      images: [
        {
          url: image ?? "/social/home.png",
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
      images: [image ?? "/social/home.png"],
    },
  };
}