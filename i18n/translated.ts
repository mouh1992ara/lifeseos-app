import { routing } from "./routing";

// Paths (without locale prefix) that have real translated content per locale.
// Everything else renders English inside the locale shell, with a banner and noindex.
const translated: Record<string, string[]> = {
  ar: ["/tools/seo-analyzer"],
  fr: [],
  zh: [],
};

export function isTranslated(locale: string, path: string): boolean {
  if (locale === routing.defaultLocale) return true;
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return (translated[locale] ?? []).includes(clean);
}
