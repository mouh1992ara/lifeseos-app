"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ShareTool from "@/components/share-tool";
import { createClient } from "@/lib/supabase/client";
import { getFixLink, type FixLang } from "@/lib/fix-links";

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

// The analyzer API returns these English placeholders when a value is absent.
const MISSING_VALUES = new Set([
  "Not found",
  "No title found",
  "No description found",
  "No H1 found",
]);

function isMissing(value: string | undefined) {
  return !value || MISSING_VALUES.has(value.trim());
}

const STEP_IDS = ["1", "2", "3", "4"] as const;
const BENEFIT_IDS = ["1", "2", "3", "4"] as const;

export default function SEOAnalyzerPage() {
  const t = useTranslations("Tool.seoAnalyzer");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");
  const tErr = useTranslations("Errors");
  const locale = useLocale();

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
      setError(tErr("urlRequired"));
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
            t("errorFallback")
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
          : t("errorFallback")
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
        !isMissing(result.canonical);

      const hasRobots =
        !isMissing(result.robots);

      const hasH1 =
        !isMissing(result.h1);

      const hasDescription =
        !isMissing(result.description);

      const hasTitle =
        !isMissing(result.title);

      const hasOgTitle =
        !isMissing(
          result.social
            ?.ogTitle
        );

      const hasOgDescription =
        !isMissing(
          result.social
            ?.ogDescription
        );

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

      const totalImages =
        result.images
          ?.total ?? 0;

      const missingAlt =
        result.images
          ?.missingAlt ?? 0;

      return [
        {
          label:
            t("checkPageTitle"),

          value:
            isMissing(result.title)
              ? t("noTitle")
              : result.title!,

          status:
            !isMissing(result.title)
              ? "good"
              : "error",
        },

        {
          label:
            t("metaDescription"),

          value:
            isMissing(result.description)
              ? t("noDescription")
              : result.description!,

          status:
            !isMissing(result.description)
              ? "good"
              : "error",
        },

        {
          label:
            t("checkH1"),

          value:
            isMissing(result.h1)
              ? t("noH1")
              : result.h1!,

          status:
            !isMissing(result.h1)
              ? "good"
              : "error",
        },

        {
          label:
            t("canonical"),

          value:
            isMissing(result.canonical)
              ? t("notFound")
              : result.canonical!,

          status:
            !isMissing(result.canonical)
              ? "good"
              : "warning",
        },

        {
          label:
            t("robotsMeta"),

          value:
            isMissing(result.robots)
              ? t("notFound")
              : result.robots!,

          status:
            !isMissing(result.robots)
              ? "good"
              : "warning",
        },

        {
          label:
            t("checkImageAlt"),

          value:
            totalImages ===
            0
              ? t("noImages")
              : t("imageAltMissing", {
                  missing: missingAlt,
                  total: totalImages,
                }),

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
            t("checkOgTitle"),

          value:
            isMissing(
              result.social
                ?.ogTitle
            )
              ? t("notFound")
              : result.social!.ogTitle!,

          status:
            !isMissing(
              result.social
                ?.ogTitle
            )
              ? "good"
              : "warning",
        },

        {
          label:
            t("checkOgDescription"),

          value:
            isMissing(
              result.social
                ?.ogDescription
            )
              ? t("notFound")
              : result.social!.ogDescription!,

          status:
            !isMissing(
              result.social
                ?.ogDescription
            )
              ? "good"
              : "warning",
        },
      ];
    }, [result, t]);

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
            t("checkPassed", {
              label: check.label,
            })
        );
    }, [
      result,
      auditChecks,
      t,
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
            t("checkNeedsAttention", {
              label: check.label,
            })
        );
    }, [
      result,
      auditChecks,
      t,
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
            t("checkImprove", {
              label: check.label,
            })
        );
    }, [
      result,
      auditChecks,
      t,
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
            <span aria-hidden="true">⌕</span>

            <span>
              {t("badge")}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}

            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {t("subtitle")}
          </p>

          {locale !== "ar" && (
            <Link
              href="/ar/tools/seo-analyzer"
              hrefLang="ar"
              lang="ar"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-300/50 hover:bg-emerald-400/20"
            >
              <span aria-hidden="true">🌐</span>
              <span>{t("arabicLink")}</span>
            </Link>
          )}

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
  aria-label={tCommon("urlLabel")}
  value={url}
  onChange={(
    event
  ) =>
    setUrl(
      event.target
        .value
    )
  }
  placeholder={tCommon("urlPlaceholder")}
  dir="ltr"
  className="w-full bg-transparent py-4 text-start text-sm text-white outline-none placeholder:text-slate-600 sm:text-base"
/>

          </div>


          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-7 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:shadow-violet-900/40 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <span aria-hidden="true">
              {loading
                ? "◌"
                : "⌕"}
            </span>

            <span>
              {loading
                ? t("submitLoading")
                : t("submit")}
            </span>

          </button>

        </form>


        {error && (

          <div className="mx-auto mt-5 max-w-4xl rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300 print:hidden" role="alert">
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
                    label={t("scoreLabel")}
                    outOf={t("scoreOutOf")}
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
                      {t("grade", { grade })}
                    </span>

                  </div>


                  <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                    {t("overviewTitle")}
                  </h2>


                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    {t("overviewBody")}
                  </p>


                  {result.url && (

                    <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-400">

                      <span className="me-2 text-slate-500" data-ltr-text>
                        {t("urlInline")}
                      </span>

                      <span className="break-all text-slate-200" data-ltr-text>
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
                title={t("metricTechnical")}
                value={
                  metrics.technical
                }
                description={t("metricTechnicalDesc")}
                accent="blue"
              />


              <MetricCard
                icon="▤"
                title={t("metricContent")}
                value={
                  metrics.content
                }
                description={t("metricContentDesc")}
                accent="emerald"
              />


              <MetricCard
                icon="▣"
                title={t("metricImages")}
                value={
                  metrics.images
                }
                description={t("metricImagesDesc")}
                accent="violet"
              />


              <MetricCard
                icon="◎"
                title={t("metricSocial")}
                value={
                  metrics.social
                }
                description={t("metricSocialDesc")}
                accent="pink"
              />

            </section>


            <section className="grid gap-6 lg:grid-cols-2">

              <AuditPanel
                icon="⚙"
                title={t("metricTechnical")}
                subtitle={t("panelTechnicalSubtitle")}
                accentClass="text-blue-300"
              >

                <ProgressRow
                  label={t("canonical")}
                  value={
                    !isMissing(
                      result.canonical
                    )
                      ? 100
                      : 0
                  }
                />


                <ProgressRow
                  label={t("h1Structure")}
                  value={
                    !isMissing(result.h1)
                      ? 100
                      : 0
                  }
                />


                <ProgressRow
                  label={t("metaDescription")}
                  value={
                    !isMissing(
                      result.description
                    )
                      ? 100
                      : 0
                  }
                />


                <ProgressRow
                  label={t("robotsMeta")}
                  value={
                    !isMissing(
                      result.robots
                    )
                      ? 100
                      : 0
                  }
                />

              </AuditPanel>


              <AuditPanel
                icon="▣"
                title={t("metricImages")}
                subtitle={t("panelImageSubtitle")}
                accentClass="text-violet-300"
              >

                <StatLine
                  label={t("totalImages")}
                  value={String(
                    result.images
                      ?.total ?? 0
                  )}
                />


                <StatLine
                  label={t("missingAlt")}
                  value={String(
                    result.images
                      ?.missingAlt ??
                      0
                  )}
                />


                <ProgressRow
                  label={t("altCoverage")}
                  value={
                    metrics.images
                  }
                />

              </AuditPanel>


              <AuditPanel
                icon="▤"
                title={t("metricContent")}
                subtitle={t("panelContentSubtitle")}
                accentClass="text-emerald-300"
              >

                <DetailItem
                  label={t("titleLabel")}
                  value={
                    isMissing(result.title)
                      ? t("noTitle")
                      : result.title!
                  }
                  good={
                    !isMissing(result.title)
                  }
                />


                <DetailItem
                  label={t("h1Label")}
                  value={
                    isMissing(result.h1)
                      ? t("noH1")
                      : result.h1!
                  }
                  good={
                    !isMissing(result.h1)
                  }
                />


                <DetailItem
                  label={t("metaDescription")}
                  value={
                    isMissing(result.description)
                      ? t("noDescription")
                      : result.description!
                  }
                  good={
                    !isMissing(result.description)
                  }
                />

              </AuditPanel>


              <AuditPanel
                icon="◎"
                title={t("metricSocial")}
                subtitle={t("panelSocialSubtitle")}
                accentClass="text-pink-300"
              >

                <DetailItem
                  label={t("ogTitle")}
                  value={
                    isMissing(
                      result.social
                        ?.ogTitle
                    )
                      ? t("notFound")
                      : result.social!.ogTitle!
                  }
                  good={
                    !isMissing(
                      result.social
                        ?.ogTitle
                    )
                  }
                />


                <DetailItem
                  label={t("ogDescription")}
                  value={
                    isMissing(
                      result.social
                        ?.ogDescription
                    )
                      ? t("notFound")
                      : result.social!.ogDescription!
                  }
                  good={
                    !isMissing(
                      result.social
                        ?.ogDescription
                    )
                  }
                />

              </AuditPanel>

            </section>


            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {t("checksEyebrow")}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {t("checksTitle")}
                  </h2>

                </div>


                <div className="text-sm text-slate-500">
                  {t("checksCount", {
                    count: auditChecks.length,
                  })}
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
                title={t("passedTitle")}
                items={
                  derivedPassed
                }
                emptyText={t("passedEmpty")}
                itemsLabel={t("itemsCount", {
                  count: derivedPassed.length,
                })}
                type="success"
              />


              <StatusList
                icon="!"
                title={t("warningsTitle")}
                items={
                  derivedWarnings
                }
                emptyText={t("warningsEmpty")}
                itemsLabel={t("itemsCount", {
                  count: derivedWarnings.length,
                })}
                type="warning"
              />


              <StatusList
                icon="×"
                title={t("errorsTitle")}
                items={
                  derivedErrors
                }
                emptyText={t("errorsEmpty")}
                itemsLabel={t("itemsCount", {
                  count: derivedErrors.length,
                })}
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
                    {t("recsEyebrow")}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {t("recsTitle")}
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
                        title={t("recCardTitle")}
                        fix={getFixLink(
                          item,
                          result,
                          locale as FixLang
                        )}
                      />

                    )
                  )

                ) : (

                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4 text-sm text-emerald-300">
                    {t("recsEmpty")}
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

                <span aria-hidden="true">
                  ⇩
                </span>

                <span>
                  {t("download")}
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

                <span aria-hidden="true">
                  ↻
                </span>

                <span>
                  {t("newAnalysis")}
                </span>

              </button>

            </div>

          </div>

        )}


        <div className="print:hidden">

          <ShareTool
            title={tc("seoAnalyzer.title")}
            description={t("shareBody")}
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10 bg-slate-950 print:hidden">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              {t("introEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("introTitle")}
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-400">
              {t("introBody")}
            </p>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-2">

            <SEOInfoCard
              icon="⚙"
              title={t("info.1.title")}
              description={t("info.1.body")}
              items={[
                t("info.1.items.1"),
                t("info.1.items.2"),
                t("info.1.items.3"),
                t("info.1.items.4"),
              ]}
            />


            <SEOInfoCard
              icon="▤"
              title={t("info.2.title")}
              description={t("info.2.body")}
              items={[
                t("info.2.items.1"),
                t("info.2.items.2"),
                t("info.2.items.3"),
                t("info.2.items.4"),
              ]}
            />


            <SEOInfoCard
              icon="▣"
              title={t("info.3.title")}
              description={t("info.3.body")}
              items={[
                t("info.3.items.1"),
                t("info.3.items.2"),
                t("info.3.items.3"),
                t("info.3.items.4"),
              ]}
            />


            <SEOInfoCard
              icon="◎"
              title={t("info.4.title")}
              description={t("info.4.body")}
              items={[
                t("info.4.items.1"),
                t("info.4.items.2"),
                t("info.4.items.3"),
                t("info.4.items.4"),
              ]}
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
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

                {STEP_IDS.map((id) => (
                  <StepCard
                    key={id}
                    number={id}
                    title={t(`how${id}Title`)}
                    description={t(`how${id}Body`)}
                  />
                ))}

              </div>

            </div>

          </div>


          {/* WHY AUDITS MATTER */}

          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-center">

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

              {BENEFIT_IDS.map((id) => (
                <BenefitCard
                  key={id}
                  title={t(`benefit${id}Title`)}
                  description={t(`benefit${id}Body`)}
                />
              ))}

            </div>

          </div>

          {/* SEO ANALYZER VS SEO PAGE ANALYZER */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                {t("vsEyebrow")}
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                {t("vsTitle")}
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                {t("vsBody")}
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">

                <Link
                  href="/tools/seo-page-analyzer"
                  className="inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
                >
                  {tc("seoPageAnalyzer.title")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </Link>

              </div>

            </div>

          </div>
          {/* SEO GUIDES */}

          <div className="mt-16">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                {t("guidesEyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t("guidesTitle")}
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
                {t("guidesBody")}
              </p>

            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">

              <Link
                href="/blog/complete-seo-audit-guide"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  {t("guide1Tag")}
                </p>

                <h3 className="mt-3 text-lg font-semibold text-white transition group-hover:text-violet-300">
                  {t("guide1Title")}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {t("guide1Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-violet-300">
                  {t("guidesCta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>
              </Link>


              <Link
                href="/blog/technical-seo-guide"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  {t("guide2Tag")}
                </p>

                <h3 className="mt-3 text-lg font-semibold text-white transition group-hover:text-cyan-300">
                  {t("guide2Title")}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {t("guide2Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  {t("guidesCta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>
              </Link>


              <Link
                href="/blog/on-page-seo-checklist"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.05]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  {t("guide3Tag")}
                </p>

                <h3 className="mt-3 text-lg font-semibold text-white transition group-hover:text-emerald-300">
                  {t("guide3Title")}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {t("guide3Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-emerald-300">
                  {t("guidesCta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>
              </Link>

            </div>

          </div>

          {/* CONTINUE TECHNICAL SEO WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                {t("flowEyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t("flowTitle")}
              </h2>

              <p className="mt-4 leading-8 text-slate-400">
                {t("flowBody")}
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
                    {t("step1")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-emerald-300">
                  {tc("robotsTxtGenerator.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("flow1Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-emerald-300">
                  {t("flow1Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
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
                    {t("step2")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  {tc("xmlSitemapGenerator.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("flow2Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  {t("flow2Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>


              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.055] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-lg text-cyan-300">
                    ⌕
                  </div>

                  <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {t("step3Current")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {tc("seoAnalyzer.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("flow3Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  {t("flow3Cta")}{" "}
                  <span aria-hidden="true">✓</span>
                </div>

              </div>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/http-status-checker"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("httpStatusChecker.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/seo-page-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("seoPageAnalyzer.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/page-speed"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("pageSpeed.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/content-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("contentAnalyzer.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 font-bold text-violet-300" data-ltr-text>
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


function ScoreRing({
  score,
  label,
  outOf,
}: {
  score: number;
  label: string;
  outOf: string;
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
          {label}
        </div>


        <div className="mt-1 text-xs text-slate-600">
          {outOf}
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


      <span className="font-semibold text-white" data-ltr-text>
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
          aria-hidden="true"
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
        aria-hidden="true"
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
  itemsLabel,
  type,
}: {
  icon: string;
  title: string;
  items: string[];
  emptyText: string;
  itemsLabel: string;

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
          aria-hidden="true"
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
            {itemsLabel}
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
  title,
  fix,
}: {
  number: number;
  text: string;
  title: string;
  fix?: { href: string; label: string } | null;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-black/10 p-4 transition hover:border-violet-400/20 hover:bg-white/[0.04]">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-sm font-bold text-violet-300" data-ltr-text>
        {number}
      </div>


      <div>

        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>


        <p className="mt-1 text-sm leading-6 text-slate-400">
          {text}
        </p>

        {fix ? (
          <Link
            href={fix.href}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-400/20"
          >
            {fix.label}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}

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
