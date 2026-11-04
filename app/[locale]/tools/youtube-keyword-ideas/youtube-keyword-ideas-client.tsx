"use client";



import { Link } from "@/i18n/navigation";

import { useMemo, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import {

  Check,

  ClipboardCopy,

  Compass,

  Copy,

  ExternalLink,

  FileText,

  Hash,

  Lightbulb,

  ListFilter,

  Play,

  Search,

  Share2,

  Sparkles,

  Tags,


  TextSearch,

  TrendingUp,

  Users,

  Youtube,

} from "lucide-react";



type Intent =

  | "Broad Discovery"

  | "How-To"

  | "Beginner"

  | "Comparison"

  | "Problem Solving"

  | "Review";



type KeywordGroup = {

  titleKey: string;

  descriptionKey: string;

  intentKey?: string;

  items: string[];

};



const INTENTS: Intent[] = [

  "Broad Discovery",

  "How-To",

  "Beginner",

  "Comparison",

  "Problem Solving",

  "Review",

];

const INTENT_KEYS: Record<Intent, string> = {

  "Broad Discovery": "broadDiscovery",

  "How-To": "howTo",

  Beginner: "beginner",

  Comparison: "comparison",

  "Problem Solving": "problemSolving",

  Review: "review",

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



function unique(items: string[]) {

  return Array.from(new Set(items.map((item) => cleanText(item)).filter(Boolean)));

}



function buildKeywordGroups(

  topic: string,

  seedKeyword: string,

  intent: Intent,

  audience: string

): KeywordGroup[] {

  const cleanTopic = cleanText(topic);

  const cleanSeed = cleanText(seedKeyword || topic);

  const cleanAudience = cleanText(audience);



  const topicLower = cleanTopic.toLowerCase();

  const seedLower = cleanSeed.toLowerCase();

  const audienceSuffix = cleanAudience ? ` for ${cleanAudience}` : "";



  const core = unique([

    seedLower,

    topicLower,

    `${seedLower} tips`,

    `${seedLower} guide`,

    `${seedLower} tutorial`,

    `${seedLower} strategy`,

    `${seedLower} explained`,

    `${seedLower} ideas`,

    `${topicLower} tips`,

    `${topicLower} guide`,

  ]);



  const longTail = unique([

    `how to ${seedLower}`,

    `best way to ${seedLower}`,

    `${seedLower} for beginners`,

    `${seedLower} step by step`,

    `${seedLower} tutorial for beginners`,

    `${seedLower} tips that actually help`,

    `how to improve ${seedLower}`,

    `${seedLower}${audienceSuffix}`,

    `complete guide to ${seedLower}`,

    `${seedLower} mistakes to avoid`,

  ]);



  const questions = unique([

    `what is ${seedLower}`,

    `how does ${seedLower} work`,

    `is ${seedLower} worth it`,

    `why is ${seedLower} important`,

    `how do i start with ${seedLower}`,

    `what are the best ${seedLower} tips`,

    `how can i improve ${seedLower}`,

    `what should beginners know about ${seedLower}`,

  ]);



  const howTo = unique([

    `how to start ${seedLower}`,

    `how to learn ${seedLower}`,

    `how to improve ${seedLower}`,

    `how to use ${seedLower}`,

    `how to master ${seedLower}`,

    `how to fix ${seedLower} mistakes`,

    `how to get better at ${seedLower}`,

    `how to create a ${seedLower} strategy`,

  ]);



  const beginner = unique([

    `${seedLower} for beginners`,

    `${seedLower} basics`,

    `${seedLower} beginner guide`,

    `getting started with ${seedLower}`,

    `${seedLower} explained simply`,

    `${seedLower} step by step for beginners`,

    `learn ${seedLower} from scratch`,

    `${seedLower} beginner mistakes`,

  ]);



  const comparison = unique([

    `${seedLower} vs alternatives`,

    `${seedLower} vs traditional methods`,

    `best ${seedLower} tools`,

    `${seedLower} comparison`,

    `${seedLower} pros and cons`,

    `${seedLower} review`,

    `${seedLower} alternatives`,

    `which ${seedLower} option is best`,

  ]);



  const problem = unique([

    `why ${seedLower} is not working`,

    `${seedLower} mistakes`,

    `${seedLower} problems`,

    `how to fix ${seedLower}`,

    `common ${seedLower} mistakes`,

    `${seedLower} not getting results`,

    `why people struggle with ${seedLower}`,

    `${seedLower} troubleshooting`,

  ]);



  const review = unique([

    `${seedLower} review`,

    `is ${seedLower} worth it`,

    `${seedLower} honest review`,

    `${seedLower} results`,

    `${seedLower} test`,

    `${seedLower} experience`,

    `${seedLower} pros and cons`,

    `${seedLower} before and after`,

  ]);



  const intentMap: Record<Intent, string[]> = {

    "Broad Discovery": longTail,

    "How-To": howTo,

    Beginner: beginner,

    Comparison: comparison,

    "Problem Solving": problem,

    Review: review,

  };



  return [

    {

      titleKey: "groups.core.title",

      descriptionKey: "groups.core.description",

      items: core,

    },

    {

      titleKey: "groups.longTail.title",

      descriptionKey: "groups.longTail.description",

      items: longTail,

    },

    {

      titleKey: "groups.questions.title",

      descriptionKey: "groups.questions.description",

      items: questions,

    },

    {

      titleKey: "groups.intent.title",

      descriptionKey: "groups.intent.description",

      intentKey: INTENT_KEYS[intent],

      items: intentMap[intent],

    },

  ];

}



function buildVideoAngles(topic: string, seedKeyword: string, intent: Intent) {

  const base = titleCase(cleanText(seedKeyword || topic));



  const intentAngles: Record<Intent, string[]> = {

    "Broad Discovery": [

      `${base}: What You Need to Know`,

      `7 ${base} Tips for Better Results`,

      `${base} Explained for Beginners`,

    ],

    "How-To": [

      `How to ${base} Step by Step`,

      `How to Improve ${base}`,

      `How to Get Started with ${base}`,

    ],

    Beginner: [

      `${base} for Beginners`,

      `A Beginner's Guide to ${base}`,

      `${base} Basics Explained Simply`,

    ],

    Comparison: [

      `${base} vs Alternatives`,

      `Best ${base} Options Compared`,

      `${base}: Pros, Cons and Alternatives`,

    ],

    "Problem Solving": [

      `Why Your ${base} Is Not Working`,

      `Common ${base} Mistakes to Avoid`,

      `How to Fix ${base} Problems`,

    ],

    Review: [

      `${base} Review: Is It Worth It?`,

      `${base}: Pros and Cons`,

      `My Experience with ${base}`,

    ],

  };



  return intentAngles[intent];

}



export default function YouTubeKeywordIdeasClient() {

  const t = useTranslations("Tool.youtubeKeywordIdeas");

  const tc = useTranslations("Tools.catalog");

  const tCommon = useTranslations("Common");

  const [topic, setTopic] = useState("");

  const [seedKeyword, setSeedKeyword] = useState("");

  const [intent, setIntent] = useState<Intent>("Broad Discovery");

  const [audience, setAudience] = useState("");

  const [groups, setGroups] = useState<KeywordGroup[]>([]);

  const [videoAngles, setVideoAngles] = useState<string[]>([]);

  const [error, setError] = useState("");

  const [copiedItem, setCopiedItem] = useState("");

  const [shareCopied, setShareCopied] = useState(false);



  
  const hasTrackedUse = useRef(false);

  async function recordToolUseOnce() {
    if (hasTrackedUse.current) {
      return;
    }

    hasTrackedUse.current = true;

    try {
      const response = await fetch("/api/tool-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool_name: "YouTube Keyword Ideas",
        }),
      });

      if (!response.ok) {
        console.error(
          "Failed to record YouTube Keyword Ideas usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

const allKeywords = useMemo(

    () => unique(groups.flatMap((group) => group.items)),

    [groups]

  );



  const totalIdeas = allKeywords.length;

  const longTailCount = useMemo(

    () =>

      allKeywords.filter((keyword) => keyword.trim().split(/\s+/).length >= 4)

        .length,

    [allKeywords]

  );



  const questionCount = useMemo(

    () =>

      allKeywords.filter((keyword) =>

        /^(what|why|how|is|are|can|should|which)\b/i.test(keyword)

      ).length,

    [allKeywords]

  );



  function localizeGroup(group: KeywordGroup) {

    if (!group.intentKey) {

      return {

        title: t(group.titleKey),

        description: t(group.descriptionKey),

      };

    }

    const intentLabel = t(`intents.${group.intentKey}`);

    return {

      title: t(group.titleKey, { intent: intentLabel }),

      description: t(group.descriptionKey, { intent: intentLabel }),

    };

  }

  function handleGenerate() {

    setError("");



    if (!cleanText(topic)) {

      setError(t("errorTopicRequired"));

      return;

    }



    const generatedGroups = buildKeywordGroups(

      topic,

      seedKeyword,

      intent,

      audience

    );



    setGroups(generatedGroups);

    setVideoAngles(buildVideoAngles(topic, seedKeyword, intent));

    void recordToolUseOnce();

  }



  async function handleCopy(text: string) {

    try {

      await navigator.clipboard.writeText(text);

      setCopiedItem(text);



      window.setTimeout(() => {

        setCopiedItem("");

      }, 1800);

    } catch {

      setCopiedItem("");

    }

  }



  async function handleCopyAll() {

    if (!allKeywords.length) return;



    try {

      await navigator.clipboard.writeText(allKeywords.join("\n"));

      setCopiedItem("__all__");



      window.setTimeout(() => {

        setCopiedItem("");

      }, 1800);

    } catch {

      setCopiedItem("");

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

              {t("perks.groups")}

            </span>



            <span className="flex items-center gap-2">

              <Check className="h-4 w-4 text-red-400" />

              {t("perks.topics")}

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

                <Tags className="h-5 w-5 text-red-400" />

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

                  htmlFor="keyword-topic"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  {t("topicLabel")}

                </label>



                <input

                  id="keyword-topic"

                  value={topic}

                  onChange={(event) => setTopic(event.target.value)}

                  placeholder={t("topicPlaceholder")}

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />

              </div>



              <div>

                <label

                  htmlFor="seed-keyword"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  {t("seedLabel")}

                  <span className="ms-2 text-slate-500">{tCommon("optional")}</span>

                </label>



                <input

                  id="seed-keyword"

                  value={seedKeyword}

                  onChange={(event) => setSeedKeyword(event.target.value)}

                  placeholder={t("seedPlaceholder")}

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                />



                <p className="mt-2 text-xs text-slate-500">

                  {t("seedHint")}

                </p>

              </div>



              <div>

                <label

                  htmlFor="keyword-intent"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  {t("intentLabel")}

                </label>



                <select

                  id="keyword-intent"

                  value={intent}

                  onChange={(event) =>

                    setIntent(event.target.value as Intent)

                  }

                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"

                >

                  {INTENTS.map((item) => (

                    <option key={item} value={item}>

                      {t(`intents.${INTENT_KEYS[item]}`)}

                    </option>

                  ))}

                </select>

              </div>



              <div>

                <label

                  htmlFor="keyword-audience"

                  className="mb-2 block text-sm font-medium text-slate-200"

                >

                  {t("audienceLabel")}

                  <span className="ms-2 text-slate-500">{tCommon("optional")}</span>

                </label>



                <input

                  id="keyword-audience"

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

                <Search className="h-4 w-4" />

                {t("submit")}

              </button>

            </div>

          </div>



          {/* QUICK INSIGHTS */}



          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 sm:p-8">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">

                  {t("sideEyebrow")}

                </p>



                <h2 className="mt-2 text-xl font-semibold">

                  {t("sideTitle")}

                </h2>



                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

                  {t("sideDesc")}

                </p>

              </div>



              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10">

                <Youtube className="h-5 w-5 text-red-400" />

              </div>

            </div>



            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-xl">

              <div className="relative min-h-[250px] overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black p-5">

                <div className="absolute inset-0">

                  <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />

                  <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />

                </div>



                <div className="relative">

                  <div className="flex items-center justify-between gap-4">

                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">

                      {t("previewBadge")}

                    </span>



                    <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-300">

                      {t(`intents.${INTENT_KEYS[intent]}`)}

                    </span>

                  </div>



                  <div className="mt-10">

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">

                      {t("seedTopicLabel")}

                    </p>



                    <h3
                      className="mt-2 text-2xl font-bold"
                      data-ltr-text
                    >

                      {cleanText(seedKeyword || topic) || t("seedTopicFallback")}

                    </h3>

                  </div>



                  <div className="mt-7 flex flex-wrap gap-2">

                    {[

                      cleanText(seedKeyword || topic),

                      cleanText(seedKeyword || topic)

                        ? `${cleanText(seedKeyword || topic)} tips`

                        : "",

                      cleanText(seedKeyword || topic)

                        ? `how to ${cleanText(seedKeyword || topic)}`

                        : "",

                      cleanText(seedKeyword || topic)

                        ? `${cleanText(seedKeyword || topic)} guide`

                        : "",

                    ]

                      .filter(Boolean)

                      .map((item) => (

                        <span

                          key={item}

                          className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300"
                          data-ltr-text
                        >

                          {item}

                        </span>

                      ))}

                  </div>

                </div>

              </div>

            </div>



            <div className="mt-6">

              <p className="text-sm font-semibold text-slate-200">

                {t("quickReviewTitle")}

              </p>



              <p className="mt-1 text-xs text-slate-500">

                {t("quickReviewHint")}

              </p>



              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    {t("stats.ideas")}

                  </p>



                  <div className="mt-2 flex items-end justify-between gap-3">

                    <span className="text-lg font-semibold">{totalIdeas}</span>

                    <Hash className="h-5 w-5 text-slate-400" />

                  </div>

                </div>



                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    {t("stats.longTail")}

                  </p>



                  <div className="mt-2 flex items-end justify-between gap-3">

                    <span className="text-lg font-semibold">

                      {longTailCount}

                    </span>

                    <TrendingUp className="h-5 w-5 text-slate-400" />

                  </div>

                </div>



                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    {t("stats.questions")}

                  </p>



                  <div className="mt-2 flex items-end justify-between gap-3">

                    <span className="text-lg font-semibold">

                      {questionCount}

                    </span>

                    <Compass className="h-5 w-5 text-slate-400" />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* RESULTS */}



      {groups.length > 0 ? (

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

                  {copiedItem === "__all__" ? (

                    <>

                      <Check className="h-4 w-4 text-emerald-400" />

                      {t("copiedAll")}

                    </>

                  ) : (

                    <>

                      <ClipboardCopy className="h-4 w-4" />

                      {t("copyAll")}

                    </>

                  )}

                </button>

              </div>



              <div className="mt-10 grid gap-6 lg:grid-cols-2">

                {groups.map((group) => (

                  <div

                    key={group.titleKey}

                    className="rounded-[26px] border border-white/10 bg-white/[0.025] p-6"

                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-xl font-semibold">

                          {localizeGroup(group).title}

                        </h3>



                        <p className="mt-2 text-sm leading-6 text-slate-500">

                          {localizeGroup(group).description}

                        </p>

                      </div>



                      <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">

                        {t("ideasCount", { count: group.items.length })}

                      </span>

                    </div>



                    <div className="mt-6 space-y-3">

                      {group.items.map((item) => {

                        const isCopied = copiedItem === item;



                        return (

                          <div

                            key={item}

                            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"

                          >

                            <span
                              className="text-sm leading-6 text-slate-300"
                              data-ltr-text
                            >

                              {item}

                            </span>



                            <button

                              type="button"

                              onClick={() => handleCopy(item)}

                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-red-400/30 hover:text-white"

                              aria-label={t("copyItem", { item })}

                            >

                              {isCopied ? (

                                <Check className="h-4 w-4 text-emerald-400" />

                              ) : (

                                <Copy className="h-4 w-4" />

                              )}

                            </button>

                          </div>

                        );

                      })}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </section>



          {/* VIDEO ANGLES */}



          <section className="px-6 pb-20 sm:px-10 lg:px-16">

            <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-7 sm:p-8">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">

                  <Lightbulb className="h-5 w-5 text-amber-300" />

                </div>



                <div className="flex-1">

                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">

                    {t("anglesEyebrow")}

                  </p>



                  <h2 className="mt-2 text-2xl font-semibold">

                    {t("anglesTitle")}

                  </h2>



                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">

                  {t("anglesDesc")}

                  </p>



                  <div className="mt-6 grid gap-3 md:grid-cols-3">

                    {videoAngles.map((angle) => (

                      <div

                        key={angle}

                        className="rounded-xl border border-white/10 bg-slate-950/40 p-4"

                      >

                        <Play className="h-4 w-4 text-red-400" />

                        <p
                          className="mt-3 text-sm font-semibold leading-6"
                          data-ltr-text
                        >

                          {angle}

                        </p>

                      </div>

                    ))}

                  </div>

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



      {/* KEYWORD FACTORS */}



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

                icon: Hash,

                key: "core",

              },

              {

                icon: TrendingUp,

                key: "longTail",

              },

              {

                icon: Compass,

                key: "questions",

              },

              {

                icon: ListFilter,

                key: "intent",

              },

              {

                icon: Users,

                key: "audience",

              },

              {

                icon: Play,

                key: "angles",

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



      {/* WHY KEYWORDS MATTER */}



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

                key: "discover",

              },

              {

                key: "language",

              },

              {

                key: "clusters",

              },

              {

                key: "planning",

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

            <div className="rounded-2xl border border-red-400/30 bg-red-400/[0.055] p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                  <Tags className="h-5 w-5 text-red-400" />
                </div>

                <span className="rounded-full border border-red-400/25 bg-red-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                  {t("workflow.current", { number: 1 })}
                </span>
              </div>

              <h3 className="mt-5 font-semibold">
                {tc("youtubeKeywordIdeas.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("workflow.items.keywords.desc")}
              </p>

              <div className="mt-5 text-sm font-semibold text-red-300">
                {t("workflow.items.keywords.cta")} ✓
              </div>
            </div>

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

            <Link
              href="/tools/youtube-title-analyzer"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-rose-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10">
                  <TextSearch className="h-5 w-5 text-rose-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t("workflow.step", { number: 3 })}
                </span>
              </div>

              <h3 className="mt-5 font-semibold transition group-hover:text-rose-300">
                {tc("youtubeTitleAnalyzer.title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t("workflow.items.titleAnalyzer.desc")}
              </p>

              <div className="mt-5 text-sm font-semibold text-rose-300">
                {t("workflow.items.titleAnalyzer.cta")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </div>
            </Link>

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
