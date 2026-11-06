import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for every locale-dependent decision in the app.
 * Add a language here and the routing, metadata, fonts, dir and switcher
 * all follow automatically.
 */

export const locales = ["en", "ar", "fr", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export type LocaleMeta = {
  /** BCP 47 tag used for <html lang> and hreflang. */
  htmlLang: string;
  /** Native language name shown in the switcher. */
  nativeName: string;
  /** English name, used for aria labels and admin surfaces. */
  englishName: string;
  dir: "ltr" | "rtl";
  /** Open Graph locale key. */
  ogLocale: string;
  /** Short region marker for formatting (dates/numbers). */
  region: string;
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    htmlLang: "en",
    nativeName: "English",
    englishName: "English",
    dir: "ltr",
    ogLocale: "en_US",
    region: "US",
  },
  ar: {
    htmlLang: "ar",
    nativeName: "العربية",
    englishName: "Arabic",
    dir: "rtl",
    ogLocale: "ar_AR",
    region: "SA",
  },
  fr: {
    htmlLang: "fr",
    nativeName: "Français",
    englishName: "French",
    dir: "ltr",
    ogLocale: "fr_FR",
    region: "FR",
  },
  zh: {
    htmlLang: "zh-Hans",
    nativeName: "中文",
    englishName: "Chinese",
    dir: "ltr",
    ogLocale: "zh_CN",
    region: "CN",
  },
};

/** Ordered list for the language switcher. */
export const localeList = locales.map((code) => ({
  code,
  ...localeMeta[code],
}));

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** `/path` for a locale, applying the as-needed prefix rule. */
export function localizePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  // The router serves the locale root without a trailing slash and answers
  // "/fr/" with a 308 to "/fr". Emitting "/fr/" in canonicals, hreflang and the
  // sitemap pointed every crawler at a redirect, so the root is collapsed here.
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

/**
 * hreflang map for a path. Every locale gets an absolute URL plus x-default.
 * Paths are locale-less (`/tools/seo-analyzer`).
 */
export function buildLanguageAlternates(
  siteUrl: string,
  path: string,
): Record<string, string> {
  const base = siteUrl.replace(/\/+$/, "");
  const alternates: Record<string, string> = {};
  for (const code of locales) {
    alternates[localeMeta[code].htmlLang] = base + localizePath(code, path);
  }
  alternates["x-default"] = base + localizePath(defaultLocale, path);
  return alternates;
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English keeps its current URLs (/tools/...). Others get /ar, /fr, /zh.
  localePrefix: "as-needed",
  // No Accept-Language redirects: URLs stay stable for users and crawlers.
  localeDetection: false,
  localeCookie: false,
});
