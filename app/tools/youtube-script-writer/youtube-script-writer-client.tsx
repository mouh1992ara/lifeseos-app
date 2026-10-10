"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  ClipboardCopy,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Lightbulb,
  ListChecks,
  Play,
  Share2,
  Sparkles,
  Target,
  TextQuote,
  Timer,
  Users,
  WandSparkles,
  Youtube,
} from "lucide-react";

type ScriptStyle =
  | "Educational"
  | "Conversational"
  | "Professional"
  | "Storytelling"
  | "Tutorial";

type VideoLength = "Short" | "5 Minutes" | "8 Minutes" | "10+ Minutes";

type ScriptSection = {
  title: string;
  content: string;
};

type ScriptResult = {
  hook: string;
  introduction: string;
  mainPoints: ScriptSection[];
  transitions: string[];
  cta: string;
  outro: string;
  hookAlternatives: string[];
  ctaAlternatives: string[];
};

const SCRIPT_STYLES: ScriptStyle[] = [
  "Educational",
  "Conversational",
  "Professional",
  "Storytelling",
  "Tutorial",
];

const VIDEO_LENGTHS: VideoLength[] = [
  "Short",
  "5 Minutes",
  "8 Minutes",
  "10+ Minutes",
];

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function titleCase(value: string) {
  return cleanText(value)
    .split(" ")
    .map((word) =>
      word.length > 0
        ? `${word.charAt(0).toUpperCase()}${word.slice(1)}`
        : word
    )
    .join(" ");
}

function getMainPointCount(length: VideoLength) {
  if (length === "Short") return 2;
  if (length === "5 Minutes") return 3;
  if (length === "8 Minutes") return 4;
  return 5;
}

function getLengthHint(length: VideoLength) {
  if (length === "Short") return "Keep each point very concise.";
  if (length === "5 Minutes") return "Keep each point focused and practical.";
  if (length === "8 Minutes") return "Add a little more explanation and context.";
  return "Allow more room for examples, detail and transitions.";
}

function buildScript(
  topic: string,
  keyword: string,
  audience: string,
  style: ScriptStyle,
  videoLength: VideoLength,
  goal: string
): ScriptResult {
  const cleanTopic = cleanText(topic);
  const cleanKeyword = cleanText(keyword || topic);
  const cleanAudience = cleanText(audience);
  const cleanGoal = cleanText(goal);

  const topicTitle = titleCase(cleanTopic);
  const keywordTitle = titleCase(cleanKeyword);
  const audiencePhrase = cleanAudience
    ? `for ${cleanAudience}`
    : "for viewers interested in this topic";
  const goalPhrase = cleanGoal
    ? `The goal is to ${cleanGoal.toLowerCase()}.`
    : "The goal is to give viewers a useful, practical takeaway.";

  const pointCount = getMainPointCount(videoLength);
  const lengthHint = getLengthHint(videoLength);

  const styleHooks: Record<ScriptStyle, string> = {
    Educational: `If you want to understand ${topicTitle} without the confusion, this video will break it down into the key ideas that actually matter.`,
    Conversational: `If ${topicTitle} has been on your mind lately, you're in the right place because we're going to make it much easier to understand.`,
    Professional: `In this video, we will examine ${topicTitle} in a clear and structured way, focusing on the most important practical considerations.`,
    Storytelling: `Most people start thinking about ${topicTitle} only after they run into a problem. In this video, we will look at what usually happens and what to do differently.`,
    Tutorial: `By the end of this video, you will know how to approach ${topicTitle} step by step without overcomplicating the process.`,
  };

  const introByStyle: Record<ScriptStyle, string> = {
    Educational: `Welcome. Today we're looking at ${topicTitle}, with a focus on ${keywordTitle}. We'll keep the explanation simple, practical and easy to follow ${audiencePhrase}. ${goalPhrase}`,
    Conversational: `Let's get into ${topicTitle}. I'll walk you through the main ideas, explain where ${keywordTitle} fits in and give you practical points you can use right away ${audiencePhrase}. ${goalPhrase}`,
    Professional: `This video provides a structured overview of ${topicTitle}. We will focus on ${keywordTitle}, practical considerations and the main decisions viewers should understand ${audiencePhrase}. ${goalPhrase}`,
    Storytelling: `Before we get into the details, think about the last time you tried to understand ${topicTitle}. The usual challenge is knowing what matters first. This video will guide you through that process ${audiencePhrase}. ${goalPhrase}`,
    Tutorial: `In this tutorial, we'll work through ${topicTitle} one step at a time. We'll focus on ${keywordTitle}, explain what to do first and then build from there ${audiencePhrase}. ${goalPhrase}`,
  };

  const pointTemplates = [
    {
      title: "Start with the core idea",
      content: `First, explain what ${topicTitle} actually means and why it matters. Keep the explanation connected to ${keywordTitle}. Avoid unnecessary jargon and give viewers one clear takeaway before moving on.`,
    },
    {
      title: "Show the practical side",
      content: `Next, move from theory into practice. Explain how viewers can apply the idea, what they should pay attention to and which common mistakes can reduce results. ${lengthHint}`,
    },
    {
      title: "Add a simple example",
      content: `Give viewers a concrete example related to ${topicTitle}. Use a realistic situation so the advice feels easier to understand and remember.`,
    },
    {
      title: "Explain what to improve",
      content: `Now highlight one or two ways viewers can improve their approach. Connect the advice back to ${keywordTitle} and make the recommendations specific rather than generic.`,
    },
    {
      title: "Summarize the decision",
      content: `Finish the main section by helping viewers decide what to do next. Recap the most important lesson and reinforce the part of ${topicTitle} that has the biggest practical impact.`,
    },
  ];

  const mainPoints = pointTemplates.slice(0, pointCount);

  const transitions = [
    "Now that the foundation is clear, let's move to the practical side.",
    "That leads to the next point, which is where most people start seeing real differences.",
    "Once you understand that, the next step becomes much easier.",
    "Before we wrap up, there is one more important point to consider.",
  ].slice(0, Math.max(1, pointCount - 1));

  const cta = cleanGoal
    ? `If this helped you ${cleanGoal.toLowerCase()}, leave a comment with the part you found most useful, and subscribe for more practical videos on this topic.`
    : `If this video helped you, leave a comment with your biggest takeaway and subscribe for more practical videos like this.`;

  const outro = `To recap, ${topicTitle} becomes much easier when you focus on the core idea, apply it practically and keep improving one step at a time. Thanks for watching, and I'll see you in the next video.`;

  const hookAlternatives = [
    `Most people make ${topicTitle} harder than it needs to be. Here's a simpler way to think about it.`,
    `Before you spend more time on ${topicTitle}, there are a few things you should understand first.`,
    `If you want better results with ${keywordTitle}, start with these key ideas.`,
    `The biggest mistake with ${topicTitle} is focusing on the wrong things first.`,
  ];

  const ctaAlternatives = [
    "If this was useful, subscribe for more practical videos and share your biggest takeaway in the comments.",
    "Want more videos like this? Subscribe and let me know what topic you want covered next.",
    "If you learned something useful, like the video and subscribe so you don't miss the next one.",
  ];

  return {
    hook: styleHooks[style],
    introduction: introByStyle[style],
    mainPoints,
    transitions,
    cta,
    outro,
    hookAlternatives,
    ctaAlternatives,
  };
}

function compileScript(result: ScriptResult | null) {
  if (!result) return "";

  const mainBody = result.mainPoints
    .map((point, index) => {
      const transition =
        index < result.transitions.length
          ? `\n\nTransition:\n${result.transitions[index]}`
          : "";

      return `${point.title}\n${point.content}${transition}`;
    })
    .join("\n\n");

  return `HOOK
${result.hook}

INTRODUCTION
${result.introduction}

MAIN SCRIPT
${mainBody}

CALL TO ACTION
${result.cta}

OUTRO
${result.outro}`;
}

export default function YouTubeScriptWriterClient() {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState<ScriptStyle>("Educational");
  const [videoLength, setVideoLength] = useState<VideoLength>("5 Minutes");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const fullScript = useMemo(() => compileScript(result), [result]);

  const wordCount = useMemo(() => {
    if (!cleanText(fullScript)) return 0;
    return cleanText(fullScript).split(/\s+/).length;
  }, [fullScript]);

  const estimatedMinutes = useMemo(() => {
    if (!wordCount) return 0;
    return Math.max(1, Math.round(wordCount / 145));
  }, [wordCount]);

  const sectionCount = result ? result.mainPoints.length + 4 : 0;

  function handleGenerate() {
    setError("");

    if (!cleanText(topic)) {
      setError("Please enter a video topic before generating a script.");
      return;
    }

    setResult(
      buildScript(topic, keyword, audience, style, videoLength, goal)
    );

    void fetch("/api/tool-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool_name: "YouTube Script Writer",
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

  async function handleCopyFullScript() {
    if (!fullScript) return;

    try {
      await navigator.clipboard.writeText(fullScript);
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
      title: "Free YouTube Script Writer | LifeSeos",
      text: "Create structured YouTube video scripts with LifeSeos.",
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
            Write better
            <span className="block bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">
              YouTube video scripts.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Turn your topic into a structured video script with a hook,
            introduction, main points, transitions, call to action and outro.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-400" />
              Free to use
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-400" />
              Multiple script styles
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-400" />
              Structured video flow
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
                <WandSparkles className="h-5 w-5 text-red-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Generate a YouTube script
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Define your topic, audience and preferred video style.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="script-topic"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Video Topic
                </label>

                <input
                  id="script-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. How to grow a YouTube channel"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="script-keyword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Main Keyword
                  <span className="ml-2 text-slate-500">Optional</span>
                </label>

                <input
                  id="script-keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="e.g. YouTube SEO"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="script-style"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Script Style
                  </label>

                  <select
                    id="script-style"
                    value={style}
                    onChange={(event) =>
                      setStyle(event.target.value as ScriptStyle)
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                  >
                    {SCRIPT_STYLES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="video-length"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Video Length
                  </label>

                  <select
                    id="video-length"
                    value={videoLength}
                    onChange={(event) =>
                      setVideoLength(event.target.value as VideoLength)
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                  >
                    {VIDEO_LENGTHS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="script-audience"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Target Audience
                  <span className="ml-2 text-slate-500">Optional</span>
                </label>

                <input
                  id="script-audience"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder="e.g. New creators"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="script-goal"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Video Goal
                  <span className="ml-2 text-slate-500">Optional</span>
                </label>

                <input
                  id="script-goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="e.g. Help beginners understand YouTube SEO"
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
                <Sparkles className="h-4 w-4" />
                Generate YouTube Script
              </button>
            </div>
          </div>

          {/* PREVIEW */}

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                  Script Preview
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  YouTube-style script structure
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Preview the flow of your video before copying the complete
                  script.
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
                  Script preview
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_12px_40px_rgba(239,68,68,0.35)]">
                    <Play className="ml-1 h-7 w-7 fill-white text-white" />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur">
                    {style}
                  </span>

                  <span className="rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                    {videoLength}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-lg">
                    <Youtube className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                      Hook
                    </p>

                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-300">
                      {result?.hook ||
                        "Your generated video hook will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-200">
                Quick script review
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Live estimates based on the generated script.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Words
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-lg font-semibold">{wordCount}</span>
                    <TextQuote className="h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Speak time
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-lg font-semibold">
                      {estimatedMinutes ? `~${estimatedMinutes}m` : "—"}
                    </span>
                    <Timer className="h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Sections
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-lg font-semibold">{sectionCount}</span>
                    <ListChecks className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}

      {result ? (
        <>
          <section className="px-6 pb-20 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                    Generated Script
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    Your structured YouTube script
                  </h2>

                  <p className="mt-3 max-w-2xl text-slate-400">
                    Review each section individually or copy the complete script
                    in one click.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyFullScript}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/30 hover:bg-white/[0.05]"
                >
                  {copiedText === "__full__" ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Copied full script
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="h-4 w-4" />
                      Copy full script
                    </>
                  )}
                </button>
              </div>

              <div className="mt-10 space-y-5">
                {[
                  {
                    label: "Hook",
                    content: result.hook,
                    icon: Sparkles,
                  },
                  {
                    label: "Introduction",
                    content: result.introduction,
                    icon: FileText,
                  },
                ].map((section) => {
                  const Icon = section.icon;
                  const isCopied = copiedText === section.content;

                  return (
                    <div
                      key={section.label}
                      className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10">
                            <Icon className="h-5 w-5 text-red-400" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                              {section.label}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-300">
                              {section.content}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(section.content)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-400/30"
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

                <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                      <ListChecks className="h-5 w-5 text-red-400" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                        Main Script
                      </p>

                      <h3 className="mt-1 text-xl font-semibold">
                        Main talking points
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {result.mainPoints.map((point, index) => {
                      const transition =
                        index < result.transitions.length
                          ? result.transitions[index]
                          : "";

                      const copyText = transition
                        ? `${point.title}\n${point.content}\n\nTransition:\n${transition}`
                        : `${point.title}\n${point.content}`;

                      return (
                        <div
                          key={`${point.title}-${index}`}
                          className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">
                                Point {index + 1}
                              </span>

                              <h4 className="mt-4 font-semibold">
                                {point.title}
                              </h4>

                              <p className="mt-2 text-sm leading-7 text-slate-400">
                                {point.content}
                              </p>

                              {transition ? (
                                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Transition
                                  </p>

                                  <p className="mt-2 text-sm leading-6 text-slate-300">
                                    {transition}
                                  </p>
                                </div>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopy(copyText)}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-400/30"
                            >
                              {copiedText === copyText ? (
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

                {[
                  {
                    label: "Call to Action",
                    content: result.cta,
                    icon: Target,
                  },
                  {
                    label: "Outro",
                    content: result.outro,
                    icon: Play,
                  },
                ].map((section) => {
                  const Icon = section.icon;

                  return (
                    <div
                      key={section.label}
                      className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10">
                            <Icon className="h-5 w-5 text-red-400" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                              {section.label}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-300">
                              {section.content}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(section.content)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-400/30"
                        >
                          {copiedText === section.content ? (
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

          {/* ALTERNATIVES */}

          <section className="px-6 pb-20 sm:px-10 lg:px-16">
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                    <Lightbulb className="h-5 w-5 text-amber-300" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Hook Alternatives
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      Try a different opening
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {result.hookAlternatives.map((hook) => (
                    <div
                      key={hook}
                      className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-4"
                    >
                      <p className="text-sm leading-6 text-slate-300">{hook}</p>

                      <button
                        type="button"
                        onClick={() => handleCopy(hook)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-red-400/30 hover:text-white"
                      >
                        {copiedText === hook ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                    <Target className="h-5 w-5 text-red-400" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
                      CTA Alternatives
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      Choose a stronger next step
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {result.ctaAlternatives.map((ctaItem) => (
                    <div
                      key={ctaItem}
                      className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-4"
                    >
                      <p className="text-sm leading-6 text-slate-300">
                        {ctaItem}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleCopy(ctaItem)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-red-400/30 hover:text-white"
                      >
                        {copiedText === ctaItem ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
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
                  Share the YouTube Script Writer with creators who want a
                  structured starting point for their videos.
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

      {/* SCRIPT FACTORS */}

      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              YouTube Script Planning
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Build a clearer structure before you start recording
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              A useful script gives the video direction without making it sound
              robotic. Use the generated structure as a starting point, then
              adjust the wording to match your own voice.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Strong Hook",
                text: "Give viewers a clear reason to keep watching from the beginning.",
              },
              {
                icon: FileText,
                title: "Clear Introduction",
                text: "Set expectations and explain what the video will cover.",
              },
              {
                icon: ListChecks,
                title: "Main Talking Points",
                text: "Break the topic into logical sections instead of one long block.",
              },
              {
                icon: Timer,
                title: "Better Pacing",
                text: "Use video length to keep the number of sections realistic.",
              },
              {
                icon: Users,
                title: "Audience Fit",
                text: "Adapt the explanation to the people the video is designed for.",
              },
              {
                icon: Target,
                title: "Relevant CTA",
                text: "End with a next step that matches the purpose of the video.",
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
                How to use the YouTube Script Writer
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Use the tool to create a structured first draft, then rewrite
                sections so the final script sounds natural in your own voice.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  number: "1",
                  title: "Enter your video topic",
                  text: "Describe what your video is mainly about.",
                },
                {
                  number: "2",
                  title: "Choose style and length",
                  text: "Select the tone you want and the approximate video duration.",
                },
                {
                  number: "3",
                  title: "Add audience and goal",
                  text: "Optionally explain who the video is for and what you want it to achieve.",
                },
                {
                  number: "4",
                  title: "Generate and personalize",
                  text: "Review the script structure, copy useful sections and adapt the wording before recording.",
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

      {/* WHY SCRIPTING MATTERS */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              Video Structure
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Why YouTube scripts matter
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              A script can help creators organize ideas, reduce repetition and
              keep the video moving in a clear direction. It can also make
              recording easier because the main talking points are already
              planned.
            </p>

            <p className="mt-4 leading-8 text-slate-400">
              The generated script is a starting point, not a finished
              performance. Review and personalize the wording so it matches your
              real content and speaking style.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Reduce rambling",
                text: "Keep the video focused by deciding the main points before recording.",
              },
              {
                title: "Improve flow",
                text: "Use transitions so each part of the video connects naturally.",
              },
              {
                title: "Save planning time",
                text: "Start with a structured outline instead of a blank page.",
              },
              {
                title: "Sound more intentional",
                text: "Give each section a clear purpose while keeping your own voice.",
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

      {/* RELATED TOOLS */}

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                Continue Creating
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Related YouTube SEO tools
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                Build your topic, title, description and script with the LifeSeos
                YouTube toolkit.
              </p>
            </div>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-300 transition hover:text-red-200"
            >
              View all tools
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            <Link
              href="/tools/youtube-keyword-ideas"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <Hash className="h-5 w-5 text-red-400" />
              </div>

              <h3 className="mt-5 font-semibold">
                YouTube Keyword Ideas
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Explore keyword groups and video topic ideas.
              </p>
            </Link>

            <Link
              href="/tools/youtube-title-generator"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <Sparkles className="h-5 w-5 text-red-400" />
              </div>

              <h3 className="mt-5 font-semibold">
                YouTube Title Generator
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Generate title ideas based on your topic and keyword.
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
                YouTube Title Analyzer
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Review title clarity, structure and keyword use.
              </p>
            </Link>

            <Link
              href="/tools/youtube-description-generator"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <FileText className="h-5 w-5 text-red-400" />
              </div>

              <h3 className="mt-5 font-semibold">
                Description Generator
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Create structured video descriptions and calls to action.
              </p>
            </Link>

            <div className="rounded-2xl border border-red-400/25 bg-red-400/[0.045] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <WandSparkles className="h-5 w-5 text-red-400" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <h3 className="font-semibold">
                  YouTube Script Writer
                </h3>

                <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                  Current
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Create a structured video script from hook to outro.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
