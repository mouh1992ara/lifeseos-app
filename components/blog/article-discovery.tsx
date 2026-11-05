"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Search, X } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { BlogArticle } from "@/lib/blog";
import { categoryOf, type BlogCategoryKey } from "@/lib/blog-categories";

type Labels = {
  listEyebrow: string;
  listTitle: string;
  listBody: string;
  resultsCount: (count: number) => string;
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  filterLabel: string;
  readGuide: string;
  emptyTitle: string;
  emptyBody: string;
  emptyReset: string;
  allLabel: string;
};

/** Accent per category, so a filtered grid keeps its colour identity. */
const ACCENT: Record<BlogCategoryKey | "all", string> = {
  all: "#34d399",
  technical: "#60a5fa",
  onPage: "#34d399",
  content: "#2dd4bf",
  audits: "#a78bfa",
};

function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Article discovery: search + category filtering over the real article set.
 *
 * Filtering is client-side on data already on the page (nine guides), so there
 * is no request per keystroke and no layout shift. Cards reveal with an
 * IntersectionObserver keyed on the current result list, which means a filtered
 * set animates in exactly like the first one.
 */
export default function ArticleDiscovery({
  articles,
  categories,
  labels,
}: {
  articles: BlogArticle[];
  categories: { key: BlogCategoryKey; label: string; count: number }[];
  labels: Labels;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<BlogCategoryKey | "all">("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [focused, setFocused] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = normalise(query.trim());
    return articles.filter((article) => {
      const key = categoryOf(article.slug);
      if (active !== "all" && key !== active) return false;
      if (!q) return true;
      const haystack = normalise(
        `${article.title} ${article.description} ${article.category}`,
      );
      return haystack.includes(q);
    });
  }, [articles, active, query]);

  /* Reveal the current result set as it enters the viewport. */
  useEffect(() => {
    const nodes = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>("[data-blog-card]") ?? [],
    );
    if (!nodes.length) return;

    if (!document.documentElement.classList.contains("motion-on")) {
      setRevealed(new Set(nodes.map((n) => n.dataset.blogCard ?? "")));
      return;
    }

    setRevealed(new Set());

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.blogCard;
          if (id) setRevealed((prev) => new Set(prev).add(id));
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );

    nodes.forEach((node) => io.observe(node));

    /* Never leave a card stuck invisible if the observer cannot fire. */
    const safety = window.setTimeout(
      () => setRevealed(new Set(nodes.map((n) => n.dataset.blogCard ?? ""))),
      2400,
    );

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [filtered]);

  const hasFilters = query.trim().length > 0 || active !== "all";

  return (
    <section id="articles" className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-16 pt-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            {labels.listEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {labels.listTitle}
          </h2>
          <p className="mt-2.5 max-w-xl text-sm leading-7 text-slate-400">
            {labels.listBody}
          </p>
        </div>

        <span
          className="shrink-0 text-xs font-medium tabular-nums text-slate-500"
          data-blog-count
        >
          {labels.resultsCount(filtered.length)}
        </span>
      </div>

      {/* ---------------- Search + filters ---------------- */}
      <div className="mt-7 space-y-4">
        <label
          className={`blog-search ${focused ? "is-focused" : ""}`}
          style={{ "--c": ACCENT[active] } as React.CSSProperties}
        >
          <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchLabel}
            data-blog-search
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={labels.clearSearch}
              className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <div
          className="category-rail flex items-center gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label={labels.filterLabel}
        >
          <button
            type="button"
            onClick={() => setActive("all")}
            aria-pressed={active === "all"}
            data-blog-filter="all"
            className="category-chip shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px]"
            style={{ "--c": ACCENT.all } as React.CSSProperties}
          >
            {labels.allLabel}
            <span className="ms-1.5 text-[11px] text-slate-500">{articles.length}</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActive(category.key)}
              aria-pressed={active === category.key}
              data-blog-filter={category.key}
              className="category-chip shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px]"
              style={{ "--c": ACCENT[category.key] } as React.CSSProperties}
            >
              {category.label}
              <span className="ms-1.5 text-[11px] text-slate-500">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Grid ---------------- */}
      {filtered.length > 0 ? (
        <div
          ref={gridRef}
          className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
        >
          {filtered.map((article, i) => {
            const key = categoryOf(article.slug);
            const wide = i === 0 && filtered.length >= 4;

            return (
              <ArticleCard
                key={article.slug}
                article={article}
                accent={ACCENT[key ?? active]}
                wide={wide}
                index={i}
                revealed={revealed.has(article.slug)}
                readGuide={labels.readGuide}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-14 text-center">
          <p className="text-base font-semibold text-white">{labels.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-400">
            {labels.emptyBody}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActive("all");
            }}
            className="btn-secondary mt-6 h-10 px-5 text-sm"
            data-blog-reset
          >
            {labels.emptyReset}
          </button>
        </div>
      )}

      {hasFilters && filtered.length > 0 ? (
        <p className="mt-5 text-center text-[11px] text-slate-600" aria-hidden="true">
          {/* Quiet reminder that this is a filtered view, not the whole library. */}
          {labels.allLabel} · {articles.length}
        </p>
      ) : null}
    </section>
  );
}

function ArticleCard({
  article,
  accent,
  wide,
  index,
  revealed,
  readGuide,
}: {
  article: BlogArticle;
  accent: string;
  wide: boolean;
  index: number;
  revealed: boolean;
  readGuide: string;
}) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      data-blog-card={article.slug}
      data-in={revealed ? "1" : "0"}
      style={
        {
          "--accent": accent,
          "--i": index,
        } as React.CSSProperties
      }
      className={`blog-card group relative flex flex-col overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.02] ${
        wide ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
    >
      <span aria-hidden="true" className="blog-card-ring" />

      <div
        className={`relative overflow-hidden ${
          wide ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
      >
        <Image
          src={article.featuredImage}
          alt={article.imageAlt}
          fill
          sizes={
            wide
              ? "(min-width: 1024px) 60vw, (min-width: 640px) 100vw, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          className="blog-card-img object-cover"
        />

        <span aria-hidden="true" className="blog-card-scrim" />

        <span className="blog-tag blog-tag--float">{article.category}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3
          className={`text-pretty font-semibold leading-snug text-white ${
            wide ? "text-lg sm:text-xl" : "text-[15px]"
          }`}
        >
          {article.title}
        </h3>

        <p className="line-clamp-2 text-[13px] leading-6 text-slate-400">
          {article.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="flex items-center gap-x-2 text-[11px] text-slate-500">
            <time dateTime={article.publishedAt}>{article.publishedAt}</time>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>{article.readTime}</span>
          </span>

          <span className="blog-card-cta inline-flex items-center gap-1 text-[12px] font-semibold">
            {readGuide}
            <ArrowUpRight
              className="blog-card-arrow h-3.5 w-3.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
