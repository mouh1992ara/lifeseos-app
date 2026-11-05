"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import ToolCard, { TOOL_ACCENT } from "@/components/tool-card";
import { CountUp } from "@/components/count-up";
import { localizePath, type Locale } from "@/i18n/config";
import {
  TOOLS,
  TOOL_CATEGORY_ORDER,
  countByCategory,
  inCategory,
  type ToolCategory,
} from "@/lib/tool-catalog";

type Filter = "all" | ToolCategory;

/** Decorative floating glyphs behind the hero. Deterministic, so SSR matches. */
const FLOATERS = [
  { top: "12%", left: "7%", size: 34, dur: "19s", delay: "0s", glyph: "M4 6h16M4 12h10M4 18h7" },
  { top: "22%", left: "88%", size: 28, dur: "24s", delay: "1.8s", glyph: "M12 3v18M3 12h18" },
  { top: "72%", left: "12%", size: 26, dur: "21s", delay: "3.1s", glyph: "M4 18l5-6 4 3 7-9" },
  { top: "64%", left: "92%", size: 32, dur: "26s", delay: "0.9s", glyph: "M5 12h14M13 6l6 6-6 6" },
  { top: "8%", left: "48%", size: 22, dur: "17s", delay: "2.4s", glyph: "M12 4v16M6 10l6-6 6 6" },
] as const;

export default function ToolsClient() {
  const t = useTranslations("Tools.index");
  const tc = useTranslations("Tools.categories");
  const common = useTranslations("Common");
  const locale = useLocale() as Locale;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [focused, setFocused] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const total = TOOLS.length;
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    return TOOLS.filter((tool) => {
      if (filter !== "all" && !inCategory(tool, filter)) return false;
      if (!normalized) return true;

      // Search across localized name, description, category label and the
      // English keyword aids, so a visitor can type what they remember.
      const haystack = [
        tc(tool.primary),
        ...(tool.also ?? []).map((c) => tc(c)),
        tool.key.toLowerCase(),
        tool.slug,
        ...tool.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [filter, normalized, tc]);

  /** Re-run the stagger whenever the visible set changes. */
  const signature = `${filter}|${normalized}|${visible.length}`;
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduced = !document.documentElement.classList.contains("motion-on");
    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-tool-card]"));

    if (reduced) {
      cards.forEach((c) => c.setAttribute("data-in", "1"));
      return;
    }

    cards.forEach((card, i) => {
      card.setAttribute("data-in", "0");
      card.style.setProperty("--stagger", `${Math.min(i, 9) * 34}ms`);
    });

    // One frame is enough for the browser to register the "out" state before
    // the "in" state is applied, which is what produces the entrance rather
    // than an instant swap.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        cards.forEach((card) => card.setAttribute("data-in", "1"));
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [signature]);

  const activeColor = filter === "all" ? "#34d399" : TOOL_ACCENT[filter];

  const chips: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: tc("all"), count: total },
    ...TOOL_CATEGORY_ORDER.map((c) => ({
      id: c as Filter,
      label: tc(c),
      count: countByCategory(c),
    })),
  ];

  const resetAll = () => {
    setQuery("");
    setFilter("all");
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-950 text-white">
      {/* ============================= HERO ============================= */}
      <section className="tools-hero relative isolate overflow-hidden px-6 pb-14 pt-16 sm:px-10 lg:px-16 lg:pb-20 lg:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="tools-hero-grid" />
          <div className="tools-hero-aura" style={{ ["--c" as string]: activeColor }} />

          {FLOATERS.map((f, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className="tool-floater absolute text-white/[0.07]"
              style={{
                top: f.top,
                left: f.left,
                width: f.size,
                height: f.size,
                ["--dur" as string]: f.dur,
                animationDelay: f.delay,
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={f.glyph} />
            </svg>
          ))}
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="tools-hero-copy text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-1.5 text-xs font-medium text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("badge")}
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="tools-line block overflow-hidden">
                <span className="tools-line-inner block">{t("titleLine1")}</span>
              </span>
              <span className="tools-line block overflow-hidden">
                <span
                  className="tools-line-inner block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent"
                  style={{ ["--d" as string]: "110ms" }}
                >
                  {t("titleLine2")}
                </span>
              </span>
            </h1>

            <p className="tools-hero-sub mx-auto mt-6 max-w-2xl text-balance text-base leading-8 text-slate-400 sm:text-lg">
              {t("subtitle")}
            </p>
          </div>

          {/* Search */}
          <div className="tools-search-wrap mx-auto mt-9 max-w-2xl">
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className={`tools-search ${focused ? "is-focused" : ""}`}
              style={{ ["--c" as string]: activeColor }}
            >
              <Search className="h-4.5 w-4.5 shrink-0 text-slate-500" aria-hidden="true" />

              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchLabel")}
                aria-describedby="tools-search-hint"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 [&::-webkit-search-cancel-button]:appearance-none"
              />

              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  aria-label={t("searchClear")}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <kbd
                  id="tools-search-hint"
                  className="hidden shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:block"
                >
                  {total}
                </kbd>
              )}
            </form>

            <p className="mt-2.5 text-center text-[11px] text-slate-600">
              {t("searchHint")}
            </p>
          </div>

          {/* Stats */}
          <dl className="tools-stats mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
            {[
              { value: total, label: t("statsTools") },
              { value: TOOL_CATEGORY_ORDER.length, label: t("statsCategories") },
              { text: t("statsAccessValue"), label: t("statsAccess") },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-3 py-4 text-center sm:px-5 sm:py-5"
              >
                <dd className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
                  {"value" in stat && typeof stat.value === "number" ? (
                    <CountUp value={stat.value} delay={220 + i * 110} />
                  ) : (
                    // A word, not a number: set smaller so the row still reads
                    // as one rhythm instead of one oversized cell.
                    <span className="text-lg sm:text-xl">{stat.text}</span>
                  )}
                </dd>
                <dt className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500 sm:text-xs">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============================ LIBRARY ============================ */}
      <section id="library" className="scroll-mt-24 px-6 pb-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {/* Category rail */}
          <div className="sticky top-[var(--header-h,76px)] z-40 -mx-6 bg-slate-950/85 px-6 py-3 backdrop-blur-xl sm:-mx-10 sm:px-10 lg:-mx-16 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal
                  className="hidden h-3.5 w-3.5 shrink-0 text-slate-500 sm:block"
                  aria-hidden="true"
                />

                <div
                  role="tablist"
                  aria-label={t("filterLabel")}
                  className="category-rail -mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 pb-1"
                >
                  {chips.map((chip) => {
                    const on = filter === chip.id;
                    const color = chip.id === "all" ? "#34d399" : TOOL_ACCENT[chip.id];
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        data-category-tab={chip.id}
                        onClick={() => setFilter(chip.id)}
                        className="category-chip shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition sm:text-[13px]"
                        style={{
                          ["--c" as string]: color,
                          ...(on
                            ? {
                                color: "#0b1220",
                                backgroundColor: color,
                                borderColor: color,
                              }
                            : {}),
                        }}
                      >
                        {chip.label}
                        <span
                          className={`ms-1.5 text-[10px] tabular-nums ${on ? "opacity-70" : "opacity-45"}`}
                        >
                          {chip.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                <p aria-live="polite" data-result-count={visible.length}>
                  {t("resultLabel", { shown: visible.length, total })}
                </p>

                {(query || filter !== "all") && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-1 font-medium text-slate-400 transition hover:text-white"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    {t("clearAll")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          {visible.length > 0 ? (
            <div
              ref={gridRef}
              data-tools-grid=""
              data-filter={filter}
              className="mt-7 grid auto-rows-fr gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
            >
              {visible.map((tool, i) => (
                <ToolCard key={tool.key} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            /* Empty state — keeps the rail so the visitor can escape easily. */
            <div
              data-tools-empty=""
              className="mt-10 flex flex-col items-center rounded-[24px] border border-white/[0.07] bg-white/[0.02] px-6 py-16 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <LayoutGrid className="h-6 w-6 text-slate-500" aria-hidden="true" />
              </span>

              <h2 className="mt-5 text-lg font-semibold">{t("noResultsTitle")}</h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {t("noResultsBody")}
              </p>

              {normalized ? (
                <p className="mt-3 rounded-lg border border-white/[0.07] bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400">
                  “{query.trim()}”
                </p>
              ) : null}

              <button
                type="button"
                onClick={resetAll}
                className="btn-primary mt-6 h-9 px-4 text-[13px]"
              >
                {t("clearAll")}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Closing CTA — links to a real tool, not a placeholder. */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-[22px] border border-white/[0.07] bg-gradient-to-r from-emerald-400/[0.06] via-cyan-400/[0.04] to-violet-400/[0.06] px-6 py-6 sm:flex-row sm:px-8">
            <div>
              <p className="text-sm font-semibold text-white">{t("explore")}</p>
              <p className="mt-1 text-[13px] text-slate-400">{t("statsAccess")} · {common("free")}</p>
            </div>

            <a
              href={localizePath(locale, "/tools/seo-analyzer")}
              className="btn-primary h-10 shrink-0 px-5 text-sm"
            >
              {t("explore")}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}