"use client";

import Link from "next/link";
import { useRef, useState } from "react";

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

  async function analyzeSpeed() {
    const cleanUrl = url.trim();

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
              onClick={
                analyzeSpeed
              }
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

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Performance Score
                </p>

                <p
                  className={`mt-4 text-5xl font-bold ${getScoreClass(
                    result.performanceScore
                  )}`}
                >
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
                description="How quickly the first visible content appears."
              />

              <MetricCard
                label="Largest Contentful Paint"
                value={
                  result.largestContentfulPaint
                }
                description="How quickly the largest visible content element loads."
              />

              <MetricCard
                label="Cumulative Layout Shift"
                value={
                  result.cumulativeLayoutShift
                }
                description="Measures unexpected layout movement during loading."
              />

              <MetricCard
                label="Total Blocking Time"
                value={
                  result.totalBlockingTime
                }
                description="Measures how long the main thread is blocked by long tasks."
              />

              <MetricCard
                label="Speed Index"
                value={
                  result.speedIndex
                }
                description="Shows how quickly visible page content is displayed."
              />

            </section>


            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Test information
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Analysis Details
              </h2>


              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <DetailCard
                  label="Tested URL"
                  value={
                    result.requestedUrl
                  }
                />

                <DetailCard
                  label="Final URL"
                  value={
                    result.finalUrl
                  }
                />

                <DetailCard
                  label="Strategy"
                  value={
                    result.strategy
                  }
                />

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


function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6">

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-500">
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
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">

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
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">

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