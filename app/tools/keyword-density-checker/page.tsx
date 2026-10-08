"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
} from "react";

import ShareTool from "@/components/share-tool";

export default function KeywordDensityCheckerPage() {
  const [text, setText] = useState("");

  const hasTrackedUse = useRef(false);

  const analysis = useMemo(() => {
    const cleaned = text
      .toLowerCase()
      .replace(
        /[^\p{L}\p{N}\s'-]/gu,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) {
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

    const words = cleaned
      .split(" ")
      .filter(Boolean);

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
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300">
            <span>%</span>

            <span>
              LifeSeos Keyword Density Checker
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free Keyword Density Checker

            <span className="mt-2 block bg-gradient-to-r from-amber-300 via-orange-300 to-fuchsia-400 bg-clip-text text-transparent">
              Analyze Keyword Frequency
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Check how often words appear in your
            content, compare keyword frequency and
            review density percentages instantly.
          </p>

        </div>


        {/* TOOL */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Content input
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Paste Your Content
            </h2>

            <textarea
              value={text}
              onChange={
                handleTextChange
              }
              placeholder="Paste your article, landing page copy, or SEO content here..."
              rows={18}
              className="mt-5 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/60"
            />

            <div className="mt-4 grid grid-cols-2 gap-4">

              <MetricCard
                label="Total Words"
                value={String(
                  analysis.totalWords
                )}
              />

              <MetricCard
                label="Unique Words"
                value={String(
                  analysis.uniqueWords
                )}
              />

            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Your text is analyzed directly in the
              browser as you type or paste content.
            </p>

          </section>


          {/* KEYWORD RESULTS */}

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
                  Keyword analysis
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Top Keywords
                </h2>

              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center">

                <p className="text-xs text-slate-500">
                  Shown
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
                Paste some text to see keyword
                frequency and density.
              </p>

            ) : (

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">

                <div className="grid grid-cols-3 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">

                  <span>
                    Keyword
                  </span>

                  <span className="text-center">
                    Count
                  </span>

                  <span className="text-right">
                    Density
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

                      <span className="truncate">
                        {
                          item.keyword
                        }
                      </span>

                      <span className="text-center text-slate-300">
                        {
                          item.count
                        }
                      </span>

                      <span className="text-right font-medium text-amber-300">
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
            title="Keyword Density Checker"
            description="Analyze keyword frequency and density in your content with this free LifeSeos tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          {/* INTRO */}

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
              Keyword Analysis
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Understand How Keywords Are Used in Your Content
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Keyword density measures how frequently
              a word appears compared with the total
              number of words in your content. It can
              be useful for spotting repetition, but
              it should be treated as a diagnostic
              metric rather than a target score.
            </p>

          </div>


          {/* EXPLANATION CARDS */}

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <InfoCard
              symbol="#"
              title="Keyword Frequency"
              description="Shows the number of times a specific word appears in the analyzed content."
            />

            <InfoCard
              symbol="%"
              title="Keyword Density"
              description="Shows the percentage of total words represented by a particular keyword."
            />

            <InfoCard
              symbol="Aa"
              title="Unique Words"
              description="Shows how many different words appear in the text and gives context to vocabulary variety."
            />

          </div>


          {/* FORMULA */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
                  Understanding the metric
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  How Keyword Density Is Calculated
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  The tool divides the number of
                  times a keyword appears by the
                  total number of words, then
                  converts the result into a
                  percentage.
                </p>

              </div>


              <div className="rounded-[24px] border border-amber-400/15 bg-amber-400/[0.04] p-6">

                <p className="font-mono text-sm text-amber-300">
                  Keyword Density =
                </p>

                <p className="mt-3 text-xl font-bold text-white sm:text-2xl">
                  Keyword Count ÷ Total Words × 100
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Example: if a word appears 5 times
                  in 200 words, its density is 2.5%.
                </p>

              </div>

            </div>

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  How it works
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  How to Use the Keyword Density Checker
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Use the report to understand which
                  words dominate your content and
                  whether repetition appears natural.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Paste your content"
                  description="Add an article, landing page, product description or any other text you want to review."
                />

                <StepCard
                  number="2"
                  title="Check total and unique words"
                  description="Use the word counts to understand the overall size and vocabulary of the content."
                />

                <StepCard
                  number="3"
                  title="Review keyword frequency"
                  description="See which words appear most often and how many times each one is used."
                />

                <StepCard
                  number="4"
                  title="Review density in context"
                  description="Look for unnatural repetition rather than trying to reach a fixed percentage."
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
                  Important SEO note
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  There Is No Universal “Perfect” Keyword Density
                </h2>

                <p className="mt-4 max-w-4xl leading-8 text-slate-400">
                  Keyword density should not be treated
                  as a formula for rankings. A useful
                  page should cover its topic naturally
                  and clearly. Repeating the same phrase
                  simply to increase a percentage can
                  make the content less readable and
                  less useful.
                </p>

              </div>

            </div>

          </div>


          {/* KEYWORD STUFFING */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-300">
                Avoid over-optimization
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Avoid Unnatural Keyword Stuffing
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Repeating a word or phrase more often
                than necessary can make writing sound
                unnatural. Density data is most useful
                when it helps you notice that kind of
                repetition.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Instead of forcing exact-match keywords
                into every paragraph, focus on answering
                the topic clearly and use related terms
                where they make sense.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <PracticeCard
                title="Write naturally"
                description="Use keywords where they genuinely help explain the topic."
              />

              <PracticeCard
                title="Check repetition"
                description="Review unusually frequent words and decide whether repeated uses are necessary."
              />

              <PracticeCard
                title="Use related language"
                description="Cover the subject comprehensively instead of repeating only one exact phrase."
              />

              <PracticeCard
                title="Prioritize readers"
                description="Make clarity, usefulness and search intent more important than a density percentage."
              />

            </div>

          </div>


          {/* RELATED TOOLS */}

          <div className="mt-20">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                  Continue optimizing
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Related SEO Tools
                </h2>

              </div>

              <Link
                href="/tools"
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                View all tools →
              </Link>

            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <RelatedToolCard
                href="/tools/content-analyzer"
                icon="▤"
                title="Content Analyzer"
                description="Review content length, structure, readability and keyword usage together."
              />

              <RelatedToolCard
                href="/tools/seo-analyzer"
                icon="⌕"
                title="SEO Analyzer"
                description="Run a broader SEO audit covering technical, content, image and social signals."
              />

              <RelatedToolCard
                href="/tools/seo-page-analyzer"
                icon="◎"
                title="SEO Page Analyzer"
                description="Inspect titles, descriptions, headings, canonical tags and other page-level SEO elements."
              />

              <RelatedToolCard
                href="/tools/meta-tag-generator"
                icon="<>"
                title="Meta Tag Generator"
                description="Create search-friendly page titles and meta descriptions."
              />

              <RelatedToolCard
                href="/tools/page-speed"
                icon="⚡"
                title="Page Speed Analyzer"
                description="Measure Lighthouse performance and website loading metrics."
              />

              <RelatedToolCard
                href="/tools/xml-sitemap-generator"
                icon="⌘"
                title="XML Sitemap Generator"
                description="Create XML sitemaps that help search engines discover important pages."
              />

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

      <p className="mt-2 text-2xl font-bold text-amber-300">
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

      <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 px-2 text-sm font-bold text-amber-300">
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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 font-bold text-amber-300">
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


function RelatedToolCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-amber-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-amber-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-amber-300">
        Open tool →
      </div>

    </Link>
  );
}