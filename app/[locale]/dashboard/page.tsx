import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import PerformanceAnalytics from "@/components/dashboard/performance-analytics";
import { localizePath } from "@/i18n/config";
import {
  bucketReports,
  sampleBuckets,
  topSites,
} from "@/lib/dashboard-analytics";

export const dynamic = "force-dynamic";

type SEOReport = {
  id: string;
  url: string;
  score: number;
  grade: string | null;
  status: string | null;
  created_at: string;
};

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: reports, error } = await supabase
    .from("seo_reports")
    .select("id, url, score, grade, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const seoReports: SEOReport[] = reports ?? [];

  const t = await getTranslations("Dashboard");
  const lp = (path: string) => localizePath(locale as Parameters<typeof localizePath>[0], path);

  const totalAudits = seoReports.length;

  /* Average and best scores are computed inside the analytics component from
     the same buckets, so the KPIs and the chart can never disagree. */

  const latestReport = seoReports[0] ?? null;
  const previousReport = seoReports[1] ?? null;

  const uniqueWebsites = new Set(seoReports.map((r) => r.url)).size;

  const scoreChange =
    latestReport && previousReport
      ? Number(latestReport.score ?? 0) - Number(previousReport.score ?? 0)
      : null;

  /* Analytics: real rows only. With fewer than two audits there is nothing to
     plot, so the dashboard shows an explicitly labelled sample instead of an
     empty box — never a fabricated number passed off as real. */
  const trackedSites = topSites(seoReports, 2);
  const realBuckets = bucketReports(seoReports, trackedSites, locale);
  const useSample = realBuckets.length < 2;
  const sample = sampleBuckets(locale);
  const buckets = useSample ? sample.buckets : realBuckets;
  const siteLabels = useSample ? sample.sites : trackedSites;

  // Dates follow the active locale instead of a hardcoded en-US format.
  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <span aria-hidden="true">◉</span>
              <span>{t("badge")}</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {t("welcome")}
            </h1>

            <p className="mt-3 text-slate-400">
              {t("signedInAs")}{" "}
              <span className="text-slate-200" data-ltr-text>
                {user.email}
              </span>
            </p>
          </div>

          <Link
            href="/tools/seo-analyzer"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5"
          >
            {t("newAnalysis")}
          </Link>
        </div>

        <PerformanceAnalytics
          buckets={buckets}
          siteLabels={siteLabels}
          sample={useSample}
          siteCount={uniqueWebsites}
          labels={{
            eyebrow: t("perf.eyebrow"),
            title: t("perf.title"),
            subtitle: t("perf.subtitle"),
            rangeLabel: t("perf.rangeLabel"),
            ranges: {
              "24h": t("perf.range24h"),
              "7d": t("perf.range7d"),
              "28d": t("perf.range28d"),
              "90d": t("perf.range90d"),
            },
            chartTitle: t("perf.chartTitle"),
            chartHint: t("perf.chartHint"),
            seriesAverage: t("perf.seriesAverage"),
            seriesBest: t("perf.seriesBest"),
            kpiAudits: t("stats.totalAudits"),
            kpiAverage: t("stats.averageScore"),
            kpiBest: t("stats.bestScore"),
            kpiSites: t("stats.websites"),
            auditsUnit: t("perf.auditsUnit"),
            scoreUnit: t("perf.scoreUnit"),
            vsPrevious: t("perf.vsPrevious"),
            flat: t("perf.flat"),
            sampleBadge: t("perf.sampleBadge"),
            sampleNote: t("perf.sampleNote"),
            footnote: t("perf.footnote"),
            cta: t("newAnalysis"),
            ctaHref: lp("/tools/seo-analyzer"),
          }}
        />

        {latestReport && (
          <section className="relative mt-10 overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.018] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                    {t("latest.badge")}
                  </span>

                  {scoreChange !== null && (
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        scoreChange > 0
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : scoreChange < 0
                            ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                            : "border-white/10 bg-white/5 text-slate-400"
                      }`}
                      data-ltr-text
                    >
                      {scoreChange > 0
                        ? t("latest.changeUp", { change: scoreChange })
                        : scoreChange < 0
                          ? t("latest.changeDown", { change: scoreChange })
                          : t("latest.noChange")}
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                  {t("latest.title")}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  {t("latest.body")}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {t("latest.website")}
                  </p>
                  <p
                    className="mt-2 break-all font-medium text-slate-200"
                    data-ltr-text
                  >
                    {latestReport.url}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDate(latestReport.created_at)}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/reports/${latestReport.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
                  >
                    {t("latest.viewReport")}
                    <span aria-hidden="true" className="rtl:rotate-180">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/tools/seo-analyzer"
                    className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {t("latest.runNew")}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-sm text-slate-500">{t("latest.score")}</p>
                  <p className="mt-3 text-4xl font-bold text-white" data-ltr-text>
                    {Number(latestReport.score ?? 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t("latest.outOf100")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-sm text-slate-500">{t("latest.grade")}</p>
                  <p
                    className="mt-3 text-4xl font-bold text-violet-300"
                    data-ltr-text
                  >
                    {latestReport.grade ?? "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t("latest.gradeHint")}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{t("latest.status")}</p>
                      <p className="mt-2 font-semibold text-slate-200">
                        {latestReport.status ?? t("latest.statusUnknown")}
                      </p>
                    </div>

                    <StatusBadge
                      score={latestReport.score}
                      status={latestReport.status ?? t("latest.statusUnknown")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-300"
          >
            {t("loadError")}
          </div>
        )}

        <section className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {t("history.eyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{t("history.title")}</h2>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
              {t("history.count", { count: totalAudits })}
            </div>
          </div>

          {seoReports.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-2xl text-violet-300"
                aria-hidden="true"
              >
                ⌕
              </div>

              <h3 className="mt-5 text-xl font-semibold">{t("empty.title")}</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {t("empty.body")}
              </p>

              <Link
                href="/tools/seo-analyzer"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                {t("empty.cta")}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10 bg-black/10 text-start text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 text-start font-medium">
                      {t("table.website")}
                    </th>
                    <th className="px-6 py-4 text-start font-medium">
                      {t("table.score")}
                    </th>
                    <th className="px-6 py-4 text-start font-medium">
                      {t("table.grade")}
                    </th>
                    <th className="px-6 py-4 text-start font-medium">
                      {t("table.status")}
                    </th>
                    <th className="px-6 py-4 text-start font-medium">
                      {t("table.date")}
                    </th>
                    <th className="px-6 py-4 text-end font-medium">
                      {t("table.report")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {seoReports.map((report) => (
                    <tr
                      key={report.id}
                      className="group border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.04]"
                    >
                      <td className="px-6 py-5">
                        <Link
                          href={`/dashboard/reports/${report.id}`}
                          className="block max-w-xs truncate font-medium text-slate-200 transition group-hover:text-violet-300"
                          data-ltr-text
                        >
                          {report.url}
                        </Link>
                      </td>

                      <td className="px-6 py-5">
                        <ScoreBadge score={report.score} />
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold text-slate-200"
                          data-ltr-text
                        >
                          {report.grade ?? "-"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          score={report.score}
                          status={report.status ?? t("latest.statusUnknown")}
                        />
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(report.created_at)}
                      </td>

                      <td className="px-6 py-5 text-end">
                        <Link
                          href={`/dashboard/reports/${report.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:border-violet-400/30 hover:bg-violet-400/20 hover:text-violet-200"
                        >
                          <span>{t("table.viewReport")}</span>
                          <span aria-hidden="true" className="rtl:rotate-180">
                            →
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.02] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {t("account.eyebrow")}
          </p>

          <h2 className="mt-2 text-xl font-semibold">{t("account.title")}</h2>

          <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {t("account.email")}
            </p>
            <p
              className="mt-2 break-all font-medium text-emerald-300"
              data-ltr-text
            >
              {user.email}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const safeScore = Number(score ?? 0);

  const className =
    safeScore >= 80
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : safeScore >= 60
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border-rose-400/20 bg-rose-400/10 text-rose-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${className}`}
      data-ltr-text
    >
      {safeScore}/100
    </span>
  );
}

function StatusBadge({ score, status }: { score: number; status: string }) {
  const className =
    score >= 80
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : score >= 60
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border-rose-400/20 bg-rose-400/10 text-rose-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}