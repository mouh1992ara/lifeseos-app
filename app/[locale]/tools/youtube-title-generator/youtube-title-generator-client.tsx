"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  Check,
  Compass,
  Copy,
  ExternalLink,
  FileText,
  Lightbulb,
  MousePointerClick,
  Play,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Tags,
  Target,
  TextCursorInput,
  Users,
  Youtube,
} from "lucide-react";

type TitleStyle =
  | "SEO Focused"
  | "How-To"
  | "Curiosity"
  | "List"
  | "Beginner Friendly"
  | "Professional";

type GeneratedTitle = {
  title: string;
  style: TitleStyle;
};

const TITLE_STYLES: TitleStyle[] = [
  "SEO Focused",
  "How-To",
  "Curiosity",
  "List",
  "Beginner Friendly",
  "Professional",
];

const STYLE_KEYS: Record<TitleStyle, string> = {
  "SEO Focused": "seoFocused",
  "How-To": "howTo",
  Curiosity: "curiosity",
  List: "list",
  "Beginner Friendly": "beginnerFriendly",
  Professional: "professional",
};

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) =>
      word.length > 0
        ? `${word.charAt(0).toUpperCase()}${word.slice(1)}`
        : word
    )
    .join(" ");
}

function generateTitles(
  topic: string,
  keyword: string,
  style: TitleStyle,
  audience: string
): GeneratedTitle[] {
  const cleanTopic = titleCase(cleanText(topic));
  const cleanKeyword = titleCase(cleanText(keyword || topic));
  const cleanAudience = cleanText(audience);

  const audienceText = cleanAudience ? ` for ${cleanAudience}` : "";

  const templates: Record<TitleStyle, string[]> = {
    "SEO Focused": [
      `${cleanKeyword}: Complete Guide to ${cleanTopic}`,
      `How to Improve ${cleanKeyword}${audienceText}`,
      `${cleanKeyword} Explained: What You Need to Know`,
      `Best Ways to Improve ${cleanKeyword}`,
      `${cleanTopic}: A Practical Guide to Better Results`,
      `How ${cleanKeyword} Can Help You Improve ${cleanTopic}`,
      `${cleanKeyword} Tips You Should Know`,
      `The Complete ${cleanKeyword} Guide${audienceText}`,
      `${cleanTopic} Strategy: Improve Your ${cleanKeyword}`,
      `Master ${cleanKeyword}: A Step-by-Step Guide`,
    ],

    "How-To": [
      `How to ${cleanTopic}`,
      `How to Improve ${cleanKeyword} Step by Step`,
      `How to Get Better Results with ${cleanKeyword}`,
      `How to Master ${cleanTopic}${audienceText}`,
      `How to Start with ${cleanKeyword}`,
      `How to Use ${cleanKeyword} the Right Way`,
      `How to Improve ${cleanTopic} Without Overcomplicating It`,
      `How to Get Started with ${cleanTopic}`,
      `How to Fix Common ${cleanKeyword} Mistakes`,
      `How to Make ${cleanTopic} Work Better`,
    ],

    Curiosity: [
      `Why Your ${cleanKeyword} Is Not Working`,
      `The Truth About ${cleanTopic}`,
      `What Nobody Tells You About ${cleanKeyword}`,
      `Are You Making These ${cleanKeyword} Mistakes?`,
      `The Biggest Mistake People Make with ${cleanTopic}`,
      `Why Most People Get ${cleanKeyword} Wrong`,
      `What Happens When You Improve ${cleanKeyword}?`,
      `The Hidden Problem with ${cleanTopic}`,
      `Is ${cleanKeyword} Really Worth It?`,
      `The Simple Change That Can Improve ${cleanTopic}`,
    ],

    List: [
      `7 Ways to Improve ${cleanKeyword}`,
      `10 ${cleanKeyword} Tips You Should Know`,
      `5 Common ${cleanKeyword} Mistakes to Avoid`,
      `8 Simple Ways to Improve ${cleanTopic}`,
      `6 Things You Need to Know About ${cleanKeyword}`,
      `9 Powerful ${cleanKeyword} Tips${audienceText}`,
      `5 Easy Steps to Better ${cleanTopic}`,
      `7 ${cleanKeyword} Strategies That Actually Make Sense`,
      `10 Ideas to Improve ${cleanTopic}`,
      `6 Practical Tips for Better ${cleanKeyword}`,
    ],

    "Beginner Friendly": [
      `${cleanKeyword} for Beginners: Start Here`,
      `A Beginner's Guide to ${cleanTopic}`,
      `${cleanTopic} Made Simple`,
      `How to Start with ${cleanKeyword} as a Beginner`,
      `${cleanKeyword} Explained for Beginners`,
      `Everything Beginners Need to Know About ${cleanTopic}`,
      `Simple ${cleanKeyword} Tips for Beginners`,
      `Getting Started with ${cleanTopic}`,
      `${cleanKeyword} Basics: A Simple Guide`,
      `Learn ${cleanTopic} Step by Step`,
    ],

    Professional: [
      `A Practical Guide to ${cleanTopic}`,
      `${cleanKeyword}: Strategies, Tips and Best Practices`,
      `Improving ${cleanKeyword}: A Professional Approach`,
      `${cleanTopic}: Key Strategies for Better Results`,
      `A Strategic Approach to ${cleanKeyword}`,
      `${cleanKeyword} Best Practices${audienceText}`,
      `How to Build a Strong ${cleanKeyword} Strategy`,
      `${cleanTopic}: Practical Insights and Recommendations`,
      `Optimizing ${cleanKeyword} for Better Performance`,
      `A Complete Framework for ${cleanTopic}`,
    ],
  };

  return templates[style].map((title) => ({
    title,
    style,
  }));
}

function getLengthStatus(length: number) {
  if (length < 35) {
    return {
      key: "short",
      className: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    };
  }

  if (length <= 65) {
    return {
      key: "good",
      className:
        "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    };
  }

  return {
    key: "long",
    className: "text-red-300 bg-red-400/10 border-red-400/20",
  };
}

export default function YouTubeTitleGeneratorClient() {
  const t = useTranslations("Tool.youtubeTitleGenerator");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");

  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState<TitleStyle>("SEO Focused");

  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [copiedTitle, setCopiedTitle] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [error, setError] = useState("");

  const selectedLength = selectedTitle.length;

  const reasons = useMemo(() => {
    if (!selectedTitle) {
      return [];
    }

    const checks: string[] = [];

    if (
      keyword &&
      selectedTitle.toLowerCase().includes(keyword.trim().toLowerCase())
    ) {
      checks.push("keyword");
    }

    if (selectedLength >= 35 && selectedLength <= 65) {
      checks.push("length");
    }

    if (
      selectedTitle.toLowerCase().includes("how") ||
      selectedTitle.includes("?") ||
      /\d/.test(selectedTitle)
    ) {
      checks.push("format");
    }

    checks.push("clarity");

    return checks;
  }, [selectedTitle, keyword, selectedLength]);

  function handleGenerate() {
    setError("");

    if (!cleanText(topic)) {
      setError(t("errorTopicRequired"));
      return;
    }

    const generated = generateTitles(topic, keyword, style, audience);

    setTitles(generated);
    setSelectedTitle(generated[0]?.title ?? "");

    void fetch("/api/tool-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool_name: "YouTube Title Generator",
      }),
    }).catch(() => {
      // Tracking should never interrupt the tool.
    });
  }

  async function handleCopy(title: string) {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedTitle(title);

      window.setTimeout(() => {
        setCopiedTitle("");
      }, 1800);
    } catch {
      setCopiedTitle("");
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

  function handleGenerateMore() {
    if (!cleanText(topic)) {
      return;
    }

    const generated = generateTitles(topic, keyword, style, audience);

    const rotated = [...generated.slice(3), ...generated.slice(0, 3)];

    setTitles(rotated);
    setSelectedTitle(rotated[0]?.title ?? "");
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
              {t("perks.noAccount")}
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-400" />
              {t("perks.styles")}
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
                <Sparkles className="h-5 w-5 text-red-400" />
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
                  htmlFor="video-topic"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("topicLabel")}
                </label>

                <input
                  id="video-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder={t("topicPlaceholder")}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="main-keyword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("keywordLabel")}
                </label>

                <input
                  id="main-keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder={t("keywordPlaceholder")}
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />

                <p className="mt-2 text-xs text-slate-500">
                  {t("keywordHint")}
                </p>
              </div>

              <div>
                <label
                  htmlFor="title-style"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("styleLabel")}
                </label>

                <select
                  id="title-style"
                  value={style}
                  onChange={(event) =>
                    setStyle(event.target.value as TitleStyle)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                >
                  {TITLE_STYLES.map((titleStyle) => (
                    <option key={titleStyle} value={titleStyle}>
                      {t(`styles.${STYLE_KEYS[titleStyle]}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="target-audience"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {t("audienceLabel")}
                  <span className="ms-2 text-slate-500">{tCommon("optional")}</span>
                </label>

                <input
                  id="target-audience"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder={t("audiencePlaceholder")}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
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
                <Play className="h-4 w-4 fill-current" />
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

            {/* VIDEO CARD */}

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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_12px_40px_rgba(239,68,68,0.35)] transition duration-300 hover:scale-105">
                    <Play className="ms-1 h-7 w-7 fill-white text-white" />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div className="max-w-[75%]">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur">
                      YouTube SEO
                    </span>
                  </div>

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
                    <h3
                      className="line-clamp-2 text-[15px] font-semibold leading-6 text-white"
                      data-ltr-text
                    >
                      {selectedTitle || t("previewEmptyTitle")}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                      <span>{t("previewChannel")}</span>
                      <span className="text-slate-700">•</span>
                      <span>{t("previewLabel")}</span>
                    </div>

                    <p className="mt-1 text-xs text-slate-600">
                      {t("previewSample")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK TITLE REVIEW */}

            <div className="mt-6">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {t("quickTitle")}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {t("quickHint")}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {t("quick.length")}
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-lg font-semibold">
                      {selectedLength || 0}
                    </span>

                    <span
                      className={`text-xs font-medium ${
                        selectedLength >= 35 && selectedLength <= 65
                          ? "text-emerald-300"
                          : selectedLength === 0
                            ? "text-slate-500"
                            : "text-amber-300"
                      }`}
                    >
                      {selectedLength === 0
                        ? t("quickLength.waiting")
                        : selectedLength >= 35 && selectedLength <= 65
                          ? t("quickLength.good")
                          : selectedLength < 35
                            ? t("quickLength.short")
                            : t("quickLength.long")}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {t("quick.keyword")}
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <Target className="h-5 w-5 text-slate-400" />

                    <span
                      className={`text-xs font-medium ${
                        !cleanText(keyword)
                          ? "text-slate-500"
                          : selectedTitle
                              .toLowerCase()
                              .includes(cleanText(keyword).toLowerCase())
                            ? "text-emerald-300"
                            : "text-amber-300"
                      }`}
                    >
                      {!cleanText(keyword)
                        ? t("quickKeyword.notSet")
                        : selectedTitle
                            .toLowerCase()
                            .includes(cleanText(keyword).toLowerCase())
                          ? t("quickKeyword.found")
                          : t("quickKeyword.missing")}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {t("quick.clarity")}
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <Lightbulb className="h-5 w-5 text-slate-400" />

                    <span
                      className={`text-xs font-medium ${
                        !selectedTitle
                          ? "text-slate-500"
                          : selectedTitle.split(" ").length >= 5
                            ? "text-emerald-300"
                            : "text-amber-300"
                      }`}
                    >
                      {!selectedTitle
                        ? t("quickClarity.waiting")
                        : selectedTitle.split(" ").length >= 5
                          ? t("quickClarity.clear")
                          : t("quickClarity.basic")}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTitle ? (
                <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-400">
                      {t("titleLengthLabel")}
                    </span>

                    <span className="text-sm font-medium">
                      {t("characters", { count: selectedLength })}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedLength >= 35 && selectedLength <= 65
                          ? "bg-emerald-400"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max((selectedLength / 70) * 100, 4),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-slate-600">
                    <span>{t("scale.short")}</span>
                    <span>{t("scale.balanced")}</span>
                    <span>{t("scale.long")}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}

      {titles.length > 0 ? (
        <section className="px-6 pb-24 sm:px-10 lg:px-16">
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
                onClick={handleGenerateMore}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/30 hover:bg-white/[0.05]"
              >
                <RefreshCw className="h-4 w-4" />
                {t("generateMore")}
              </button>
            </div>

            <div className="mt-10 grid gap-4">
              {titles.map((item, index) => {
                const lengthStatus = getLengthStatus(item.title.length);
                const isSelected = item.title === selectedTitle;
                const isCopied = item.title === copiedTitle;

                return (
                  <div
                    key={`${item.title}-${index}`}
                    className={`rounded-2xl border p-5 transition duration-300 ${
                      isSelected
                        ? "border-red-400/40 bg-red-400/[0.05]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedTitle(item.title)}
                        className="flex-1 text-start"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">
                            {t(`styles.${STYLE_KEYS[item.style]}`)}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${lengthStatus.className}`}
                          >
                            {t(`lengthStatus.${lengthStatus.key}`)}
                          </span>

                          <span className="text-xs text-slate-500">
                            {t("characters", { count: item.title.length })}
                          </span>
                        </div>

                        <h3
                          className="mt-3 text-lg font-semibold leading-7 text-white"
                          data-ltr-text
                        >
                          {item.title}
                        </h3>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.title)}
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

            {/* WHY THIS TITLE WORKS */}

            {selectedTitle ? (
              <div className="mt-8 rounded-[26px] border border-white/10 bg-white/[0.025] p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                    <Lightbulb className="h-5 w-5 text-amber-300" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                      {t("insightsEyebrow")}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      {t("insightsTitle")}
                    </h2>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {reasons.map((reason) => (
                        <div
                          key={reason}
                          className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                          <span className="text-sm leading-6 text-slate-300">
                            {t(`reasons.${reason}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
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

      {/* TITLE OPTIMIZATION */}

      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              {t("optimizationEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("optimizationTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("optimizationBody")}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {icon: Search, key: "keywordRelevance"},
              {icon: TextCursorInput, key: "clarity"},
              {icon: Compass, key: "intent"},
              {icon: MousePointerClick, key: "clickAppeal"},
              {icon: BarChart3, key: "length"},
              {icon: Users, key: "audience"},
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
                {number: "1"},
                {number: "2"},
                {number: "3"},
                {number: "4"},
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

      {/* WHY TITLES MATTER */}

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
              "topic",
              "search",
              "expectations",
              "consistency",
            ].map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
              >
                <Check className="h-5 w-5 text-emerald-400" />
                <h3 className="mt-4 font-semibold">{t(`benefits.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {t(`benefits.${key}.text`)}
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
                {t("relatedEyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {t("relatedTitle")}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                {t("relatedDesc")}
              </p>
            </div>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-300 transition hover:text-red-200"
            >
              {tCommon("viewAllTools")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-red-400/25 bg-red-400/[0.045] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <Youtube className="h-5 w-5 text-red-400" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <h3 className="font-semibold">
                  {tc("youtubeTitleGenerator.title")}
                </h3>
                <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                  {t("related.current")}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("related.titleGenerator.desc")}
              </p>
            </div>

            {[
              {
                icon: BarChart3,
                key: "titleAnalyzer",
                catalog: "youtubeTitleAnalyzer",
              },
              {
                icon: Tags,
                key: "keywords",
                catalog: "youtubeKeywordIdeas",
              },
              {
                icon: FileText,
                key: "descriptionGenerator",
                catalog: "youtubeDescriptionGenerator",
              },
            ].map((tool) => {
              const Icon = tool.icon;

              return (
                <div
                  key={tool.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                    <Icon className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {tc(`${tool.catalog}.title`)}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {t("related.comingSoon")}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {t(`related.${tool.key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
