export type SeoFixResult = {
  url?: string;
  title?: string;
  description?: string;
};

export type FixLink = {
  href: string;
  label: string;
};

export type FixLang = "en" | "ar";

const LABELS = {
  schema: { en: "Generate schema", ar: "أنشئ بيانات Schema" },
  robots: { en: "Fix robots.txt", ar: "أصلح ملف robots.txt" },
  sitemap: { en: "Create sitemap", ar: "أنشئ خريطة الموقع" },
  status: { en: "Check status codes", ar: "افحص أكواد الحالة" },
  meta: { en: "Fix title & description", ar: "أصلح العنوان والوصف" },
} as const;

// Placeholder values the analyzer API returns when something is missing.
const MISSING_VALUES = new Set([
  "Not found",
  "No title found",
  "No description found",
  "No H1 found",
]);

function clean(value: string | undefined, max: number) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || MISSING_VALUES.has(trimmed)) return "";
  return trimmed.slice(0, max);
}

function withParams(path: string, params: Record<string, string>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Maps a recommendation / warning / error text from the SEO analyzer
 * (always the English text returned by the API) to the LifeSeos
 * generator that can fix it. Returns null when no generator fits,
 * so no button is shown. `lang` only changes the button label.
 */
export function getFixLink(
  text: string,
  result: SeoFixResult,
  lang: FixLang = "en"
): FixLink | null {
  const t = text.toLowerCase();
  const url = clean(result.url, 500);

  if (/schema|structured data|json-ld/.test(t)) {
    return {
      href: withParams("/tools/schema-markup-generator", { url }),
      label: LABELS.schema[lang],
    };
  }

  if (/robots/.test(t)) {
    return {
      href: withParams("/tools/robots-txt-generator", { url }),
      label: LABELS.robots[lang],
    };
  }

  if (/sitemap/.test(t)) {
    return {
      href: withParams("/tools/xml-sitemap-generator", { url }),
      label: LABELS.sitemap[lang],
    };
  }

  if (/broken|redirect|status code|404|5\d\d\b/.test(t)) {
    return {
      href: withParams("/tools/http-status-checker", { url }),
      label: LABELS.status[lang],
    };
  }

  if (/meta description|description|title/.test(t)) {
    return {
      href: withParams("/tools/meta-tag-generator", {
        title: clean(result.title, 200),
        description: clean(result.description, 400),
      }),
      label: LABELS.meta[lang],
    };
  }

  return null;
}
