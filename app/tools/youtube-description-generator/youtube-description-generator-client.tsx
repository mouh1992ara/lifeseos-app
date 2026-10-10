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



function slugify(value: string) {

  return cleanText(value)

    .toLowerCase()

    .replace(/[^a-z0-9\s-]/g, "")

    .split(/\s+/)

    .filter(Boolean)

    .slice(0, 4)

    .join("");

}



function buildHashtags(topic: string, keyword: string) {

  const baseTopic = slugify(topic);

  const baseKeyword = slugify(keyword || topic);



  return Array.from(

    new Set(

      [

        baseKeyword ? `#${baseKeyword}` : "",

        baseTopic ? `#${baseTopic}` : "",

        "#YouTubeTips",

        "#ContentCreator",

        "#YouTubeSEO",

      ].filter(Boolean)

    )

  );

}



function generateDescriptions(

  topic: string,

  keyword: string,

  audience: string,

  style: DescriptionStyle,

  cta: string

): GeneratedDescription[] {

  const cleanTopic = cleanText(topic);

  const cleanKeyword = cleanText(keyword || topic);

  const cleanAudience = cleanText(audience);

  const cleanCta = cleanText(cta);



  const topicTitle = titleCase(cleanTopic);

  const keywordTitle = titleCase(cleanKeyword);



  const audienceLine = cleanAudience

    ? `This video is especially useful for ${cleanAudience}.`

    : "";



  const ctaLine = cleanCta

    ? cleanCta

    : "If you found this video useful, consider liking the video and subscribing for more.";



  const keywordLine =

    cleanKeyword && cleanKeyword.toLowerCase() !== cleanTopic.toLowerCase()

      ? `We also cover practical ideas related to ${cleanKeyword}.`

      : "";



  const templates: Record<DescriptionStyle, GeneratedDescription[]> = {

    Balanced: [

      {

        label: "Balanced",

        description: `Learn more about ${topicTitle} in this video.



We break down the topic in a clear and practical way so you can understand the key ideas and apply them more easily. ${keywordLine}



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Educational",

        description: `In this video, we explore ${topicTitle} and explain the most important points you should know.



You will get a practical overview of ${keywordTitle}, along with useful ideas you can apply to your own content or workflow.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Creator Friendly",

        description: `Want to understand ${topicTitle} better?



This video gives you a simple breakdown of the topic, practical tips and useful takeaways related to ${keywordTitle}.



${audienceLine}



${ctaLine}`,

      },

    ],



    "SEO Focused": [

      {

        label: "SEO Focused",

        description: `${keywordTitle} is the main focus of this video.



We explain how ${topicTitle} works, what to pay attention to and which practical steps can help you get better results. The goal is to give you a clear understanding of ${keywordTitle} without unnecessary complexity.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Search Friendly",

        description: `Looking for information about ${keywordTitle}?



In this video, we cover ${topicTitle}, explain the core ideas and share practical tips that can help you understand the topic more clearly.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Keyword Rich",

        description: `This video is a practical guide to ${keywordTitle}.



You will learn about ${topicTitle}, common considerations, useful strategies and ways to improve your approach.



${audienceLine}



${ctaLine}`,

      },

    ],



    Professional: [

      {

        label: "Professional",

        description: `This video provides a structured overview of ${topicTitle}.



We examine the key concepts behind ${keywordTitle}, highlight practical considerations and explain how the topic can be approached more effectively.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Structured",

        description: `Explore ${topicTitle} through a clear and structured explanation.



This video covers the main principles, practical applications and important considerations related to ${keywordTitle}.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Expert Tone",

        description: `In this video, we review the essential elements of ${topicTitle} and discuss practical approaches related to ${keywordTitle}.



The content is designed to provide a concise but useful overview for viewers who want a clearer understanding of the subject.



${audienceLine}



${ctaLine}`,

      },

    ],



    Friendly: [

      {

        label: "Friendly",

        description: `Let's talk about ${topicTitle}.



In this video, I break the topic down in a simple way and share useful ideas related to ${keywordTitle} that you can start using right away.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Conversational",

        description: `If ${topicTitle} feels confusing, this video is a good place to start.



We'll go through the main ideas, explain ${keywordTitle} in simple terms and look at a few practical tips.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Approachable",

        description: `Curious about ${topicTitle}?



This video walks you through the topic step by step and gives you practical ideas around ${keywordTitle} without overcomplicating things.



${audienceLine}



${ctaLine}`,

      },

    ],



    Short: [

      {

        label: "Short",

        description: `Learn the basics of ${topicTitle} and discover practical tips related to ${keywordTitle}.



${ctaLine}`,

      },

      {

        label: "Compact",

        description: `A quick guide to ${topicTitle} with practical ideas around ${keywordTitle}.



${ctaLine}`,

      },

      {

        label: "Minimal",

        description: `Explore ${topicTitle}, understand ${keywordTitle} and take away a few practical tips.



${ctaLine}`,

      },

    ],



    Detailed: [

      {

        label: "Detailed",

        description: `In this video, we take a closer look at ${topicTitle} and explore the most important ideas you should understand.



We cover the core concepts behind ${keywordTitle}, explain how they connect to the broader topic and highlight practical considerations that can help you make better decisions.



You will also see how different approaches can affect your results and what to keep in mind when applying these ideas yourself.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "In-Depth",

        description: `This video provides an in-depth introduction to ${topicTitle}.



We start with the fundamentals, move into practical examples and then look at the main considerations related to ${keywordTitle}. The goal is to help you understand both the theory and the practical side of the topic.



${audienceLine}



${ctaLine}`,

      },

      {

        label: "Comprehensive",

        description: `If you want a more complete understanding of ${topicTitle}, this video gives you a structured starting point.



We explain the main ideas behind ${keywordTitle}, discuss practical applications and highlight common mistakes or considerations that are useful to know before you begin.



${audienceLine}



${ctaLine}`,

      },

    ],

  };



  return templates[style];

}



export default function YouTubeDescriptionGeneratorClient() {

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

    () => buildHashtags(topic, keyword),

    [topic, keyword]

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

      setError("Please enter a video topic before generating a description.");

      return;

    }



    const generated = generateDescriptions(

      topic,

      keyword,

      audience,

      style,

      cta

    );



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

      title: "Free YouTube Description Generator | LifeSeos",

      text: "Create YouTube video descriptions with LifeSeos.",

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

            Create better

            <span className="block bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">

              YouTube descriptions.

            </span>

          </h1>



          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">

            Turn your video topic, keyword and audience into clear, structured

            YouTube description ideas in seconds.

          </p>



          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">

            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              Free to use

            </span>



            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              Multiple description styles

            </span>



            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              Hashtag suggestions

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

                  Generate a YouTube description

                </h2>



                <p className="mt-1 text-sm text-slate-400">

                  Add your video details and choose the description style you

                  want.

                </p>

              </div>

            </div>



            <div className="mt-8 space-y-6">

              <div>

                <label

                  htmlFor="description-topic"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  Video Topic

                </label>



                <input

                  id="description-topic"

                  value={topic}

                  onChange={(event) => setTopic(event.target.value)}

                  placeholder="e.g. How to grow a YouTube channel"

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />

              </div>



              <div>

                <label

                  htmlFor="description-keyword"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  Main Keyword

                  <span className="ml-2 text-slate-500">Optional</span>

                </label>



                <input

                  id="description-keyword"

                  value={keyword}

                  onChange={(event) => setKeyword(event.target.value)}

                  placeholder="e.g. YouTube SEO"

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />

              </div>



              <div>

                <label

                  htmlFor="description-style"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  Description Style

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

                      {item}

                    </option>

                  ))}

                </select>

              </div>



              <div>

                <label

                  htmlFor="description-audience"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  Target Audience

                  <span className="ml-2 text-slate-500">Optional</span>

                </label>



                <input

                  id="description-audience"

                  value={audience}

                  onChange={(event) => setAudience(event.target.value)}

                  placeholder="e.g. New creators"

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />

              </div>



              <div>

                <label

                  htmlFor="description-cta"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  Call to Action

                  <span className="ml-2 text-slate-500">Optional</span>

                </label>



                <input

                  id="description-cta"

                  value={cta}

                  onChange={(event) => setCta(event.target.value)}

                  placeholder="e.g. Subscribe for more YouTube SEO tips"

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

                Generate YouTube Description

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

                  YouTube-style description preview

                </h2>



                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

                  Preview the selected description and review a few useful

                  content signals at a glance.

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

                  Preview only

                </div>



                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_12px_40px_rgba(239,68,68,0.35)]">

                    <Play className="ml-1 h-7 w-7 fill-white text-white" />

                  </div>

                </div>



                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">

                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur">

                    YouTube Description

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

                    <p className="line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-300">

                      {selectedDescription ||

                        "Your generated YouTube description will appear here."}

                    </p>



                    <div className="mt-3 flex flex-wrap gap-2">

                      {hashtags.slice(0, 3).map((tag) => (

                        <span

                          key={tag}

                          className="text-xs font-medium text-blue-300"

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

                Quick description review

              </p>



              <p className="mt-1 text-xs text-slate-500">

                Live signals based on the selected description.

              </p>



              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Characters

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

                    Words

                  </p>



                  <div className="mt-2 flex items-end justify-between gap-3">

                    <span className="text-lg font-semibold">{wordCount}</span>

                    <ListChecks className="h-5 w-5 text-slate-400" />

                  </div>

                </div>



                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Keyword

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

                        ? "Not set"

                        : hasKeyword

                          ? "Found"

                          : "Missing"}

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

                    Generated Descriptions

                  </p>



                  <h2 className="mt-3 text-3xl font-bold">

                    Choose the description you prefer

                  </h2>



                  <p className="mt-3 max-w-2xl text-slate-400">

                    Select a version to preview it, then copy and customize it

                    for your video.

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

                      Copied

                    </>

                  ) : (

                    <>

                      <ClipboardCopy className="h-4 w-4" />

                      Copy description + hashtags

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

                          className="flex-1 text-left"

                        >

                          <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">

                            {item.label}

                          </span>



                          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">

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

                      Hashtags

                    </p>

                    <h2 className="mt-1 text-xl font-semibold">

                      Suggested hashtags

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

                      CTA Tip

                    </p>

                    <h2 className="mt-1 text-xl font-semibold">

                      Keep your call to action relevant

                    </h2>

                  </div>

                </div>



                <p className="mt-6 text-sm leading-7 text-slate-400">

                  Use a clear call to action that matches the video. Ask viewers

                  to subscribe, visit a relevant link, watch another video or

                  leave a comment only when it makes sense for the content.

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

                <h2 className="font-semibold">Share this tool</h2>



                <p className="mt-1 text-sm leading-6 text-slate-400">

                  Share the YouTube Description Generator with creators who want

                  a faster way to draft structured video descriptions.

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



      {/* DESCRIPTION FACTORS */}



      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">

        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">

              YouTube Description Writing

            </p>



            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">

              Build clearer, more useful video descriptions

            </h2>



            <p className="mt-5 leading-8 text-slate-400">

              A useful description should explain the video clearly, support the

              main topic and give viewers relevant next steps without stuffing

              unnecessary keywords.

            </p>

          </div>



          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {[

              {

                icon: Target,

                title: "Topic Relevance",

                text: "Keep the description focused on what the video actually covers.",

              },

              {

                icon: FileText,

                title: "Clear Structure",

                text: "Use short paragraphs and readable wording instead of one large block of text.",

              },

              {

                icon: Link2,

                title: "Useful Links",

                text: "Add relevant links only when they genuinely help the viewer.",

              },

              {

                icon: Users,

                title: "Audience Fit",

                text: "Adapt the wording and level of detail to the people the video is for.",

              },

              {

                icon: Hash,

                title: "Hashtags",

                text: "Use a small number of relevant hashtags rather than unrelated tags.",

              },

              {

                icon: Sparkles,

                title: "Call to Action",

                text: "Give viewers one clear next step that matches the purpose of the video.",

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

                How to use the YouTube Description Generator

              </h2>



              <p className="mt-5 leading-8 text-slate-400">

                Generate a structured starting point, then edit it so it matches

                your actual video before publishing.

              </p>

            </div>



            <div className="space-y-3">

              {[

                {

                  number: "1",

                  title: "Enter your video topic",

                  text: "Describe the main subject of the video in a clear phrase.",

                },

                {

                  number: "2",

                  title: "Add keyword and audience details",

                  text: "Optionally provide a keyword, target audience and call to action.",

                },

                {

                  number: "3",

                  title: "Choose a description style",

                  text: "Select balanced, SEO focused, professional, friendly, short or detailed.",

                },

                {

                  number: "4",

                  title: "Generate and customize",

                  text: "Choose a description, copy it and edit it so it accurately reflects your video.",

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



      {/* WHY DESCRIPTIONS MATTER */}



      <section className="px-6 py-20 sm:px-10 lg:px-16">

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">

              Video Context

            </p>



            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">

              Why YouTube descriptions matter

            </h2>



            <p className="mt-5 leading-8 text-slate-400">

              A description gives viewers additional context about the video and

              can help explain what they will learn, which resources are

              relevant and what action they can take next.

            </p>



            <p className="mt-4 leading-8 text-slate-400">

              The generated text should always be reviewed and customized before

              publishing so it accurately reflects the actual video.

            </p>

          </div>



          <div className="grid gap-4 sm:grid-cols-2">

            {[

              {

                title: "Explain the video",

                text: "Give viewers useful context about the topic and what the video covers.",

              },

              {

                title: "Support relevance",

                text: "Use natural topic wording that matches the actual video content.",

              },

              {

                title: "Add useful resources",

                text: "Include links or references only when they genuinely support the viewer.",

              },

              {

                title: "Guide the next action",

                text: "Use a relevant call to action without overwhelming the description.",

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

                Continue Optimizing

              </p>



              <h2 className="mt-3 text-3xl font-bold">

                Related YouTube SEO tools

              </h2>



              <p className="mt-3 max-w-2xl text-slate-400">

                Continue building your video metadata with the rest of the

                LifeSeos YouTube toolkit.

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



          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

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

                Generate video title ideas based on your topic and keyword.

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

                Review title structure, clarity and keyword use.

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

                YouTube Keyword Ideas

              </h3>



              <p className="mt-3 text-sm leading-6 text-slate-400">

                Explore keyword groups and video topic ideas.

              </p>

            </Link>



            <div className="rounded-2xl border border-red-400/25 bg-red-400/[0.045] p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">

                <FileText className="h-5 w-5 text-red-400" />

              </div>



              <div className="mt-5 flex items-center gap-2">

                <h3 className="font-semibold">

                  YouTube Description Generator

                </h3>



                <span className="rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">

                  Current

                </span>

              </div>



              <p className="mt-3 text-sm leading-6 text-slate-400">

                Create structured description ideas, hashtags and calls to

                action.

              </p>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}
