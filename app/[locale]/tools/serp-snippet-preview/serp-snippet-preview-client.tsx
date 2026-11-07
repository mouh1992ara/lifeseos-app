"use client";

import { Link } from "@/i18n/navigation";
import { hasRealOutput, useToolOutcome } from "@/lib/use-tool-outcome";
import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  ClipboardCopy,
  Copy,
  ExternalLink,
  FileText,
  Gauge,
  Globe2,
  Monitor,
  RefreshCcw,
  Search,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react";

type LengthStatus = {
  key: "statusEmpty" | "statusTooShort" | "statusGood" | "statusTooLong";
  className: string;
};

function getTitleStatus(length: number): LengthStatus {
  if (length === 0) return { key: "statusEmpty", className: "text-slate-500" };
  if (length < 30) return { key: "statusTooShort", className: "text-amber-300" };
  if (length <= 60) return { key: "statusGood", className: "text-emerald-300" };
  return { key: "statusTooLong", className: "text-red-300" };
}

function getDescriptionStatus(length: number): LengthStatus {
  if (length === 0) return { key: "statusEmpty", className: "text-slate-500" };
  if (length < 70) return { key: "statusTooShort", className: "text-amber-300" };
  if (length <= 160) return { key: "statusGood", className: "text-emerald-300" };
  return { key: "statusTooLong", className: "text-red-300" };
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "https://www.example.com/page";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getDisplayUrl(value: string) {
  try {
    const url = new URL(normalizeUrl(value));
    const path = url.pathname
      .split("/")
      .filter(Boolean)
      .slice(0, 3)
      .join(" › ");

    return path ? `${url.hostname} › ${path}` : url.hostname;
  } catch {
    return value.trim() || "www.example.com";
  }
}

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

const APPEARANCE_CARDS = [
  { icon: FileText, key: "feat1" },
  { icon: Gauge, key: "feat2" },
  { icon: Globe2, key: "feat3" },
  { icon: Monitor, key: "feat4" },
  { icon: Smartphone, key: "feat5" },
  { icon: ClipboardCopy, key: "feat6" },
] as const;

const HOW_STEPS = ["1", "2", "3", "4"] as const;

export default function SerpSnippetPreviewClient() {
  const { start: startOutcome } = useToolOutcome("serp-snippet-preview");
  const t = useTranslations("Tool.serpPreview");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");

  // Sample values are localized so the empty state reads in the visitor's language.
  const [title, setTitle] = useState(t("sampleTitle"));
  const [description, setDescription] = useState(t("sampleDescription"));
  const [url, setUrl] = useState("https://www.lifeseos.com/tools");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [copiedField, setCopiedField] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const titleStatus = useMemo(
    () => getTitleStatus(title.length),
    [title.length]
  );

  const descriptionStatus = useMemo(
    () => getDescriptionStatus(description.length),
    [description.length]
  );

  const displayUrl = useMemo(() => getDisplayUrl(url), [url]);

  const previewTitle = useMemo(
    () =>
      truncateText(
        title || t("previewTitleEmpty"),
        previewMode === "desktop" ? 68 : 62
      ),
    [title, previewMode, t]
  );

  const previewDescription = useMemo(
    () =>
      truncateText(
        description || t("previewDescriptionEmpty"),
        previewMode === "desktop" ? 165 : 150
      ),
    [description, previewMode, t]
  );

  function handleReset() {
    setTitle("");
    setDescription("");
    setUrl("");
    setPreviewMode("desktop");
    setCopiedField("");
  }

async function copyField(field: string, value: string) {
  if (!value.trim()) return;

  try {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);

    window.setTimeout(() => {
      setCopiedField("");
    }, 1800);
  } catch {
    setCopiedField("");
  }
}

  async function handleShare() {
    const shareData = {
      title: t("shareMessageTitle"),
      text: t("shareMessageText"),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);

      window.setTimeout(() => {
        setShareCopied(false);
      }, 1800);
    } catch {
      // Ignore cancelled share actions.
    }
  }

  /* One success per visit, and only for output the visitor caused.
     These tools recompute on every keystroke, so counting each change would
     record dozens of operations for one person typing. `hasRealOutput` stops an
     empty result counting, and the mount snapshot stops a non-empty default
     from being recorded as work nobody did. */
  const outcomeOutput = `${previewTitle}${previewDescription}${displayUrl}`.trim();
  const initialOutcomeOutput = useRef(outcomeOutput);
  const outcomeTrackedRef = useRef(false);
  useEffect(() => {
    if (outcomeTrackedRef.current) return;
    if (outcomeOutput === initialOutcomeOutput.current) return;
    if (!hasRealOutput(outcomeOutput)) return;
    outcomeTrackedRef.current = true;
    startOutcome().success();
  }, [outcomeOutput, startOutcome]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:px-10 lg:px-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[150px]" />
          <div className="absolute right-0 top-20 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-2 text-sm font-medium text-blue-300">
            <Search className="h-4 w-4" />
            {t("badge")}
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            {t("subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              {t("heroCheckDesktop")}
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              {t("heroCheckMobile")}
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              {t("heroCheckLength")}
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[.92fr_1.08fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {t("formTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t("formSubtitle")}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="page-title"
                    className="text-sm font-medium text-slate-200"
                  >
                    {t("titleLabel")}
                  </label>
                  <span className={`text-xs font-semibold ${titleStatus.className}`}>
                    <span data-ltr-text>{title.length} / 60</span> ·{" "}
                    {t(titleStatus.key)}
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="page-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={t("titlePlaceholder")}
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 pe-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />

                  {title ? (
                    <button
                      type="button"
                      onClick={() => copyField("title", title)}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-white"
                      aria-label={t("copyTitleAria")}
                    >
                      {copiedField === "title" ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {t("titleHint")}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="page-description"
                    className="text-sm font-medium text-slate-200"
                  >
                    {t("descriptionLabel")}
                  </label>
                  <span
                    className={`text-xs font-semibold ${descriptionStatus.className}`}
                  >
                    <span data-ltr-text>{description.length} / 160</span> ·{" "}
                    {t(descriptionStatus.key)}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    id="page-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    rows={6}
                    className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 p-4 pe-12 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />

                  {description ? (
                    <button
                      type="button"
                      onClick={() => copyField("description", description)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-white"
                      aria-label={t("copyDescriptionAria")}
                    >
                      {copiedField === "description" ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {t("descriptionHint")}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="page-url"
                    className="text-sm font-medium text-slate-200"
                  >
                    {t("pageUrlLabel")}
                  </label>
                  <span className="text-xs text-slate-500">
                    {t("charactersCount", { count: url.length })}
                  </span>
                </div>

                <div className="relative">
                  <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="page-url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder={t("urlPlaceholder")}
                    dir="ltr"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 ps-11 pe-4 text-start text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                    previewMode === "desktop"
                      ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  {t("modeDesktop")}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                    previewMode === "mobile"
                      ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  {t("modeMobile")}
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
              >
                <RefreshCcw className="h-4 w-4" />
                {t("reset")}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  {t("liveEyebrow")}
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {previewMode === "desktop"
                    ? t("desktopResult")
                    : t("mobileResult")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t("liveNote")}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                {previewMode === "desktop" ? (
                  <Monitor className="h-5 w-5 text-blue-400" />
                ) : (
                  <Smartphone className="h-5 w-5 text-blue-400" />
                )}
              </div>
            </div>

            <div
              className={`mx-auto mt-8 rounded-2xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl ${
                previewMode === "mobile" ? "max-w-[430px]" : "max-w-full"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <Globe2 className="h-4 w-4 text-slate-500" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-800" data-ltr-text>
                    {url ? normalizeUrl(url) : "https://www.example.com"}
                  </p>
                  <p className="truncate text-xs text-slate-500" data-ltr-text>
                    {displayUrl}
                  </p>
                </div>
              </div>

              <h3 className="mt-4 text-[20px] leading-7 text-[#1a0dab]">
                {previewTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {previewDescription}
              </p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <MetricCard
                icon={FileText}
                label={t("titleLengthLabel")}
                value={t("charsUnit", { count: title.length })}
                status={t(titleStatus.key)}
                statusClass={titleStatus.className}
              />
              <MetricCard
                icon={Gauge}
                label={t("descriptionLengthLabel")}
                value={t("charsUnit", { count: description.length })}
                status={t(descriptionStatus.key)}
                statusClass={descriptionStatus.className}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm font-semibold text-slate-200">
                {t("notesTitle")}
              </p>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                <div className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    {t("note1")}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    {t("note2")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
                <Share2 className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold">{t("shareHeading")}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {t("shareBody")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
            >
              {shareCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  {t("linkCopied")}
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  {t("shareTool")}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t("appearanceEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("appearanceTitle")}
            </h2>
            <p className="mt-5 leading-8 text-slate-400">
              {t("appearanceBody")}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {APPEARANCE_CARDS.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">
                    {t(`${item.key}Title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {t(`${item.key}Body`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-7 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                {t("howEyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                {t("howTitle")}
              </h2>
              <p className="mt-5 leading-8 text-slate-400">
                {t("howBody")}
              </p>
            </div>

            <div className="space-y-3">
              {HOW_STEPS.map((number) => (
                <div
                  key={number}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-sm font-bold text-blue-300"
                    data-ltr-text
                  >
                    {number}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {t(`how${number}Title`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      {t(`how${number}Body`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t("flowEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("flowTitle")}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-400">
              {t("flowBody")}
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Link
              href="/tools/meta-tag-generator"
              className="group relative rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                  {tCommon("step", { number: 1 })}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {tc("metaTagGenerator.title")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("flow1Body")}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition group-hover:text-blue-200">
                {t("flow1Cta")}
                <ExternalLink className="h-4 w-4" />
              </div>
            </Link>

            <div className="relative rounded-2xl border border-blue-400/30 bg-blue-400/[0.055] p-6 shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <Monitor className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {tCommon("step", { number: 2 })} · {t("stepCurrent")}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {tc("serpSnippetPreview.title")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("flow2Body")}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                {t("flow2Cta")}
                <Check className="h-4 w-4" />
              </div>
            </div>

            <Link
              href="/tools/seo-page-analyzer"
              className="group relative rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                  {tCommon("step", { number: 3 })}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {tc("seoPageAnalyzer.title")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("flow3Body")}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition group-hover:text-blue-200">
                {t("flow3Cta")}
                <ExternalLink className="h-4 w-4" />
              </div>
            </Link>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href="/tools/content-analyzer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-white/[0.05] hover:text-white"
            >
              <FileText className="h-4 w-4 text-blue-400" />
              {t("alsoAnalyze")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  status,
  statusClass,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  status: string;
  statusClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>

        <span className={`text-xs font-semibold ${statusClass}`}>
          {status}
        </span>
      </div>

      <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-100" data-ltr-text>
        {value}
      </p>
    </div>
  );
}
