"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { errorCodeFrom, isUserValidationError, useToolOutcome } from "@/lib/use-tool-outcome";

import CwvDashboard, { parseMetric } from "@/components/cwv-dashboard";
import ShareTool from "@/components/share-tool";
import { errorCodeKey } from "@/lib/tool-errors";

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

type MetricStatusKey =
  | "scoreReview"
  | "scoreGood"
  | "scoreNeedsImprovement"
  | "scorePoor";

type ScoreKey =
  | "scoreUnavailable"
  | "scoreGood"
  | "scoreNeedsImprovement"
  | "scorePoor";

const RELATED = [
  { href: "/tools/seo-analyzer", icon: "⌕", key: "seoAnalyzer" },
  { href: "/tools/seo-page-analyzer", icon: "◎", key: "seoPageAnalyzer" },
  { href: "/tools/content-analyzer", icon: "▤", key: "contentAnalyzer" },
  { href: "/tools/meta-tag-generator", icon: "<>", key: "metaTagGenerator" },
  { href: "/tools/xml-sitemap-generator", icon: "⌘", key: "xmlSitemapGenerator" },
  { href: "/tools/http-status-checker", icon: "↔", key: "httpStatusChecker" },
] as const;

const STEPS = ["1", "2", "3", "4"] as const;
const BENEFITS = ["1", "2", "3", "4"] as const;
const METRIC_INFO = ["1", "2", "3", "4", "5", "6"] as const;
const METRIC_ABBREVIATIONS = ["Score", "FCP", "LCP", "CLS", "TBT", "SI"] as const;

export default function PageSpeedAnalyzerPage() {
  const t = useTranslations("Tool.pageSpeed");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");
  const tErr = useTranslations("Errors");
  const tRelated = useTranslations("ToolShared.related");

  const [url, setUrl] = useState("");
  const [result, setResult] =
    useState<PageSpeedResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [animatedScore, setAnimatedScore] =
    useState(0);

  const initialUrlHandledRef = useRef(false);
  const { start } = useToolOutcome("page-speed");

  async function analyzeSpeed(
    overrideUrl?: string
  ) {
    const cleanUrl =
      (overrideUrl ?? url).trim();

    setError("");
    setResult(null);

    if (!cleanUrl) {
      setError(tErr("urlRequired"));
      return;
    }

    setLoading(true);

    // Validation passed, so this is a real attempt by a real user.
    const op = start();

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
        const key = errorCodeKey(data.code);
        setError(
          key && tErr.has(key)
            ? tErr(key)
            : data.error || t("errorFallback")
        );
        /* A malformed or empty URL is the user's input problem, not a failed
           operation. Emitting tool_error here would make every typo look like
           an outage and would swamp the real failures. */
        if (!isUserValidationError(response.status)) {
          op.error(errorCodeFrom(data));
        }
        return;
      }

      setResult(data);
      op.success();
    } catch {
      setError(t("errorFallback"));
      // A thrown error has no category of its own; INTERNAL is honest about that.
      op.error("INTERNAL");
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

  function getScoreKey(
    score: number | null
  ): ScoreKey {
    if (score === null) {
      return "scoreUnavailable";
    }

    if (score >= 90) {
      return "scoreGood";
    }

    if (score >= 50) {
      return "scoreNeedsImprovement";
    }

    return "scorePoor";
  }

  function getMetricStatus(
    metric: string,
    value: string
  ): {
    key: MetricStatusKey;
    className: string;
  } {
    const numeric =
      Number.parseFloat(value);

    if (
      Number.isNaN(numeric)
    ) {
      return {
        key: "scoreReview",
        className:
          "border-white/10 bg-white/5 text-slate-400",
      };
    }

    if (
      metric ===
      "Cumulative Layout Shift"
    ) {
      if (numeric <= 0.1) {
        return {
          key: "scoreGood",
          className:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        };
      }

      if (numeric <= 0.25) {
        return {
          key: "scoreNeedsImprovement",
          className:
            "border-amber-400/20 bg-amber-400/10 text-amber-300",
        };
      }

      return {
        key: "scorePoor",
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
      limits[metric];

    if (!threshold) {
      return {
        key: "scoreReview",
        className:
          "border-white/10 bg-white/5 text-slate-400",
      };
    }

    if (seconds <= threshold[0]) {
      return {
        key: "scoreGood",
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      };
    }

    if (seconds <= threshold[1]) {
      return {
        key: "scoreNeedsImprovement",
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
      };
    }

    return {
      key: "scorePoor",
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
            ? t("recPerformance")
            : null,
          getMetricStatus(
            "Largest Contentful Paint",
            result.largestContentfulPaint
          ).key !== "scoreGood"
            ? t("recLcp")
            : null,
          getMetricStatus(
            "Cumulative Layout Shift",
            result.cumulativeLayoutShift
          ).key !== "scoreGood"
            ? t("recCls")
            : null,
          getMetricStatus(
            "Total Blocking Time",
            result.totalBlockingTime
          ).key !== "scoreGood"
            ? t("recTbt")
            : null,
        ].filter(
          (
            item
          ): item is string =>
            Boolean(item)
        )
      : [];

  const metrics = result
    ? [
        {
          id: "First Contentful Paint",
          label: t("metricFcpLabel"),
          value: result.firstContentfulPaint,
          description: t("metricFcpDesc"),
        },
        {
          id: "Largest Contentful Paint",
          label: t("metricLcpLabel"),
          value: result.largestContentfulPaint,
          description: t("metricLcpDesc"),
        },
        {
          id: "Cumulative Layout Shift",
          label: t("metricClsLabel"),
          value: result.cumulativeLayoutShift,
          description: t("metricClsDesc"),
        },
        {
          id: "Total Blocking Time",
          label: t("metricTbtLabel"),
          value: result.totalBlockingTime,
          description: t("metricTbtDesc"),
        },
        {
          id: "Speed Index",
          label: t("metricSiLabel"),
          value: result.speedIndex,
          description: t("metricSiDesc"),
        },
      ]
    : [];

  return (
    <main data-tool-surface className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <span aria-hidden="true">⚡</span>
            <span>
              {t("badge")}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}

            <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {t("subtitle")}
          </p>

        </div>


        {/* TOOL */}

        <section className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 sm:p-6">

          <label
            htmlFor="page-speed-url"
            className="text-sm font-semibold text-slate-200"
          >
            {t("urlLabel")}
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">

            <input
              id="page-speed-url"
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
                  void analyzeSpeed();
                }
              }}
              placeholder={tCommon("urlPlaceholder")}
              dir="ltr"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
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
                ? t("submitLoading")
                : t("submit")}
            </button>

          </div>

          <p className="mt-3 text-sm text-slate-500">
            {t("hint")}
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


        {/* SAMPLE DASHBOARD — shown before any analysis, clearly labelled demo */}
        {!result && (
          <div className="mt-8">
            <CwvDashboard
              headline={t("cwvHeadline")}
              score={92}
              scoreLabel={t("ringLabel")}
              scoreOutOf={t("ringOutOf")}
              demo
              demoLabel={t("cwvDemo")}
              note={t("cwvNote")}
              statusLabels={{
                good: t("scoreGood"),
                warn: t("scoreNeedsImprovement"),
                poor: t("scorePoor"),
                unknown: t("scoreUnavailable"),
              }}
              metrics={[
                { key: "lcp", label: t("metricLcpLabel"), value: "2.1", num: 2.1 },
                { key: "inp", label: t("cwvInpLabel"), value: "180", num: 180 },
                { key: "cls", label: t("metricClsLabel"), value: "0.04", num: 0.04 },
              ]}
            />
          </div>
        )}

        {/* RESULTS */}

        {result && (
          <div className="mt-10 space-y-6">

            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
                <div className="flex justify-center">
                  <CwvDashboard
                    headline={t("cwvHeadline")}
                    score={animatedScore}
                    scoreLabel={t("ringLabel")}
                    scoreOutOf={t("ringOutOf")}
                    demoLabel={t("cwvDemo")}
                    statusLabels={{
                      good: t("scoreGood"),
                      warn: t("scoreNeedsImprovement"),
                      poor: t("scorePoor"),
                      unknown: t("scoreUnavailable"),
                    }}
                    metrics={[
                      {
                        key: "lcp",
                        label: t("metricLcpLabel"),
                        value: result.largestContentfulPaint,
                        num: parseMetric(result.largestContentfulPaint),
                      },
                      {
                        key: "inp",
                        // Lighthouse lab data has no INP; show it as unavailable
                        // rather than inventing a number.
                        label: t("cwvInpLabel"),
                        value: "—",
                        num: null,
                      },
                      {
                        key: "cls",
                        label: t("metricClsLabel"),
                        value: result.cumulativeLayoutShift,
                        num: parseMetric(result.cumulativeLayoutShift),
                      },
                    ]}
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
                      {t(getScoreKey(
                        result.performanceScore
                      ))}
                    </span>

                    <span
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300"
                      data-ltr-text
                    >
                      {result.strategy}
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                    {t("resultTitle")}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    {t("resultBody")}
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-400">
                    <span className="me-2 text-slate-500">
                      {t("testedUrl")}
                    </span>
                    <span
                      className="break-all text-slate-200"
                      data-ltr-text
                    >
                      {result.finalUrl}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {metrics.map((metric) => {
                const status = getMetricStatus(
                  metric.id,
                  metric.value
                );

                return (
                  <MetricCard
                    key={metric.id}
                    label={metric.label}
                    value={metric.value}
                    description={
                      metric.description
                    }
                    status={{
                      label: t(status.key),
                      className: status.className,
                    }}
                  />
                );
              })}
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    {t("detailsEyebrow")}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {t("detailsTitle")}
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
                  {t("detailsBadge")}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <DetailCard
                  label={t("requestedUrl")}
                  value={result.requestedUrl}
                />

                <DetailCard
                  label={t("finalUrl")}
                  value={result.finalUrl}
                />

                <DetailCard
                  label={t("strategy")}
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
                    {t("recsEyebrow")}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {t("recsTitle")}
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

                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-sm font-bold text-amber-300"
                          data-ltr-text
                        >
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
                    {t("recNone")}
                  </div>

                )}

              </div>

            </section>

            <section className="rounded-[28px] border border-cyan-400/15 bg-cyan-400/[0.04] p-6 sm:p-8">

              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    {t("nextEyebrow")}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {t("nextTitle")}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    {t("nextBody")}
                  </p>
                </div>

                <Link
                  href={`/tools/seo-analyzer?url=${encodeURIComponent(
                    result.finalUrl
                  )}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200"
                >
                  {t("nextCta")}
                  <span aria-hidden="true" className="rtl:rotate-180">→</span>
                </Link>

              </div>

            </section>

          </div>
        )}


        <div className="mt-10">

          <ShareTool
            title={tc("pageSpeed.title")}
            description={t("shareDescription")}
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {t("infoEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("infoTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("infoBody")}
            </p>

          </div>


          {/* METRIC EXPLANATIONS */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {METRIC_INFO.map((n, index) => (
              <MetricInfoCard
                key={n}
                abbreviation={METRIC_ABBREVIATIONS[index]}
                title={t(`info${n}Title`)}
                description={t(`info${n}Body`)}
              />
            ))}

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
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

                {STEPS.map((number) => (
                  <StepCard
                    key={number}
                    number={number}
                    title={t(`how${number}Title`)}
                    description={t(`how${number}Body`)}
                  />
                ))}

              </div>

            </div>

          </div>


          {/* WHY SPEED MATTERS */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
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

              {BENEFITS.map((n) => (
                <BenefitCard
                  key={n}
                  title={t(`benefit${n}Title`)}
                  description={t(`benefit${n}Body`)}
                />
              ))}

            </div>

          </div>


          {/* RELATED TOOLS */}

          <div className="mt-20">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                  {tRelated("eyebrow")}
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  {tRelated("title")}
                </h2>

              </div>


              <Link
                href="/tools"
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                {tRelated("viewAll")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {RELATED.map((item) => (
                <RelatedToolCard
                  key={item.key}
                  href={item.href}
                  icon={item.icon}
                  title={tc(`${item.key}.title`)}
                  description={tc(`${item.key}.short`)}
                  openLabel={tCommon("openTool")}
                />
              ))}

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

      <p
        className="mt-4 text-2xl font-bold text-white"
        data-ltr-text
      >
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

      <p
        className="mt-2 break-all text-sm leading-6 text-slate-300"
        data-ltr-text
      >
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

      <div
        className="inline-flex rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300"
        data-ltr-text
      >
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

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 font-bold text-emerald-300"
        data-ltr-text
      >
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
  openLabel,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  openLabel: string;
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
        {openLabel}
        <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
          →
        </span>
      </div>

    </Link>
  );
}
