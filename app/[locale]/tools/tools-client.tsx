"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Sparkles,
  Bot,
  Globe,
  Zap,
  BarChart3,
  FileText,
  Gauge,
  Youtube,
  Tags,
  TextSearch,
  WandSparkles,
  FileCode2,
  Monitor,
} from "lucide-react";

const sections = [
  {
    categoryKey: "technical",
    accent: "default",
    items: [
      "seoAnalyzer",
      "seoPageAnalyzer",
      "robotsTxtGenerator",
      "xmlSitemapGenerator",
      "schemaMarkupGenerator",
    ],
    icons: {
      seoAnalyzer: Search,
      seoPageAnalyzer: FileText,
      robotsTxtGenerator: Bot,
      xmlSitemapGenerator: Globe,
      schemaMarkupGenerator: FileCode2,
    },
  },
  {
    categoryKey: "content",
    accent: "default",
    items: [
      "metaTagGenerator",
      "serpSnippetPreview",
      "keywordDensityChecker",
      "articleRewriter",
    ],
    icons: {
      metaTagGenerator: Sparkles,
      serpSnippetPreview: Monitor,
      keywordDensityChecker: BarChart3,
      articleRewriter: WandSparkles,
    },
  },
  {
    categoryKey: "performance",
    accent: "default",
    items: ["httpStatusChecker", "pageSpeed"],
    icons: {
      httpStatusChecker: Zap,
      pageSpeed: Gauge,
    },
  },
  {
    categoryKey: "management",
    accent: "default",
    items: ["contentAnalyzer"],
    icons: {
      contentAnalyzer: FileText,
    },
  },
  {
    categoryKey: "youtube",
    accent: "youtube",
    items: [
      "youtubeKeywordIdeas",
      "youtubeTitleGenerator",
      "youtubeTitleAnalyzer",
      "youtubeDescriptionGenerator",
      "youtubeScriptWriter",
    ],
    icons: {
      youtubeKeywordIdeas: Tags,
      youtubeTitleGenerator: Sparkles,
      youtubeTitleAnalyzer: TextSearch,
      youtubeDescriptionGenerator: FileText,
      youtubeScriptWriter: WandSparkles,
    },
  },
] as const;

type ToolKey = (typeof sections)[number]["items"][number];

const HREF: Record<string, string> = {
  seoAnalyzer: "/tools/seo-analyzer",
  seoPageAnalyzer: "/tools/seo-page-analyzer",
  robotsTxtGenerator: "/tools/robots-txt-generator",
  xmlSitemapGenerator: "/tools/xml-sitemap-generator",
  schemaMarkupGenerator: "/tools/schema-markup-generator",
  metaTagGenerator: "/tools/meta-tag-generator",
  serpSnippetPreview: "/tools/serp-snippet-preview",
  keywordDensityChecker: "/tools/keyword-density-checker",
  articleRewriter: "/tools/article-rewriter",
  httpStatusChecker: "/tools/http-status-checker",
  pageSpeed: "/tools/page-speed",
  contentAnalyzer: "/tools/content-analyzer",
  youtubeKeywordIdeas: "/tools/youtube-keyword-ideas",
  youtubeTitleGenerator: "/tools/youtube-title-generator",
  youtubeTitleAnalyzer: "/tools/youtube-title-analyzer",
  youtubeDescriptionGenerator: "/tools/youtube-description-generator",
  youtubeScriptWriter: "/tools/youtube-script-writer",
};

export default function ToolsPage() {
  const t = useTranslations("Tools.index");
  const tc = useTranslations("Tools.categories");
  const ty = useTranslations("Tools");
  const catalog = useTranslations("Tools.catalog");
  const common = useTranslations("Common");
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return sections
      .map((section) => {
        const category = tc(section.categoryKey);
        const items = section.items.filter((key: ToolKey) => {
          if (!normalizedSearch) return true;
          const searchable = [
            category,
            catalog(`${key}.title`),
            catalog(`${key}.short`),
          ]
            .join(" ")
            .toLowerCase();
          return searchable.includes(normalizedSearch);
        });
        return { ...section, category, items };
      })
      .filter((section) => section.items.length > 0);
  }, [normalizedSearch, tc, catalog]);

  const totalTools = sections.reduce((total, s) => total + s.items.length, 0);
  const visibleTools = filteredSections.reduce(
    (total, s) => total + s.items.length,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        {/* HERO */}
        <div className="text-center">
          <div className="mx-auto mb-6 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            {t("badge")}
          </div>

          <h1 className="text-balance text-5xl font-bold leading-tight md:text-7xl">
            {t("titleLine1")}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t("titleLine2")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            {t("subtitle")}
          </p>

          <div className="mx-auto mt-10 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
            <Search className="shrink-0 text-slate-400" size={20} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </div>

          {normalizedSearch ? (
            <p className="mt-4 text-sm text-slate-500">
              {t("resultCount", { count: visibleTools })}
            </p>
          ) : null}
        </div>

        {/* STATS */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            [String(totalTools), t("statsTools")],
            [String(sections.length), t("statsCategories")],
            [t("statsAccessValue"), t("statsAccess")],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-blue-400/40 hover:bg-white/[0.06]"
            >
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="mt-2 text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* TOOL SECTIONS */}
        <div className="mt-20">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => {
              const isYouTube = section.accent === "youtube";

              return (
                <div key={section.categoryKey} className="mb-14">
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    {isYouTube ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10">
                        <Youtube className="h-5 w-5 text-red-400" />
                      </div>
                    ) : null}

                    <h2 className="text-2xl font-bold">{section.category}</h2>

                    {isYouTube ? (
                      <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
                        {tc("youtube")}
                      </span>
                    ) : null}
                  </div>

                  {isYouTube ? (
                    <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-slate-500">
                      {ty("youtubeBlurb")}
                    </p>
                  ) : null}

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {section.items.map((key: ToolKey) => {
                      const Icon = section.icons[
                        key as keyof typeof section.icons
                      ] as LucideIcon;
                      const title = catalog(`${key}.title`);
                      const description = catalog(`${key}.short`);

                      return (
                        <Link
                          key={key}
                          href={HREF[key]}
                          className={
                            isYouTube
                              ? "group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-2 hover:border-red-400/50 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-red-500/10"
                              : "group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-blue-500/10"
                          }
                        >
                          <div
                            className={
                              isYouTube
                                ? "mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-700"
                                : "mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
                            }
                          >
                            <Icon size={24} />
                          </div>

                          <h3 className="text-xl font-semibold">{title}</h3>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {description}
                          </p>

                          <div
                            className={
                              isYouTube
                                ? "mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-red-400 transition group-hover:text-red-300"
                                : "mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 transition group-hover:text-emerald-300"
                            }
                          >
                            {common("openTool")}
                            <span className="rtl:rotate-180">→</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
              <Search className="mx-auto text-slate-500" size={32} />

              <h2 className="mt-4 text-xl font-semibold">{t("noResultsTitle")}</h2>

              <p className="mt-2 text-sm text-slate-500">{t("noResultsBody")}</p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold transition hover:bg-white/[0.1]"
              >
                {t("clearSearch")}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}