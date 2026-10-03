"use client";

import { useMemo, useState } from "react";

export default function KeywordDensityCheckerPage() {
  const [text, setText] = useState("");

  const analysis = useMemo(() => {
    const cleaned = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
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

    const words = cleaned.split(" ").filter(Boolean);
    const counts = new Map<string, number>();

    for (const word of words) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }

    const keywords = Array.from(counts.entries())
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / words.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return {
      totalWords: words.length,
      uniqueWords: counts.size,
      keywords,
    };
  }, [text]);

  return (
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          SEO Tool
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Keyword Density Checker
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Analyze how often words appear in your content and review their
          keyword density instantly.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label className="text-sm font-semibold">
            Paste your content
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, landing page copy, or SEO content here..."
            rows={18}
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 leading-7 outline-none focus:border-emerald-400"
          />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total words
              </p>
              <p className="mt-2 text-2xl font-bold">
                {analysis.totalWords}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Unique words
              </p>
              <p className="mt-2 text-2xl font-bold">
                {analysis.uniqueWords}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">
            Top keywords
          </h2>

          {analysis.keywords.length === 0 ? (
            <p className="mt-5 text-sm leading-7 text-slate-500">
              Paste some text to see keyword frequency and density.
            </p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
              <div className="grid grid-cols-3 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Keyword</span>
                <span className="text-center">Count</span>
                <span className="text-right">Density</span>
              </div>

              {analysis.keywords.map((item) => (
                <div
                  key={item.keyword}
                  className="grid grid-cols-3 border-t border-white/10 px-4 py-3 text-sm"
                >
                  <span className="truncate">{item.keyword}</span>

                  <span className="text-center text-slate-300">
                    {item.count}
                  </span>

                  <span className="text-right text-emerald-400">
                    {item.density.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold">
          How to use this tool
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Paste your content into the text box. The tool calculates total
          words, unique words, keyword frequency, and keyword density. Use
          the results to identify repeated terms and make sure your content
          reads naturally.
        </p>
      </section>
    </>
  );
}