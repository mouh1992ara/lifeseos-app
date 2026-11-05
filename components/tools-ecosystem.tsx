import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Cog,
  FileSearch,
  FileText,
  Gauge,
  Network,
} from "lucide-react";

import YouTubeMark from "@/components/youtube-mark";
import { Link } from "@/i18n/navigation";

export const TOOL_HREF: Record<string, string> = {
  seoAnalyzer: "/tools/seo-analyzer",
  seoPageAnalyzer: "/tools/seo-page-analyzer",
  pageSpeed: "/tools/page-speed",
  contentAnalyzer: "/tools/content-analyzer",
  httpStatusChecker: "/tools/http-status-checker",
  xmlSitemapGenerator: "/tools/xml-sitemap-generator",
  robotsTxtGenerator: "/tools/robots-txt-generator",
  metaTagGenerator: "/tools/meta-tag-generator",
  serpSnippetPreview: "/tools/serp-snippet-preview",
  keywordDensityChecker: "/tools/keyword-density-checker",
  schemaMarkupGenerator: "/tools/schema-markup-generator",
  articleRewriter: "/tools/article-rewriter",
  youtubeKeywordIdeas: "/tools/youtube-keyword-ideas",
  youtubeTitleGenerator: "/tools/youtube-title-generator",
  youtubeTitleAnalyzer: "/tools/youtube-title-analyzer",
  youtubeDescriptionGenerator: "/tools/youtube-description-generator",
  youtubeScriptWriter: "/tools/youtube-script-writer",
};

type Group = {
  key: string;
  accent: string;
  icon: LucideIcon | null;
  brand?: "youtube";
  span: "wide" | "full" | "base";
  links: string[];
};

/**
 * Six disciplines, two of them featured. `span` drives the bento layout:
 *  - wide  → two of three columns, horizontal composition
 *  - full  → all three columns
 *  - base  → single column, vertical composition
 */
const GROUPS: Group[] = [
  {
    key: "technical",
    accent: "#60a5fa",
    icon: Cog,
    span: "wide",
    links: ["seoAnalyzer", "httpStatusChecker", "robotsTxtGenerator", "schemaMarkupGenerator"],
  },
  {
    key: "onPage",
    accent: "#34d399",
    icon: FileSearch,
    span: "base",
    links: ["seoPageAnalyzer", "metaTagGenerator", "serpSnippetPreview", "contentAnalyzer"],
  },
  {
    key: "crawling",
    accent: "#22d3ee",
    icon: Network,
    span: "base",
    links: ["xmlSitemapGenerator", "robotsTxtGenerator", "seoAnalyzer"],
  },
  {
    key: "performance",
    accent: "#a78bfa",
    icon: Gauge,
    span: "base",
    links: ["pageSpeed", "seoAnalyzer"],
  },
  {
    key: "content",
    accent: "#2dd4bf",
    icon: FileText,
    span: "base",
    links: ["articleRewriter", "contentAnalyzer", "keywordDensityChecker"],
  },
  {
    key: "youtube",
    accent: "#ff3b5c",
    icon: null,
    brand: "youtube",
    span: "full",
    links: [
      "youtubeKeywordIdeas",
      "youtubeTitleGenerator",
      "youtubeTitleAnalyzer",
      "youtubeDescriptionGenerator",
      "youtubeScriptWriter",
    ],
  },
];

function IconTile({
  group,
  size,
}: {
  group: Group;
  size: "base" | "wide" | "full";
}) {
  const box =
    size === "base" ? "h-12 w-12 rounded-2xl" : "h-14 w-14 rounded-[18px]";
  const glyph = size === "base" ? "h-6 w-6" : "h-7 w-7";

  return (
    <div
      className={`${box} relative flex shrink-0 items-center justify-center transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:-rotate-3`}
      style={{
        background: `linear-gradient(150deg, ${group.accent}26, ${group.accent}0d)`,
        boxShadow: `inset 0 0 0 1px ${group.accent}33, 0 10px 30px -18px ${group.accent}`,
      }}
    >
      {group.brand === "youtube" ? (
        <YouTubeMark className={`${glyph} text-[#ff3b5c]`} />
      ) : group.icon ? (
        <group.icon className={glyph} style={{ color: group.accent }} />
      ) : null}
    </div>
  );
}

export default async function ToolsEcosystem() {
  const t = await getTranslations("Home");
  const toolCatalog = await getTranslations("Tools.catalog");

  return (
    <section id="tools" className="relative scroll-mt-24 px-6 py-28 sm:px-10 lg:px-16">
      <div className="section-rule pointer-events-none absolute inset-x-0 top-0" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            {t("categories.eyebrow")}
          </p>

          <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">
            {t("categories.title")}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-400">
            {t("categories.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => {
            const featured = group.span !== "base";

            return (
              <article
                key={group.key}
                data-reveal
                className={`tools-card surface group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] p-6 sm:p-7 ${
                  group.span === "wide"
                    ? "md:col-span-2 lg:col-span-2"
                    : group.span === "full"
                      ? "md:col-span-2 lg:col-span-3"
                      : ""
                }`}
                style={{
                  ["--accent" as string]: `${group.accent}66`,
                  background: `linear-gradient(165deg, ${group.accent}12, rgba(255,255,255,0.012) 46%)`,
                }}
              >
                {/* Accent wash, stronger on the featured cards */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full opacity-[0.18] blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: group.accent }}
                />

                <div
                  className={
                    group.span === "full"
                      ? "relative flex h-full flex-col gap-6 lg:flex-row lg:items-center"
                      : "relative flex h-full flex-col"
                  }
                >
                  <div className={group.span === "full" ? "lg:w-[22rem] lg:shrink-0" : ""}>
                    <div className="flex items-center gap-3">
                      <IconTile group={group} size={group.span} />

                      <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-400">
                        {group.links.length}
                      </span>
                    </div>

                    <h3
                      className={`relative mt-5 font-semibold ${
                        featured ? "text-xl" : "text-lg"
                      }`}
                    >
                      {t(`categories.${group.key}Title`)}
                    </h3>

                    <p className="relative mt-2 text-sm leading-7 text-slate-400">
                      {t(`categories.${group.key}Body`)}
                    </p>

                  </div>

                  <div
                    className={
                      group.span === "full"
                        ? "flex flex-1 flex-col lg:mt-0"
                        : "mt-5 flex flex-1 flex-col"
                    }
                  >
                    <ul
                      className={`relative ${group.span === "full" ? "" : "border-t border-white/[0.06] pt-3"} ${
                        group.span === "wide"
                          ? "grid gap-x-8 gap-y-0.5 sm:grid-cols-2"
                          : group.span === "full"
                            ? "flex flex-wrap gap-2"
                            : "space-y-0.5"
                      }`}
                    >
                      {group.links.map((linkKey) => (
                        <li key={linkKey}>
                          <Link
                            href={TOOL_HREF[linkKey]}
                            className={
                              group.span === "full"
                                ? "tools-link group/link inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                                : "tools-link group/link flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                            }
                          >
                            <span className="truncate">
                              {toolCatalog(`${linkKey}.title`)}
                            </span>

                            <ArrowUpRight
                              className="h-3.5 w-3.5 shrink-0 text-slate-600 transition group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-emerald-300 rtl:-scale-x-100"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/tools"
                      className="relative mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-xs font-semibold uppercase tracking-wider transition"
                      style={{ color: group.accent }}
                    >
                      {t("tools.viewAll")}
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
