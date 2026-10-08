"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import ShareTool from "@/components/share-tool";

type SeoResult = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  h1: string[];
  h1Count: number;
  h2Count: number;
  totalLinks: number;
  totalImages: number;
  imagesWithoutAlt: number;
  pageSizeKb: number;
};

export default function SeoPageAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] =
    useState<SeoResult | null>(null);
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
              "SEO Page Analyzer",
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to record SEO Page Analyzer usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  async function analyzePage() {
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
        "/api/seo-page-analyzer",
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
            "Unable to analyze this page."
        );
        return;
      }

      await recordToolUseOnce();

      setResult(data);
    } catch {
      setError(
        "Unable to analyze this page."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <span>⌕</span>

            <span>
              LifeSeos SEO Page Analyzer
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free On-Page SEO Checker

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Analyze Any Web Page
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Analyze page titles, meta descriptions,
            headings, canonical tags, robots directives,
            links, image ALT text and other important
            on-page SEO elements.
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
                  analyzePage();
                }
              }}
              placeholder="https://example.com"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
            />

            <button
              type="button"
              onClick={
                analyzePage
              }
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze page"}
            </button>

          </div>

          <p className="mt-3 text-sm text-slate-500">
            Enter a publicly accessible page URL to review
            its main on-page SEO elements.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-6 overflow-hidden rounded-full bg-slate-900">
              <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400" />
            </div>
          )}

        </section>


        {/* RESULTS */}

        {result && (
          <div className="mt-10 space-y-6">

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              <MetricCard
                label="HTTP Status"
                value={String(
                  result.status
                )}
              />

              <MetricCard
                label="H1 Tags"
                value={String(
                  result.h1Count
                )}
              />

              <MetricCard
                label="Links"
                value={String(
                  result.totalLinks
                )}
              />

              <MetricCard
                label="Page Size"
                value={`${result.pageSizeKb} KB`}
              />

            </section>


            <section className="grid gap-6 lg:grid-cols-2">

              <InfoCard
                title="Page Title"
                value={
                  result.title ||
                  "No title found"
                }
                note={`${result.titleLength} characters`}
              />

              <InfoCard
                title="Meta Description"
                value={
                  result.description ||
                  "No meta description found"
                }
                note={`${result.descriptionLength} characters`}
              />

              <InfoCard
                title="Canonical URL"
                value={
                  result.canonical ||
                  "No canonical tag found"
                }
              />

              <InfoCard
                title="Robots Meta"
                value={
                  result.robots ||
                  "No robots meta tag found"
                }
              />

            </section>


            <section className="grid gap-6 lg:grid-cols-2">

              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Page structure
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Heading Structure
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <SmallMetricCard
                    label="H1 count"
                    value={String(
                      result.h1Count
                    )}
                  />

                  <SmallMetricCard
                    label="H2 count"
                    value={String(
                      result.h2Count
                    )}
                  />

                </div>

                {result.h1.length > 0 ? (

                  <div className="mt-5 space-y-2">

                    {result.h1.map(
                      (
                        heading,
                        index
                      ) => (

                        <div
                          key={`${heading}-${index}`}
                          className="rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-sm leading-6 text-slate-300"
                        >
                          {heading}
                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <p className="mt-5 text-sm text-slate-500">
                    No H1 headings were detected.
                  </p>

                )}

              </div>


              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  Image SEO
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Images
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <SmallMetricCard
                    label="Total images"
                    value={String(
                      result.totalImages
                    )}
                  />

                  <SmallMetricCard
                    label="Missing ALT"
                    value={String(
                      result.imagesWithoutAlt
                    )}
                    warning={
                      result.imagesWithoutAlt >
                      0
                    }
                  />

                </div>

                <p className="mt-5 text-sm leading-7 text-slate-500">
                  ALT text helps describe meaningful images
                  for accessibility and provides additional
                  context about image content.
                </p>

              </div>

            </section>


            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                URL information
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Analysis Details
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <UrlCard
                  label="Requested URL"
                  value={
                    result.requestedUrl
                  }
                />

                <UrlCard
                  label="Final URL"
                  value={
                    result.finalUrl
                  }
                />

              </div>

            </section>

          </div>
        )}


        <div className="mt-10">

          <ShareTool
            title="SEO Page Analyzer"
            description="Analyze titles, meta descriptions, headings, canonical tags, links and image SEO with this free LifeSeos tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              On-Page SEO Analysis
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Check Important SEO Elements on Any Page
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              On-page SEO includes the page-level signals
              that help users and search engines understand
              what a webpage contains. LifeSeos checks
              several important elements so you can quickly
              identify missing or incomplete page signals.
            </p>

          </div>


          {/* WHAT IT CHECKS */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <CheckInfoCard
              icon="T"
              title="Page Title"
              description="Review the page title and its character length to identify missing or unusually structured titles."
            />

            <CheckInfoCard
              icon="D"
              title="Meta Description"
              description="Check whether a meta description exists and review its current length."
            />

            <CheckInfoCard
              icon="H"
              title="Heading Structure"
              description="Inspect H1 and H2 usage to better understand the visible structure of the page."
            />

            <CheckInfoCard
              icon="C"
              title="Canonical Tag"
              description="Check whether the page declares a canonical URL for search engines."
            />

            <CheckInfoCard
              icon="R"
              title="Robots Meta"
              description="Review robots directives that may influence how search engines index or follow the page."
            />

            <CheckInfoCard
              icon="ALT"
              title="Image ALT Text"
              description="Identify how many images are present and whether some are missing ALT attributes."
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                  How it works
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  How to Use the SEO Page Analyzer
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Run a quick page-level audit before
                  publishing changes or when reviewing an
                  existing webpage.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Enter a page URL"
                  description="Paste the full public URL of the webpage you want to inspect."
                />

                <StepCard
                  number="2"
                  title="Run the page analysis"
                  description="LifeSeos retrieves the page and extracts supported on-page SEO elements."
                />

                <StepCard
                  number="3"
                  title="Review the important signals"
                  description="Check metadata, headings, canonical information, links, images and page size."
                />

                <StepCard
                  number="4"
                  title="Fix missing elements"
                  description="Use the results to identify page elements that may need further review or improvement."
                />

              </div>

            </div>

          </div>


          {/* WHY ON-PAGE SEO MATTERS */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Page-level optimization
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Why On-Page SEO Matters
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                A webpage can contain useful content and
                still have weak SEO signals if important
                metadata or structural elements are
                missing.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Reviewing titles, descriptions, headings,
                canonical tags and image attributes gives
                you a clearer picture of how the page is
                structured and where additional
                optimization may be needed.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BenefitCard
                title="Find missing metadata"
                description="Quickly identify missing titles, descriptions or canonical information."
              />

              <BenefitCard
                title="Review page structure"
                description="Check H1 and H2 usage to understand how the page content is organized."
              />

              <BenefitCard
                title="Inspect image SEO"
                description="Identify images that may be missing descriptive ALT attributes."
              />

              <BenefitCard
                title="Check technical signals"
                description="Review HTTP status, robots directives, final URL and page size."
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
                description="Run a broader SEO audit covering technical, content, image and social signals."
              />

              <RelatedToolCard
                href="/tools/content-analyzer"
                icon="▤"
                title="Content Analyzer"
                description="Analyze readability, content structure, keyword usage and content quality signals."
              />

              <RelatedToolCard
                href="/tools/meta-tag-generator"
                icon="<>"
                title="Meta Tag Generator"
                description="Create optimized page titles, descriptions and social metadata."
              />

              <RelatedToolCard
                href="/tools/keyword-density-checker"
                icon="%"
                title="Keyword Density Checker"
                description="Measure keyword frequency and density within your written content."
              />

              <RelatedToolCard
                href="/tools/page-speed"
                icon="⚡"
                title="Page Speed Analyzer"
                description="Measure Lighthouse performance and important page loading metrics."
              />

              <RelatedToolCard
                href="/tools/xml-sitemap-generator"
                icon="⌘"
                title="XML Sitemap Generator"
                description="Generate XML sitemaps to help search engines discover website pages."
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
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-cyan-300">
        {value}
      </p>

    </div>
  );
}


function SmallMetricCard({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          warning
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


function InfoCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6">

      <h2 className="text-sm font-semibold text-slate-400">
        {title}
      </h2>

      <p className="mt-3 break-words text-lg leading-7 text-white">
        {value}
      </p>

      {note && (
        <p className="mt-2 text-xs text-slate-500">
          {note}
        </p>
      )}

    </div>
  );
}


function UrlCard({
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


function CheckInfoCard({
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

      <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2 text-xs font-bold text-cyan-300">
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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 font-bold text-cyan-300">
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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-cyan-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-cyan-300">
        Open tool →
      </div>

    </Link>
  );
}