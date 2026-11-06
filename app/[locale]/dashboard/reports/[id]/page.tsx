import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { requireVerifiedUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

type ReportData = {
  url?: string;
  score?: number;
  grade?: string;
  status?: string;
  title?: string;
  description?: string;
  h1?: string;
  canonical?: string;
  robots?: string;

  images?: {
    total?: number;
    missingAlt?: number;
  };

  social?: {
    ogTitle?: string;
    ogDescription?: string;
  };

  passed?: string[];
  warnings?: string[];
  errors?: string[];
  recommendations?: string[];
};

type SEOReport = {
  id: string;
  url: string;
  score: number;
  grade: string | null;
  status: string | null;
  report_data: ReportData | null;
  created_at: string;
};

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function SEOReportPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Dashboard.report");

  const supabase = await createClient();

  // Confirmed address required: a saved report is private data.
  const user = await requireVerifiedUser("/dashboard");

  const { data: report, error } = await supabase
    .from("seo_reports")
    .select(
      `
        id,
        url,
        score,
        grade,
        status,
        report_data,
        created_at
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !report) {
    notFound();
  }

  const seoReport = report as SEOReport;

  const data = seoReport.report_data ?? {};

  const score = Number(data.score ?? seoReport.score ?? 0);

  const grade = data.grade ?? seoReport.grade ?? getGrade(score);

  const rawStatus = data.status ?? seoReport.status ?? null;

  const status = rawStatus ?? t("statusUnknown");

  const passed = data.passed ?? [];
  const warnings = data.warnings ?? [];
  const errors = data.errors ?? [];
  const recommendations = data.recommendations ?? [];

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden="true" className="rtl:rotate-180">
              ←
            </span>
            <span>{t("back")}</span>
          </Link>

          <div className="text-sm text-slate-500">
            {t("analyzedOn")} {formatDate(seoReport.created_at)}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[240px_1fr]">
            <div className="flex justify-center">
              <ScoreRing
                score={score}
                label={t("score")}
                outOfLabel={t("outOf100")}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                    score,
                  )}`}
                  data-ltr-text={rawStatus ? "" : undefined}
                >
                  {status}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {t("gradeLabel")} <span data-ltr-text>{grade}</span>
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {t("eyebrow")}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {t("title")}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                {t("intro")}
              </p>

              <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {t("website")}
                </p>

                <p
                  className="mt-1 break-all text-sm font-medium text-slate-200"
                  data-ltr-text
                >
                  {seoReport.url}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label={t("fields.pageTitle")}
            value={data.title || t("fields.noTitle")}
          />

          <InfoCard
            label={t("fields.h1")}
            value={data.h1 || t("fields.noH1")}
          />

          <InfoCard
            label={t("fields.canonical")}
            value={data.canonical || t("fields.notFound")}
            ltr={Boolean(data.canonical)}
          />

          <InfoCard
            label={t("fields.robots")}
            value={data.robots || t("fields.notFound")}
            ltr={Boolean(data.robots)}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <ReportPanel
            title={t("sections.contentSeo")}
            subtitle={t("sections.contentSeoBody")}
          >
            <DetailItem
              label={t("labels.title")}
              value={data.title || t("fields.noTitle")}
            />

            <DetailItem
              label={t("labels.metaDescription")}
              value={data.description || t("fields.noDescription")}
            />

            <DetailItem
              label={t("labels.h1")}
              value={data.h1 || t("fields.noH1")}
            />
          </ReportPanel>

          <ReportPanel
            title={t("sections.imageSeo")}
            subtitle={t("sections.imageSeoBody")}
          >
            <StatLine
              label={t("labels.totalImages")}
              value={String(data.images?.total ?? 0)}
            />

            <StatLine
              label={t("labels.missingAlt")}
              value={String(data.images?.missingAlt ?? 0)}
            />
          </ReportPanel>

          <ReportPanel
            title={t("sections.socialSeo")}
            subtitle={t("sections.socialSeoBody")}
          >
            <DetailItem
              label={t("labels.ogTitle")}
              value={data.social?.ogTitle || t("fields.notFound")}
              ltr={Boolean(data.social?.ogTitle)}
            />

            <DetailItem
              label={t("labels.ogDescription")}
              value={data.social?.ogDescription || t("fields.notFound")}
              ltr={Boolean(data.social?.ogDescription)}
            />
          </ReportPanel>

          <ReportPanel
            title={t("sections.technicalSeo")}
            subtitle={t("sections.technicalSeoBody")}
          >
            <DetailItem
              label={t("labels.canonicalUrl")}
              value={data.canonical || t("fields.notFound")}
              ltr={Boolean(data.canonical)}
            />

            <DetailItem
              label={t("labels.robotsMeta")}
              value={data.robots || t("fields.notFound")}
              ltr={Boolean(data.robots)}
            />
          </ReportPanel>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <StatusList
            title={t("passed")}
            items={passed}
            countLabel={t("items", { count: passed.length })}
            type="success"
            emptyText={t("noPassed")}
          />

          <StatusList
            title={t("warnings")}
            items={warnings}
            countLabel={t("items", { count: warnings.length })}
            type="warning"
            emptyText={t("noWarnings")}
          />

          <StatusList
            title={t("errors")}
            items={errors}
            countLabel={t("items", { count: errors.length })}
            type="error"
            emptyText={t("noErrors")}
          />
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/70">
              {t("actionPlan")}
            </p>

            <h2 className="mt-2 text-2xl font-bold">{t("recommendations")}</h2>
          </div>

          <div className="mt-6 space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-black/10 p-4"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-sm font-bold text-violet-300"
                    data-ltr-text
                  >
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {t("improvement")}
                    </h3>

                    <p
                      className="mt-1 text-sm leading-6 text-slate-400"
                      data-ltr-text
                    >
                      {item}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4 text-sm text-emerald-300">
                {t("noRecommendations")}
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tools/seo-analyzer"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5"
          >
            {t("newAnalysis")}
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {t("back")}
          </Link>
        </div>
      </div>
    </main>
  );
}

function ScoreRing({
  score,
  label,
  outOfLabel,
}: {
  score: number;
  label: string;
  outOfLabel: string;
}) {
  const safeScore = Math.max(0, Math.min(100, score));

  const color =
    safeScore >= 80 ? "#34d399" : safeScore >= 60 ? "#facc15" : "#fb7185";

  return (
    <div
      className="relative flex h-48 w-48 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${
          safeScore * 3.6
        }deg, rgba(51,65,85,0.45) 0deg)`,
      }}
    >
      <div className="absolute inset-[12px] rounded-full bg-slate-950 shadow-inner shadow-black/50" />

      <div className="relative text-center">
        <div className="text-5xl font-bold" style={{ color }} data-ltr-text>
          {safeScore}
        </div>

        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </div>

        <div className="mt-1 text-xs text-slate-600">{outOfLabel}</div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className="mt-3 break-words text-sm font-medium leading-6 text-slate-200"
        data-ltr-text={ltr ? "" : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function ReportPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>

      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className="mt-2 break-words text-sm leading-6 text-slate-200"
        data-ltr-text={ltr ? "" : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>

      <span className="font-semibold text-white" data-ltr-text>
        {value}
      </span>
    </div>
  );
}

function StatusList({
  title,
  items,
  countLabel,
  type,
  emptyText,
}: {
  title: string;
  items: string[];
  countLabel: string;
  type: "success" | "warning" | "error";
  emptyText: string;
}) {
  const styles = {
    success: {
      title: "text-emerald-300",
      container: "border-emerald-400/10 bg-emerald-400/[0.04]",
    },
    warning: {
      title: "text-amber-300",
      container: "border-amber-400/10 bg-amber-400/[0.04]",
    },
    error: {
      title: "text-rose-300",
      container: "border-rose-400/10 bg-rose-400/[0.04]",
    },
  };

  const style = styles[type];

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
      <h2 className={`text-lg font-semibold ${style.title}`}>{title}</h2>

      <p className="mt-1 text-xs text-slate-500">{countLabel}</p>

      <div className="mt-5 space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className={`rounded-2xl border px-4 py-3 text-sm leading-6 text-slate-300 ${style.container}`}
              data-ltr-text
            >
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function getGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getStatusBadgeClass(score: number) {
  if (score >= 80) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (score >= 60) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-rose-400/20 bg-rose-400/10 text-rose-300";
}
