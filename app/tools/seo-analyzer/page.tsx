"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ShareTool from "@/components/share-tool";
import { createClient } from "@/lib/supabase/client";

type SEOResult = {
  url?: string;
  score: number;
  grade?: string;
  status: string;
  title?: string;
  description?: string;
  h1?: string;
  canonical?: string;
  robots?: string;

  images?: {
    total: number;
    missingAlt: number;
  };

  social?: {
    ogTitle?: string;
    ogDescription?: string;
  };

  passed?: string[];
  errors?: string[];
  warnings?: string[];
  recommendations?: string[];
};

type CheckStatus =
  | "good"
  | "warning"
  | "error"
  | "neutral";

type AuditCheck = {
  label: string;
  value: string;
  status: CheckStatus;
};

export default function SEOAnalyzerPage() {
  const initialUrlHandledRef = useRef(false);

  const [url, setUrl] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [result, setResult] =
    useState<SEOResult | null>(null);
  const [error, setError] = useState("");
  const [
    animatedScore,
    setAnimatedScore,
  ] = useState(0);

  useEffect(() => {
    if (!result) {
      setAnimatedScore(0);
      return;
    }

    const target = Math.max(
      0,
      Math.min(
        100,
        result.score || 0
      )
    );

    const duration = 1400;
    const startTime =
      performance.now();

    setAnimatedScore(0);

    let frame = 0;

    const animate = (
      time: number
    ) => {
      const elapsed =
        time - startTime;

      const progress = Math.min(
        elapsed / duration,
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

    frame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [result]);

  async function analyzeWebsite(
    event?: FormEvent,
    overrideUrl?: string
  ) {
    event?.preventDefault();

    const cleanUrl =
      (overrideUrl ?? url).trim();

    if (!cleanUrl) {
      setError(
        "Please enter a website URL."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setAnimatedScore(0);

    try {
      const response =
        await fetch(
          "/api/analyze",
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
        throw new Error(
          data.error ||
            "Unable to analyze website."
        );
      }

      try {
        const trackingResponse =
          await fetch(
            "/api/tool-events",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                tool_name:
                  "SEO Analyzer",
              }),
            }
          );

        if (
          !trackingResponse.ok
        ) {
          console.error(
            "Failed to record SEO Analyzer usage."
          );
        }
      } catch (
        trackingError
      ) {
        console.error(
          "Unable to record tool usage:",
          trackingError
        );
      }

      const supabase =
        createClient();

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (user) {
        const {
          error: saveError,
        } = await supabase
          .from("seo_reports")
          .insert({
            user_id:
              user.id,

            url:
              cleanUrl,

            score:
              Number(
                data.score ?? 0
              ),

            grade:
              data.grade ??
              getGrade(
                Number(
                  data.score ?? 0
                )
              ),

            status:
              data.status ??
              "Unknown",

            report_data:
              data,
          });

        if (saveError) {
          console.error(
            "Failed to save SEO report:",
            saveError
          );
        }
      }

      setResult({
        ...data,

        score:
          Number(
            data.score ?? 0
          ),

        status:
          data.status ??
          "Unknown",

        recommendations:
          data.recommendations ??
          [],

        passed:
          data.passed ?? [],

        warnings:
          data.warnings ?? [],

        errors:
          data.errors ?? [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze website."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialUrlHandledRef.current) {
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

    void analyzeWebsite(
      undefined,
      incomingUrl
    );
  }, []);

  const metrics =
    useMemo(() => {
      if (!result) {
        return {
          technical: 0,
          content: 0,
          images: 0,
          social: 0,
        };
      }

      const hasCanonical =
        Boolean(
          result.canonical
        ) &&
        result.canonical !==
          "Not found";

      const hasRobots =
        Boolean(
          result.robots
        ) &&
        result.robots !==
          "Not found";

      const hasH1 =
        Boolean(result.h1) &&
        result.h1 !==
          "No H1 found";

      const hasDescription =
        Boolean(
          result.description
        ) &&
        result.description !==
          "No description found";

      const hasTitle =
        Boolean(
          result.title
        ) &&
        result.title !==
          "No title found";

      const hasOgTitle =
        Boolean(
          result.social
            ?.ogTitle
        ) &&
        result.social
          ?.ogTitle !==
          "Not found";

      const hasOgDescription =
        Boolean(
          result.social
            ?.ogDescription
        ) &&
        result.social
          ?.ogDescription !==
          "Not found";

      const technicalValues = [
        hasCanonical
          ? 100
          : 0,

        hasRobots
          ? 100
          : 0,

        hasH1
          ? 100
          : 0,

        hasDescription
          ? 100
          : 0,
      ];

      const technical =
        Math.round(
          technicalValues.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          ) /
            technicalValues.length
        );

      const contentValues = [
        hasTitle
          ? 100
          : 0,

        hasDescription
          ? 100
          : 0,

        hasH1
          ? 100
          : 0,
      ];

      const content =
        Math.round(
          contentValues.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          ) /
            contentValues.length
        );

      const totalImages =
        result.images
          ?.total ?? 0;

      const missingAlt =
        result.images
          ?.missingAlt ?? 0;

      const images =
        totalImages === 0
          ? 100
          : Math.max(
              0,
              Math.round(
                ((totalImages -
                  missingAlt) /
                  totalImages) *
                  100
              )
            );

      const socialValues = [
        hasOgTitle
          ? 100
          : 0,

        hasOgDescription
          ? 100
          : 0,
      ];

      const social =
        Math.round(
          socialValues.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          ) /
            socialValues.length
        );

      return {
        technical,
        content,
        images,
        social,
      };
    }, [result]);

  const auditChecks =
    useMemo<
      AuditCheck[]
    >(() => {
      if (!result) {
        return [];
      }

      const title =
        result.title ||
        "No title found";

      const description =
        result.description ||
        "No description found";

      const h1 =
        result.h1 ||
        "No H1 found";

      const canonical =
        result.canonical ||
        "Not found";

      const robots =
        result.robots ||
        "Not found";

      const ogTitle =
        result.social
          ?.ogTitle ||
        "Not found";

      const ogDescription =
        result.social
          ?.ogDescription ||
        "Not found";

      const totalImages =
        result.images
          ?.total ?? 0;

      const missingAlt =
        result.images
          ?.missingAlt ?? 0;

      return [
        {
          label:
            "Page Title",

          value:
            title,

          status:
            title !==
            "No title found"
              ? "good"
              : "error",
        },

        {
          label:
            "Meta Description",

          value:
            description,

          status:
            description !==
            "No description found"
              ? "good"
              : "error",
        },

        {
          label:
            "H1 Heading",

          value:
            h1,

          status:
            h1 !==
            "No H1 found"
              ? "good"
              : "error",
        },

        {
          label:
            "Canonical URL",

          value:
            canonical,

          status:
            canonical !==
            "Not found"
              ? "good"
              : "warning",
        },

        {
          label:
            "Robots Meta",

          value:
            robots,

          status:
            robots !==
            "Not found"
              ? "good"
              : "warning",
        },

        {
          label:
            "Image ALT",

          value:
            totalImages ===
            0
              ? "No images detected"
              : `${missingAlt} missing ALT out of ${totalImages}`,

          status:
            totalImages ===
            0
              ? "neutral"
              : missingAlt ===
                0
              ? "good"
              : "warning",
        },

        {
          label:
            "Open Graph Title",

          value:
            ogTitle,

          status:
            ogTitle !==
            "Not found"
              ? "good"
              : "warning",
        },

        {
          label:
            "Open Graph Description",

          value:
            ogDescription,

          status:
            ogDescription !==
            "Not found"
              ? "good"
              : "warning",
        },
      ];
    }, [result]);

  const derivedPassed =
    useMemo(() => {
      if (!result) {
        return [];
      }

      if (
        result.passed &&
        result.passed.length >
          0
      ) {
        return result.passed;
      }

      return auditChecks
        .filter(
          (check) =>
            check.status ===
            "good"
        )
        .map(
          (check) =>
            `${check.label} passed`
        );
    }, [
      result,
      auditChecks,
    ]);

  const derivedErrors =
    useMemo(() => {
      if (!result) {
        return [];
      }

      if (
        result.errors &&
        result.errors.length >
          0
      ) {
        return result.errors;
      }

      return auditChecks
        .filter(
          (check) =>
            check.status ===
            "error"
        )
        .map(
          (check) =>
            `${check.label} needs attention`
        );
    }, [
      result,
      auditChecks,
    ]);

  const derivedWarnings =
    useMemo(() => {
      if (!result) {
        return [];
      }

      if (
        result.warnings &&
        result.warnings
          .length > 0
      ) {
        return result.warnings;
      }

      return auditChecks
        .filter(
          (check) =>
            check.status ===
            "warning"
        )
        .map(
          (check) =>
            `${check.label} should be improved`
        );
    }, [
      result,
      auditChecks,
    ]);

  const grade =
    result?.grade ||
    getGrade(
      result?.score ?? 0
    );

  function downloadPdf() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* TOOL AREA */}

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl text-center print:hidden">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <span>⌕</span>

            <span>
              LifeSeos SEO Analyzer
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free SEO Analyzer

            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Audit Your Website SEO
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Analyze your website for technical SEO,
            content, metadata, image optimization and
            social sharing issues, then get actionable
            recommendations to improve your pages.
          </p>

        </div>


        <form
          onSubmit={
            analyzeWebsite
          }
          className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 sm:flex-row print:hidden"
        >

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/5 bg-slate-900 px-4">

            <span className="text-xl text-slate-500">
              ⌕
            </span>

            <input
  type="url"
  inputMode="url"
  autoCapitalize="none"
  spellCheck={false}
  aria-label="Website URL"
  value={url}
  onChange={(
    event
  ) =>
    setUrl(
      event.target
        .value
    )
  }
  placeholder="https://example.com"
  className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-600 sm:text-base"
/>

          </div>


          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-7 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:shadow-violet-900/40 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <span>
              {loading
                ? "◌"
                : "⌕"}
            </span>

            <span>
              {loading
                ? "Analyzing..."
                : "Analyze"}
            </span>

          </button>

        </form>


        {error && (

          <div className="mx-auto mt-5 max-w-4xl rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300 print:hidden">
            {error}
          </div>

        )}


        {loading && (

          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-full bg-slate-900 print:hidden">

            <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500" />

          </div>

        )}


        {result && (

          <div className="mt-10 space-y-6">

            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 sm:p-8">

              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />


              <div className="relative grid items-center gap-8 lg:grid-cols-[280px_1fr]">

                <div className="flex justify-center">

                  <ScoreRing
                    score={
                      animatedScore
                    }
                  />

                </div>


                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        result.score
                      )}`}
                    >
                      {
                        result.status
                      }
                    </span>


                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      Grade {grade}
                    </span>

                  </div>


                  <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                    SEO Audit Overview
                  </h2>


                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    This score summarizes the SEO checks
                    currently supported by LifeSeos.
                    Review each category below to see
                    where improvements are needed.
                  </p>


                  {result.url && (

                    <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-400">

                      <span className="mr-2 text-slate-500">
                        URL
                      </span>

                      <span className="break-all text-slate-200">
                        {
                          result.url
                        }
                      </span>

                    </div>

                  )}

                </div>

              </div>

            </section>


            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <MetricCard
                icon="⚙"
                title="Technical SEO"
                value={
                  metrics.technical
                }
                description="Core technical signals"
                accent="blue"
              />


              <MetricCard
                icon="▤"
                title="Content SEO"
                value={
                  metrics.content
                }
                description="Page content structure"
                accent="emerald"
              />


              <MetricCard
                icon="▣"
                title="Image SEO"
                value={
                  metrics.images
                }
                description="Image accessibility"
                accent="violet"
              />


              <MetricCard
                icon="◎"
                title="Social SEO"
                value={
                  metrics.social
                }
                description="Open Graph metadata"
                accent="pink"
              />

            </section>


            <section className="grid gap-6 lg:grid-cols-2">

              <AuditPanel
                icon="⚙"
                title="Technical SEO"
                subtitle="Technical signals that help search engines understand your page."
                accentClass="text-blue-300"
              >

                <ProgressRow
                  label="Canonical URL"
                  value={
                    result.canonical &&
                    result.canonical !==
                      "Not found"
                      ? 100
                      : 0
                  }
                />


                <ProgressRow
                  label="H1 Structure"
                  value={
                    result.h1 &&
                    result.h1 !==
                      "No H1 found"
                      ? 100
                      : 0
                  }
                />


                <ProgressRow
                  label="Meta Description"
                  value={
                    result.description &&
                    result.description !==
                      "No description found"
                      ? 100
                      : 0
                  }
                />


                <ProgressRow
                  label="Robots Meta"
                  value={
                    result.robots &&
                    result.robots !==
                      "Not found"
                      ? 100
                      : 0
                  }
                />

              </AuditPanel>


              <AuditPanel
                icon="▣"
                title="Image SEO"
                subtitle="Image accessibility and ALT attribute coverage."
                accentClass="text-violet-300"
              >

                <StatLine
                  label="Total Images"
                  value={String(
                    result.images
                      ?.total ?? 0
                  )}
                />


                <StatLine
                  label="Missing ALT"
                  value={String(
                    result.images
                      ?.missingAlt ??
                      0
                  )}
                />


                <ProgressRow
                  label="ALT Coverage"
                  value={
                    metrics.images
                  }
                />

              </AuditPanel>


              <AuditPanel
                icon="▤"
                title="Content SEO"
                subtitle="Important content elements visible to search engines."
                accentClass="text-emerald-300"
              >

                <DetailItem
                  label="Title"
                  value={
                    result.title ||
                    "No title found"
                  }
                  good={
                    Boolean(
                      result.title
                    ) &&
                    result.title !==
                      "No title found"
                  }
                />


                <DetailItem
                  label="H1"
                  value={
                    result.h1 ||
                    "No H1 found"
                  }
                  good={
                    Boolean(
                      result.h1
                    ) &&
                    result.h1 !==
                      "No H1 found"
                  }
                />


                <DetailItem
                  label="Meta Description"
                  value={
                    result.description ||
                    "No description found"
                  }
                  good={
                    Boolean(
                      result.description
                    ) &&
                    result.description !==
                      "No description found"
                  }
                />

              </AuditPanel>


              <AuditPanel
                icon="◎"
                title="Social SEO"
                subtitle="Metadata used when your page is shared on social platforms."
                accentClass="text-pink-300"
              >

                <DetailItem
                  label="OG Title"
                  value={
                    result.social
                      ?.ogTitle ||
                    "Not found"
                  }
                  good={
                    Boolean(
                      result.social
                        ?.ogTitle
                    ) &&
                    result.social
                      ?.ogTitle !==
                      "Not found"
                  }
                />


                <DetailItem
                  label="OG Description"
                  value={
                    result.social
                      ?.ogDescription ||
                    "Not found"
                  }
                  good={
                    Boolean(
                      result.social
                        ?.ogDescription
                    ) &&
                    result.social
                      ?.ogDescription !==
                      "Not found"
                  }
                />

              </AuditPanel>

            </section>


            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Audit checklist
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    SEO Checks
                  </h2>

                </div>


                <div className="text-sm text-slate-500">
                  {
                    auditChecks.length
                  }{" "}
                  checks
                </div>

              </div>


              <div className="mt-6 grid gap-3 md:grid-cols-2">

                {auditChecks.map(
                  (check) => (

                    <CheckCard
                      key={
                        check.label
                      }
                      check={
                        check
                      }
                    />

                  )
                )}

              </div>

            </section>


            <section className="grid gap-6 lg:grid-cols-3">

              <StatusList
                icon="✓"
                title="Passed"
                items={
                  derivedPassed
                }
                emptyText="No passed checks yet."
                type="success"
              />


              <StatusList
                icon="!"
                title="Warnings"
                items={
                  derivedWarnings
                }
                emptyText="No warnings detected."
                type="warning"
              />


              <StatusList
                icon="×"
                title="Errors"
                items={
                  derivedErrors
                }
                emptyText="No critical errors detected."
                type="error"
              />

            </section>


            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-xl text-amber-300">
                  !
                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/70">
                    Action plan
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Recommendations
                  </h2>

                </div>

              </div>


              <div className="mt-6 space-y-3">

                {(result.recommendations ??
                  []).length >
                0 ? (

                  (
                    result.recommendations ??
                    []
                  ).map(
                    (
                      item,
                      index
                    ) => (

                      <RecommendationCard
                        key={`${item}-${index}`}
                        number={
                          index +
                          1
                        }
                        text={
                          item
                        }
                      />

                    )
                  )

                ) : (

                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4 text-sm text-emerald-300">
                    No recommendations at this time.
                    The analyzed checks look good.
                  </div>

                )}

              </div>

            </section>


            <div className="flex flex-col gap-3 sm:flex-row print:hidden">

              <button
                type="button"
                onClick={
                  downloadPdf
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >

                <span>
                  ⇩
                </span>

                <span>
                  Download PDF
                </span>

              </button>


              <button
                type="button"
                onClick={() => {
                  setResult(
                    null
                  );

                  setUrl("");

                  setError("");

                  setAnimatedScore(
                    0
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >

                <span>
                  ↻
                </span>

                <span>
                  New Analysis
                </span>

              </button>

            </div>

          </div>

        )}


        <div className="print:hidden">

          <ShareTool
            title="SEO Analyzer"
            description="Analyze technical SEO, content, images and social metadata with this free LifeSeos SEO Analyzer."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10 bg-slate-950 print:hidden">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Free Website SEO Audit
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Understand Your Website&apos;s SEO Health
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-400">
              The LifeSeos SEO Analyzer helps you review
              important on-page and technical SEO signals
              in one place. Use the results to identify
              missing metadata, page structure issues,
              image optimization gaps and social sharing
              problems before they affect your website&apos;s
              search visibility.
            </p>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-2">

            <SEOInfoCard
              icon="⚙"
              title="Technical SEO Checks"
              description="Review signals that help search engines crawl, understand and correctly interpret your page."
              items={[
                "Canonical URL",
                "Robots meta directives",
                "H1 heading structure",
                "Meta description",
              ]}
            />


            <SEOInfoCard
              icon="▤"
              title="On-Page Content"
              description="Check whether essential page elements are present and structured clearly for users and search engines."
              items={[
                "Page title",
                "Meta description",
                "Main H1 heading",
                "Core page information",
              ]}
            />


            <SEOInfoCard
              icon="▣"
              title="Image SEO"
              description="Identify images that may be missing ALT text and improve accessibility and image search signals."
              items={[
                "Total images detected",
                "Missing ALT attributes",
                "ALT text coverage",
                "Image accessibility",
              ]}
            />


            <SEOInfoCard
              icon="◎"
              title="Social Metadata"
              description="Check Open Graph metadata used when your website is shared across social platforms and messaging apps."
              items={[
                "Open Graph title",
                "Open Graph description",
                "Social preview readiness",
                "Share metadata coverage",
              ]}
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                  How it works
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  How to Use the SEO Analyzer
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Run a quick website audit and use the
                  report as a practical starting point for
                  improving your SEO.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Enter your website URL"
                  description="Paste the full URL of the page you want to analyze, including https://."
                />


                <StepCard
                  number="2"
                  title="Run the SEO analysis"
                  description="LifeSeos checks the page for supported technical, content, image and social SEO signals."
                />


                <StepCard
                  number="3"
                  title="Review your SEO score"
                  description="Use the overall score and category breakdown to understand which areas need attention."
                />


                <StepCard
                  number="4"
                  title="Fix issues by priority"
                  description="Start with errors and warnings, then work through the recommendations shown in your report."
                />

              </div>

            </div>

          </div>


          {/* WHY AUDITS MATTER */}

          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Better SEO decisions
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Why Regular SEO Audits Matter
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Websites change over time. New pages,
                design updates, plugins, metadata changes
                and content edits can introduce SEO issues
                without being immediately visible.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Regular audits help you identify problems
                early and give you a structured way to
                review technical and on-page SEO signals
                before investing more time in content or
                promotion.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BenefitCard
                title="Find hidden issues"
                description="Discover missing or incomplete SEO elements that may otherwise be easy to overlook."
              />


              <BenefitCard
                title="Prioritize improvements"
                description="Use warnings, errors and recommendations to focus on the most important changes first."
              />


              <BenefitCard
                title="Improve consistency"
                description="Review your pages using the same checks instead of relying on manual inspection alone."
              />


              <BenefitCard
                title="Track website quality"
                description="Run audits after major website updates to confirm that important SEO elements remain in place."
              />

            </div>

          </div>

          {/* SEO ANALYZER VS SEO PAGE ANALYZER */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Choose the right analysis
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                SEO Analyzer vs SEO Page Analyzer
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Use the SEO Analyzer for a broad overview of technical SEO,
                content, images and social metadata. Use the SEO Page Analyzer
                when you want a more focused review of important on-page SEO
                elements for a specific page.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">

                <Link
                  href="/tools/seo-page-analyzer"
                  className="inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  Open SEO Page Analyzer →
                </Link>

              </div>

            </div>

          </div>
          {/* SEO GUIDES */}

          <div className="mt-16">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                Learn more
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                SEO Audit Guides
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
                Explore practical SEO guides to better understand audit results
                and improve your website step by step.
              </p>

            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">

              <Link
                href="/blog/complete-seo-audit-guide"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  SEO Audit
                </p>

                <h3 className="mt-3 text-lg font-semibold text-white transition group-hover:text-violet-300">
                  Complete SEO Audit Guide
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Learn how to review technical, on-page and content SEO issues
                  using a structured audit process.
                </p>

                <div className="mt-5 text-sm font-semibold text-violet-300">
                  Read guide →
                </div>
              </Link>


              <Link
                href="/blog/technical-seo-guide"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Technical SEO
                </p>

                <h3 className="mt-3 text-lg font-semibold text-white transition group-hover:text-cyan-300">
                  Technical SEO Guide
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Understand crawling, indexing, metadata and other technical
                  signals that affect search visibility.
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  Read guide →
                </div>
              </Link>


              <Link
                href="/blog/on-page-seo-checklist"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  On-Page SEO
                </p>

                <h3 className="mt-3 text-lg font-semibold text-white transition group-hover:text-emerald-300">
                  On-Page SEO Checklist
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Review important on-page elements such as titles,
                  descriptions, headings and page structure.
                </p>

                <div className="mt-5 text-sm font-semibold text-emerald-300">
                  Read guide →
                </div>
              </Link>

            </div>

          </div>

          {/* CONTINUE TECHNICAL SEO WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Complete Your Technical SEO Workflow
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Control crawling, improve discovery and audit your site
              </h2>

              <p className="mt-4 leading-8 text-slate-400">
                Use these tools together to manage crawler access, publish a
                clean XML sitemap and then review your website with a broader
                SEO audit.
              </p>

            </div>


            <div className="mt-10 grid gap-5 lg:grid-cols-3">

              <Link
                href="/tools/robots-txt-generator"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-lg text-emerald-300">
                    🤖
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    Step 1
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-emerald-300">
                  Robots.txt Generator
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Configure crawler access rules and make sure search engines can
                  access the areas of your site you want them to crawl.
                </p>

                <div className="mt-5 text-sm font-semibold text-emerald-300">
                  Configure crawling →
                </div>

              </Link>


              <Link
                href="/tools/xml-sitemap-generator"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 font-bold text-blue-300">
                    ⌘
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    Step 2
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  XML Sitemap Generator
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Create a clean XML sitemap containing important canonical URLs
                  you want search engines to discover.
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  Create sitemap →
                </div>

              </Link>


              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.055] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-lg text-cyan-300">
                    ⌕
                  </div>

                  <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    Step 3 · Current
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  SEO Analyzer
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Complete the workflow with a broader audit covering technical,
                  content, image and social SEO signals.
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  Run SEO audit ✓
                </div>

              </div>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/http-status-checker"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                HTTP Status Checker →
              </Link>

              <Link
                href="/tools/seo-page-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                SEO Page Analyzer →
              </Link>

              <Link
                href="/tools/page-speed"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                Page Speed Analyzer →
              </Link>

              <Link
                href="/tools/content-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                Content Analyzer →
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                View All Tools →
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


function SEOInfoCard({
  icon,
  title,
  description,
  items,
}: {
  icon: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 sm:p-7">

      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-xl text-cyan-300">
        {icon}
      </div>


      <h3 className="mt-5 text-xl font-bold">
        {title}
      </h3>


      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>


      <ul className="mt-5 space-y-2">

        {items.map(
          (item) => (

            <li
              key={item}
              className="flex items-start gap-3 text-sm text-slate-300"
            >

              <span className="mt-0.5 text-emerald-400">
                ✓
              </span>

              <span>
                {item}
              </span>

            </li>

          )
        )}

      </ul>

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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 font-bold text-violet-300">
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


function ScoreRing({
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
    safeScore >= 80
      ? "#34d399"
      : safeScore >= 60
      ? "#facc15"
      : "#fb7185";

  return (
    <div
      className="relative flex h-52 w-52 items-center justify-center rounded-full"
      style={{
        background:
          `conic-gradient(${color} ${
            safeScore *
            3.6
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
          SEO Score
        </div>


        <div className="mt-1 text-xs text-slate-600">
          out of 100
        </div>

      </div>

    </div>
  );
}


function MetricCard({
  icon,
  title,
  value,
  description,
  accent,
}: {
  icon: string;
  title: string;
  value: number;
  description: string;

  accent:
    | "blue"
    | "emerald"
    | "violet"
    | "pink";
}) {
  const accentClasses = {
    blue: {
      icon:
        "border-blue-400/20 bg-blue-400/10 text-blue-300",

      value:
        "text-blue-300",
    },

    emerald: {
      icon:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

      value:
        "text-emerald-300",
    },

    violet: {
      icon:
        "border-violet-400/20 bg-violet-400/10 text-violet-300",

      value:
        "text-violet-300",
    },

    pink: {
      icon:
        "border-pink-400/20 bg-pink-400/10 text-pink-300",

      value:
        "text-pink-300",
    },
  };

  const styles =
    accentClasses[
      accent
    ];

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">

      <div className="flex items-start justify-between gap-4">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl ${styles.icon}`}
        >
          {icon}
        </div>


        <AnimatedNumber
          target={value}
          suffix="%"
          className={`text-2xl font-bold ${styles.value}`}
        />

      </div>


      <h3 className="mt-5 font-semibold">
        {title}
      </h3>


      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>


      <div className="mt-4">

        <AnimatedBar
          value={value}
        />

      </div>

    </div>
  );
}


function AuditPanel({
  icon,
  title,
  subtitle,
  accentClass,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  accentClass: string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">

      <div className="flex items-start gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
          {icon}
        </div>


        <div>

          <h3
            className={`font-semibold ${accentClass}`}
          >
            {title}
          </h3>


          <p className="mt-1 text-sm leading-6 text-slate-500">
            {subtitle}
          </p>

        </div>

      </div>


      <div className="mt-6 space-y-5">
        {children}
      </div>

    </div>
  );
}


function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between gap-4 text-sm">

        <span className="text-slate-300">
          {label}
        </span>


        <AnimatedNumber
          target={value}
          suffix="%"
          className={
            getPercentageClass(
              value
            )
          }
        />

      </div>


      <AnimatedBar
        value={value}
      />

    </div>
  );
}


function AnimatedBar({
  value,
}: {
  value: number;
}) {
  const [
    width,
    setWidth,
  ] = useState(0);

  const safeValue =
    Math.max(
      0,
      Math.min(
        100,
        value
      )
    );

  useEffect(() => {
    setWidth(0);

    const timer =
      window.setTimeout(
        () => {
          setWidth(
            safeValue
          );
        },
        80
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [safeValue]);

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

      <div
        className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-1000 ease-out ${getBarGradient(
          safeValue
        )}`}
        style={{
          width:
            `${width}%`,
        }}
      />

    </div>
  );
}


function AnimatedNumber({
  target,
  suffix = "",
  className = "",
}: {
  target: number;
  suffix?: string;
  className?: string;
}) {
  const [
    value,
    setValue,
  ] = useState(0);

  useEffect(() => {
    const safeTarget =
      Math.max(
        0,
        Math.round(
          target
        )
      );

    const duration =
      900;

    const startTime =
      performance.now();

    setValue(0);

    let frame = 0;

    const animate = (
      time: number
    ) => {
      const progress =
        Math.min(
          (time -
            startTime) /
            duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 -
            progress,
          3
        );

      setValue(
        Math.round(
          safeTarget *
            eased
        )
      );

      if (
        progress <
        1
      ) {
        frame =
          requestAnimationFrame(
            animate
          );
      }
    };

    frame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        frame
      );
    };
  }, [target]);

  return (
    <span
      className={`tabular-nums ${className}`}
    >
      {value}
      {suffix}
    </span>
  );
}


function StatLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 px-4 py-3">

      <span className="text-sm text-slate-400">
        {label}
      </span>


      <span className="font-semibold text-white">
        {value}
      </span>

    </div>
  );
}


function DetailItem({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

      <div className="flex items-center justify-between gap-4">

        <span className="text-sm font-medium text-slate-400">
          {label}
        </span>


        <span
          className={
            good
              ? "text-emerald-400"
              : "text-rose-400"
          }
        >
          {good
            ? "✓"
            : "×"}
        </span>

      </div>


      <p className="mt-2 break-words text-sm leading-6 text-slate-200">
        {value}
      </p>

    </div>
  );
}


function CheckCard({
  check,
}: {
  check: AuditCheck;
}) {
  const styles = {
    good: {
      icon: "✓",

      container:
        "border-emerald-400/15 bg-emerald-400/[0.05]",

      iconClass:
        "bg-emerald-400/10 text-emerald-300",
    },

    warning: {
      icon: "!",

      container:
        "border-amber-400/15 bg-amber-400/[0.05]",

      iconClass:
        "bg-amber-400/10 text-amber-300",
    },

    error: {
      icon: "×",

      container:
        "border-rose-400/15 bg-rose-400/[0.05]",

      iconClass:
        "bg-rose-400/10 text-rose-300",
    },

    neutral: {
      icon: "•",

      container:
        "border-white/10 bg-white/[0.03]",

      iconClass:
        "bg-white/5 text-slate-300",
    },
  };

  const style =
    styles[
      check.status
    ];

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${style.container}`}
    >

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${style.iconClass}`}
      >
        {style.icon}
      </div>


      <div className="min-w-0">

        <h3 className="text-sm font-semibold text-white">
          {check.label}
        </h3>


        <p className="mt-1 break-words text-xs leading-5 text-slate-400">
          {check.value}
        </p>

      </div>

    </div>
  );
}


function StatusList({
  icon,
  title,
  items,
  emptyText,
  type,
}: {
  icon: string;
  title: string;
  items: string[];
  emptyText: string;

  type:
    | "success"
    | "warning"
    | "error";
}) {
  const styles = {
    success: {
      heading:
        "text-emerald-300",

      icon:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

      item:
        "border-emerald-400/10 bg-emerald-400/[0.04]",
    },

    warning: {
      heading:
        "text-amber-300",

      icon:
        "border-amber-400/20 bg-amber-400/10 text-amber-300",

      item:
        "border-amber-400/10 bg-amber-400/[0.04]",
    },

    error: {
      heading:
        "text-rose-300",

      icon:
        "border-rose-400/20 bg-rose-400/10 text-rose-300",

      item:
        "border-rose-400/10 bg-rose-400/[0.04]",
    },
  };

  const style =
    styles[type];

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border font-bold ${style.icon}`}
        >
          {icon}
        </div>


        <div>

          <h3
            className={`font-semibold ${style.heading}`}
          >
            {title}
          </h3>


          <p className="text-xs text-slate-500">
            {
              items.length
            }{" "}
            items
          </p>

        </div>

      </div>


      <div className="mt-5 space-y-2">

        {items.length >
        0 ? (

          items.map(
            (
              item,
              index
            ) => (

              <div
                key={`${item}-${index}`}
                className={`rounded-2xl border px-4 py-3 text-sm leading-6 text-slate-300 ${style.item}`}
              >
                {item}
              </div>

            )
          )

        ) : (

          <div className="rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-500">
            {emptyText}
          </div>

        )}

      </div>

    </div>
  );
}


function RecommendationCard({
  number,
  text,
}: {
  number: number;
  text: string;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-black/10 p-4 transition hover:border-violet-400/20 hover:bg-white/[0.04]">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-sm font-bold text-violet-300">
        {number}
      </div>


      <div>

        <h3 className="text-sm font-semibold text-white">
          SEO Improvement
        </h3>


        <p className="mt-1 text-sm leading-6 text-slate-400">
          {text}
        </p>

      </div>

    </div>
  );
}


function getGrade(
  score: number
) {
  if (
    score >= 90
  ) {
    return "A";
  }

  if (
    score >= 75
  ) {
    return "B";
  }

  if (
    score >= 60
  ) {
    return "C";
  }

  if (
    score >= 40
  ) {
    return "D";
  }

  return "F";
}


function getStatusBadgeClass(
  score: number
) {
  if (
    score >= 80
  ) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (
    score >= 60
  ) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-rose-400/20 bg-rose-400/10 text-rose-300";
}


function getPercentageClass(
  value: number
) {
  if (
    value >= 80
  ) {
    return "font-semibold text-emerald-300";
  }

  if (
    value >= 50
  ) {
    return "font-semibold text-amber-300";
  }

  return "font-semibold text-rose-300";
}


function getBarGradient(
  value: number
) {
  if (
    value >= 80
  ) {
    return "from-emerald-500 to-cyan-400";
  }

  if (
    value >= 50
  ) {
    return "from-amber-500 to-yellow-300";
  }

  return "from-rose-500 to-fuchsia-500";
}