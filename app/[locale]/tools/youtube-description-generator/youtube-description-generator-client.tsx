"use client";

import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { buildDescriptions, hashtagsFor, type DescriptionStyleKey } from "@/lib/content-i18n";

import { useMemo, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import {
  Check,
  ClipboardCopy,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Lightbulb,
  Link2,
  ListChecks,
  Play,
  Share2,
  Sparkles,
  Target,
  TextQuote,
  Users,
  Youtube,
} from "lucide-react";

type DescriptionStyle =
  | "Balanced"
  | "SEO Focused"
  | "Professional"
  | "Friendly"
  | "Short"
  | "Detailed";

type GeneratedDescription = {
  label: string;
  description: string;
};

const DESCRIPTION_STYLES: DescriptionStyle[] = [
  "Balanced",
  "SEO Focused",
  "Professional",
  "Friendly",
  "Short",
  "Detailed",
];

const STYLE_KEYS: Record<DescriptionStyle, string> = {
  Balanced: "balanced",
  "SEO Focused": "seoFocused",
  Professional: "professional",
  Friendly: "friendly",
  Short: "short",
  Detailed: "detailed",
};

// Generated descriptions keep their English label as an identifier; the chip is
// rendered through the translated `labels.*` map.
const LABEL_KEYS: Record<string, string> = {
  Balanced: "balanced",
  Educational: "educational",
  "Creator Friendly": "creatorFriendly",
  "SEO Focused": "seoFocused",
  "Search Friendly": "searchFriendly",
  "Keyword Rich": "keywordRich",
  Professional: "professional",
  Structured: "structured",
  "Expert Tone": "expertTone",
  Friendly: "friendly",
  Conversational: "conversational",
  Approachable: "approachable",
  Short: "short",
  Compact: "compact",
  Minimal: "minimal",
  Detailed: "detailed",
  "In-Depth": "inDepth",
  Comprehensive: "comprehensive",
};

function cleanText(value: string) {

  return value.trim().replace(/\s+/g, " ");

}



function buildHashtags(topic: string, keyword: string, locale: Locale) {
  // The old version slugified to [a-z0-9], which emptied Arabic and Chinese
  // topics and left only English tags. The shared generator keeps each script.
  return hashtagsFor(topic, keyword, locale, 5);
}

export default function YouTubeDescriptionGeneratorClient() {
  const t = useTranslations("Tool.youtubeDescriptionGenerator");
  const locale = useLocale() as Locale;
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");
  const tRelated = useTranslations("ToolShared.related");

  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState<DescriptionStyle>("Balanced");
  const [cta, setCta] = useState("");
  const [results, setResults] = useState<GeneratedDescription[]>([]);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const hashtags = useMemo(
    () => buildHashtags(topic, keyword, locale),
    [topic, keyword, locale]
  );

  const descriptionLength = selectedDescription.length;
  const wordCount = cleanText(selectedDescription)
    ? cleanText(selectedDescription).split(/\s+/).length
    : 0;

  const hasKeyword =
    !!cleanText(keyword) &&
    selectedDescription
      .toLowerCase()
      .includes(cleanText(keyword).toLowerCase());

  function handleGenerate() {
    setError("");

    if (!cleanText(topic)) {
      setError(t("errorTopicRequired"));
      return;
    }

    // Localized generation: the shared builder writes in the current language
    // instead of translating English templates word for word.
    const localized = buildDescriptions({
      topic,
      keyword,
      audience,
      cta,
      locale,
      style: STYLE_KEYS[style] as DescriptionStyleKey,
    });

    const generated = localized.map((description) => ({
      label: style,
      description,
    }));

    setResults(generated);
    setSelectedDescription(generated[0]?.description ?? "");

    void fetch("/api/tool-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool_name: "YouTube Description Generator",
      }),
    }).catch(() => {
      // Tracking should never interrupt the tool.
    });
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      window.setTimeout(() => {
        setCopiedText("");
      }, 1800);
    } catch {
      setCopiedText("");
    }
  }

  async function handleCopyAll() {
    if (!selectedDescription) return;

    const fullText = `${selectedDescription}\n\n${hashtags.join(" ")}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedText("__full__");

      window.setTimeout(() => {
        setCopiedText("");
      }, 1800);
    } catch {
      setCopiedText("");
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}

      <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:px-10 lg:px-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-red-600/15 blur-[150px]" />
          <div className="absolute right-0 top-20 h-[320px] w-[320px] rounded-full bg-rose-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/5 px-4 py-2 text-sm font-medium text-red-300">
            <Youtube className="h-4 w-4" />
            {t("badge")}
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}
            <span className="block bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            {t("subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-400" />
              {t("perks.free")}
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-400" />
              {t("perks.styles")}
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-400" />
              {t("perks.hashtags")}
            </span>
          </div>
        </div>
      </section>

      {/* GENERATOR */}

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10">
                <FileText className="h-5 w-5 text-red-400" />
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
                <label
                  htmlFor="description-topic"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("topicLabel")}
                </label>

                <input
                  id="description-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder={t("topicPlaceholder")}
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-start text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="description-keyword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("keywordLabel")}
                  <span className="ms-2 text-slate-500">{tCommon("optional")}</span>
                </label>

                <input
                  id="description-keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder={t("keywordPlaceholder")}
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-start text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="description-style"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("styleLabel")}
                </label>

                <select
                  id="description-style"
                  value={style}
                  onChange={(event) =>
                    setStyle(event.target.value as DescriptionStyle)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                >
                  {DESCRIPTION_STYLES.map((item) => (
                    <option key={item} value={item}>
                      {t(`styles.${STYLE_KEYS[item]}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="description-audience"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("audienceLabel")}
                  <span className="ms-2 text-slate-500">{tCommon("optional")}</span>
                </label>

                <input
                  id="description-audience"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder={t("audiencePlaceholder")}
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-start text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="description-cta"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("ctaLabel")}
                  <span className="ms-2 text-slate-500">{tCommon("optional")}</span>
                </label>

                <input
                  id="description-cta"
                  value={cta}
                  onChange={(event) => setCta(event.target.value)}
                  placeholder={t("ctaPlaceholder")}
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-start text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGenerate}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-red-400 hover:shadow-[0_12px_35px_rgba(239,68,68,0.2)]"
              >
                <Sparkles className="h-4 w-4" />
                {t("submit")}
              </button>
            </div>
          </div>

          {/* PREVIEW */}

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                  {t("previewEyebrow")}
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {t("previewTitle")}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {t("previewDesc")}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10">
                <Youtube className="h-5 w-5 text-red-400" />
              </div>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-xl">
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black">
                <div className="absolute inset-0">
                  <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
                  <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />
                </div>

                <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
                  {t("previewBadge")}
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_12px_40px_rgba(239,68,68,0.35)]">
                    <Play className="ms-1 h-7 w-7 fill-white text-white" />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur">
                    {t("previewTag")}
                  </span>

                  <span className="rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                    8:42
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-lg">
                    <Youtube className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-300"
                      data-ltr-text
                    >
                      {selectedDescription || t("previewEmpty")}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {hashtags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium text-blue-300"
                          data-ltr-text
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-200">
                {t("quickTitle")}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {t("quickHint")}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {t("stats.characters")}
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-lg font-semibold">
                      {descriptionLength}
                    </span>
                    <TextQuote className="h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {t("stats.words")}
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-lg font-semibold">{wordCount}</span>
                    <ListChecks className="h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {t("stats.keyword")}
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <Target className="h-5 w-5 text-slate-400" />

                    <span
                      className={`text-xs font-medium ${
                        !cleanText(keyword)
                          ? "text-slate-500"
                          : hasKeyword
                            ? "text-emerald-300"
                            : "text-amber-300"
                      }`}
                    >
                      {!cleanText(keyword)
                        ? t("keywordStatus.notSet")
                        : hasKeyword
                          ? t("keywordStatus.found")
                          : t("keywordStatus.missing")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}

      {results.length > 0 ? (
        <>
          <section className="px-6 pb-20 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                    {t("resultsEyebrow")}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    {t("resultsTitle")}
                  </h2>

                  <p className="mt-3 max-w-2xl text-slate-400">
                    {t("resultsDesc")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/30 hover:bg-white/[0.05]"
                >
                  {copiedText === "__full__" ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      {tCommon("copied")}
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="h-4 w-4" />
                      {t("copyAll")}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-10 grid gap-5">
                {results.map((item) => {
                  const isSelected =
                    item.description === selectedDescription;
                  const isCopied = copiedText === item.description;

                  return (
                    <div
                      key={item.label}
                      className={`rounded-2xl border p-6 transition ${
                        isSelected
                          ? "border-red-400/35 bg-red-400/[0.045]"
                          : "border-white/10 bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDescription(item.description)
                          }
                          className="flex-1 text-start"
                        >
                          <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">
                            {t(`labels.${LABEL_KEYS[item.label]}`)}
                          </span>

                          <p
                            className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300"
                            data-ltr-text
                          >
                            {item.description}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.description)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-400/30 hover:text-white"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-400" />
                              {tCommon("copied")}
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              {tCommon("copy")}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* HASHTAGS + CTA */}

          <section className="px-6 pb-20 sm:px-10 lg:px-16">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                    <Hash className="h-5 w-5 text-red-400" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
                      {t("hashtagsEyebrow")}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      {t("hashtagsTitle")}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleCopy(tag)}
                      className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-blue-300 transition hover:border-red-400/30"
                      data-ltr-text
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                    <Lightbulb className="h-5 w-5 text-amber-300" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                      {t("ctaTipEyebrow")}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      {t("ctaTipTitle")}
                    </h2>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-7 text-slate-400">
                  {t("ctaTipBody")}
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {/* SHARE TOOL */}

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10">
                <Share2 className="h-5 w-5 text-red-400" />
              </div>

              <div>
                <h2 className="font-semibold">{t("shareTitle")}</h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {t("shareDesc")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/30 hover:bg-white/[0.05] hover:text-white"
            >
              {shareCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  {t("linkCopied")}
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  {t("shareButton")}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* DESCRIPTION FACTORS */}

      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              {t("factorsEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("factorsTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("factorsBody")}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Target,
                key: "topicRelevance",
              },
              {
                icon: FileText,
                key: "clearStructure",
              },
              {
                icon: Link2,
                key: "usefulLinks",
              },
              {
                icon: Users,
                key: "audienceFit",
              },
              {
                icon: Hash,
                key: "hashtags",
              },
              {
                icon: Sparkles,
                key: "callToAction",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-red-400/25 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10">
                    <Icon className="h-5 w-5 text-red-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {t(`factors.${item.key}.title`)}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {t(`factors.${item.key}.text`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-7 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
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
              {[
                {
                  number: "1",
                },
                {
                  number: "2",
                },
                {
                  number: "3",
                },
                {
                  number: "4",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-400/10 text-sm font-bold text-red-300">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {t(`steps.${step.number}.title`)}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      {t(`steps.${step.number}.text`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY DESCRIPTIONS MATTER */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              {t("whyEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
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
            {[
              {
                key: "explainVideo",
              },
              {
                key: "relevance",
              },
              {
                key: "resources",
              },
              {
                key: "nextAction",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
              >
                <Check className="h-5 w-5 text-emerald-400" />

                <h3 className="mt-4 font-semibold">
                  {t(`benefits.${item.key}.title`)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {t(`benefits.${item.key}.text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED TOOLS */}

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                {tRelated("eyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {tRelated("title")}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                {t("relatedBody")}
              </p>
            </div>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-300 transition hover:text-red-200"
            >
              {tRelated("viewAll")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/tools/youtube-title-generator"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <Sparkles className="h-5 w-5 text-red-400" />
              </div>

              <h3 className="mt-5 font-semibold">
                {tc("youtubeTitleGenerator.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("relTitleGeneratorBody")}
              </p>
            </Link>

            <Link
              href="/tools/youtube-title-analyzer"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <Target className="h-5 w-5 text-red-400" />
              </div>

              <h3 className="mt-5 font-semibold">
                {tc("youtubeTitleAnalyzer.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("relTitleAnalyzerBody")}
              </p>
            </Link>

            <Link
              href="/tools/youtube-keyword-ideas"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <Hash className="h-5 w-5 text-red-400" />
              </div>

              <h3 className="mt-5 font-semibold">
                {tc("youtubeKeywordIdeas.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("relKeywordIdeasBody")}
              </p>
            </Link>

            <div className="rounded-2xl border border-red-400/25 bg-red-400/[0.045] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <FileText className="h-5 w-5 text-red-400" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <h3 className="font-semibold">
                  {tc("youtubeDescriptionGenerator.title")}
                </h3>

                <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                  {t("currentBadge")}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("relDescriptionBody")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
