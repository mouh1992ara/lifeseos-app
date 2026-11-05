import { parse } from "node-html-parser";

/**
 * Extraction + scoring for a single HTML document.
 *
 * Parsing is delegated to a real HTML parser: attribute order, quoting styles,
 * unquoted values and nesting all behave the way a browser would. Scoring is
 * deliberately explicit — every deducted point maps to a named issue with the
 * real-world impact spelled out, so the UI can never show "100/Excellent" for a
 * page that search engines will not index.
 */

const MISSING_TITLE = "No title found";
const MISSING_DESCRIPTION = "No description found";
const MISSING_H1 = "No H1 found";
const NOT_FOUND = "Not found";

const TITLE_MIN = 30;
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 160;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
  reg: "®",
  trade: "™",
  middot: "·",
  laquo: "«",
  raquo: "»",
};

export function decodeEntities(input: string) {
  return input.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (match, body: string) => {
    if (body[0] === "#") {
      const isHex = body[1] === "x" || body[1] === "X";
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? match;
  });
}

const clean = (value: string | undefined | null) => decodeEntities((value ?? "").replace(/\s+/g, " ")).trim();

export type OgData = {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
};

export type SeoExtract = {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  canonicalIsSelf: boolean;
  robots: string;
  robotsTokens: string[];
  h1: string[];
  h1Count: number;
  h2Count: number;
  images: { total: number; missingAlt: number; emptyAlt: number };
  links: { total: number; internal: number; external: number };
  og: OgData;
  lang: string;
  isHttps: boolean;
};

/** Values the UI already understands as "absent". */
export const SENTINELS = {
  title: MISSING_TITLE,
  description: MISSING_DESCRIPTION,
  h1: MISSING_H1,
  notFound: NOT_FOUND,
};

function normaliseForCompare(raw: string, base: string) {
  try {
    const url = new URL(raw, base);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.host.toLowerCase()}${path}`;
  } catch {
    return "";
  }
}

export function extractSeo(html: string, finalUrl: string): SeoExtract {
  const root = parse(html, { lowerCaseTagName: false, comment: false });

  const title = clean(root.querySelector("title")?.text);

  // Collect <meta> once; attribute order and quoting are the parser's problem.
  const metaByName = new Map<string, string>();
  for (const meta of root.querySelectorAll("meta")) {
    const key = (meta.getAttribute("name") ?? meta.getAttribute("property") ?? "").trim().toLowerCase();
    if (!key) continue;
    const content = meta.getAttribute("content");
    if (content === undefined) continue;
    if (!metaByName.has(key)) metaByName.set(key, clean(content));
  }

  const description = metaByName.get("description") ?? "";
  const robots = metaByName.get("robots") ?? "";
  const robotsTokens = robots
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);

  let canonical = "";
  for (const link of root.querySelectorAll("link")) {
    const rel = (link.getAttribute("rel") ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("canonical")) {
      canonical = clean(link.getAttribute("href"));
      if (canonical) break;
    }
  }

  const h1 = root
    .querySelectorAll("h1")
    .map((node) => clean(node.text))
    .filter(Boolean);
  const h2Count = root.querySelectorAll("h2").length;

  let total = 0;
  let missingAlt = 0;
  let emptyAlt = 0;
  for (const img of root.querySelectorAll("img")) {
    total += 1;
    const alt = img.getAttribute("alt");
    if (alt === undefined) missingAlt += 1;
    else if (clean(alt) === "") emptyAlt += 1;
  }

  const og: OgData = {
    title: metaByName.get("og:title") ?? "",
    description: metaByName.get("og:description") ?? "",
    image: metaByName.get("og:image") ?? "",
    url: metaByName.get("og:url") ?? "",
    type: metaByName.get("og:type") ?? "",
    siteName: metaByName.get("og:site_name") ?? "",
  };

  let linkTotal = 0;
  let linkInternal = 0;
  const host = (() => {
    try {
      return new URL(finalUrl).host.toLowerCase();
    } catch {
      return "";
    }
  })();
  for (const anchor of root.querySelectorAll("a")) {
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) continue;
    linkTotal += 1;
    try {
      const target = new URL(href, finalUrl);
      if (target.host.toLowerCase() === host) linkInternal += 1;
    } catch {
      /* malformed href: counted in the total only */
    }
  }

  const lang = clean(root.querySelector("html")?.getAttribute("lang"));
  const canonicalTarget = normaliseForCompare(canonical, finalUrl);
  const canonicalIsSelf = canonical !== "" && canonicalTarget === normaliseForCompare(finalUrl, finalUrl);

  return {
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    canonical,
    canonicalIsSelf,
    robots,
    robotsTokens,
    h1,
    h1Count: h1.length,
    h2Count,
    images: { total, missingAlt, emptyAlt },
    links: { total: linkTotal, internal: linkInternal, external: linkTotal - linkInternal },
    og,
    lang,
    isHttps: finalUrl.startsWith("https://"),
  };
}

export type Severity = "critical" | "error" | "warning";

export type Issue = {
  id: string;
  severity: Severity;
  /** What is wrong. */
  message: string;
  /** Why it matters for ranking / users. */
  impact: string;
};

export type SeoScore = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  status: "Excellent" | "Good" | "Fair" | "Needs Improvement" | "Poor";
  indexable: boolean;
  issues: Issue[];
  /** Stable ids for the "what works" list, so the UI can translate it. */
  passedIds: string[];
  passed: string[];
  errors: string[];
  warnings: string[];
  recommendations: string[];
};

/**
 * One source of truth for the score → grade → status mapping, so the three can
 * never contradict each other (the old code had grade B next to "Excellent").
 */
export function rate(score: number): { grade: SeoScore["grade"]; status: SeoScore["status"] } {
  if (score >= 90) return { grade: "A", status: "Excellent" };
  if (score >= 80) return { grade: "B", status: "Good" };
  if (score >= 70) return { grade: "C", status: "Fair" };
  if (score >= 50) return { grade: "D", status: "Needs Improvement" };
  return { grade: "F", status: "Poor" };
}

export function scoreSeo(
  extract: SeoExtract,
  options: { httpStatus: number },
): SeoScore {
  const issues: Issue[] = [];
  const passed: string[] = [];
  const passedIds: string[] = [];
  let score = 100;

  const penalise = (
    id: string,
    severity: Severity,
    message: string,
    impact: string,
    points: number,
  ) => {
    issues.push({ id, severity, message, impact });
    score -= points;
  };

  /* ---- HTTP status: an error page is not an optimised page -------------- */
  if (options.httpStatus >= 400) {
    penalise(
      "httpStatus",
      "critical",
      `The page returned HTTP ${options.httpStatus}.`,
      "Search engines treat error responses as missing pages: they drop them from the index and pass no authority, so on-page fixes cannot help until the page returns 200.",
      60,
    );
  } else if (options.httpStatus >= 300) {
    penalise(
      "httpStatus",
      "warning",
      `The page returned HTTP ${options.httpStatus} without a final destination.`,
      "A redirect that never resolves cannot be indexed under this URL.",
      20,
    );
  } else {
    passed.push(`Page returned HTTP ${options.httpStatus}`);
    passedIds.push("httpStatus");
  }

  /* ---- Indexability ---------------------------------------------------- */
  const noindex =
    extract.robotsTokens.includes("noindex") ||
    extract.robotsTokens.includes("none");

  let indexable = options.httpStatus < 400;

  if (noindex) {
    indexable = false;
    penalise(
      "robotsNoindex",
      "critical",
      `A robots meta tag blocks indexing ("${extract.robots}").`,
      "Search engines are explicitly told not to index this page, so it cannot appear in results at all — every other on-page improvement is irrelevant while noindex is present.",
      80,
    );
  } else {
    indexable = options.httpStatus < 400;
    passed.push("The page is indexable (no noindex directive)");
    passedIds.push("indexable");
  }

  if (extract.robotsTokens.includes("nofollow")) {
    penalise(
      "robotsNofollow",
      "warning",
      "The robots meta tag sets nofollow.",
      "Links on this page are not followed, so link equity stops here and internal pages lose discoverability.",
      8,
    );
  }

  /* ---- Title ----------------------------------------------------------- */
  if (!extract.title) {
    penalise(
      "titleMissing",
      "critical",
      "No <title> element was found.",
      "The title is the clickable headline in search results; without it Google rewrites the snippet and the page loses almost all of its organic click-through.",
      20,
    );
  } else {
    passed.push("Page title detected");
    passedIds.push("title");
    if (extract.titleLength < TITLE_MIN || extract.titleLength > TITLE_MAX) {
      penalise(
        "titleLength",
        "warning",
        `The title is ${extract.titleLength} characters (recommended ${TITLE_MIN}–${TITLE_MAX}).`,
        extract.titleLength > TITLE_MAX
          ? "Search results truncate around 60 characters, so the end of the title (often the differentiator) is cut off."
          : "A very short title wastes the most valuable keyword space in the result snippet.",
        8,
      );
    }
  }

  /* ---- Meta description ------------------------------------------------ */
  if (!extract.description) {
    penalise(
      "descriptionMissing",
      "error",
      "No meta description was found.",
      "Google writes its own snippet, which is usually less relevant; a missing description typically lowers click-through from the same ranking.",
      12,
    );
  } else {
    passed.push("Meta description detected");
    passedIds.push("description");
    if (extract.descriptionLength < DESC_MIN || extract.descriptionLength > DESC_MAX) {
      penalise(
        "descriptionLength",
        "warning",
        `The meta description is ${extract.descriptionLength} characters (recommended ${DESC_MIN}–${DESC_MAX}).`,
        "Long descriptions are truncated and short ones leave space unused, weakening the call to action in the snippet.",
        5,
      );
    }
  }

  /* ---- Headings -------------------------------------------------------- */
  if (extract.h1Count === 0) {
    penalise(
      "h1Missing",
      "error",
      "No <h1> heading was found.",
      "The H1 is the strongest on-page signal of the page's topic; without it search engines have to infer the subject from weaker signals.",
      10,
    );
  } else {
    passed.push("H1 heading detected");
    passedIds.push("h1");
    if (extract.h1Count > 1) {
      penalise(
        "h1Multiple",
        "warning",
        `${extract.h1Count} <h1> headings were found.`,
        "Multiple H1s dilute the topic signal and often signal a template bug; one H1 per page is the safer structure.",
        5,
      );
    }
  }

  /* ---- Canonical ------------------------------------------------------- */
  if (!extract.canonical) {
    penalise(
      "canonicalMissing",
      "warning",
      "No canonical URL was found.",
      "Without a canonical, parameterised or duplicated URLs can compete against each other and split ranking signals.",
      6,
    );
  } else if (!extract.canonicalIsSelf) {
    penalise(
      "canonicalMismatch",
      "warning",
      `The canonical points elsewhere (${extract.canonical}).`,
      "This page tells search engines to index a different URL, so this address is unlikely to rank in its own right.",
      8,
    );
  } else {
    passed.push("Canonical URL detected");
    passedIds.push("canonical");
  }

  /* ---- Images ---------------------------------------------------------- */
  if (extract.images.total === 0) {
    // No images is not an error; nothing to reward or penalise.
  } else if (extract.images.missingAlt > 0) {
    penalise(
      "imgAlt",
      "warning",
      `${extract.images.missingAlt} of ${extract.images.total} images have no alt attribute.`,
      "Alt text is how image search and screen readers understand an image; missing alt forfeits image traffic and fails accessibility requirements.",
      8,
    );
  } else {
    passed.push("Images ALT attributes detected");
    passedIds.push("images");
  }

  /* ---- Open Graph ------------------------------------------------------ */
  const ogChecks: { key: keyof OgData; id: string; label: string; points: number; impact: string }[] = [
    {
      key: "title",
      id: "ogTitle",
      label: "og:title",
      points: 4,
      impact: "Without og:title, social platforms guess the headline, which usually produces a weaker, truncated post preview.",
    },
    {
      key: "description",
      id: "ogDescription",
      label: "og:description",
      points: 3,
      impact: "Missing og:description makes shared links show scraped text, reducing click-through from social traffic.",
    },
    {
      key: "image",
      id: "ogImage",
      label: "og:image",
      points: 3,
      impact: "Shares without an image render as bare text links, which consistently attract fewer clicks.",
    },
    {
      key: "url",
      id: "ogUrl",
      label: "og:url",
      points: 1,
      impact: "Without og:url, platforms may attribute engagement to the wrong URL when the page is reachable via several paths.",
    },
    {
      key: "type",
      id: "ogType",
      label: "og:type",
      points: 1,
      impact: "og:type tells platforms what kind of object is being shared; omitting it can downgrade rich previews.",
    },
  ];

  let ogMissing = 0;
  for (const check of ogChecks) {
    if (!extract.og[check.key]) {
      ogMissing += 1;
      penalise(check.id, "warning", `Missing ${check.label}.`, check.impact, check.points);
    }
  }
  if (ogMissing === 0) {
    passed.push("Open Graph metadata complete");
    passedIds.push("og");
  }

  /* ---- Transport / document basics ------------------------------------ */
  if (!extract.isHttps) {
    penalise(
      "https",
      "warning",
      "The page is served over plain HTTP.",
      "HTTPS is a confirmed ranking signal and browsers mark HTTP pages as “Not secure”, which suppresses conversions.",
      8,
    );
  } else {
    passed.push("Served over HTTPS");
    passedIds.push("https");
  }

  if (!extract.lang) {
    penalise(
      "lang",
      "warning",
      "The <html> element has no lang attribute.",
      "Search engines and screen readers cannot tell which language the page is in, which hurts international targeting and accessibility.",
      3,
    );
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Hard caps: these failures cannot coexist with a good grade.
  if (!indexable) score = Math.min(score, 20);
  if (options.httpStatus >= 400) score = Math.min(score, 25);

  const { grade, status } = rate(score);

  // Critical findings carry their impact inline: the UI renders this array, and
  // "noindex" or "HTTP 404" mean nothing to a visitor without the consequence.
  const errors = issues
    .filter((issue) => issue.severity !== "warning")
    .map((issue) => (issue.severity === "critical" ? `${issue.message} ${issue.impact}` : issue.message));
  const warnings = issues.filter((issue) => issue.severity === "warning").map((issue) => issue.message);

  return {
    score,
    grade,
    status,
    indexable,
    issues,
    passedIds,
    passed,
    errors,
    warnings,
    recommendations: [...errors, ...warnings],
  };
}
