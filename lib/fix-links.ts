export type SeoFixResult = {
  url?: string;
  title?: string;
  description?: string;
};

export type FixLink = {
  href: string;
  label: string;
};

function clean(value: string | undefined, max: number) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Not found") return "";
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
 * to the LifeSeos generator that can fix it. Returns null when no
 * generator fits, so no button is shown.
 */
export function getFixLink(
  text: string,
  result: SeoFixResult
): FixLink | null {
  const t = text.toLowerCase();
  const url = clean(result.url, 500);

  if (/schema|structured data|json-ld/.test(t)) {
    return {
      href: withParams("/tools/schema-markup-generator", { url }),
      label: "Generate schema",
    };
  }

  if (/robots/.test(t)) {
    return {
      href: withParams("/tools/robots-txt-generator", { url }),
      label: "Fix robots.txt",
    };
  }

  if (/sitemap/.test(t)) {
    return {
      href: withParams("/tools/xml-sitemap-generator", { url }),
      label: "Create sitemap",
    };
  }

  if (/broken|redirect|status code|404|5\d\d\b/.test(t)) {
    return {
      href: withParams("/tools/http-status-checker", { url }),
      label: "Check status codes",
    };
  }

  if (/meta description|description|title/.test(t)) {
    return {
      href: withParams("/tools/meta-tag-generator", {
        title: clean(result.title, 200),
        description: clean(result.description, 400),
      }),
      label: "Fix title & description",
    };
  }

  return null;
}
