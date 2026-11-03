import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar", "fr", "zh"],
  defaultLocale: "en",
  // English keeps its current URLs (/tools/...). Others get /ar, /fr, /zh.
  localePrefix: "as-needed",
  // No Accept-Language redirects: URLs stay stable for users and crawlers.
  localeDetection: false,
  localeCookie: false,
});
