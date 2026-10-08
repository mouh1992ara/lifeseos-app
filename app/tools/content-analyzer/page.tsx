"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
} from "react";

import ShareTool from "@/components/share-tool";

type KeywordItem = {
  keyword: string;
  count: number;
  density: number;
};

export default function ContentAnalyzerPage() {
  const [text, setText] = useState("");

  const hasTrackedUse = useRef(false);

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
              "Content Analyzer",
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to record Content Analyzer usage."
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
          [] as string[],
      };
    }

    const cleaned = trimmed
      .toLowerCase()
      .replace(
        /[^\p{L}\p{N}\s'-]/gu,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();

    const words = cleaned
      ? cleaned
          .split(" ")
          .filter(Boolean)
      : [];

    const sentenceMatches =
      trimmed.match(
        /[^.!?]+[.!?]+|[^.!?]+$/g
      );

    const sentences =
      sentenceMatches?.filter(
        (item) =>
          item.trim()
      ).length || 0;

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
      if (word.length < 3) {
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

    const readingTime =
      words.length > 0
        ? Math.max(
            1,
            Math.ceil(
              words.length /
                200
            )
          )
        : 0;

    const recommendations:
      string[] = [];

    let score = 100;

    if (words.length < 300) {
      recommendations.push(
        "Consider adding more useful content. Pages with very little text may not fully answer search intent."
      );

      score -= 20;
    }

    if (
      averageSentenceLength >
        25 &&
      sentences > 0
    ) {
      recommendations.push(
        "Some sentences may be too long. Shorter sentences can improve readability."
      );

      score -= 10;
    }

    if (
      paragraphs <= 1 &&
      words.length > 150
    ) {
      recommendations.push(
        "Break long blocks of text into multiple paragraphs to improve readability."
      );

      score -= 10;
    }

    if (
      words.length > 0 &&
      uniqueWords /
        words.length <
        0.35
    ) {
      recommendations.push(
        "The content contains a high amount of repeated vocabulary. Consider using more natural variation."
      );

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
      recommendations.push(
        `The keyword "${highDensityKeyword.keyword}" appears frequently. Review the content to avoid unnatural repetition.`
      );

      score -= 10;
    }

    if (
      words.length >= 300 &&
      averageSentenceLength <=
        25 &&
      paragraphs >= 2
    ) {
      recommendations.push(
        "The content has a solid basic structure with reasonable length and readability."
      );
    }

    if (
      recommendations.length ===
      0
    ) {
      recommendations.push(
        "The content structure looks balanced. Review it manually for search intent, accuracy and usefulness."
      );
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

  function getScoreLabel(
    score: number
  ) {
    if (score >= 90) {
      return "Excellent";
    }

    if (score >= 75) {
      return "Good";
    }

    if (score >= 60) {
      return "Needs Improvement";
    }

    return "Poor";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-300">
            <span>▤</span>

            <span>
              LifeSeos Content Analyzer
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free SEO Content Analyzer

            <span className="mt-2 block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              Improve Content Quality
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Analyze content length, readability,
            keyword usage, keyword density and
            basic SEO quality signals directly in
            your browser.
          </p>

        </div>


        {/* ANALYZER */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <label className="text-sm font-semibold text-slate-200">
              Paste your content
            </label>

            <textarea
              value={text}
              onChange={
                handleTextChange
              }
              placeholder="Paste your article, landing page copy, blog post, or other SEO content here..."
              rows={20}
              className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60"
            />

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <span>✓</span>
              <span>
                Your text is analyzed directly in the browser.
              </span>
            </div>

          </section>


          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Content Score
                </p>

                <p className="mt-2 text-5xl font-bold text-emerald-400">
                  {analysis.score}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {text.trim()
                    ? getScoreLabel(
                        analysis.score
                      )
                    : "Add content to begin"}
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-right">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Reading time
                </p>

                <p className="mt-1 text-lg font-bold">
                  {
                    analysis.readingTime
                  }{" "}
                  min
                </p>

              </div>

            </div>


            <div className="mt-6 grid grid-cols-2 gap-4">

              <MetricCard
                label="Words"
                value={String(
                  analysis.words
                )}
              />

              <MetricCard
                label="Unique Words"
                value={String(
                  analysis.uniqueWords
                )}
              />

              <MetricCard
                label="Sentences"
                value={String(
                  analysis.sentences
                )}
              />

              <MetricCard
                label="Paragraphs"
                value={String(
                  analysis.paragraphs
                )}
              />

            </div>


            <div className="mt-4 grid grid-cols-2 gap-4">

              <MetricCard
                label="Characters"
                value={String(
                  analysis.characters
                )}
              />

              <MetricCard
                label="Avg. Sentence"
                value={
                  analysis.words > 0
                    ? `${analysis.averageSentenceLength.toFixed(
                        1
                      )} words`
                    : "0 words"
                }
              />

            </div>

          </section>

        </div>


        {/* KEYWORDS AND RECOMMENDATIONS */}

        <section className="mt-8 grid gap-8 lg:grid-cols-2">

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Keyword analysis
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Top Keywords
            </h2>

            {analysis.topKeywords.length ===
            0 ? (

              <p className="mt-5 text-sm leading-7 text-slate-500">
                Paste some content to see the most
                frequently used words and their keyword
                density.
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

                      <span className="text-center text-slate-300">
                        {
                          item.count
                        }
                      </span>

                      <span className="text-right text-emerald-400">
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
              Content guidance
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              SEO Recommendations
            </h2>


            {text.trim() ? (

              <div className="mt-5 space-y-3">

                {analysis.recommendations.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={`${item}-${index}`}
                      className="rounded-2xl border border-white/10 bg-slate-900 p-4"
                    >

                      <div className="flex gap-3">

                        <span className="text-emerald-400">
                          ✓
                        </span>

                        <p className="text-sm leading-6 text-slate-300">
                          {item}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="mt-5 text-sm leading-7 text-slate-500">
                Paste some content to receive SEO and
                readability recommendations.
              </p>

            )}

          </div>

        </section>


        {/* DETAILS */}

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Content metrics
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Detailed Content Statistics
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <DetailCard
              label="Characters with spaces"
              value={String(
                analysis.characters
              )}
            />

            <DetailCard
              label="Characters without spaces"
              value={String(
                analysis.charactersWithoutSpaces
              )}
            />

            <DetailCard
              label="Vocabulary ratio"
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
              label="Reading time"
              value={`${analysis.readingTime} min`}
            />

          </div>

        </section>


        <div className="mt-10">

          <ShareTool
            title="Content Analyzer"
            description="Analyze content length, readability, keyword usage and SEO quality signals with this free LifeSeos tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
              Content SEO Analysis
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Understand the Structure of Your Content
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Good SEO content should be useful and
              natural while also being easy to read and
              well structured. The LifeSeos Content
              Analyzer helps you inspect measurable
              content signals before publishing or
              updating a page.
            </p>

          </div>


          {/* WHAT IT ANALYZES */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <InfoCard
              icon="▤"
              title="Content Length"
              description="Review word count, character count, sentence count and paragraph structure."
            />

            <InfoCard
              icon="◎"
              title="Keyword Usage"
              description="See the most frequently used words and how often they appear in the text."
            />

            <InfoCard
              icon="%"
              title="Keyword Density"
              description="Measure the percentage of your content represented by frequently repeated words."
            />

            <InfoCard
              icon="Aa"
              title="Vocabulary Variety"
              description="Compare unique words with total words to identify excessive repetition."
            />

            <InfoCard
              icon="¶"
              title="Sentence Structure"
              description="Review average sentence length as a basic readability indicator."
            />

            <InfoCard
              icon="◷"
              title="Reading Time"
              description="Estimate approximately how long a reader may need to read the content."
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  How it works
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  How to Use the Content Analyzer
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Use the analyzer while writing,
                  editing or reviewing content before it
                  is published.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Paste your content"
                  description="Add your article, landing page copy, product description or other written content."
                />

                <StepCard
                  number="2"
                  title="Review the content score"
                  description="Use the score as a quick summary of the basic content signals checked by the tool."
                />

                <StepCard
                  number="3"
                  title="Check keywords and structure"
                  description="Review frequently used words, density, sentence length and paragraph structure."
                />

                <StepCard
                  number="4"
                  title="Improve the writing naturally"
                  description="Use recommendations as guidance while keeping the content useful, accurate and relevant to readers."
                />

              </div>

            </div>

          </div>


          {/* WHY CONTENT ANALYSIS MATTERS */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Better content decisions
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Why Content Analysis Matters for SEO
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Search-focused content should answer the
                reader&apos;s needs clearly without relying
                on repetitive keywords or unnecessarily
                complex writing.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Content analysis provides measurable
                signals that can help you identify thin
                content, repetitive vocabulary, long
                sentences and weak paragraph structure
                before publishing.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BenefitCard
                title="Identify thin content"
                description="Spot pages with limited text that may need more useful information."
              />

              <BenefitCard
                title="Avoid keyword repetition"
                description="Review frequently repeated words and unusually high keyword density."
              />

              <BenefitCard
                title="Improve readability"
                description="Use sentence and paragraph metrics to identify content that may be difficult to scan."
              />

              <BenefitCard
                title="Review before publishing"
                description="Analyze drafts before they go live and make improvements early."
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
                href="/tools/keyword-density-checker"
                icon="%"
                title="Keyword Density Checker"
                description="Review keyword frequency and density in greater detail."
              />

              <RelatedToolCard
                href="/tools/seo-analyzer"
                icon="⌕"
                title="SEO Analyzer"
                description="Run a broader SEO audit covering technical, content and metadata signals."
              />

              <RelatedToolCard
                href="/tools/seo-page-analyzer"
                icon="◎"
                title="SEO Page Analyzer"
                description="Analyze important SEO elements on a live webpage."
              />

              <RelatedToolCard
                href="/tools/meta-tag-generator"
                icon="<>"
                title="Meta Tag Generator"
                description="Create optimized titles, descriptions and social metadata."
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

      <p className="mt-2 text-2xl font-bold">
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

      <p className="mt-2 text-lg font-semibold text-white">
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

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-sm font-bold text-violet-300">
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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 font-bold text-violet-300">
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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-violet-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-violet-300">
        Open tool →
      </div>

    </Link>
  );
}