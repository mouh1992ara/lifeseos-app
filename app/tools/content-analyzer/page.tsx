"use client";

import { useMemo, useRef, useState } from "react";

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
      const response = await fetch("/api/tool-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool_name: "Content Analyzer",
        }),
      });

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
    const value = event.target.value;

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
        topKeywords: [] as KeywordItem[],
        score: 0,
        recommendations: [] as string[],
      };
    }

    const cleaned = trimmed
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    const words = cleaned
      ? cleaned.split(" ").filter(Boolean)
      : [];

    const sentenceMatches = trimmed.match(
      /[^.!?]+[.!?]+|[^.!?]+$/g
    );

    const sentences =
      sentenceMatches?.filter((item) =>
        item.trim()
      ).length || 0;

    const paragraphs = trimmed
      .split(/\n\s*\n/)
      .map((item) => item.trim())
      .filter(Boolean).length;

    const counts = new Map<string, number>();

    for (const word of words) {
      if (word.length < 3) {
        continue;
      }

      counts.set(
        word,
        (counts.get(word) || 0) + 1
      );
    }

    const topKeywords = Array.from(
      counts.entries()
    )
      .map(([keyword, count]) => ({
        keyword,
        count,
        density:
          words.length > 0
            ? (count / words.length) * 100
            : 0,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.keyword.localeCompare(
          b.keyword
        );
      })
      .slice(0, 10);

    const uniqueWords = new Set(words).size;

    const averageSentenceLength =
      sentences > 0
        ? words.length / sentences
        : words.length;

    const readingTime =
      words.length > 0
        ? Math.max(
            1,
            Math.ceil(words.length / 200)
          )
        : 0;

    const recommendations: string[] = [];

    let score = 100;

    if (words.length < 300) {
      recommendations.push(
        "Consider adding more useful content. Pages with very little text may not fully answer search intent."
      );
      score -= 20;
    }

    if (
      averageSentenceLength > 25 &&
      sentences > 0
    ) {
      recommendations.push(
        "Some sentences may be too long. Shorter sentences can improve readability."
      );
      score -= 10;
    }

    if (paragraphs <= 1 && words.length > 150) {
      recommendations.push(
        "Break long blocks of text into multiple paragraphs to improve readability."
      );
      score -= 10;
    }

    if (
      words.length > 0 &&
      uniqueWords / words.length < 0.35
    ) {
      recommendations.push(
        "The content contains a high amount of repeated vocabulary. Consider using more natural variation."
      );
      score -= 10;
    }

    const highDensityKeyword =
      topKeywords.find(
        (item) => item.density > 5
      );

    if (highDensityKeyword) {
      recommendations.push(
        `The keyword "${highDensityKeyword.keyword}" appears frequently. Review the content to avoid unnatural repetition.`
      );
      score -= 10;
    }

    if (
      words.length >= 300 &&
      averageSentenceLength <= 25 &&
      paragraphs >= 2
    ) {
      recommendations.push(
        "The content has a solid basic structure with reasonable length and readability."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "The content structure looks balanced. Review it manually for search intent, accuracy and usefulness."
      );
    }

    score = Math.max(0, Math.min(100, score));

    return {
      words: words.length,
      characters: text.length,
      charactersWithoutSpaces:
        text.replace(/\s/g, "").length,
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

  function getScoreLabel(score: number) {
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
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          SEO Tool
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Content Analyzer
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Analyze content length, readability,
          keyword usage and basic SEO quality
          signals instantly.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label className="text-sm font-semibold">
            Paste your content
          </label>

          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your article, landing page copy, blog post, or other SEO content here..."
            rows={20}
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 leading-7 outline-none focus:border-emerald-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Your text is analyzed directly in the
            browser.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Content Score
              </p>

              <p className="mt-2 text-4xl font-bold text-emerald-400">
                {analysis.score}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {text.trim()
                  ? getScoreLabel(analysis.score)
                  : "Add content to begin"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Reading time
              </p>

              <p className="mt-1 text-lg font-bold">
                {analysis.readingTime} min
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <MetricCard
              label="Words"
              value={String(analysis.words)}
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

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">
            Top keywords
          </h2>

          {analysis.topKeywords.length ===
          0 ? (
            <p className="mt-5 text-sm leading-7 text-slate-500">
              Paste some content to see the most
              frequently used words.
            </p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
              <div className="grid grid-cols-3 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Keyword</span>

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
                    key={item.keyword}
                    className="grid grid-cols-3 border-t border-white/10 px-4 py-3 text-sm"
                  >
                    <span className="truncate">
                      {item.keyword}
                    </span>

                    <span className="text-center text-slate-300">
                      {item.count}
                    </span>

                    <span className="text-right text-emerald-400">
                      {item.density.toFixed(2)}%
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">
            SEO recommendations
          </h2>

          {text.trim() ? (
            <div className="mt-5 space-y-3">
              {analysis.recommendations.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-xl border border-white/10 bg-slate-900 p-4"
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

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold">
          Detailed content statistics
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
                  ).toFixed(1)}%`
                : "0%"
            }
          />

          <DetailCard
            label="Reading time"
            value={`${analysis.readingTime} min`}
          />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold">
          How to use this tool
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Paste your content into the text area.
          LifeSeos will analyze its length,
          sentence structure, keyword frequency
          and other basic content signals. Use the
          recommendations as guidance while
          keeping your writing natural, useful and
          relevant to the reader.
        </p>
      </section>
    </>
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
    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
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
    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
