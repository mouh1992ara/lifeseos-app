"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRightLeft,
  Check,
  ClipboardCopy,
  Copy,
  FileText,
  Gauge,
  Hash,
  ListChecks,
  RefreshCcw,
  Search,
  Share2,
  Sparkles,
  Target,
  TextQuote,
  WandSparkles,
} from "lucide-react";

type RewriteStyle =
  | "Clear"
  | "Professional"
  | "Natural"
  | "Concise"
  | "SEO Friendly"
  | "Formal";

type Tone = "Neutral" | "Friendly" | "Expert" | "Simple";

type ReadingLevel = "Simple" | "Standard" | "Advanced";

type RewriteStrength = "Light" | "Moderate" | "Strong";

type ReadabilityKey =
  | "readabilityWaiting"
  | "readabilityEasy"
  | "readabilityStandard"
  | "readabilityAdvanced";

const REWRITE_STYLES: RewriteStyle[] = [
  "Clear",
  "Professional",
  "Natural",
  "Concise",
  "SEO Friendly",
  "Formal",
];

const TONES: Tone[] = ["Neutral", "Friendly", "Expert", "Simple"];

const READING_LEVELS: ReadingLevel[] = ["Simple", "Standard", "Advanced"];

const REWRITE_STRENGTHS: RewriteStrength[] = [
  "Light",
  "Moderate",
  "Strong",
];

const STYLE_LABEL_KEYS: Record<RewriteStyle, string> = {
  Clear: "styleClear",
  Professional: "styleProfessional",
  Natural: "styleNatural",
  Concise: "styleConcise",
  "SEO Friendly": "styleSeoFriendly",
  Formal: "styleFormal",
};

const TONE_LABEL_KEYS: Record<Tone, string> = {
  Neutral: "toneNeutral",
  Friendly: "toneFriendly",
  Expert: "toneExpert",
  Simple: "toneSimple",
};

const LEVEL_LABEL_KEYS: Record<ReadingLevel, string> = {
  Simple: "levelSimple",
  Standard: "levelStandard",
  Advanced: "levelAdvanced",
};

const STRENGTH_LABEL_KEYS: Record<RewriteStrength, string> = {
  Light: "strengthLight",
  Moderate: "strengthModerate",
  Strong: "strengthStrong",
};

const FEATURE_CARDS = [
  { icon: Sparkles, key: "feat1" },
  { icon: TextQuote, key: "feat2" },
  { icon: Gauge, key: "feat3" },
  { icon: ArrowRightLeft, key: "feat4" },
  { icon: Hash, key: "feat5" },
  { icon: ListChecks, key: "feat6" },
] as const;

const HOW_STEPS = ["1", "2", "3", "4"] as const;

const BENEFIT_CARDS = ["1", "2", "3", "4"] as const;

function cleanText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function countWords(value: string) {
  const cleaned = value.trim();
  return cleaned ? cleaned.split(/\s+/).length : 0;
}

function splitParagraphs(value: string) {
  return cleanText(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function capitalizeSentence(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function softenPhrase(sentence: string) {
  return sentence
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bdue to the fact that\b/gi, "because")
    .replace(/\bat this point in time\b/gi, "now")
    .replace(/\ba large number of\b/gi, "many")
    .replace(/\bhas the ability to\b/gi, "can")
    .replace(/\bmake use of\b/gi, "use")
    .replace(/\bwith regard to\b/gi, "about")
    .replace(/\bin the event that\b/gi, "if")
    .replace(/\bfor the purpose of\b/gi, "to");
}

function conciseSentence(sentence: string) {
  return softenPhrase(sentence)
    .replace(/\bit is important to note that\b[:,]?\s*/gi, "")
    .replace(/\bit should be noted that\b[:,]?\s*/gi, "")
    .replace(/\bas a matter of fact\b[:,]?\s*/gi, "")
    .replace(/\bbasically\b[:,]?\s*/gi, "")
    .replace(/\bin general\b[:,]?\s*/gi, "")
    .replace(/\bvery\b\s+/gi, "")
    .replace(/\breally\b\s+/gi, "");
}

function naturalizeSentence(sentence: string) {
  let value = softenPhrase(sentence);

  value = value
    .replace(/\btherefore\b[:,]?\s*/gi, "So ")
    .replace(/\bfurthermore\b[:,]?\s*/gi, "Also, ")
    .replace(/\bmoreover\b[:,]?\s*/gi, "Also, ")
    .replace(/\bnevertheless\b[:,]?\s*/gi, "Still, ");

  return capitalizeSentence(value.trim());
}

function professionalizeSentence(sentence: string) {
  let value = softenPhrase(sentence);

  value = value
    .replace(/\ba lot of\b/gi, "many")
    .replace(/\bget better\b/gi, "improve")
    .replace(/\bget results\b/gi, "achieve results")
    .replace(/\bhelp you\b/gi, "support you")
    .replace(/\bthing\b/gi, "factor");

  return capitalizeSentence(value.trim());
}

function formalizeSentence(sentence: string) {
  let value = professionalizeSentence(sentence);

  value = value
    .replace(/\bso\b[:,]?\s*/gi, "Therefore, ")
    .replace(/\balso\b[:,]?\s*/gi, "Additionally, ")
    .replace(/\bbut\b/gi, "however")
    .replace(/\bcan't\b/gi, "cannot")
    .replace(/\bdon't\b/gi, "do not")
    .replace(/\bwon't\b/gi, "will not");

  return capitalizeSentence(value.trim());
}

function simplifySentence(sentence: string) {
  return conciseSentence(sentence)
    .replace(/\butilize\b/gi, "use")
    .replace(/\bapproximately\b/gi, "about")
    .replace(/\bdemonstrate\b/gi, "show")
    .replace(/\badditional\b/gi, "extra")
    .replace(/\bcommence\b/gi, "start")
    .replace(/\bterminate\b/gi, "end")
    .replace(/\bsubsequently\b/gi, "later");
}

function advancedSentence(sentence: string) {
  return professionalizeSentence(sentence)
    .replace(/\bshows\b/gi, "demonstrates")
    .replace(/\bhelps\b/gi, "supports")
    .replace(/\bimportant\b/gi, "significant")
    .replace(/\buse\b/gi, "apply");
}

function rewriteSentence(
  sentence: string,
  style: RewriteStyle,
  tone: Tone,
  readingLevel: ReadingLevel,
  strength: RewriteStrength
) {
  let value = sentence.trim();

  if (style === "Concise") value = conciseSentence(value);
  if (style === "Natural") value = naturalizeSentence(value);
  if (style === "Professional") value = professionalizeSentence(value);
  if (style === "Formal") value = formalizeSentence(value);
  if (style === "Clear") value = softenPhrase(value);
  if (style === "SEO Friendly") value = professionalizeSentence(value);

  if (tone === "Simple") value = simplifySentence(value);
  if (tone === "Friendly") value = naturalizeSentence(value);
  if (tone === "Expert") value = professionalizeSentence(value);

  if (readingLevel === "Simple") value = simplifySentence(value);
  if (readingLevel === "Advanced") value = advancedSentence(value);

  if (strength === "Moderate") {
    value = value
      .replace(/\bThis means that\b/gi, "In practice,")
      .replace(/\bFor example\b/gi, "For instance")
      .replace(/\bAs a result\b/gi, "This can lead to");
  }

  if (strength === "Strong") {
    value = value
      .replace(/\bThis means that\b/gi, "In practical terms,")
      .replace(/\bFor example\b/gi, "One example is")
      .replace(/\bAs a result\b/gi, "The result is")
      .replace(/\bAnother\b/gi, "A further")
      .replace(/\bOne of the\b/gi, "A key");
  }

  return capitalizeSentence(value.trim());
}

function rewriteParagraph(
  paragraph: string,
  style: RewriteStyle,
  tone: Tone,
  readingLevel: ReadingLevel,
  strength: RewriteStrength,
  preserveHeadings: boolean
) {
  const trimmed = paragraph.trim();

  if (
    preserveHeadings &&
    (trimmed.startsWith("#") ||
      trimmed.length < 80 &&
        !/[.!?]$/.test(trimmed) &&
        trimmed.split(/\s+/).length <= 10)
  ) {
    return trimmed;
  }

  const sentences =
    trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()) ?? [
      trimmed,
    ];

  const rewritten = sentences.map((sentence) =>
    rewriteSentence(sentence, style, tone, readingLevel, strength)
  );

  if (strength === "Strong" && rewritten.length >= 3) {
    const first = rewritten.shift();
    const second = rewritten.shift();

    if (first && second) {
      rewritten.unshift(`${first} ${second}`);
    }
  }

  return rewritten.join(" ");
}

function rewriteArticle(
  article: string,
  style: RewriteStyle,
  tone: Tone,
  readingLevel: ReadingLevel,
  strength: RewriteStrength,
  keyword: string,
  preserveHeadings: boolean,
  preserveLinks: boolean
) {
  const paragraphs = splitParagraphs(article);

  let rewritten = paragraphs
    .map((paragraph) =>
      rewriteParagraph(
        paragraph,
        style,
        tone,
        readingLevel,
        strength,
        preserveHeadings
      )
    )
    .join("\n\n");

  if (!preserveLinks) {
    rewritten = rewritten.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      "$1"
    );
    rewritten = rewritten.replace(/https?:\/\/\S+/g, "");
  }

  const cleanKeyword = keyword.trim();

  if (
    style === "SEO Friendly" &&
    cleanKeyword &&
    !rewritten.toLowerCase().includes(cleanKeyword.toLowerCase())
  ) {
    const paragraphList = splitParagraphs(rewritten);

    if (paragraphList.length > 0) {
      paragraphList[0] = `${paragraphList[0]} This article focuses on ${cleanKeyword} and the practical factors that matter most.`;
      rewritten = paragraphList.join("\n\n");
    }
  }

  return rewritten.trim();
}

function getReadabilityKey(words: number, chars: number): ReadabilityKey {
  if (!words) return "readabilityWaiting";

  const averageWordLength = chars / Math.max(words, 1);

  if (averageWordLength <= 5.2) return "readabilityEasy";
  if (averageWordLength <= 6.2) return "readabilityStandard";
  return "readabilityAdvanced";
}

export default function ArticleRewriterClient() {
  const t = useTranslations("Tool.articleRewriter");
  const locale = useLocale();
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");

  const [article, setArticle] = useState("");
  const [rewrittenArticle, setRewrittenArticle] = useState("");
  const [style, setStyle] = useState<RewriteStyle>("Clear");
  const [tone, setTone] = useState<Tone>("Neutral");
  const [readingLevel, setReadingLevel] =
    useState<ReadingLevel>("Standard");
  const [strength, setStrength] = useState<RewriteStrength>("Moderate");
  const [keyword, setKeyword] = useState("");
  const [preserveHeadings, setPreserveHeadings] = useState(true);
  const [preserveLinks, setPreserveLinks] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const originalWords = useMemo(() => countWords(article), [article]);
  const rewrittenWords = useMemo(
    () => countWords(rewrittenArticle),
    [rewrittenArticle]
  );

  const originalCharacters = article.length;
  const rewrittenCharacters = rewrittenArticle.length;

  const keywordFound = useMemo(() => {
    const cleanKeyword = keyword.trim().toLowerCase();
    if (!cleanKeyword || !rewrittenArticle) return false;
    return rewrittenArticle.toLowerCase().includes(cleanKeyword);
  }, [keyword, rewrittenArticle]);

  const readability = useMemo(
    () => getReadabilityKey(rewrittenWords, rewrittenCharacters),
    [rewrittenWords, rewrittenCharacters]
  );

  const difference = rewrittenWords - originalWords;

  function handleRewrite() {
  setError("");

  if (!cleanText(article)) {
    setError(t("errEmpty"));
    return;
  }

  if (originalWords < 10) {
    setError(t("errTooShort"));
    return;
  }

  const result = rewriteArticle(
    article,
    style,
    tone,
    readingLevel,
    strength,
    keyword,
    preserveHeadings,
    preserveLinks
  );

  setRewrittenArticle(result);

  void fetch("/api/tool-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tool_name: "SEO Article Rewriter",
    }),
  }).catch(() => {
    // Tracking should never interrupt the tool.
  });
}

  async function handleCopy() {
    if (!rewrittenArticle) return;

    try {
      await navigator.clipboard.writeText(rewrittenArticle);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
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
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[150px]" />
          <div className="absolute right-0 top-20 h-[320px] w-[320px] rounded-full bg-violet-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-2 text-sm font-medium text-blue-300">
            <WandSparkles className="h-4 w-4" />
            {t("badge")}
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}
            <span className="block bg-gradient-to-r from-blue-400 via-violet-300 to-white bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            {t("subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              {t("heroCheckFree")}
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              {t("heroCheckStyles")}
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              {t("heroCheckSeo")}
            </span>
          </div>
        </div>
      </section>

      {/* TOOL */}

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    {tc("articleRewriter.title")}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {t("panelSubtitle")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  {t("originalCount", { count: originalWords })}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  {t("rewrittenCount", { count: rewrittenWords })}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* ORIGINAL */}

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label
                    htmlFor="original-article"
                    className="text-sm font-semibold text-slate-200"
                  >
                    {t("originalLabel")}
                  </label>

                  <span className="text-xs text-slate-500">
                    {t("charactersCount", { count: originalCharacters })}
                  </span>
                </div>

                {locale !== "en" && (
              <p className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm leading-6 text-amber-200/90">
                {t("languageLimitation")}
              </p>
            )}

            <textarea
                  id="original-article"
                  value={article}
                  onChange={(event) => setArticle(event.target.value)}
                  placeholder={t("originalPlaceholder")}
                  className="min-h-[430px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                />
              </div>

              {/* REWRITTEN */}

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label
                    htmlFor="rewritten-article"
                    className="text-sm font-semibold text-slate-200"
                  >
                    {t("rewrittenLabel")}
                  </label>

                  <span className="text-xs text-slate-500">
                    {t("charactersCount", { count: rewrittenCharacters })}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    id="rewritten-article"
                    value={rewrittenArticle}
                    onChange={(event) =>
                      setRewrittenArticle(event.target.value)
                    }
                    placeholder={t("rewrittenPlaceholder")}
                    className="min-h-[430px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 p-5 pe-14 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />

                  {rewrittenArticle ? (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 text-slate-400 transition hover:border-blue-400/30 hover:text-white"
                      aria-label={t("copyAria")}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* OPTIONS */}

            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="rewrite-style"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  {t("styleLabel")}
                </label>

                <select
                  id="rewrite-style"
                  value={style}
                  onChange={(event) =>
                    setStyle(event.target.value as RewriteStyle)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-blue-400/50"
                >
                  {REWRITE_STYLES.map((item) => (
                    <option key={item} value={item}>
                      {t(STYLE_LABEL_KEYS[item])}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="rewrite-tone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  {t("toneLabel")}
                </label>

                <select
                  id="rewrite-tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value as Tone)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-blue-400/50"
                >
                  {TONES.map((item) => (
                    <option key={item} value={item}>
                      {t(TONE_LABEL_KEYS[item])}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reading-level"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  {t("levelLabel")}
                </label>

                <select
                  id="reading-level"
                  value={readingLevel}
                  onChange={(event) =>
                    setReadingLevel(event.target.value as ReadingLevel)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-blue-400/50"
                >
                  {READING_LEVELS.map((item) => (
                    <option key={item} value={item}>
                      {t(LEVEL_LABEL_KEYS[item])}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="rewrite-strength"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  {t("strengthLabel")}
                </label>

                <select
                  id="rewrite-strength"
                  value={strength}
                  onChange={(event) =>
                    setStrength(event.target.value as RewriteStrength)
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-blue-400/50"
                >
                  {REWRITE_STRENGTHS.map((item) => (
                    <option key={item} value={item}>
                      {t(STRENGTH_LABEL_KEYS[item])}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label
                  htmlFor="target-keyword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  {t("keywordLabel")}
                  <span className="ms-2 text-slate-500">
                    {tCommon("optional")}
                  </span>
                </label>

                <input
                  id="target-keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder={t("keywordPlaceholder")}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={preserveHeadings}
                    onChange={(event) =>
                      setPreserveHeadings(event.target.checked)
                    }
                    className="h-4 w-4 accent-blue-500"
                  />
                  {t("keepHeadings")}
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={preserveLinks}
                    onChange={(event) =>
                      setPreserveLinks(event.target.checked)
                    }
                    className="h-4 w-4 accent-blue-500"
                  />
                  {t("keepLinks")}
                </label>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRewrite}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-[0_12px_35px_rgba(59,130,246,0.2)]"
              >
                <WandSparkles className="h-4 w-4" />
                {t("actionRewrite")}
              </button>

              {rewrittenArticle ? (
                <>
                  <button
                    type="button"
                    onClick={handleRewrite}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {t("actionAgain")}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        {t("actionCopied")}
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4" />
                        {t("actionCopy")}
                      </>
                    )}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ANALYSIS */}

      {rewrittenArticle ? (
        <section className="px-6 pb-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                {t("summaryEyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {t("summaryTitle")}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <TextQuote className="h-5 w-5 text-blue-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  {t("statWordCount")}
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-2xl font-semibold" data-ltr-text>
                    {rewrittenWords}
                  </span>

                  <span
                    className={`pb-1 text-xs ${
                      difference > 0
                        ? "text-emerald-300"
                        : difference < 0
                          ? "text-amber-300"
                          : "text-slate-500"
                    }`}
                    data-ltr-text
                  >
                    {difference > 0 ? `+${difference}` : difference}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <Gauge className="h-5 w-5 text-violet-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  {t("statReadability")}
                </p>

                <p className="mt-2 text-2xl font-semibold">{t(readability)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <Target className="h-5 w-5 text-emerald-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  {t("statKeyword")}
                </p>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    !keyword.trim()
                      ? "text-slate-500"
                      : keywordFound
                        ? "text-emerald-300"
                        : "text-amber-300"
                  }`}
                >
                  {!keyword.trim()
                    ? t("keywordNotSet")
                    : keywordFound
                      ? t("keywordFound")
                      : t("keywordMissing")}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <ArrowRightLeft className="h-5 w-5 text-cyan-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  {t("statMode")}
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-200">
                  {t(STYLE_LABEL_KEYS[style])} · {t(STRENGTH_LABEL_KEYS[strength])}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* SHARE */}

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

      {/* FEATURES */}

      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t("featuresEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("featuresTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("featuresBody")}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((item) => {
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

      {/* HOW TO USE */}

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

      {/* WHY REWRITE */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
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
            {BENEFIT_CARDS.map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
              >
                <Check className="h-5 w-5 text-emerald-400" />

                <h3 className="mt-4 font-semibold">
                  {t(`benefit${n}Title`)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {t(`benefit${n}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTINUE CONTENT WORKFLOW */}

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
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
            <div className="rounded-2xl border border-blue-400/30 bg-blue-400/[0.055] p-6 shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <WandSparkles className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {tCommon("step", { number: 1 })} · {t("stepCurrent")}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {tc("articleRewriter.title")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("flow1Body")}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                {t("flow1Cta")}
                <Check className="h-4 w-4" />
              </div>
            </div>

            <Link
              href="/tools/content-analyzer"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10">
                  <Search className="h-5 w-5 text-violet-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                  {tCommon("step", { number: 2 })}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold transition group-hover:text-violet-300">
                {tc("contentAnalyzer.title")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("flow2Body")}
              </p>

              <div className="mt-5 text-sm font-semibold text-violet-300">
                {t("flow2Cta")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/tools/keyword-density-checker"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Hash className="h-5 w-5 text-cyan-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                  {tCommon("step", { number: 3 })}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold transition group-hover:text-cyan-300">
                {tc("keywordDensityChecker.title")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("flow3Body")}
              </p>

              <div className="mt-5 text-sm font-semibold text-cyan-300">
                {t("flow3Cta")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </div>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/meta-tag-generator"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              {tc("metaTagGenerator.title")}
              <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                →
              </span>
            </Link>

            <Link
              href="/tools/seo-page-analyzer"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              {tc("seoPageAnalyzer.title")}
              <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                →
              </span>
            </Link>

            <Link
              href="/tools"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              {tCommon("viewAllTools")}
              <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
