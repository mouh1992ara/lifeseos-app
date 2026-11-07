"use client";

import { useState } from "react";
import { errorCodeFrom, isUserValidationError, useToolOutcome } from "@/lib/use-tool-outcome";
import { useTranslations } from "next-intl";

import ShareTool from "@/components/share-tool";
import { errorCodeKey } from "@/lib/tool-errors";
import { Link } from "@/i18n/navigation";

type Result = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  redirected: boolean;
  ok: boolean;
};

const GROUP_CODES = ["2xx", "3xx", "4xx", "5xx"] as const;
const COMMON_CODES = ["200", "301", "302", "404", "410", "500", "503"] as const;
const BENEFITS = ["1", "2", "3", "4"] as const;
const REASONS = ["1", "2", "3", "4"] as const;
const STEPS = ["1", "2", "3", "4"] as const;
const FAQS = ["1", "2", "3", "4", "5"] as const;

const RELATED = [
  { href: "/tools/seo-analyzer", icon: "⌕", key: "seoAnalyzer" },
  { href: "/tools/seo-page-analyzer", icon: "◎", key: "seoPageAnalyzer" },
  { href: "/tools/xml-sitemap-generator", icon: "⌘", key: "xmlSitemapGenerator" },
  { href: "/tools/robots-txt-generator", icon: "🤖", key: "robotsTxtGenerator" },
  { href: "/tools/page-speed", icon: "⚡", key: "pageSpeed" },
  { href: "/tools/meta-tag-generator", icon: "<>", key: "metaTagGenerator" },
] as const;

export default function HttpStatusCheckerPage() {
  const { start: startOutcome } = useToolOutcome("http-status-checker");
  const t = useTranslations("Tool.httpStatus");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");
  const tRelated = useTranslations("ToolShared.related");
  const tErr = useTranslations("Errors");

  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);



  async function checkStatus() {
    const cleanUrl = url.trim();

    setError("");
    setResult(null);

    if (!cleanUrl) {
      setError(tErr("urlRequired"));
      return;
    }

    setLoading(true);

    // Validation passed: a real attempt, and the clock starts here.
    const op = startOutcome();

    try {
      const response = await fetch("/api/http-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        const key = errorCodeKey(data.code);
        setError(
          key && tErr.has(key)
            ? tErr(key)
            : data.error || tErr("generic")
        );
        
        if (!isUserValidationError(response.status)) {
          op.error(errorCodeFrom(data));
        }
        return;
      }

      setResult(data);
      op.success();
    } catch {
      setError(tErr("network"));
      op.error("INTERNAL");
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: number) {
    if (status >= 200 && status < 300) return "text-emerald-300";
    if (status >= 300 && status < 400) return "text-blue-300";
    if (status >= 400 && status < 500) return "text-amber-300";
    if (status >= 500) return "text-rose-300";
    return "text-slate-300";
  }

  return (
    <main data-tool-surface className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <span aria-hidden="true">↔</span>
            <span>{t("badge")}</span>
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
            htmlFor="http-status-url"
            className="text-sm font-semibold text-slate-200"
          >
            {t("urlLabel")}
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="http-status-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") checkStatus();
              }}
              placeholder={tCommon("urlPlaceholder")}
              dir="ltr"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
            />

            <button
              type="button"
              onClick={checkStatus}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("checking") : t("submit")}
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">{t("hint")}</p>

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

        {/* RESULT */}
        {result && (
          <section className="mt-8 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                {t("resultEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{t("resultTitle")}</h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {t("statusCode")}
                </p>
                <p
                  className={`mt-2 text-4xl font-bold ${getStatusColor(result.status)}`}
                  data-ltr-text
                >
                  {result.status}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {result.statusText || t("statusFallback")}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {t("redirectLabel")}
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {result.redirected ? tCommon("yes") : tCommon("no")}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {result.redirected ? t("redirectYesBody") : t("redirectNoBody")}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <UrlCard label={t("requestedUrl")} value={result.requestedUrl} />
              <UrlCard label={t("finalUrl")} value={result.finalUrl} />
            </div>
          </section>
        )}

        <div className="mt-10">
          <ShareTool title={tc("httpStatusChecker.title")} />
        </div>
      </section>

      {/* SEO CONTENT */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              {t("basicsEyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("basicsTitle")}
            </h2>
            <p className="mt-5 leading-8 text-slate-400">{t("basicsP1")}</p>
            <p className="mt-4 leading-8 text-slate-400">{t("basicsP2")}</p>
          </div>

          <div className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                {t("groupsEyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-bold">{t("groupsTitle")}</h2>
              <p className="mt-4 leading-7 text-slate-400">{t("groupsBody")}</p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {GROUP_CODES.map((code) => (
                <article
                  key={code}
                  className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6"
                >
                  <div
                    className="inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-bold text-cyan-300"
                    data-ltr-text
                  >
                    {code}
                  </div>
                  <h3 className="mt-5 text-lg font-bold">
                    {t(`groups.${code}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {t(`groups.${code}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                {t("commonEyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-bold">{t("commonTitle")}</h2>
              <p className="mt-4 leading-7 text-slate-400">{t("commonBody")}</p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {COMMON_CODES.map((code) => (
                <article
                  key={code}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-cyan-300" data-ltr-text>
                      {code}
                    </span>
                    <h3 className="font-semibold text-white">
                      {t(`codes.${code}.title`)}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {t(`codes.${code}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                {t("redirectEyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                {t("redirectTitle")}
              </h2>
              <p className="mt-5 leading-8 text-slate-400">{t("redirectP1")}</p>
              <p className="mt-4 leading-8 text-slate-400">{t("redirectP2")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"
                    aria-hidden="true"
                  >
                    ✓
                  </div>
                  <h3 className="mt-4 font-semibold">{t(`benefit${n}Title`)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {t(`benefit${n}Body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  {t("importanceEyebrow")}
                </p>
                <h2 className="mt-4 text-3xl font-bold">{t("importanceTitle")}</h2>
                <p className="mt-4 leading-7 text-slate-400">{t("importanceBody")}</p>
              </div>

              <div className="space-y-4">
                {REASONS.map((n) => (
                  <div
                    key={n}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 font-bold text-cyan-300"
                      data-ltr-text
                    >
                      {n}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {t(`reason${n}Title`)}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {t(`reason${n}Body`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                {t("howEyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-bold">{t("howTitle")}</h2>
            </div>

            <div className="mx-auto mt-8 max-w-3xl space-y-4">
              {STEPS.map((n) => (
                <div
                  key={n}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 font-bold text-violet-300"
                    data-ltr-text
                  >
                    {n}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t(`how${n}Title`)}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {t(`how${n}Body`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
              {t("faqEyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-bold">{t("faqTitle")}</h2>

            <div className="mt-8 divide-y divide-white/10">
              {FAQS.map((n) => (
                <article key={n} className="py-6 first:pt-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-white">
                    {t(`faq${n}Q`)}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-400">{t(`faq${n}A`)}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
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
                <Link
                  key={item.key}
                  href={item.href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
                    {item.icon}
                  </div>

                  <h3 className="mt-4 font-semibold text-white transition group-hover:text-cyan-300">
                    {tc(`${item.key}.title`)}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {tc(`${item.key}.short`)}
                  </p>

                  <div className="mt-4 text-sm font-semibold text-cyan-300">
                    {tCommon("openTool")}
                    <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function UrlCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-all text-sm leading-6 text-slate-300" data-ltr-text>
        {value}
      </p>
    </div>
  );
}