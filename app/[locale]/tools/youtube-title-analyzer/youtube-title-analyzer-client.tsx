"use client";



import { Link } from "@/i18n/navigation";
import { hasRealOutput, useToolOutcome } from "@/lib/use-tool-outcome";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import {

  AlertTriangle,

  BarChart3,

  Check,

  CheckCircle2,

  ClipboardCheck,

  Compass,

  Copy,

  ExternalLink,

  FileText,

  Gauge,

  Lightbulb,

  MousePointerClick,

  Play,

  Search,

  Share2,

  Sparkles,

  Tags,

  Target,

  TextCursorInput,


  Youtube,

} from "lucide-react";



type MetricStatus = "Good" | "Needs Improvement" | "Weak";



type Metric = {

  key: string;

  score: number;

  status: MetricStatus;

  descriptionKey: string;

  descriptionCount?: number;

};



type TitleSuggestion = {

  title: string;

  angle: string;

  reason: string;

};



type AnalysisResult = {

  score: number;

  grade: "Excellent" | "Good" | "Fair" | "Needs Work";

  metrics: Metric[];

  strengths: string[];

  issues: string[];

  recommendations: string[];

  suggestions: TitleSuggestion[];

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



function getMetricStatus(score: number): MetricStatus {

  if (score >= 80) return "Good";

  if (score >= 55) return "Needs Improvement";

  return "Weak";

}



function getGrade(score: number): AnalysisResult["grade"] {

  if (score >= 85) return "Excellent";

  if (score >= 70) return "Good";

  if (score >= 55) return "Fair";

  return "Needs Work";

}



function gradeKey(grade: AnalysisResult["grade"]) {

  if (grade === "Excellent") return "excellent";

  if (grade === "Good") return "good";

  if (grade === "Fair") return "fair";

  return "needsWork";

}

function statusKey(status: MetricStatus) {

  if (status === "Good") return "good";

  if (status === "Needs Improvement") return "needsImprovement";

  return "weak";

}

function analyzeTitle(title: string, keyword: string): AnalysisResult {

  const cleanTitle = cleanText(title);

  const cleanKeyword = cleanText(keyword);

  const lowerTitle = cleanTitle.toLowerCase();

  const lowerKeyword = cleanKeyword.toLowerCase();

  const length = cleanTitle.length;

  const words = cleanTitle.split(" ").filter(Boolean);



  const hasNumber = /\d/.test(cleanTitle);

  const hasQuestion = cleanTitle.includes("?");

  const hasHow = /\bhow\b/i.test(cleanTitle);

  const hasWhy = /\bwhy\b/i.test(cleanTitle);

  const hasIntentWord =

    /\b(best|tips|ways|mistakes|explained|complete|beginner|review|tutorial|guide|strategy|steps)\b/i.test(

      cleanTitle

    );



  let lengthScore = 100;

  if (length < 25) lengthScore = 45;

  else if (length < 35) lengthScore = 70;

  else if (length <= 65) lengthScore = 100;

  else if (length <= 75) lengthScore = 75;

  else lengthScore = 50;



  let keywordScore = 75;

  let keywordPositionScore = 70;



  if (cleanKeyword) {

    if (lowerTitle.includes(lowerKeyword)) {

      keywordScore = 100;

      const index = lowerTitle.indexOf(lowerKeyword);

      const ratio = index / Math.max(cleanTitle.length, 1);

      keywordPositionScore = ratio <= 0.25 ? 100 : ratio <= 0.5 ? 80 : 60;

    } else {

      keywordScore = 35;

      keywordPositionScore = 35;

    }

  }



  let clarityScore = 70;

  if (words.length >= 5 && words.length <= 14) clarityScore += 15;

  if (!/[!]{2,}|[?]{2,}/.test(cleanTitle)) clarityScore += 10;

  if (cleanTitle === titleCase(cleanTitle)) clarityScore += 5;

  clarityScore = Math.min(clarityScore, 100);



  let specificityScore = 55;

  if (hasNumber) specificityScore += 20;

  if (hasIntentWord) specificityScore += 20;

  if (words.length >= 6) specificityScore += 5;

  specificityScore = Math.min(specificityScore, 100);



  let clickAppealScore = 60;

  if (hasNumber || hasQuestion || hasHow || hasWhy) clickAppealScore += 15;

  if (

    /\b(best|complete|simple|easy|powerful|practical|mistakes|truth|secret|explained)\b/i.test(

      cleanTitle

    )

  ) {

    clickAppealScore += 15;

  }

  if (length >= 35 && length <= 65) clickAppealScore += 10;

  clickAppealScore = Math.min(clickAppealScore, 100);



  const metrics: Metric[] = [

    {

      key: "length",

      score: lengthScore,

      status: getMetricStatus(lengthScore),

      descriptionKey: "metrics.length.desc",

      descriptionCount: length,

    },

    {

      key: "keywordPresence",

      score: keywordScore,

      status: getMetricStatus(keywordScore),

      descriptionKey: !cleanKeyword

        ? "metrics.keywordPresence.none"

        : lowerTitle.includes(lowerKeyword)

          ? "metrics.keywordPresence.found"

          : "metrics.keywordPresence.missing",

    },

    {

      key: "keywordPosition",

      score: keywordPositionScore,

      status: getMetricStatus(keywordPositionScore),

      descriptionKey: !cleanKeyword

        ? "metrics.keywordPosition.none"

        : lowerTitle.includes(lowerKeyword)

          ? "metrics.keywordPosition.reviewed"

          : "metrics.keywordPosition.unknown",

    },

    {

      key: "clarity",

      score: clarityScore,

      status: getMetricStatus(clarityScore),

      descriptionKey: "metrics.clarity.desc",

    },

    {

      key: "specificity",

      score: specificityScore,

      status: getMetricStatus(specificityScore),

      descriptionKey: "metrics.specificity.desc",

    },

    {

      key: "clickAppeal",

      score: clickAppealScore,

      status: getMetricStatus(clickAppealScore),

      descriptionKey: "metrics.clickAppeal.desc",

    },

  ];



  const score = Math.round(

    metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length

  );



  const strengths: string[] = [];

  const issues: string[] = [];

  const recommendations: string[] = [];



  if (length >= 35 && length <= 65) {

    strengths.push("lengthGood");

  } else if (length < 35) {

    issues.push("short");

    recommendations.push(

      "addBenefit"

    );

  } else {

    issues.push("long");

    recommendations.push(

      "moveEarlier"

    );

  }



  if (cleanKeyword) {

    if (lowerTitle.includes(lowerKeyword)) {

      strengths.push("keywordFound");



      const keywordIndex = lowerTitle.indexOf(lowerKeyword);

      if (keywordIndex <= cleanTitle.length * 0.25) {

        strengths.push("keywordEarly");

      } else {

        recommendations.push(

          "moveKeyword"

        );

      }

    } else {

      issues.push("keywordMissing");

      recommendations.push(

        "includeKeyword"

      );

    }

  }



  if (clarityScore >= 80) {

    strengths.push("clarityGood");

  } else {

    issues.push("clarity");

    recommendations.push("directWording");

  }



  if (specificityScore >= 80) {

    strengths.push("specificityGood");

  } else {

    recommendations.push(

      "specificFormat"

    );

  }



  if (clickAppealScore >= 80) {

    strengths.push("clickGood");

  } else {

    recommendations.push(

      "moreInterest"

    );

  }



  const baseTopic = cleanKeyword || cleanTitle;



  const topicTitle = titleCase(baseTopic);



  const suggestions: TitleSuggestion[] = [

    {

      title: `How to ${topicTitle}: A Complete Guide`,

      angle: "howTo",

      reason: "r1",

    },

    {

      title: `7 Ways to Improve ${topicTitle}`,

      angle: "list",

      reason: "r2",

    },

    {

      title: `${topicTitle} Explained: What You Need to Know`,

      angle: "explainer",

      reason: "r3",

    },

    {

      title: `Why Your ${topicTitle} May Not Be Working`,

      angle: "problem",

      reason: "r4",

    },

    {

      title: `${topicTitle} for Beginners: Start Here`,

      angle: "beginner",

      reason: "r5",

    },

    {

      title: `10 ${topicTitle} Tips You Should Know`,

      angle: "tips",

      reason: "r6",

    },

    {

      title: `The Biggest ${topicTitle} Mistakes to Avoid`,

      angle: "mistakes",

      reason: "r7",

    },

    {

      title: `${topicTitle}: Simple Strategies for Better Results`,

      angle: "professional",

      reason: "r8",

    },

    {

      title: `Is ${topicTitle} Really Worth It?`,

      angle: "question",

      reason: "r9",

    },

    {

      title: `Master ${topicTitle}: Step-by-Step Tutorial`,

      angle: "tutorial",

      reason: "r10",

    },

  ].filter(

    (item, index, self) =>

      item.title !== cleanTitle &&

      self.findIndex((candidate) => candidate.title === item.title) === index

  );



  return {

    score,

    grade: getGrade(score),

    metrics,

    strengths,

    issues,

    recommendations: Array.from(new Set(recommendations)),

    suggestions,

  };

}



function scoreTextClass(score: number) {

  if (score >= 85) return "text-emerald-300";

  if (score >= 70) return "text-cyan-300";

  if (score >= 55) return "text-amber-300";

  return "text-red-300";

}



function scoreBorderClass(score: number) {

  if (score >= 85) return "border-emerald-400/30";

  if (score >= 70) return "border-cyan-400/30";

  if (score >= 55) return "border-amber-400/30";

  return "border-red-400/30";

}



function statusClass(status: MetricStatus) {

  if (status === "Good") {

    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

  }



  if (status === "Needs Improvement") {

    return "border-amber-400/20 bg-amber-400/10 text-amber-300";

  }



  return "border-red-400/20 bg-red-400/10 text-red-300";

}



export default function YouTubeTitleAnalyzerClient() {
  const { start: startOutcome } = useToolOutcome("youtube-title-analyzer");

  const t = useTranslations("Tool.youtubeTitleAnalyzer");

  const tc = useTranslations("Tools.catalog");

  const tCommon = useTranslations("Common");

  const [title, setTitle] = useState("");

  const [keyword, setKeyword] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [error, setError] = useState("");

  const [copiedText, setCopiedText] = useState("");

  const [shareCopied, setShareCopied] = useState(false);



  const titleLength = title.length;



  const liveLengthStatus = useMemo(() => {

    if (!titleLength) return "empty";

    if (titleLength < 35) return "short";

    if (titleLength <= 65) return "good";

    return "long";

  }, [titleLength]);



  function handleAnalyze() {

    setError("");



    if (!cleanText(title)) {

      setError(t("errorTitleRequired"));

      return;

    }



    // Validation passed: a real operation begins here.
    const op = startOutcome();

    const analyzed = analyzeTitle(title, keyword);
    setResult(analyzed);

    if (hasRealOutput(analyzed)) op.success();
    else op.error("INVALID_REQUEST");




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

              {t("perks.instant")}

            </span>



            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              {t("perks.recommendations")}

            </span>

          </div>

        </div>

      </section>



      {/* ANALYZER */}



      <section className="px-6 pb-20 sm:px-10 lg:px-16">

        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[1.05fr_.95fr]">

          <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10">

                <ClipboardCheck className="h-5 w-5 text-red-400" />

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

                  htmlFor="youtube-title"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  {t("titleLabel")}

                </label>



                <textarea

                  id="youtube-title"

                  value={title}

                  onChange={(event) => setTitle(event.target.value)}

                  placeholder={t("titlePlaceholder")}

                  rows={4}

                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />



                <div className="mt-2 flex items-center justify-between gap-3 text-xs">

                  <span className="text-slate-500">
                    {t(`liveLength.${liveLengthStatus}`)}
                  </span>

                  <span className="text-slate-500">

                    {t("characters", { count: titleLength })}

                  </span>

                </div>

              </div>



              <div>

                <label

                  htmlFor="youtube-keyword"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  {t("keywordLabel")}

                  <span className="ms-2 text-slate-500">{tCommon("optional")}</span>

                </label>



                <input

                  id="youtube-keyword"

                  value={keyword}

                  onChange={(event) => setKeyword(event.target.value)}

                  placeholder={t("keywordPlaceholder")}

                  dir="ltr"

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />



                <p className="mt-2 text-xs leading-5 text-slate-500">

                  {t("keywordHint")}

                </p>

              </div>



              {error ? (

                <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">

                  {error}

                </div>

              ) : null}



              <button

                type="button"

                onClick={handleAnalyze}

                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-red-400 hover:shadow-[0_12px_35px_rgba(239,68,68,0.2)]"

              >

                <Gauge className="h-4 w-4" />

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

                      {cleanText(title) || t("previewEmptyTitle")}

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

                      {titleLength || 0}

                    </span>



                    <span

                      className={`text-xs font-medium ${

                        titleLength >= 35 && titleLength <= 65

                          ? "text-emerald-300"

                          : titleLength === 0

                            ? "text-slate-500"

                            : "text-amber-300"

                      }`}

                    >

                      {titleLength === 0

                        ? t("quickLength.waiting")

                        : titleLength >= 35 && titleLength <= 65

                          ? t("quickLength.good")

                          : titleLength < 35

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

                    <Search className="h-5 w-5 text-slate-400" />



                    <span

                      className={`text-xs font-medium ${

                        !cleanText(keyword)

                          ? "text-slate-500"

                          : cleanText(title)

                              .toLowerCase()

                              .includes(cleanText(keyword).toLowerCase())

                            ? "text-emerald-300"

                            : "text-amber-300"

                      }`}

                    >

                      {!cleanText(keyword)

                        ? t("quickKeyword.notSet")

                        : cleanText(title)

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

                    <TextCursorInput className="h-5 w-5 text-slate-400" />



                    <span

                      className={`text-xs font-medium ${

                        !cleanText(title)

                          ? "text-slate-500"

                          : cleanText(title).split(" ").length >= 5

                            ? "text-emerald-300"

                            : "text-amber-300"

                      }`}

                    >

                      {!cleanText(title)

                        ? t("quickClarity.waiting")

                        : cleanText(title).split(" ").length >= 5

                          ? t("quickClarity.clear")

                          : t("quickClarity.basic")}

                    </span>

                  </div>

                </div>

              </div>



              {title ? (

                <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/30 p-4">

                  <div className="flex items-center justify-between gap-3">

                    <span className="text-sm text-slate-400">

                      {t("titleLengthLabel")}

                    </span>



                    <span className="text-sm font-medium">

                      {t("characters", { count: titleLength })}

                    </span>

                  </div>



                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

                    <div

                      className={`h-full rounded-full transition-all duration-500 ${

                        titleLength >= 35 && titleLength <= 65

                          ? "bg-emerald-400"

                          : "bg-red-500"

                      }`}

                      style={{

                        width: `${Math.min(

                          Math.max((titleLength / 70) * 100, 4),

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



      {result ? (

        <>

          <section className="px-6 pb-20 sm:px-10 lg:px-16">

            <div className="mx-auto max-w-6xl">

              <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">

                <div

                  className={`rounded-[28px] border bg-white/[0.025] p-7 ${scoreBorderClass(

                    result.score

                  )}`}

                >

                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">

                    {t("scoreEyebrow")}

                  </p>



                  <div className="mt-6 flex items-center gap-6">

                    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-white/10">

                      <div className="text-center">

                        <div

                          className={`text-4xl font-bold ${scoreTextClass(

                            result.score

                          )}`}

                        >

                          {result.score}

                        </div>



                        <div className="mt-1 text-xs text-slate-500">

                          {t("outOf")}

                        </div>

                      </div>

                    </div>



                    <div>

                      <h2 className="text-2xl font-bold">
                        {t(`grades.${gradeKey(result.grade)}`)}
                      </h2>



                      <p className="mt-3 text-sm leading-6 text-slate-400">

                        {t("scoreDesc")}

                      </p>

                    </div>

                  </div>

                </div>



                <div className="grid gap-4 sm:grid-cols-2">

                  {result.metrics.map((metric) => (

                    <div

                      key={metric.key}

                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"

                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-sm text-slate-400">

                            {t(`metrics.${metric.key}.label`)}

                          </p>



                          <p className="mt-2 text-2xl font-bold">

                            {metric.score}

                          </p>

                        </div>



                        <span

                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(

                            metric.status

                          )}`}

                        >

                          {t(`status.${statusKey(metric.status)}`)}

                        </span>

                      </div>



                      <p className="mt-4 text-sm leading-6 text-slate-500">

                        {t(
                          metric.descriptionKey,
                          metric.descriptionCount === undefined
                            ? undefined
                            : { count: metric.descriptionCount },
                        )}

                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </section>



          {/* STRENGTHS / ISSUES */}



          <section className="px-6 pb-20 sm:px-10 lg:px-16">

            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">

              <div className="rounded-[26px] border border-emerald-400/15 bg-emerald-400/[0.035] p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">

                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                  </div>



                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">

                      {t("strengthsEyebrow")}

                    </p>

                    <h2 className="mt-1 text-xl font-semibold">

                      {t("strengthsTitle")}

                    </h2>

                  </div>

                </div>



                <div className="mt-6 space-y-3">

                  {result.strengths.length ? (

                    result.strengths.map((item) => (

                      <div

                        key={item}

                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-4"

                      >

                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                        <span className="text-sm leading-6 text-slate-300">

                          {t(`insights.strengths.${item}`)}

                        </span>

                      </div>

                    ))

                  ) : (

                    <p className="text-sm leading-6 text-slate-400">

                      {t("strengthsEmpty")}

                    </p>

                  )}

                </div>

              </div>



              <div className="rounded-[26px] border border-amber-400/15 bg-amber-400/[0.035] p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">

                    <AlertTriangle className="h-5 w-5 text-amber-300" />

                  </div>



                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">

                      {t("issuesEyebrow")}

                    </p>

                    <h2 className="mt-1 text-xl font-semibold">

                      {t("issuesTitle")}

                    </h2>

                  </div>

                </div>



                <div className="mt-6 space-y-3">

                  {result.issues.length ? (

                    result.issues.map((item) => (

                      <div

                        key={item}

                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-4"

                      >

                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />

                        <span className="text-sm leading-6 text-slate-300">

                          {t(`insights.issues.${item}`)}

                        </span>

                      </div>

                    ))

                  ) : (

                    <p className="text-sm leading-6 text-slate-400">

                      {t("issuesEmpty")}

                    </p>

                  )}

                </div>

              </div>

            </div>

          </section>



          {/* RECOMMENDATIONS */}



          <section className="px-6 pb-20 sm:px-10 lg:px-16">

            <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-white/[0.025] p-7 sm:p-8">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10">

                  <Lightbulb className="h-5 w-5 text-blue-300" />

                </div>



                <div className="flex-1">

                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">

                    {t("recsEyebrow")}

                  </p>



                  <h2 className="mt-2 text-2xl font-semibold">

                    {t("recsTitle")}

                  </h2>



                  <div className="mt-6 grid gap-3 md:grid-cols-2">

                    {result.recommendations.length ? (

                      result.recommendations.map((item) => (

                        <div

                          key={item}

                          className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4"

                        >

                          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />

                          <span className="text-sm leading-6 text-slate-300">

                            {t(`insights.recommendations.${item}`)}

                          </span>

                        </div>

                      ))

                    ) : (

                      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4 text-sm leading-6 text-emerald-200">

                        {t("recsEmpty")}

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>

          </section>



          {/* IMPROVED TITLES */}



          <section className="px-6 pb-20 sm:px-10 lg:px-16">

            <div className="mx-auto max-w-6xl">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">

                    {t("suggestionsEyebrow")}

                  </p>



                  <h2 className="mt-3 text-3xl font-bold">

                    {t("recsTitle")}

                  </h2>



                  <p className="mt-3 max-w-2xl text-slate-400">

                    {t("suggestionsDesc")}

                  </p>

                </div>



                <Link

                  href="/tools/youtube-title-generator"

                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-400/10"

                >

                  <Sparkles className="h-4 w-4" />

                  {t("generateMore")}

                </Link>

              </div>



              <div className="mt-8 grid gap-4">

                {result.suggestions.map((suggestion) => {

                  const isCopied = copiedText === suggestion.title;



                  return (

                    <div

                      key={suggestion.title}

                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-red-400/25 hover:bg-white/[0.04]"

                    >

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">

                              {t(`angles.${suggestion.angle}`)}

                            </span>



                            <span className="text-xs text-slate-500">

                              {t("characters", { count: suggestion.title.length })}

                            </span>

                          </div>



                          <h3
                            className="mt-3 text-lg font-semibold leading-7 text-white"
                            data-ltr-text
                          >

                            {suggestion.title}

                          </h3>



                          <p className="mt-2 text-sm leading-6 text-slate-400">

                            {t(`suggestionReasons.${suggestion.reason}`)}

                          </p>

                        </div>



                        <button

                          type="button"

                          onClick={() => handleCopy(suggestion.title)}

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



      {/* TITLE FACTORS */}



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

                icon: BarChart3,

                key: "length",

              },

              {

                icon: Search,

                key: "keywordPresence",

              },

              {

                icon: Target,

                key: "keywordPosition",

              },

              {

                icon: TextCursorInput,

                key: "clarity",

              },

              {

                icon: Compass,

                key: "specificity",

              },

              {

                icon: MousePointerClick,

                key: "clickAppeal",

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

              {

                key: "topic",

              },

              {

                key: "relevance",

              },

              {

                key: "interest",

              },

              {

                key: "expectations",

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



            {/* CONTINUE YOUTUBE SEO WORKFLOW */}

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              {t("workflowEyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("workflowTitle")}
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              {t("workflowBody")}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">

            <Link
              href="/tools/youtube-keyword-ideas"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                  <Tags className="h-5 w-5 text-red-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t("workflow.step", { number: 1 })}
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-red-300">
                {tc("youtubeKeywordIdeas.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("workflow.items.keywords.desc")}
              </p>

              <div className="mt-5 text-sm font-semibold text-red-300">
                {t("workflow.items.keywords.cta")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/tools/youtube-title-generator"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                  <Sparkles className="h-5 w-5 text-red-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t("workflow.step", { number: 2 })}
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-red-300">
                {tc("youtubeTitleGenerator.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("workflow.items.titleGenerator.desc")}
              </p>

              <div className="mt-5 text-sm font-semibold text-red-300">
                {t("workflow.items.titleGenerator.cta")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </div>
            </Link>

            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/[0.055] p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10">
                  <BarChart3 className="h-5 w-5 text-rose-400" />
                </div>

                <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  {t("workflow.current", { number: 3 })}
                </span>
              </div>

              <h3 className="mt-5 font-semibold">
                {tc("youtubeTitleAnalyzer.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("workflow.items.titleAnalyzer.desc")}
              </p>

              <div className="mt-5 text-sm font-semibold text-rose-300">
                {t("workflow.items.titleAnalyzer.cta")} ✓
              </div>
            </div>

            <Link
              href="/tools/youtube-description-generator"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-fuchsia-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-400/10">
                  <FileText className="h-5 w-5 text-fuchsia-300" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t("workflow.step", { number: 4 })}
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-fuchsia-300">
                {tc("youtubeDescriptionGenerator.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("workflow.items.descriptionGenerator.desc")}
              </p>

              <div className="mt-5 text-sm font-semibold text-fuchsia-300">
                {t("workflow.items.descriptionGenerator.cta")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/tools/youtube-script-writer"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-pink-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-400/10">
                  <FileText className="h-5 w-5 text-pink-300" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t("workflow.step", { number: 5 })}
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-pink-300">
                {tc("youtubeScriptWriter.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("workflow.items.scriptWriter.desc")}
              </p>

              <div className="mt-5 text-sm font-semibold text-pink-300">
                {t("workflow.items.scriptWriter.cta")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </div>
            </Link>

          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              {tCommon("viewAllTools")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

</main>

  );

}
