import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { loadMessages } from "./messages";
import { routing } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    formats: {
      number: {
        compact: { notation: "compact" },
        percent: { style: "percent", maximumFractionDigits: 0 },
        plain: { maximumFractionDigits: 0 },
        decimal: { maximumFractionDigits: 1 },
      },
      dateTime: {
        short: { day: "numeric", month: "short", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
        monthYear: { month: "long", year: "numeric" },
      },
    },
    timeZone: "UTC",
  };
});
