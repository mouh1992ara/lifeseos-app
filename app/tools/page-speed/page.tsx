"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import ShareTool from "@/components/share-tool";

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
  const [animatedScore, setAnimatedScore] =
    useState(0);

  const hasTrackedUse = useRef(false);
  const initialUrlHandledRef = useRef(false);

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
              "Page Speed Analyzer",
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

  async function analyzeSpeed(
    overrideUrl?: string
  ) {
    const cleanUrl =
      (overrideUrl ?? url).trim();

    setError("");
    setResult(null);

    if (!cleanUrl) {
      setError(
        "Please enter a website URL."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/page-speed",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url: cleanUrl,
          }),
        }
      );

      const data =
        await response.json();

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

  useEffect(() => {
    if (!result) {
      setAnimatedScore(0);
      return;
    }

    const target = Math.max(
      0,
      Math.min(
        100,
        Number(
          result.performanceScore ?? 0
        )
      )
    );

    const duration = 1200;
    const startTime = performance.now();
    let frame = 0;

    const animate = (
      time: number
    ) => {
      const progress = Math.min(
        (time - startTime) /
          duration,
        1
      );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      setAnimatedScore(
        Math.round(
          target * eased
        )
      );

      if (progress < 1) {
        frame =
          requestAnimationFrame(
            animate
          );
      }
    };

    setAnimatedScore(0);
    frame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [result]);

  useEffect(() => {
    if (
      initialUrlHandledRef.current
    ) {
      return;
    }

    const incomingUrl =
      new URLSearchParams(
        window.location.search
      )
        .get("url")
        ?.trim();

    if (!incomingUrl) {
      return;
    }

    initialUrlHandledRef.current = true;
    setUrl(incomingUrl);

    void analyzeSpeed(
      incomingUrl
    );
  }, []);

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

  function getScoreClass(
    score: number | null
  ) {
    if (score === null) {
      return "text-slate-400";
    }

    if (score >= 90) {
      return "text-emerald-400";
    }

    if (score >= 50) {
      return "text-amber-400";
    }

    return "text-rose-400";
  }

  function getMetricStatus(
    label: string,
    value: string
  ) {
    const numeric =
      Number.parseFloat(value);

    if (
      Number.isNaN(numeric)
    ) {
      return {
        label: "Review",
        className:
          "border-white/10 bg-white/5 text-slate-400",
      };
    }

    if (
      label ===
      "Cumulative Layout Shift"
    ) {
      if (numeric <= 0.1) {
        return {
          label: "Good",
          className:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        };
      }

      if (numeric <= 0.25) {
        return {
          label:
            "Needs Improvement",
          className:
            "border-amber-400/20 bg-amber-400/10 text-amber-300",
        };
      }

      return {
        label: "Poor",
        className:
          "border-rose-400/20 bg-rose-400/10 text-rose-300",
      };
    }

    const seconds =
      value.toLowerCase().includes(
        "ms"
      )
        ? numeric / 1000
        : numeric;

    const limits: Record<
      string,
      [number, number]
    > = {
      "First Contentful Paint": [
        1.8,
        3,
      ],
      "Largest Contentful Paint": [
        2.5,
        4,
      ],
      "Total Blocking Time": [
        0.2,
        0.6,
      ],
      "Speed Index": [
        3.4,
        5.8,
      ],
    };

    const threshold =
      limits[label];

    if (!threshold) {
      return {
        label: "Review",
        className:
          "border-white/10 bg-white/5 text-slate-400",
      };
    }

    if (seconds <= threshold[0]) {
      return {
        label: "Good",
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      };
    }

    if (seconds <= threshold[1]) {
      return {
        label:
          "Needs Improvement",
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
      };
    }

    return {
      label: "Poor",
      className:
        "border-rose-400/20 bg-rose-400/10 text-rose-300",
    };
  }

  const recommendations =
    result
      ? [
          result.performanceScore !==
            null &&
          result.performanceScore < 90
            ? "Reduce unnecessary JavaScript, optimize images and review render-blocking resources."
            : null,
          getMetricStatus(
            "Largest Contentful Paint",
            result.largestContentfulPaint
          ).label !== "Good"
            ? "Improve Largest Contentful Paint by optimizing the main above-the-fold element and server response."
            : null,
          getMetricStatus(
            "Cumulative Layout Shift",
            result.cumulativeLayoutShift
          ).label !== "Good"
            ? "Reserve space for images, embeds and dynamic content to reduce layout shifts."
            : null,
          getMetricStatus(
            "Total Blocking Time",
            result.totalBlockingTime
          ).label !== "Good"
            ? "Break up long JavaScript tasks and reduce main-thread work."
            : null,
        ].filter(
          (
            item
          ): item is string =>
            Boolean(item)
        )
      : [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <span>⚡</span>
            <span>
              LifeSeos Page Speed Analyzer
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free Page Speed Analyzer

            <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Test Website Performance
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Measure website speed and Lighthouse
            performance metrics including loading,
            rendering and layout stability signals.
          </p>

        </div>


        {/* TOOL */}

        <section className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 sm:p-6">

          <label className="text-sm font-semibold text-slate-200">
            Page URL
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">

            <input
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  analyzeSpeed();
                }
              }}
              placeholder="https://example.com"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <button
              type="button"
              onClick={() => {
                void analyzeSpeed();
              }}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-7 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze speed"}
            </button>

          </div>

          <p className="mt-3 text-sm text-slate-500">
            The analysis uses a mobile Lighthouse
            performance test for the submitted page.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-6 overflow-hidden rounded-full bg-slate-900">
              <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400" />
            </div>
          )}

        </section>


        {/* RESULTS */}

        {result && (
          <div className="mt-10 space-y-6">

            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[260px_1fr]">
                <div className="flex justify-center">
                  <PerformanceScoreRing
                    score={animatedScore}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        result.performanceScore !== null &&
                        result.performanceScore >= 90
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : result.performanceScore !== null &&
                            result.performanceScore >= 50
                          ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                          : "border-rose-400/20 bg-rose-400/10 text-rose-300"
                      }`}
                    >
                      {getScoreLabel(
                        result.performanceScore
                      )}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      {result.strategy}
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                    Page Performance Overview
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    Review your Lighthouse performance score together with loading, interactivity and layout stability metrics.
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-400">
                    <span className="mr-2 text-slate-500">
                      Tested URL
                    </span>
                    <span className="break-all text-slate-200">
                      {result.finalUrl}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  label:
                    "First Contentful Paint",
                  value:
                    result.firstContentfulPaint,
                  description:
                    "First visible content",
                },
                {
                  label:
                    "Largest Contentful Paint",
                  value:
                    result.largestContentfulPaint,
                  description:
                    "Largest visible element",
                },
                {
                  label:
                    "Cumulative Layout Shift",
                  value:
                    result.cumulativeLayoutShift,
                  description:
                    "Visual stability",
                },
                {
                  label:
                    "Total Blocking Time",
                  value:
                    result.totalBlockingTime,
                  description:
                    "Main-thread blocking",
                },
                {
                  label:
                    "Speed Index",
                  value:
                    result.speedIndex,
                  description:
                    "Visual loading speed",
                },
              ].map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  description={
                    metric.description
                  }
                  status={getMetricStatus(
                    metric.label,
                    metric.value
                  )}
                />
              ))}
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Test information
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Analysis Details
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
                  Lighthouse performance
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <DetailCard
                  label="Requested URL"
                  value={result.requestedUrl}
                />

                <DetailCard
                  label="Final URL"
                  value={result.finalUrl}
                />

                <DetailCard
                  label="Strategy"
                  value={result.strategy}
                />

              </div>

            </section>

            <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.02] p-6 sm:p-8">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-xl text-amber-300">
                  !
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/70">
                    Performance action plan
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Recommended Improvements
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">

                {recommendations.length > 0 ? (
                  recommendations.map(
                    (item, index) => (

                      <div
                        key={`${item}-${index}`}
                        className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-sm font-bold text-amber-300">
                          {index + 1}
                        </div>

                        <p className="text-sm leading-7 text-slate-300">
                          {item}
                        </p>

                      </div>
                    )
                  )
                ) : (

                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4 text-sm text-emerald-300">
                    The measured performance signals look strong. Continue monitoring after major website changes.
                  </div>

                )}

              </div>

            </section>

            <section className="rounded-[28px] border border-cyan-400/15 bg-cyan-400/[0.04] p-6 sm:p-8">

              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Recommended next tool
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Run a complete SEO audit
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    Page speed is only one part of SEO. Use the SEO Analyzer to review technical, content, image and social metadata signals for the same page.
                  </p>
                </div>

                <Link
                  href={`/tools/seo-analyzer?url=${encodeURIComponent(
                    result.finalUrl
                  )}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200"
                >
                  Open SEO Analyzer
                  <span>→</span>
                </Link>

              </div>

            </section>

          </div>
        )}


        <div className="mt-10">

          <ShareTool
            title="Page Speed Analyzer"
            description="Measure website performance, loading speed and Lighthouse metrics with this free LifeSeos tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Website Performance
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Understand Your Page Speed Metrics
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Website performance is more than a single
              score. The LifeSeos Page Speed Analyzer
              displays several Lighthouse metrics that
              help you understand how quickly a page
              begins rendering, how stable the layout is
              and whether browser tasks delay interaction.
            </p>

          </div>


          {/* METRIC EXPLANATIONS */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <MetricInfoCard
              abbreviation="Score"
              title="Performance Score"
              description="A combined Lighthouse performance score that summarizes several loading and rendering measurements."
            />

            <MetricInfoCard
              abbreviation="FCP"
              title="First Contentful Paint"
              description="Measures when the browser first displays visible page content such as text, images or graphics."
            />

            <MetricInfoCard
              abbreviation="LCP"
              title="Largest Contentful Paint"
              description="Measures how long it takes for the largest visible content element in the viewport to render."
            />

            <MetricInfoCard
              abbreviation="CLS"
              title="Cumulative Layout Shift"
              description="Measures visual stability by tracking unexpected movement of page elements during loading."
            />

            <MetricInfoCard
              abbreviation="TBT"
              title="Total Blocking Time"
              description="Measures time when long main-thread tasks can delay the browser from responding quickly."
            />

            <MetricInfoCard
              abbreviation="SI"
              title="Speed Index"
              description="Estimates how quickly the visible parts of a page are displayed during the loading process."
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
                  How to Use the Page Speed Analyzer
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Test any publicly accessible page and
                  use the results to identify areas that
                  may need performance optimization.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Enter the page URL"
                  description="Paste the complete public URL you want to test, including https://."
                />

                <StepCard
                  number="2"
                  title="Run the performance test"
                  description="LifeSeos sends the page to the performance analysis service and retrieves Lighthouse metrics."
                />

                <StepCard
                  number="3"
                  title="Review the metrics"
                  description="Check the overall performance score together with FCP, LCP, CLS, TBT and Speed Index."
                />

                <StepCard
                  number="4"
                  title="Investigate slow areas"
                  description="Use weak metrics as signals for deeper investigation into images, scripts, rendering and page structure."
                />

              </div>

            </div>

          </div>


          {/* WHY SPEED MATTERS */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                Performance matters
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Why Website Speed Matters
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Slow pages can create a poor browsing
                experience, especially for users on mobile
                devices or slower networks. Heavy images,
                large scripts and inefficient rendering
                can all increase loading time.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Performance testing helps you identify
                pages that deserve closer attention and
                gives you measurable values that can be
                compared after optimization work.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BenefitCard
                title="Faster loading"
                description="Identify pages that take longer to display meaningful content."
              />

              <BenefitCard
                title="Better stability"
                description="Spot layout movement that can make pages difficult or frustrating to use."
              />

              <BenefitCard
                title="Mobile performance"
                description="Review page performance using the mobile testing strategy used by the tool."
              />

              <BenefitCard
                title="Track improvements"
                description="Run another test after optimization and compare the resulting performance metrics."
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
                href="/tools/seo-analyzer"
                icon="⌕"
                title="SEO Analyzer"
                description="Run a broader website SEO audit and identify technical and on-page issues."
              />

              <RelatedToolCard
                href="/tools/seo-page-analyzer"
                icon="◎"
                title="SEO Page Analyzer"
                description="Inspect an individual page and review important on-page SEO elements."
              />

              <RelatedToolCard
                href="/tools/content-analyzer"
                icon="▤"
                title="Content Analyzer"
                description="Analyze page content and identify opportunities to improve SEO relevance."
              />

              <RelatedToolCard
                href="/tools/meta-tag-generator"
                icon="<>"
                title="Meta Tag Generator"
                description="Create optimized page titles, descriptions and social metadata."
              />

              <RelatedToolCard
                href="/tools/xml-sitemap-generator"
                icon="⌘"
                title="XML Sitemap Generator"
                description="Create an XML sitemap to help search engines discover important pages."
              />

              <RelatedToolCard
                href="/tools/http-status-checker"
                icon="↔"
                title="HTTP Status Checker"
                description="Check HTTP response codes and verify whether URLs return the expected status."
              />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


function PerformanceScoreRing({
  score,
}: {
  score: number;
}) {
  const safeScore =
    Math.max(
      0,
      Math.min(
        100,
        score
      )
    );

  const color =
    safeScore >= 90
      ? "#34d399"
      : safeScore >= 50
      ? "#facc15"
      : "#fb7185";

  return (
    <div
      className="relative flex h-52 w-52 items-center justify-center rounded-full"
      style={{
        background:
          `conic-gradient(${color} ${
            safeScore * 3.6
          }deg, rgba(51,65,85,0.45) 0deg)`,
      }}
    >

      <div className="absolute inset-[12px] rounded-full bg-slate-950 shadow-inner shadow-black/50" />

      <div className="relative text-center">

        <div
          className="text-6xl font-bold tabular-nums"
          style={{
            color,
          }}
        >
          {safeScore}
        </div>

        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Performance
        </div>

        <div className="mt-1 text-xs text-slate-600">
          out of 100
        </div>

      </div>

    </div>
  );
}


function MetricCard({
  label,
  value,
  description,
  status,
}: {
  label: string;
  value: string;
  description: string;
  status: {
    label: string;
    className: string;
  };
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-slate-900">

      <div className="flex items-start justify-between gap-3">

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
        >
          {status.label}
        </span>

      </div>

      <p className="mt-4 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
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
    <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm leading-6 text-slate-300">
        {value}
      </p>

    </div>
  );
}


function MetricInfoCard({
  abbreviation,
  title,
  description,
}: {
  abbreviation: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-slate-900">

      <div className="inline-flex rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
        {abbreviation}
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
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition duration-300 hover:border-cyan-400/20 hover:bg-slate-900/80">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 font-bold text-emerald-300">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-white/[0.05]">

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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-emerald-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-emerald-300">
        Open tool →
      </div>

    </Link>
  );
}