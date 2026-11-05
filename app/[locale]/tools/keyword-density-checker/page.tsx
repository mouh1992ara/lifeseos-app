"use client";

import { Link } from "@/i18n/navigation";
import {
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { tokenize } from "@/lib/text-stats";

import ShareTool from "@/components/share-tool";

export default function KeywordDensityCheckerPage() {
  const t = useTranslations("Tool.keywordDensity");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");

  const [text, setText] = useState("");

  const hasTrackedUse = useRef(false);

  const analysis = useMemo(() => {
    // Shared tokeniser: keeps "l'outil" / "don't" as one word and counts each
    // Han/kana character as a token, so Chinese pages are not a single "word".
    const { words } = tokenize(text);

    if (words.length === 0) {
      return {
        totalWords: 0,
        uniqueWords: 0,
        keywords: [] as {
          keyword: string;
          count: number;
          density: number;
        }[],
      };
    }

    const counts =
      new Map<string, number>();

    for (const word of words) {
      counts.set(
        word,
        (counts.get(word) || 0) + 1
      );
    }

    const keywords =
      Array.from(
        counts.entries()
      )
        .map(
          ([keyword, count]) => ({
            keyword,
            count,
            density:
              (count /
                words.length) *
              100,
          })
        )
        .sort(
          (a, b) =>
            b.count - a.count
        )
        .slice(0, 20);

    return {
      totalWords:
        words.length,
      uniqueWords:
        counts.size,
      keywords,
    };
  }, [text]);

  async function recordToolUseOnce() {
    if (hasTrackedUse.current) {
      return;
    }

    hasTrackedUse.current = true;

    try {
      const response = await fetch(
        "/api/tool-events",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tool_name:
              "Keyword Density Checker",
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to record Keyword Density Checker usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  function handleTextChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const value =
      event.target.value;

    setText(value);

    if (value.trim()) {
      void recordToolUseOnce();
    }
  }

  return (
    <main data-tool-surface className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300">
            <span aria-hidden="true">%</span>

            <span>
              {t("badge")}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}

            <span className="mt-2 block bg-gradient-to-r from-amber-300 via-orange-300 to-fuchsia-400 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {t("subtitle")}
          </p>

        </div>


        {/* TOOL */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              {t("inputEyebrow")}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {t("inputTitle")}
            </h2>

            <textarea
              value={text}
              onChange={
                handleTextChange
              }
              placeholder={t("inputPlaceholder")}
              rows={18}
              className="mt-5 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/60"
            />

            <div className="mt-4 grid grid-cols-2 gap-4">

              <MetricCard
                label={t("totalWords")}
                value={String(
                  analysis.totalWords
                )}
              />

              <MetricCard
                label={t("uniqueWords")}
                value={String(
                  analysis.uniqueWords
                )}
              />

            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              {t("inputNote")}
            </p>

          </section>


          {/* KEYWORD RESULTS */}

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
                  {t("resultsEyebrow")}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {t("resultsTitle")}
                </h2>

              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center">

                <p className="text-xs text-slate-500">
                  {t("shown")}
                </p>

                <p className="mt-1 font-bold text-amber-300">
                  {
                    analysis.keywords
                      .length
                  }
                </p>

              </div>

            </div>


            {analysis.keywords.length ===
            0 ? (

              <p className="mt-6 text-sm leading-7 text-slate-500">
                {t("empty")}
              </p>

            ) : (

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">

                <div className="grid grid-cols-3 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">

                  <span>
                    {t("colKeyword")}
                  </span>

                  <span className="text-center">
                    {t("colCount")}
                  </span>

                  <span className="text-end">
                    {t("colDensity")}
                  </span>

                </div>


                {analysis.keywords.map(
                  (item) => (

                    <div
                      key={
                        item.keyword
                      }
                      className="grid grid-cols-3 border-t border-white/10 px-4 py-3 text-sm"
                    >

                      <span className="truncate" data-ltr-text>
                        {
                          item.keyword
                        }
                      </span>

                      <span className="text-center text-slate-300">
                        {
                          item.count
                        }
                      </span>

                      <span className="text-end font-medium text-amber-300" data-ltr-text>
                        {item.density.toFixed(
                          2
                        )}
                        %
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </div>


        <div className="mt-10">

          <ShareTool
            title={tc("keywordDensityChecker.title")}
            description={t("shareBody")}
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          {/* INTRO */}

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              {t("introEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("introTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("introP1")}
            </p>

          </div>


          {/* EXPLANATION CARDS */}

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <InfoCard
              symbol="#"
              title={t("freqTitle")}
              description={t("freqBody")}
            />

            <InfoCard
              symbol="%"
              title={t("densityTitle")}
              description={t("densityBody")}
            />

            <InfoCard
              symbol="Aa"
              title={t("uniqueTitle")}
              description={t("uniqueBody")}
            />

          </div>


          {/* FORMULA */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
                  {t("formulaEyebrow")}
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  {t("formulaTitle")}
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  {t("formulaBody")}
                </p>

              </div>


              <div className="rounded-[24px] border border-amber-400/15 bg-amber-400/[0.04] p-6">

                <p className="font-mono text-sm text-amber-300">
                  {t("formulaLabel")}
                </p>

                <p className="mt-3 text-xl font-bold text-white sm:text-2xl">
                  {t("formulaExpr")}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {t("formulaExample")}
                </p>

              </div>

            </div>

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  {t("howEyebrow")}
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  {t("howTitle")}
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  {t("howBody")}
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title={t("how1Title")}
                  description={t("how1Body")}
                />

                <StepCard
                  number="2"
                  title={t("how2Title")}
                  description={t("how2Body")}
                />

                <StepCard
                  number="3"
                  title={t("how3Title")}
                  description={t("how3Body")}
                />

                <StepCard
                  number="4"
                  title={t("how4Title")}
                  description={t("how4Body")}
                />

              </div>

            </div>

          </div>


          {/* NO MAGIC NUMBER */}

          <div className="mt-16 rounded-[32px] border border-violet-400/15 bg-violet-400/[0.04] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-6 sm:grid-cols-[auto_1fr]">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 font-bold text-violet-300">
                !
              </div>

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  {t("noteEyebrow")}
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  {t("noteTitle")}
                </h2>

                <p className="mt-4 max-w-4xl leading-8 text-slate-400">
                  {t("noteBody")}
                </p>

              </div>

            </div>

          </div>


          {/* KEYWORD STUFFING */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-300">
                {t("avoidEyebrow")}
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                {t("avoidTitle")}
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                {t("avoidP1")}
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                {t("avoidP2")}
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <PracticeCard
                title={t("practice1Title")}
                description={t("practice1Body")}
              />

              <PracticeCard
                title={t("practice2Title")}
                description={t("practice2Body")}
              />

              <PracticeCard
                title={t("practice3Title")}
                description={t("practice3Body")}
              />

              <PracticeCard
                title={t("practice4Title")}
                description={t("practice4Body")}
              />

            </div>

          </div>


          {/* CONTINUE CONTENT WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
                {t("nextEyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t("nextTitle")}
              </h2>

              <p className="mt-4 leading-8 text-slate-400">
                {t("nextBody")}
              </p>

            </div>


            <div className="mt-10 grid gap-5 lg:grid-cols-3">

              <Link
                href="/tools/article-rewriter"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 font-bold text-blue-300">
                    ✦
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("wfStep1")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  {tc("articleRewriter.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf1Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  {t("wf1Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>


              <Link
                href="/tools/content-analyzer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-lg text-violet-300">
                    ▤
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("wfStep2")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-violet-300">
                  {tc("contentAnalyzer.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf2Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-violet-300">
                  {t("wf2Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>


              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.055] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 font-bold text-amber-300">
                    %
                  </div>

                  <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                    {t("wfStep3")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {tc("keywordDensityChecker.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf3Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-amber-300">
                  {t("wf3Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block">
                    ✓
                  </span>
                </div>

              </div>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/seo-page-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-amber-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("seoPageAnalyzer.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/meta-tag-generator"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-amber-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("metaTagGenerator.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-amber-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tCommon("viewAllTools")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-amber-300" data-ltr-text>
        {value}
      </p>

    </div>
  );
}


function InfoCard({
  symbol,
  title,
  description,
}: {
  symbol: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">

      <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 px-2 text-sm font-bold text-amber-300" data-ltr-text>
        {symbol}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

    </div>
  );
}


function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 font-bold text-amber-300" data-ltr-text>
        {number}
      </div>

      <div>

        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}


function PracticeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        ✓
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

    </div>
  );
}
