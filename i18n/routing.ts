/**
 * `routing` and all locale metadata live in ./config so there is exactly one
 * place to add or change a language. This file stays for compatibility with
 * existing imports.
 */
export {
  routing,
  locales,
  defaultLocale,
  localeMeta,
  localeList,
  isLocale,
  localizePath,
  buildLanguageAlternates,
} from "./config";
export type { Locale, LocaleMeta } from "./config";
