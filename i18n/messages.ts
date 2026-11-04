import type { AbstractIntlMessages } from "next-intl";

import type { Locale } from "./config";

/**
 * One catalog per locale, imported statically so bundlers can resolve them.
 * Namespaces inside the file mirror the product areas (Header, Home, Tools…).
 *
 * Catalogs contain arrays (legal sections, bullet lists) which are read with
 * `t.raw()`, so the value is widened to `AbstractIntlMessages` here.
 */
const catalogs: Record<Locale, () => Promise<unknown>> = {
  en: () => import("../messages/en.json"),
  ar: () => import("../messages/ar.json"),
  fr: () => import("../messages/fr.json"),
  zh: () => import("../messages/zh.json"),
};

export async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  const load = catalogs[locale] ?? catalogs.en;
  const mod = (await load()) as { default?: unknown };
  return (mod.default ?? mod) as AbstractIntlMessages;
}
