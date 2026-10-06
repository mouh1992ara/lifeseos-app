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
} from "lucide-react";

const tools = [
  {
    category: "Technical SEO",
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
          "Analyze on-page SEO elements including titles, headings, links and image optimization.",
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
          "Generate SEO-friendly sitemap structures for better indexing.",
        icon: Globe,
        href: "/tools/xml-sitemap-generator",
      },
    ],
  },
  {
    category: "Content SEO",
    items: [
      {
        title: "Meta Tag Generator",
        description:
          "Create optimized titles and descriptions to improve visibility.",
        icon: Sparkles,
        href: "/tools/meta-tag-generator",
      },
      {
        title: "Keyword Density Checker",
        description:
          "Analyze keyword usage, frequency and content optimization.",
        icon: BarChart3,
        href: "/tools/keyword-density-checker",
      },
    ],
  },
  {
    category: "Performance",
    items: [
      {
        title: "HTTP Status Checker",
        description:
          "Check redirects, errors and HTTP responses instantly.",
        icon: Zap,
        href: "/tools/http-status-checker",
      },
      {
        title: "Page Speed Analyzer",
        description:
          "Measure website performance, loading speed and Lighthouse metrics.",
        icon: Gauge,
        href: "/tools/page-speed",
      },
    ],
  },
  {
    category: "Content Management",
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
];

export default function ToolsPage() {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return tools
      .map((section) => {
        const filteredItems = section.items.filter((tool) => {
          if (!normalizedSearch) {
            return true;
          }

          const searchableText = [
            section.category,
            tool.title,
            tool.description,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedSearch);
        });

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [normalizedSearch]);

  const totalTools = tools.reduce(
    (total, section) => total + section.items.length,
    0
  );

  const totalVisibleTools = filteredSections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-20">
        {/* HERO */}
        <div className="text-center">
          <div className="mx-auto mb-6 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            🚀 LifeSeos Tool Library
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Powerful SEO tools
            <br />

            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              for every website
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Analyze your website, improve rankings, optimize content and
            discover technical SEO issues instantly with free LifeSeos tools.
          </p>

          {/* SEARCH */}
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

          {normalizedSearch && (
            <p className="mt-4 text-sm text-slate-500">
              {totalVisibleTools === 0
                ? "No SEO tools found."
                : `${totalVisibleTools} ${
                    totalVisibleTools === 1 ? "tool" : "tools"
                  } found`}
            </p>
          )}
        </div>

        {/* STATS */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            [String(totalTools), "SEO Tools"],
            ["100%", "Free Access"],
            ["Instant", "Analysis"],
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

        {/* TOOLS */}
        <div className="mt-20">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => (
              <div key={section.category} className="mb-14">
                <h2 className="mb-6 text-2xl font-bold">
                  {section.category}
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((tool) => {
                    const Icon = tool.icon;

                    return (
                      <Link
                        key={tool.title}
                        href={tool.href}
                        className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-blue-500/10"
                      >
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                          <Icon size={24} />
                        </div>

                        <h3 className="text-xl font-semibold">
                          {tool.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          {tool.description}
                        </p>

                        <div className="mt-6 text-sm font-semibold text-emerald-400 transition group-hover:text-emerald-300">
                          Open tool →
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
              <Search className="mx-auto text-slate-500" size={32} />

              <h2 className="mt-4 text-xl font-semibold">
                No tools found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try searching for another SEO tool or category.
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