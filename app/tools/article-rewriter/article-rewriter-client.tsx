"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

function getReadabilityLabel(words: number, chars: number) {
  if (!words) return "Waiting";

  const averageWordLength = chars / Math.max(words, 1);

  if (averageWordLength <= 5.2) return "Easy";
  if (averageWordLength <= 6.2) return "Standard";
  return "Advanced";
}

export default function ArticleRewriterClient() {
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
    () => getReadabilityLabel(rewrittenWords, rewrittenCharacters),
    [rewrittenWords, rewrittenCharacters]
  );

  const difference = rewrittenWords - originalWords;

  function handleRewrite() {
  setError("");

  if (!cleanText(article)) {
    setError("Please paste an article or paragraph before rewriting.");
    return;
  }

  if (originalWords < 10) {
    setError("Please enter at least 10 words so the tool has enough text to rewrite.");
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
      title: "Free SEO Article Rewriter | LifeSeos",
      text: "Rewrite website content for clarity, readability and SEO consistency with LifeSeos.",
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
            Content SEO Tool
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Rewrite website content
            <span className="block bg-gradient-to-r from-blue-400 via-violet-300 to-white bg-clip-text text-transparent">
              with better clarity and structure.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Improve article readability, tone and structure while keeping the
            original topic and core meaning intact.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              Free to use
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              Multiple rewrite styles
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              SEO-aware options
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
                    SEO Article Rewriter
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Paste your article, choose your preferences and rewrite it.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  Original: {originalWords} words
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                  Rewritten: {rewrittenWords} words
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
                    Original Article
                  </label>

                  <span className="text-xs text-slate-500">
                    {originalCharacters} characters
                  </span>
                </div>

                <textarea
                  id="original-article"
                  value={article}
                  onChange={(event) => setArticle(event.target.value)}
                  placeholder="Paste your article, blog post or website content here..."
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
                    Rewritten Article
                  </label>

                  <span className="text-xs text-slate-500">
                    {rewrittenCharacters} characters
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    id="rewritten-article"
                    value={rewrittenArticle}
                    onChange={(event) =>
                      setRewrittenArticle(event.target.value)
                    }
                    placeholder="Your rewritten article will appear here..."
                    className="min-h-[430px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 p-5 pr-14 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />

                  {rewrittenArticle ? (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 text-slate-400 transition hover:border-blue-400/30 hover:text-white"
                      aria-label="Copy rewritten article"
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
                  Rewrite Style
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
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="rewrite-tone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Tone
                </label>

                <select
                  id="rewrite-tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value as Tone)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-blue-400/50"
                >
                  {TONES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reading-level"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Reading Level
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
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="rewrite-strength"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Rewrite Strength
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
                      {item}
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
                  Target Keyword
                  <span className="ml-2 text-slate-500">Optional</span>
                </label>

                <input
                  id="target-keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="e.g. technical SEO"
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
                  Keep headings
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
                  Keep links
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
                Rewrite Article
              </button>

              {rewrittenArticle ? (
                <>
                  <button
                    type="button"
                    onClick={handleRewrite}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Rewrite Again
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4" />
                        Copy Result
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
                Rewrite Summary
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Compare the original and rewritten content
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <TextQuote className="h-5 w-5 text-blue-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  Word Count
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-2xl font-semibold">
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
                  >
                    {difference > 0 ? `+${difference}` : difference}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <Gauge className="h-5 w-5 text-violet-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  Readability
                </p>

                <p className="mt-2 text-2xl font-semibold">{readability}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <Target className="h-5 w-5 text-emerald-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  Keyword
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
                    ? "Not set"
                    : keywordFound
                      ? "Found"
                      : "Missing"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <ArrowRightLeft className="h-5 w-5 text-cyan-400" />

                <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
                  Rewrite Mode
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-200">
                  {style} · {strength}
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
                <h2 className="font-semibold">Share this tool</h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Share the SEO Article Rewriter with writers, marketers and
                  website owners.
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
                  Link copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share tool
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
              Content Improvement
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Rewrite articles without losing the original direction
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Use different rewrite settings to improve clarity, structure,
              readability and tone while keeping the main topic consistent.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Rewrite Style",
                text: "Choose a clearer, more natural, concise, formal or SEO-friendly direction.",
              },
              {
                icon: TextQuote,
                title: "Tone Control",
                text: "Adjust the rewritten content for neutral, friendly, expert or simple communication.",
              },
              {
                icon: Gauge,
                title: "Reading Level",
                text: "Make content easier to read or more advanced depending on your audience.",
              },
              {
                icon: ArrowRightLeft,
                title: "Rewrite Strength",
                text: "Control how lightly or strongly the original wording is changed.",
              },
              {
                icon: Hash,
                title: "Keyword Check",
                text: "Track whether your optional target keyword appears in the rewritten version.",
              },
              {
                icon: ListChecks,
                title: "Structure Preservation",
                text: "Keep headings and links when they are important to your article structure.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.text}
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
                How It Works
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                How to use the SEO Article Rewriter
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Start with your original draft, choose the rewrite settings and
                review the result before publishing it on your website.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  number: "1",
                  title: "Paste your article",
                  text: "Add the article, blog post or website content you want to improve.",
                },
                {
                  number: "2",
                  title: "Choose rewrite settings",
                  text: "Select the style, tone, reading level and rewrite strength.",
                },
                {
                  number: "3",
                  title: "Add an optional target keyword",
                  text: "Use the keyword field when you want to keep a specific SEO phrase in view.",
                },
                {
                  number: "4",
                  title: "Review before publishing",
                  text: "Compare the rewritten version with the original and make final editorial changes.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-sm font-bold text-blue-300">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="font-semibold">{step.title}</h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      {step.text}
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
              Better Website Content
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Why article rewriting can be useful
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Rewriting can help improve unclear sentences, reduce unnecessary
              wording and adapt an existing draft to a different tone or reading
              level.
            </p>

            <p className="mt-4 leading-8 text-slate-400">
              Always review the rewritten result for accuracy, originality and
              factual correctness before publishing it on a live website.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Improve clarity",
                text: "Simplify awkward wording and make important points easier to understand.",
              },
              {
                title: "Adjust tone",
                text: "Adapt content for different audiences without changing the main subject.",
              },
              {
                title: "Reduce redundancy",
                text: "Remove filler phrases and tighten sections that feel unnecessarily long.",
              },
              {
                title: "Refresh existing drafts",
                text: "Use an existing article as a starting point for a cleaner updated version.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
              >
                <Check className="h-5 w-5 text-emerald-400" />

                <h3 className="mt-4 font-semibold">{item.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.text}
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
              Continue Your Content SEO Workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Rewrite, analyze and refine your content
            </h2>

            <p className="mt-4 leading-8 text-slate-400">
              Use these tools together to improve your draft, review content
              quality and then check how frequently your target terms appear.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-blue-400/30 bg-blue-400/[0.055] p-6 shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <WandSparkles className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  Step 1 · Current
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                SEO Article Rewriter
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Rewrite your article for clearer structure, tone, readability
                and better SEO consistency.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                Rewrite content
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
                  Step 2
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold transition group-hover:text-violet-300">
                Content Analyzer
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Review the rewritten version for readability, content structure,
                keyword usage and basic quality signals.
              </p>

              <div className="mt-5 text-sm font-semibold text-violet-300">
                Analyze content →
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
                  Step 3
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold transition group-hover:text-cyan-300">
                Keyword Density Checker
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Check keyword frequency and density after your content has been
                rewritten and reviewed.
              </p>

              <div className="mt-5 text-sm font-semibold text-cyan-300">
                Check keyword usage →
              </div>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/meta-tag-generator"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              Meta Tag Generator →
            </Link>

            <Link
              href="/tools/seo-page-analyzer"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              SEO Page Analyzer →
            </Link>

            <Link
              href="/tools"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              View All Tools →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
