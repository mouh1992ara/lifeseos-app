"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

const toolSections = [
  {
    category: "Technical SEO",
    accent: "default",
    items: [
      {
        title: "SEO Analyzer",
        description:
          "Analyze website health, technical SEO issues and optimization opportunities.",
        icon: Search,
        href: "/tools/seo-analyzer",
      },
      {
        title: "SEO Page Analyzer",
        description:
          "Analyze titles, headings, links, metadata and other important on-page SEO elements.",
        icon: FileText,
        href: "/tools/seo-page-analyzer",
      },
      {
        title: "Robots.txt Generator",
        description:
          "Create crawler-friendly robots.txt files for search engines.",
        icon: Bot,
        href: "/tools/robots-txt-generator",
      },
      {
        title: "XML Sitemap Generator",
        description:
          "Generate SEO-friendly sitemap structures for better crawling and indexing.",
        icon: Globe,
        href: "/tools/xml-sitemap-generator",
      },
      {
        title: "Schema Markup Generator",
        description:
          "Generate JSON-LD structured data for articles, FAQs, products, businesses and more.",
        icon: FileCode2,
        href: "/tools/schema-markup-generator",
      },
    ],
  },
  {
    category: "Content SEO",
    accent: "default",
    items: [
      {
        title: "Meta Tag Generator",
        description:
          "Create optimized title and meta description ideas for search visibility.",
        icon: Sparkles,
        href: "/tools/meta-tag-generator",
      },
      {
        title: "SERP Snippet Preview",
        description:
          "Preview how your page title, URL and meta description may appear in search results.",
        icon: Monitor,
        href: "/tools/serp-snippet-preview",
      },
      {
        title: "Keyword Density Checker",
        description:
          "Analyze keyword frequency and content usage across your text.",
        icon: BarChart3,
        href: "/tools/keyword-density-checker",
      },
      {
        title: "SEO Article Rewriter",
        description:
          "Rewrite website articles for better clarity, readability, tone and SEO consistency.",
        icon: WandSparkles,
        href: "/tools/article-rewriter",
      },
    ],
  },
  {
    category: "Performance",
    accent: "default",
    items: [
      {
        title: "HTTP Status Checker",
        description:
          "Check redirects, errors and HTTP response codes instantly.",
        icon: Zap,
        href: "/tools/http-status-checker",
      },
      {
        title: "Page Speed Analyzer",
        description:
          "Measure website performance, loading speed and important Lighthouse metrics.",
        icon: Gauge,
        href: "/tools/page-speed",
      },
    ],
  },
  {
    category: "Content Management",
    accent: "default",
    items: [
      {
        title: "Content Analyzer",
        description:
          "Analyze content quality, readability, keyword usage and SEO opportunities.",
        icon: FileText,
        href: "/tools/content-analyzer",
      },
    ],
  },
  {
    category: "YouTube SEO",
    accent: "youtube",
    items: [
      {
        title: "YouTube Keyword Ideas",
        description:
          "Discover keyword groups, long-tail phrases and useful video topic ideas.",
        icon: Tags,
        href: "/tools/youtube-keyword-ideas",
      },
      {
        title: "YouTube Title Generator",
        description:
          "Generate engaging YouTube title ideas based on your topic, keyword, style and audience.",
        icon: Sparkles,
        href: "/tools/youtube-title-generator",
      },
      {
        title: "YouTube Title Analyzer",
        description:
          "Analyze YouTube titles for clarity, keyword use, structure, length and click appeal.",
        icon: TextSearch,
        href: "/tools/youtube-title-analyzer",
      },
      {
        title: "YouTube Description Generator",
        description:
          "Create structured YouTube descriptions with keyword support, hashtags and calls to action.",
        icon: FileText,
        href: "/tools/youtube-description-generator",
      },
      {
        title: "YouTube Script Writer",
        description:
          "Create structured video scripts with hooks, main points, transitions, CTAs and outros.",
        icon: WandSparkles,
        href: "/tools/youtube-script-writer",
      },
    ],
  },
];

export default function ToolsPage() {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return toolSections
      .map((section) => {
        const items = section.items.filter((tool) => {
          if (!normalizedSearch) return true;

          const searchable = [
            section.category,
            tool.title,
            tool.description,
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(normalizedSearch);
        });

        return {
          ...section,
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [normalizedSearch]);

  const totalTools = toolSections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  const visibleTools = filteredSections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        {/* HERO */}
        <div className="text-center">
          <div className="mx-auto mb-6 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            LifeSeos Tool Library
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Powerful SEO tools
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              for every website
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Analyze websites, improve content, generate structured data and
            optimize YouTube content with free LifeSeos tools.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
            <Search className="shrink-0 text-slate-400" size={20} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search SEO tools..."
              aria-label="Search SEO tools"
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </div>

          {normalizedSearch ? (
            <p className="mt-4 text-sm text-slate-500">
              {visibleTools === 0
                ? "No tools found."
                : `${visibleTools} ${visibleTools === 1 ? "tool" : "tools"} found`}
            </p>
          ) : null}
        </div>

        {/* STATS */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            [String(totalTools), "Free Tools"],
            ["5", "Tool Categories"],
            ["Instant", "Access"],
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
                <div key={section.category} className="mb-14">
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    {isYouTube ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10">
                        <Youtube className="h-5 w-5 text-red-400" />
                      </div>
                    ) : null}

                    <h2 className="text-2xl font-bold">{section.category}</h2>

                    {isYouTube ? (
                      <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
                        YouTube SEO
                      </span>
                    ) : null}
                  </div>

                  {isYouTube ? (
                    <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-slate-500">
                      Discover video keywords, create stronger titles and
                      descriptions, analyze title quality and build structured
                      scripts.
                    </p>
                  ) : null}

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {section.items.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <Link
                          key={tool.title}
                          href={tool.href}
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

                          <h3 className="text-xl font-semibold">
                            {tool.title}
                          </h3>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {tool.description}
                          </p>

                          <div
                            className={
                              isYouTube
                                ? "mt-6 text-sm font-semibold text-red-400 transition group-hover:text-red-300"
                                : "mt-6 text-sm font-semibold text-emerald-400 transition group-hover:text-emerald-300"
                            }
                          >
                            Open tool →
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

              <h2 className="mt-4 text-xl font-semibold">No tools found</h2>

              <p className="mt-2 text-sm text-slate-500">
                Try another tool name or category.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold transition hover:bg-white/[0.1]"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
