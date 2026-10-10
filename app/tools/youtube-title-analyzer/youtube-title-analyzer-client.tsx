"use client";



import Link from "next/link";

import { useMemo, useState } from "react";

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

  Users,

  Youtube,

} from "lucide-react";



type MetricStatus = "Good" | "Needs Improvement" | "Weak";



type Metric = {

  label: string;

  score: number;

  status: MetricStatus;

  description: string;

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

      label: "Title Length",

      score: lengthScore,

      status: getMetricStatus(lengthScore),

      description: `${length} characters`,

    },

    {

      label: "Keyword Presence",

      score: keywordScore,

      status: getMetricStatus(keywordScore),

      description: cleanKeyword

        ? lowerTitle.includes(lowerKeyword)

          ? "Main keyword found"

          : "Main keyword not found"

        : "No keyword provided",

    },

    {

      label: "Keyword Position",

      score: keywordPositionScore,

      status: getMetricStatus(keywordPositionScore),

      description: cleanKeyword

        ? lowerTitle.includes(lowerKeyword)

          ? "Keyword placement reviewed"

          : "Cannot evaluate placement"

        : "No keyword provided",

    },

    {

      label: "Clarity",

      score: clarityScore,

      status: getMetricStatus(clarityScore),

      description: "How easy the title is to understand",

    },

    {

      label: "Specificity",

      score: specificityScore,

      status: getMetricStatus(specificityScore),

      description: "How clearly the title defines the video angle",

    },

    {

      label: "Click Appeal",

      score: clickAppealScore,

      status: getMetricStatus(clickAppealScore),

      description: "How strongly the title creates interest",

    },

  ];



  const score = Math.round(

    metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length

  );



  const strengths: string[] = [];

  const issues: string[] = [];

  const recommendations: string[] = [];



  if (length >= 35 && length <= 65) {

    strengths.push("The title uses a clear, practical length.");

  } else if (length < 35) {

    issues.push("The title is quite short and may not communicate enough context.");

    recommendations.push(

      "Add a clearer benefit, angle or specific detail to the title."

    );

  } else {

    issues.push("The title is relatively long and may be harder to scan quickly.");

    recommendations.push(

      "Move the most important wording earlier and remove unnecessary words."

    );

  }



  if (cleanKeyword) {

    if (lowerTitle.includes(lowerKeyword)) {

      strengths.push("The main keyword appears in the title.");



      const keywordIndex = lowerTitle.indexOf(lowerKeyword);

      if (keywordIndex <= cleanTitle.length * 0.25) {

        strengths.push("The main keyword appears early in the title.");

      } else {

        recommendations.push(

          "Consider moving the main keyword closer to the beginning."

        );

      }

    } else {

      issues.push("The main keyword does not appear in the title.");

      recommendations.push(

        "Include the main keyword naturally if it accurately reflects the video."

      );

    }

  }



  if (clarityScore >= 80) {

    strengths.push("The title is easy to understand at a glance.");

  } else {

    issues.push("The title could communicate the video topic more clearly.");

    recommendations.push("Use more direct wording and reduce vague phrases.");

  }



  if (specificityScore >= 80) {

    strengths.push("The title communicates a specific angle or promise.");

  } else {

    recommendations.push(

      "Add a specific format such as a guide, list, question, tutorial or clear outcome."

    );

  }



  if (clickAppealScore >= 80) {

    strengths.push("The title has a strong, attention-friendly structure.");

  } else {

    recommendations.push(

      "Increase interest with a clearer benefit, question, number or problem-focused angle."

    );

  }



  const baseTopic = cleanKeyword || cleanTitle;



  const topicTitle = titleCase(baseTopic);



  const suggestions: TitleSuggestion[] = [

    {

      title: `How to ${topicTitle}: A Complete Guide`,

      angle: "How-To",

      reason: "Clear instructional intent and a direct promise of useful guidance.",

    },

    {

      title: `7 Ways to Improve ${topicTitle}`,

      angle: "List",

      reason: "A numbered format makes the value easy to scan before clicking.",

    },

    {

      title: `${topicTitle} Explained: What You Need to Know`,

      angle: "Explainer",

      reason: "Signals a clear educational video and sets expectations quickly.",

    },

    {

      title: `Why Your ${topicTitle} May Not Be Working`,

      angle: "Problem",

      reason: "Focuses on a pain point and creates a natural reason to keep reading.",

    },

    {

      title: `${topicTitle} for Beginners: Start Here`,

      angle: "Beginner",

      reason: "Makes the intended audience explicit and reduces uncertainty for new viewers.",

    },

    {

      title: `10 ${topicTitle} Tips You Should Know`,

      angle: "Tips",

      reason: "Combines a specific number with a practical benefit-focused format.",

    },

    {

      title: `The Biggest ${topicTitle} Mistakes to Avoid`,

      angle: "Mistakes",

      reason: "Uses a risk-avoidance angle that can make the topic feel immediately relevant.",

    },

    {

      title: `${topicTitle}: Simple Strategies for Better Results`,

      angle: "Professional",

      reason: "Keeps the keyword prominent while adding a practical outcome-oriented promise.",

    },

    {

      title: `Is ${topicTitle} Really Worth It?`,

      angle: "Question",

      reason: "A question format can match viewers who are comparing options or looking for an opinion.",

    },

    {

      title: `Master ${topicTitle}: Step-by-Step Tutorial`,

      angle: "Tutorial",

      reason: "Combines a strong outcome with a structured learning format.",

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

  const [title, setTitle] = useState("");

  const [keyword, setKeyword] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [error, setError] = useState("");

  const [copiedText, setCopiedText] = useState("");

  const [shareCopied, setShareCopied] = useState(false);



  const titleLength = title.length;



  const liveLengthStatus = useMemo(() => {

    if (!titleLength) return "Enter a title";

    if (titleLength < 35) return "Short";

    if (titleLength <= 65) return "Good length";

    return "Long";

  }, [titleLength]);



  function handleAnalyze() {

    setError("");



    if (!cleanText(title)) {

      setError("Please enter a YouTube title before running the analysis.");

      return;

    }



    setResult(analyzeTitle(title, keyword));



    void fetch("/api/tool-events", {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify({

        tool_name: "YouTube Title Analyzer",

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



  async function handleShare() {

    const shareData = {

      title: "Free YouTube Title Analyzer | LifeSeos",

      text: "Analyze and improve a YouTube video title with LifeSeos.",

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

            YouTube SEO Tools

          </div>



          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">

            Analyze and improve your

            <span className="block bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">

              YouTube title.

            </span>

          </h1>



          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">

            Review title length, keyword use, clarity, specificity and click

            appeal with practical recommendations.

          </p>



          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">

            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              Free to use

            </span>



            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              Instant analysis

            </span>



            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              Practical recommendations

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

                  Analyze your YouTube title

                </h2>



                <p className="mt-1 text-sm text-slate-400">

                  Enter an existing title and an optional target keyword.

                </p>

              </div>

            </div>



            <div className="mt-8 space-y-6">

              <div>

                <label

                  htmlFor="youtube-title"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  YouTube Title

                </label>



                <textarea

                  id="youtube-title"

                  value={title}

                  onChange={(event) => setTitle(event.target.value)}

                  placeholder="e.g. How to Grow a YouTube Channel in 2026"

                  rows={4}

                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />



                <div className="mt-2 flex items-center justify-between gap-3 text-xs">

                  <span className="text-slate-500">{liveLengthStatus}</span>

                  <span className="text-slate-500">

                    {titleLength} characters

                  </span>

                </div>

              </div>



              <div>

                <label

                  htmlFor="youtube-keyword"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  Main Keyword

                  <span className="ml-2 text-slate-500">Optional</span>

                </label>



                <input

                  id="youtube-keyword"

                  value={keyword}

                  onChange={(event) => setKeyword(event.target.value)}

                  placeholder="e.g. YouTube SEO"

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />



                <p className="mt-2 text-xs leading-5 text-slate-500">

                  Add the keyword you want the title to communicate clearly.

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

                Analyze YouTube Title

              </button>

            </div>

          </div>



          {/* PREVIEW */}



          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 sm:p-8">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">

                  Preview

                </p>



                <h2 className="mt-2 text-xl font-semibold">

                  YouTube-style title preview

                </h2>



                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

                  See how your title may look in a video-style card and review a

                  few important title signals at a glance.

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

                  Preview only

                </div>



                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_12px_40px_rgba(239,68,68,0.35)] transition duration-300 hover:scale-105">

                    <Play className="ml-1 h-7 w-7 fill-white text-white" />

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

                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-white">

                      {cleanText(title) ||

                        "Your YouTube title will appear here"}

                    </h3>



                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">

                      <span>LifeSeos Creator</span>

                      <span className="text-slate-700">•</span>

                      <span>Preview</span>

                    </div>



                    <p className="mt-1 text-xs text-slate-600">

                      Sample display only

                    </p>

                  </div>

                </div>

              </div>

            </div>



            {/* QUICK TITLE REVIEW */}



            <div className="mt-6">

              <div>

                <p className="text-sm font-semibold text-slate-200">

                  Quick title review

                </p>



                <p className="mt-1 text-xs text-slate-500">

                  Live signals based on the title you entered.

                </p>

              </div>



              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Length

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

                        ? "Waiting"

                        : titleLength >= 35 && titleLength <= 65

                          ? "Good"

                          : titleLength < 35

                            ? "Short"

                            : "Long"}

                    </span>

                  </div>

                </div>



                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Keyword

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

                        ? "Not set"

                        : cleanText(title)

                            .toLowerCase()

                            .includes(cleanText(keyword).toLowerCase())

                          ? "Found"

                          : "Missing"}

                    </span>

                  </div>

                </div>



                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Clarity

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

                        ? "Waiting"

                        : cleanText(title).split(" ").length >= 5

                          ? "Clear"

                          : "Basic"}

                    </span>

                  </div>

                </div>

              </div>



              {title ? (

                <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/30 p-4">

                  <div className="flex items-center justify-between gap-3">

                    <span className="text-sm text-slate-400">

                      Title length

                    </span>



                    <span className="text-sm font-medium">

                      {titleLength} characters

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

                    <span>Short</span>

                    <span>Balanced</span>

                    <span>Long</span>

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

                    Title Score

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

                          out of 100

                        </div>

                      </div>

                    </div>



                    <div>

                      <h2 className="text-2xl font-bold">{result.grade}</h2>



                      <p className="mt-3 text-sm leading-6 text-slate-400">

                        This score summarizes the title structure, keyword use,

                        clarity, specificity and click appeal.

                      </p>

                    </div>

                  </div>

                </div>



                <div className="grid gap-4 sm:grid-cols-2">

                  {result.metrics.map((metric) => (

                    <div

                      key={metric.label}

                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"

                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-sm text-slate-400">

                            {metric.label}

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

                          {metric.status}

                        </span>

                      </div>



                      <p className="mt-4 text-sm leading-6 text-slate-500">

                        {metric.description}

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

                      Strengths

                    </p>

                    <h2 className="mt-1 text-xl font-semibold">

                      What is working well

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

                          {item}

                        </span>

                      </div>

                    ))

                  ) : (

                    <p className="text-sm leading-6 text-slate-400">

                      No strong signals were detected yet. Review the

                      recommendations below.

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

                      Issues

                    </p>

                    <h2 className="mt-1 text-xl font-semibold">

                      What could be improved

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

                          {item}

                        </span>

                      </div>

                    ))

                  ) : (

                    <p className="text-sm leading-6 text-slate-400">

                      No major structural issues were detected in this title.

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

                    Recommendations

                  </p>



                  <h2 className="mt-2 text-2xl font-semibold">

                    How to improve this title

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

                            {item}

                          </span>

                        </div>

                      ))

                    ) : (

                      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4 text-sm leading-6 text-emerald-200">

                        The title already has a strong structure. Keep it aligned

                        with the actual video content and thumbnail.

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

                    Improved Ideas

                  </p>



                  <h2 className="mt-3 text-3xl font-bold">

                    How to improve this title

                  </h2>



                  <p className="mt-3 max-w-2xl text-slate-400">

                    Compare several stronger title directions based on the topic

                    you entered. Each option uses a different angle so you can

                    choose the one that best matches your actual video.

                  </p>

                </div>



                <Link

                  href="/tools/youtube-title-generator"

                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-400/10"

                >

                  <Sparkles className="h-4 w-4" />

                  Generate more titles

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

                              {suggestion.angle}

                            </span>



                            <span className="text-xs text-slate-500">

                              {suggestion.title.length} characters

                            </span>

                          </div>



                          <h3 className="mt-3 text-lg font-semibold leading-7 text-white">

                            {suggestion.title}

                          </h3>



                          <p className="mt-2 text-sm leading-6 text-slate-400">

                            {suggestion.reason}

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

                              Copied

                            </>

                          ) : (

                            <>

                              <Copy className="h-4 w-4" />

                              Copy

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

                <h2 className="font-semibold">Share this tool</h2>



                <p className="mt-1 text-sm leading-6 text-slate-400">

                  Share the YouTube Title Analyzer with creators who want a

                  clearer way to review their video titles.

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



      {/* TITLE FACTORS */}



      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">

        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">

              YouTube Title Analysis

            </p>



            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">

              What the analyzer reviews

            </h2>



            <p className="mt-5 leading-8 text-slate-400">

              The analyzer checks practical title signals that help you review

              wording, structure and relevance before publishing a video.

            </p>

          </div>



          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {[

              {

                icon: BarChart3,

                title: "Title Length",

                text: "Reviews whether the title provides enough context without becoming unnecessarily long.",

              },

              {

                icon: Search,

                title: "Keyword Presence",

                text: "Checks whether your optional main keyword appears naturally in the title.",

              },

              {

                icon: Target,

                title: "Keyword Position",

                text: "Reviews how early the main keyword appears when a keyword is provided.",

              },

              {

                icon: TextCursorInput,

                title: "Clarity",

                text: "Looks at whether the title communicates the topic in a direct, readable way.",

              },

              {

                icon: Compass,

                title: "Specificity",

                text: "Checks whether the title defines a clear angle, format or outcome.",

              },

              {

                icon: MousePointerClick,

                title: "Click Appeal",

                text: "Reviews whether the title creates interest without relying on misleading claims.",

              },

            ].map((item) => {

              const Icon = item.icon;



              return (

                <div

                  key={item.title}

                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-red-400/25 hover:bg-white/[0.04]"

                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10">

                    <Icon className="h-5 w-5 text-red-400" />

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

          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">

                How It Works

              </p>



              <h2 className="mt-3 text-3xl font-bold">

                How to use the YouTube Title Analyzer

              </h2>



              <p className="mt-5 leading-8 text-slate-400">

                Review an existing title in a few simple steps and use the

                recommendations to refine it before publishing.

              </p>

            </div>



            <div className="space-y-3">

              {[

                {

                  number: "1",

                  title: "Enter your current title",

                  text: "Paste or type the YouTube title you want to review.",

                },

                {

                  number: "2",

                  title: "Add your main keyword",

                  text: "Optionally add the keyword you want the title to communicate.",

                },

                {

                  number: "3",

                  title: "Run the analysis",

                  text: "Review the overall score, title factors, strengths and issues.",

                },

                {

                  number: "4",

                  title: "Improve your title",

                  text: "Use the recommendations or alternative ideas as a starting point.",

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



      {/* WHY TITLES MATTER */}



      <section className="px-6 py-20 sm:px-10 lg:px-16">

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">

              Video Discovery

            </p>



            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">

              Why YouTube titles matter

            </h2>



            <p className="mt-5 leading-8 text-slate-400">

              A video title helps viewers understand the subject before they

              click. It can communicate relevance, set expectations and support

              the overall presentation of the video.

            </p>



            <p className="mt-4 leading-8 text-slate-400">

              Titles work together with thumbnails, descriptions and the actual

              video content. This analyzer focuses on title structure only and

              does not claim to predict rankings or views.

            </p>

          </div>



          <div className="grid gap-4 sm:grid-cols-2">

            {[

              {

                title: "Explain the topic",

                text: "Help viewers quickly understand what the video is about.",

              },

              {

                title: "Support relevance",

                text: "Use wording that accurately reflects the subject of the video.",

              },

              {

                title: "Create interest",

                text: "Give viewers a clear reason to explore the content without misleading them.",

              },

              {

                title: "Set expectations",

                text: "Make sure the title promise matches what the video actually delivers.",

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



            {/* CONTINUE YOUTUBE SEO WORKFLOW */}

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              Continue Your YouTube SEO Workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Go from keyword research to a complete video plan
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Use the YouTube SEO tools in sequence to find keyword angles,
              create a title, review it, build the description and then draft
              the full video script.
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
                  Step 1
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-red-300">
                YouTube Keyword Ideas
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Discover keyword groups, long-tail phrases, questions and video
                angles from your main topic.
              </p>

              <div className="mt-5 text-sm font-semibold text-red-300">
                Find keywords →
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
                  Step 2
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-red-300">
                YouTube Title Generator
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Turn your strongest keyword or topic into multiple title ideas
                for the video.
              </p>

              <div className="mt-5 text-sm font-semibold text-red-300">
                Generate titles →
              </div>
            </Link>

            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/[0.055] p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10">
                  <BarChart3 className="h-5 w-5 text-rose-400" />
                </div>

                <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  Step 3 · Current
                </span>
              </div>

              <h3 className="mt-5 font-semibold">
                YouTube Title Analyzer
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Review your title for clarity, keyword use, structure, length
                and click appeal before publishing.
              </p>

              <div className="mt-5 text-sm font-semibold text-rose-300">
                Analyze title ✓
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
                  Step 4
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-fuchsia-300">
                YouTube Description Generator
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Build a structured description using the topic, title and
                important keywords from your video plan.
              </p>

              <div className="mt-5 text-sm font-semibold text-fuchsia-300">
                Create description →
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
                  Step 5
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-pink-300">
                YouTube Script Writer
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Turn the completed video concept into a structured script with
                a hook, main sections and closing.
              </p>

              <div className="mt-5 text-sm font-semibold text-pink-300">
                Write script →
              </div>
            </Link>

          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              View All Tools
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

</main>

  );

}
