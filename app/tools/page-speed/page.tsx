"use client";

import { useRef, useState } from "react";

type PageSpeedResult = {
  requestedUrl: string;
  finalUrl: string;
  performanceScore: number | null;
  firstContentfulPaint: string;
  largestContentfulPaint: string;
  cumulativeLayoutShift: string;
  totalBlockingTime: string;
  speedIndex: string;
  strategy: string;
};

export default function PageSpeedAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] =
    useState<PageSpeedResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tool_name: "Page Speed Analyzer",
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to record Page Speed Analyzer usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  async function analyzeSpeed() {
    const cleanUrl = url.trim();

    setError("");
    setResult(null);

    if (!cleanUrl) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/page-speed",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: cleanUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to analyze page speed."
        );
        return;
      }

      await recordToolUseOnce();

      setResult(data);
    } catch {
      setError(
        "Unable to analyze page speed."
      );
    } finally {
      setLoading(false);
    }
  }

  function getScoreLabel(
    score: number | null
  ) {
    if (score === null) {
      return "Unavailable";
    }

    if (score >= 90) {
      return "Good";
    }

    if (score >= 50) {
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
          Page Speed Analyzer
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Measure page performance with Lighthouse
          metrics including performance score,
          loading speed and layout stability.
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <label className="text-sm font-semibold">
          Page URL
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                analyzeSpeed();
              }
            }}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <button
            type="button"
            onClick={analyzeSpeed}
            disabled={loading}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Analyzing..."
              : "Analyze speed"}
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Analysis uses a mobile Lighthouse
          performance test.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>

      {result && (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Performance Score
              </p>

              <p className="mt-3 text-4xl font-bold text-emerald-400">
                {result.performanceScore ??
                  "N/A"}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {getScoreLabel(
                  result.performanceScore
                )}
              </p>
            </div>

            <MetricCard
              label="First Contentful Paint"
              value={
                result.firstContentfulPaint
              }
            />

            <MetricCard
              label="Largest Contentful Paint"
              value={
                result.largestContentfulPaint
              }
            />

            <MetricCard
              label="Cumulative Layout Shift"
              value={
                result.cumulativeLayoutShift
              }
            />

            <MetricCard
              label="Total Blocking Time"
              value={
                result.totalBlockingTime
              }
            />

            <MetricCard
              label="Speed Index"
              value={result.speedIndex}
            />
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">
              Analysis details
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">
                  Tested URL
                </p>

                <p className="mt-1 break-all text-slate-300">
                  {result.requestedUrl}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Final URL
                </p>

                <p className="mt-1 break-all text-slate-300">
                  {result.finalUrl}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Strategy
                </p>

                <p className="mt-1 capitalize text-slate-300">
                  {result.strategy}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold">
          How to use this tool
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Enter a public webpage URL and run the
          analysis. Review the performance score
          together with loading and stability
          metrics to identify pages that may need
          performance improvements.
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}
