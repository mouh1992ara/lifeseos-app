"use client";

import { Link } from "@/i18n/navigation";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

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

const CHECK_IDS = ["1", "2", "3", "4", "5", "6"] as const;
const STEP_IDS = ["1", "2", "3", "4"] as const;
const BENEFIT_IDS = ["1", "2", "3", "4"] as const;
const CHECK_ICONS = ["T", "D", "H", "C", "R", "ALT"] as const;

export default function SeoPageAnalyzerPage() {
  const t = useTranslations("Tool.seoPageAnalyzer");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");
  const tErr = useTranslations("Errors");

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
      setError(tErr("urlRequired"));
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
            t("errorFallback")
        );
        return;
      }

      await recordToolUseOnce();

      setResult(data);
    } catch {
      setError(
        t("errorFallback")
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
            <span aria-hidden="true">⌕</span>

            <span>
              {t("badge")}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
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
            htmlFor="seo-page-url"
            className="text-sm font-semibold text-slate-200"
          >
            {t("urlLabel")}
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">

            <input
              id="seo-page-url"
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
              placeholder={tCommon("urlPlaceholder")}
              dir="ltr"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
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
                ? t("submitLoading")
                : t("submit")}
            </button>

          </div>

          <p className="mt-3 text-sm text-slate-500">
            {t("hint")}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300"
            >
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
                label={t("metricStatus")}
                value={String(
                  result.status
                )}
              />

              <MetricCard
                label={t("metricH1")}
                value={String(
                  result.h1Count
                )}
              />

              <MetricCard
                label={t("metricLinks")}
                value={String(
                  result.totalLinks
                )}
              />

              <MetricCard
                label={t("metricPageSize")}
                value={t("pageSizeValue", {
                  size: result.pageSizeKb,
                })}
              />

            </section>


            <section className="grid gap-6 lg:grid-cols-2">

              <InfoCard
                title={t("infoTitle")}
                value={
                  result.title ||
                  t("noTitle")
                }
                note={t("charsCount", {
                  count: result.titleLength,
                })}
              />

              <InfoCard
                title={t("infoDescription")}
                value={
                  result.description ||
                  t("noDescription")
                }
                note={t("charsCount", {
                  count: result.descriptionLength,
                })}
              />

              <InfoCard
                title={t("infoCanonical")}
                value={
                  result.canonical ||
                  t("noCanonical")
                }
              />

              <InfoCard
                title={t("infoRobots")}
                value={
                  result.robots ||
                  t("noRobots")
                }
              />

            </section>


            <section className="grid gap-6 lg:grid-cols-2">

              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  {t("structureEyebrow")}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {t("structureTitle")}
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <SmallMetricCard
                    label={t("h1Count")}
                    value={String(
                      result.h1Count
                    )}
                  />

                  <SmallMetricCard
                    label={t("h2Count")}
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
                    {t("noH1")}
                  </p>

                )}

              </div>


              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  {t("imageEyebrow")}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {t("imageTitle")}
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <SmallMetricCard
                    label={t("totalImages")}
                    value={String(
                      result.totalImages
                    )}
                  />

                  <SmallMetricCard
                    label={t("missingAlt")}
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
                  {t("imageNote")}
                </p>

              </div>

            </section>


            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {t("urlEyebrow")}
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {t("urlTitle")}
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <UrlCard
                  label={t("requestedUrl")}
                  value={
                    result.requestedUrl
                  }
                />

                <UrlCard
                  label={t("finalUrl")}
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
            title={tc("seoPageAnalyzer.title")}
            description={t("shareBody")}
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              {t("introEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("introTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("introBody")}
            </p>

          </div>


          {/* WHAT IT CHECKS */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {CHECK_IDS.map((id, index) => (
              <CheckInfoCard
                key={id}
                icon={CHECK_ICONS[index]}
                title={t(`checks.${id}.title`)}
                description={t(`checks.${id}.body`)}
              />
            ))}

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

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


          {/* WHY ON-PAGE SEO MATTERS */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

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


          {/* CONTINUE SEO WORKFLOW */}

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
                href="/tools/meta-tag-generator"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-fuchsia-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 font-bold text-fuchsia-300" data-ltr-text>
                    T
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("step1")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-fuchsia-300">
                  {tc("metaTagGenerator.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("flow1Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-fuchsia-300">
                  {t("flow1Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>


              <Link
                href="/tools/serp-snippet-preview"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-lg text-blue-300">
                    ◫
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("step2")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  {tc("serpSnippetPreview.title")}
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


              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.05] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-lg text-cyan-300">
                    ⌕
                  </div>

                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {t("step3Current")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {tc("seoPageAnalyzer.title")}
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
                href="/tools/seo-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("seoAnalyzer.title")}
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
                href="/tools/page-speed"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("pageSpeed.title")}
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

      <p className="mt-2 text-2xl font-bold text-cyan-300" data-ltr-text>
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
        data-ltr-text
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

      <p className="mt-2 break-all text-sm leading-6 text-slate-300" data-ltr-text>
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

      <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2 text-xs font-bold text-cyan-300" data-ltr-text>
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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 font-bold text-cyan-300" data-ltr-text>
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
