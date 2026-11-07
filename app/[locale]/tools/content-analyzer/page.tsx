"use client";

import { Link } from "@/i18n/navigation";
import { hasRealOutput, useToolOutcome } from "@/lib/use-tool-outcome";
import { useMemo, useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { countSentences, isCjkToken, readingMinutes, tokenize } from "@/lib/text-stats";

import ShareTool from "@/components/share-tool";

type KeywordItem = {
  keyword: string;
  count: number;
  density: number;
};

type Recommendation = {
  key: string;
  keyword?: string;
};

type ScoreKey =
  | "scoreExcellent"
  | "scoreGood"
  | "scoreNeedsImprovement"
  | "scorePoor";

const INFO_CARDS = ["1", "2", "3", "4", "5", "6"] as const;
const INFO_ICONS = ["▤", "◎", "%", "Aa", "¶", "◷"] as const;
const STEPS = ["1", "2", "3", "4"] as const;
const BENEFITS = ["1", "2", "3", "4"] as const;

export default function ContentAnalyzerPage() {
  const { start: startOutcome } = useToolOutcome("content-analyzer");
  const t = useTranslations("Tool.contentAnalyzer");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");

  const [text, setText] = useState("");



  function handleTextChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const value =
      event.target.value;

    setText(value);
  }

  const analysis = useMemo(() => {
    const trimmed = text.trim();

    if (!trimmed) {
      return {
        words: 0,
        characters: 0,
        charactersWithoutSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        uniqueWords: 0,
        averageSentenceLength: 0,
        readingTime: 0,
        topKeywords:
          [] as KeywordItem[],
        score: 0,
        recommendations:
          [] as Recommendation[],
      };
    }

    // Shared tokeniser: smart apostrophes no longer split words, and Han/kana
    // characters count individually instead of collapsing into one token.
    const { words, cjkChars } = tokenize(trimmed);

    const sentences = countSentences(trimmed);

    const paragraphs = trimmed
      .split(/\n\s*\n/)
      .map((item) =>
        item.trim()
      )
      .filter(Boolean).length;

    const counts =
      new Map<
        string,
        number
      >();

    for (const word of words) {
      if (!isCjkToken(word) && word.length < 3) {
        continue;
      }

      counts.set(
        word,
        (counts.get(word) ||
          0) + 1
      );
    }

    const topKeywords =
      Array.from(
        counts.entries()
      )
        .map(
          ([
            keyword,
            count,
          ]) => ({
            keyword,
            count,
            density:
              words.length > 0
                ? (count /
                    words.length) *
                  100
                : 0,
          })
        )
        .sort((a, b) => {
          if (
            b.count !==
            a.count
          ) {
            return (
              b.count -
              a.count
            );
          }

          return a.keyword.localeCompare(
            b.keyword
          );
        })
        .slice(0, 10);

    const uniqueWords =
      new Set(words).size;

    const averageSentenceLength =
      sentences > 0
        ? words.length /
          sentences
        : words.length;

    const readingTime = readingMinutes(
      words.length,
      cjkChars
    );

    const recommendations:
      Recommendation[] = [];

    let score = 100;

    if (words.length < 300) {
      recommendations.push({
        key: "recThin",
      });

      score -= 20;
    }

    if (
      averageSentenceLength >
        25 &&
      sentences > 0
    ) {
      recommendations.push({
        key: "recLongSentences",
      });

      score -= 10;
    }

    if (
      paragraphs <= 1 &&
      words.length > 150
    ) {
      recommendations.push({
        key: "recParagraphs",
      });

      score -= 10;
    }

    if (
      words.length > 0 &&
      uniqueWords /
        words.length <
        0.35
    ) {
      recommendations.push({
        key: "recRepetition",
      });

      score -= 10;
    }

    const highDensityKeyword =
      topKeywords.find(
        (item) =>
          item.density > 5
      );

    if (
      highDensityKeyword
    ) {
      recommendations.push({
        key: "recHighDensity",
        keyword:
          highDensityKeyword.keyword,
      });

      score -= 10;
    }

    if (
      words.length >= 300 &&
      averageSentenceLength <=
        25 &&
      paragraphs >= 2
    ) {
      recommendations.push({
        key: "recGood",
      });
    }

    if (
      recommendations.length ===
      0
    ) {
      recommendations.push({
        key: "recBalanced",
      });
    }

    score = Math.max(
      0,
      Math.min(
        100,
        score
      )
    );

    return {
      words:
        words.length,

      characters:
        text.length,

      charactersWithoutSpaces:
        text.replace(
          /\s/g,
          ""
        ).length,

      sentences,
      paragraphs,
      uniqueWords,
      averageSentenceLength,
      readingTime,
      topKeywords,
      score,
      recommendations,
    };
  }, [text]);

  function getScoreKey(
    score: number
  ): ScoreKey {
    if (score >= 90) {
      return "scoreExcellent";
    }

    if (score >= 75) {
      return "scoreGood";
    }

    if (score >= 60) {
      return "scoreNeedsImprovement";
    }

    return "scorePoor";
  }


  /* One success per visit, and only for output the visitor caused.
     These tools recompute on every keystroke, so counting each change would
     record dozens of operations for one person typing. `hasRealOutput` stops an
     empty result counting, and the mount snapshot stops a non-empty default
     from being recorded as work nobody did. */
  const outcomeOutput = analysis;
  const initialOutcomeOutput = useRef(outcomeOutput);
  const outcomeTrackedRef = useRef(false);
  useEffect(() => {
    if (outcomeTrackedRef.current) return;
    if (outcomeOutput === initialOutcomeOutput.current) return;
    if (!hasRealOutput(outcomeOutput)) return;
    outcomeTrackedRef.current = true;
    startOutcome().success();
  }, [outcomeOutput, startOutcome]);

  return (
    <main data-tool-surface className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-300">
            <span aria-hidden="true">▤</span>

            <span>
              {t("badge")}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}

            <span className="mt-2 block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {t("subtitle")}
          </p>

        </div>


        {/* ANALYZER */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <label
              htmlFor="content-analyzer-input"
              className="text-sm font-semibold text-slate-200"
            >
              {t("inputLabel")}
            </label>

            <textarea
              id="content-analyzer-input"
              value={text}
              onChange={
                handleTextChange
              }
              placeholder={t("inputPlaceholder")}
              rows={20}
              className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60"
            />

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <span aria-hidden="true">✓</span>
              <span>
                {t("privacyNote")}
              </span>
            </div>

          </section>


          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {t("scoreLabel")}
                </p>

                <p
                  className="mt-2 text-5xl font-bold text-emerald-400"
                  data-ltr-text
                >
                  {analysis.score}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {text.trim()
                    ? t(getScoreKey(
                        analysis.score
                      ))
                    : t("scoreEmpty")}
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-end">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {t("readingTimeLabel")}
                </p>

                <p className="mt-1 text-lg font-bold">
                  <span data-ltr-text>
                    {
                      analysis.readingTime
                    }
                  </span>{" "}
                  {t("minUnit")}
                </p>

              </div>

            </div>


            <div className="mt-6 grid grid-cols-2 gap-4">

              <MetricCard
                label={t("wordsLabel")}
                value={String(
                  analysis.words
                )}
              />

              <MetricCard
                label={t("uniqueWordsLabel")}
                value={String(
                  analysis.uniqueWords
                )}
              />

              <MetricCard
                label={t("sentencesLabel")}
                value={String(
                  analysis.sentences
                )}
              />

              <MetricCard
                label={t("paragraphsLabel")}
                value={String(
                  analysis.paragraphs
                )}
              />

            </div>


            <div className="mt-4 grid grid-cols-2 gap-4">

              <MetricCard
                label={t("charactersLabel")}
                value={String(
                  analysis.characters
                )}
              />

              <MetricCard
                label={t("avgSentenceLabel")}
                value={
                  analysis.words > 0
                    ? `${analysis.averageSentenceLength.toFixed(
                        1
                      )} ${t("wordsUnit")}`
                    : `0 ${t("wordsUnit")}`
                }
              />

            </div>

          </section>

        </div>


        {/* KEYWORDS AND RECOMMENDATIONS */}

        <section className="mt-8 grid gap-8 lg:grid-cols-2">

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              {t("keywordsEyebrow")}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {t("keywordsTitle")}
            </h2>

            {analysis.topKeywords.length ===
            0 ? (

              <p className="mt-5 text-sm leading-7 text-slate-500">
                {t("keywordsEmpty")}
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


                {analysis.topKeywords.map(
                  (item) => (

                    <div
                      key={
                        item.keyword
                      }
                      className="grid grid-cols-3 border-t border-white/10 px-4 py-3 text-sm"
                    >

                      <span className="truncate">
                        {
                          item.keyword
                        }
                      </span>

                      <span
                        className="text-center text-slate-300"
                        data-ltr-text
                      >
                        {
                          item.count
                        }
                      </span>

                      <span
                        className="text-end text-emerald-400"
                        data-ltr-text
                      >
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

          </div>


          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {t("guidanceEyebrow")}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {t("guidanceTitle")}
            </h2>


            {text.trim() ? (

              <div className="mt-5 space-y-3">

                {analysis.recommendations.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={`${item.key}-${index}`}
                      className="rounded-2xl border border-white/10 bg-slate-900 p-4"
                    >

                      <div className="flex gap-3">

                        <span
                          className="text-emerald-400"
                          aria-hidden="true"
                        >
                          ✓
                        </span>

                        <p className="text-sm leading-6 text-slate-300">
                          {t(
                            item.key,
                            item.keyword
                              ? {
                                  keyword:
                                    item.keyword,
                                }
                              : undefined
                          )}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="mt-5 text-sm leading-7 text-slate-500">
                {t("guidanceEmpty")}
              </p>

            )}

          </div>

        </section>


        {/* DETAILS */}

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            {t("detailsEyebrow")}
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {t("detailsTitle")}
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <DetailCard
              label={t("detailCharsWithSpaces")}
              value={String(
                analysis.characters
              )}
            />

            <DetailCard
              label={t("detailCharsNoSpaces")}
              value={String(
                analysis.charactersWithoutSpaces
              )}
            />

            <DetailCard
              label={t("detailVocabularyRatio")}
              value={
                analysis.words > 0
                  ? `${(
                      (analysis.uniqueWords /
                        analysis.words) *
                      100
                    ).toFixed(
                      1
                    )}%`
                  : "0%"
              }
            />

            <DetailCard
              label={t("readingTimeLabel")}
              value={`${analysis.readingTime} ${t("minUnit")}`}
            />

          </div>

        </section>


        <div className="mt-10">

          <ShareTool
            title={tc("contentAnalyzer.title")}
            description={t("shareDescription")}
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
              {t("infoEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("infoTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("infoBody")}
            </p>

          </div>


          {/* WHAT IT ANALYZES */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {INFO_CARDS.map((n, index) => (
              <InfoCard
                key={n}
                icon={INFO_ICONS[index]}
                title={t(`info${n}Title`)}
                description={t(`info${n}Body`)}
              />
            ))}

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

                {STEPS.map((number) => (
                  <StepCard
                    key={number}
                    number={number}
                    title={t(`how${number}Title`)}
                    description={t(`how${number}Body`)}
                  />
                ))}

              </div>

            </div>

          </div>


          {/* WHY CONTENT ANALYSIS MATTERS */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                {t("whyEyebrow")}
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                {t("whyTitle")}
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                {t("whyP1")}
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                {t("whyP2")}
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              {BENEFITS.map((n) => (
                <BenefitCard
                  key={n}
                  title={t(`benefit${n}Title`)}
                  description={t(`benefit${n}Body`)}
                />
              ))}

            </div>

          </div>


          {/* CONTINUE CONTENT WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                {t("workflowEyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t("workflowTitle")}
              </h2>

              <p className="mt-4 leading-8 text-slate-400">
                {t("workflowBody")}
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
                    {tCommon("step", { number: 1 })}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  {tc("articleRewriter.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("card1Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  {t("card1Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>


              <div className="rounded-2xl border border-violet-400/30 bg-violet-400/[0.055] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-lg text-violet-300">
                    ▤
                  </div>

                  <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
                    {tCommon("step", { number: 2 })} · {t("stepCurrent")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {tc("contentAnalyzer.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("card2Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-violet-300">
                  {t("card2Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block">
                    ✓
                  </span>
                </div>

              </div>


              <Link
                href="/tools/keyword-density-checker"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300">
                    %
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {tCommon("step", { number: 3 })}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-cyan-300">
                  {tc("keywordDensityChecker.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("card3Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  {t("card3Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/seo-page-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("seoPageAnalyzer.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/meta-tag-generator"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("metaTagGenerator.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-400/20 hover:bg-white/[0.05] hover:text-white"
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

      <p
        className="mt-2 text-2xl font-bold"
        data-ltr-text
      >
        {value}
      </p>

    </div>
  );
}


function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className="mt-2 text-lg font-semibold text-white"
        data-ltr-text
      >
        {value}
      </p>

    </div>
  );
}


function InfoCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">

      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-sm font-bold text-violet-300"
        data-ltr-text
      >
        {icon}
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

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 font-bold text-violet-300"
        data-ltr-text
      >
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


function BenefitCard({
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
