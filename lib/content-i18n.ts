import type { Locale } from "@/i18n/config";

/**
 * Shared, locale-aware generation for the YouTube content tools.
 *
 * These are curated patterns, not an AI model: each builder writes in the
 * target language instead of translating English word-for-word, and every
 * output stays deterministic so it can be tested. No search volume, competition
 * or ranking data is invented anywhere here.
 *
 * Grammar note: the topic and keyword are free text typed by the visitor, so
 * they are never spliced into a sentence bare. French gets a determiner and
 * correct contractions (les / des / aux / de l'), Arabic gets the mandatory
 * article contraction after لـ and بـ, and Chinese gets spacing between Han
 * characters and Latin words. When the gender of a French noun cannot be
 * inferred, the phrase falls back to a quoted mention (« … »), which is
 * grammatical in every position instead of guessing wrong.
 */

const TERMS = ["SEO", "YouTube", "HTML", "Google", "URL", "HTTPS", "API", "CTR", "SERP"];

/** Keeps the visitor's own wording and capitalisation ("SEO" stays "SEO"). */
export function normaliseForLocale(value: string, locale: Locale) {
  void locale;
  return value.trim().replace(/\s+/g, " ");
}

/* ------------------------------------------------------------------ */
/* Chinese typography                                                  */
/* ------------------------------------------------------------------ */

/** Han characters with a Latin word or digit next to them get one space. */
export function zhSpacing(text: string) {
  return text
    .replace(/([\u3400-\u9fff])([A-Za-z0-9])/g, "$1 $2")
    .replace(/([A-Za-z0-9])([\u3400-\u9fff])/g, "$1 $2")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ */
/* Arabic clitics                                                      */
/* ------------------------------------------------------------------ */

/**
 * "لـ" before a definite noun must contract to "لل" (لـ + الأدوات = للأدوات).
 * Writing "لـالأدوات" is the single most common generated-Arabic mistake.
 */
export function arLi(value: string) {
  return value.startsWith("ال") ? `لل${value.slice(2)}` : `لـ${value}`;
}

/** Same rule for "بـ" → "بال". */
export function arBi(value: string) {
  return value.startsWith("ال") ? `بال${value.slice(2)}` : `بـ${value}`;
}

/* ------------------------------------------------------------------ */
/* French noun phrases                                                 */
/* ------------------------------------------------------------------ */

type FrDet = "les" | "le" | "la" | "l'" | null;

export type FrPhrase = {
  raw: string;
  head: string;
  det: FrDet;
  plural: boolean;
};

const FR_GIVEN_DET =
  /^(les|le|la|des|du|de la|de l['’]|l['’]|un|une|mon|ma|mes|notre|nos|votre|vos|ce|cet|cette|ces|leur|leurs|son|sa|ses)\s+(.+)$/i;

const FR_DET_MAP: Record<string, FrDet> = {
  les: "les",
  des: "les",
  mes: "les",
  tes: "les",
  ses: "les",
  nos: "les",
  vos: "les",
  leurs: "les",
  ces: "les",
  le: "le",
  du: "le",
  un: "le",
  ce: "le",
  cet: "le",
  son: "le",
  mon: "le",
  notre: "le",
  votre: "le",
  leur: "le",
  la: "la",
  une: "la",
  cette: "la",
  sa: "la",
  ma: "la",
  "de la": "la",
  "l'": "l'",
  "l’": "l'",
  "de l'": "l'",
  "de l’": "l'",
};

/** Endings that are reliably feminine / masculine in SEO copy. */
const FR_FEMININE =
  /(tion|sion|xion|aison|ance|ence|ette|elle|esse|ude|ade|ité|tié|ure|euse|trice|ique|ie|che|ée|aille|eille)$/i;
const FR_MASCULINE =
  /(ment|isme|age|eau|eur|oir|ail|eil|ier|scope|gramme|logue|in|on|et|ou|u|i|a|o|é|ai|oi|ème|er)$/i;
const FR_PLURAL_END = /[sx]$/i;
const FR_PLURAL_EXCEPTION = /(ss|us|is|as|os|ès)$/i;

/**
 * Classifies a free-text noun phrase so it can be dropped into a French
 * sentence. Unknown genders return `det: null`, which renders as a quoted
 * mention — always grammatical, never a wrong "le/la".
 */
export function frPhrase(input: string): FrPhrase {
  const raw = input.trim().replace(/\s+/g, " ");
  if (!raw) return { raw, head: "", det: null, plural: false };

  const given = raw.match(FR_GIVEN_DET);
  if (given) {
    const det = FR_DET_MAP[given[1].toLowerCase()] ?? null;
    return { raw, head: given[2], det, plural: det === "les" };
  }

  if (/^l['’]/i.test(raw)) {
    return { raw, head: raw.slice(2), det: "l'", plural: false };
  }

  const headWord = raw.split(" ")[0].replace(/[«»"']/g, "");

  if (
    FR_PLURAL_END.test(headWord) &&
    headWord.length > 3 &&
    !FR_PLURAL_EXCEPTION.test(headWord)
  ) {
    return { raw, head: raw, det: "les", plural: true };
  }
  if (/^[aeiouyàâäéèêëîïôöûüh]/i.test(headWord)) {
    return { raw, head: raw, det: "l'", plural: false };
  }
  if (FR_FEMININE.test(headWord)) {
    return { raw, head: raw, det: "la", plural: false };
  }
  if (FR_MASCULINE.test(headWord)) {
    return { raw, head: raw, det: "le", plural: false };
  }
  return { raw, head: raw, det: null, plural: false };
}

/** Direct object / subject: "les outils SEO", "l'audit", "« … »". */
export function frDirect(p: FrPhrase) {
  if (!p.head) return "";
  if (p.det === "l'") return `l'${p.head}`;
  if (p.det) return `${p.det} ${p.head}`;
  return `« ${p.raw} »`;
}

/** After "de": des / du / de la / de l'. */
export function frDe(p: FrPhrase) {
  if (!p.head) return "";
  switch (p.det) {
    case "les":
      return `des ${p.head}`;
    case "le":
      return `du ${p.head}`;
    case "la":
      return `de la ${p.head}`;
    case "l'":
      return `de l'${p.head}`;
    default:
      return `de « ${p.raw} »`;
  }
}

/** After "à": aux / au / à la / à l'. */
export function frA(p: FrPhrase) {
  if (!p.head) return "";
  switch (p.det) {
    case "les":
      return `aux ${p.head}`;
    case "le":
      return `au ${p.head}`;
    case "la":
      return `à la ${p.head}`;
    case "l'":
      return `à l'${p.head}`;
    default:
      return `à « ${p.raw} »`;
  }
}

/**
 * Full inverted question with correct subject-verb agreement:
 * "Les outils SEO valent-ils vraiment la peine ?" / "Le SEO vaut-il…" /
 * "La stratégie vaut-elle…". When the head noun's gender cannot be inferred the
 * sentence is rebuilt around "ça", which is grammatical for any number/gender.
 */
export function frWorthQuestion(p: FrPhrase) {
  if (!p.head) return "";
  if (p.det === "les") return `${frDirect(p)} valent-ils vraiment la peine ?`;
  if (p.det === "le") return `${frDirect(p)} vaut-il vraiment la peine ?`;
  if (p.det === "la") return `${frDirect(p)} vaut-elle vraiment la peine ?`;
  return `Est-ce que ça vaut vraiment la peine ${frWith("avec", p)} ?`;
}

/** Any other preposition: sur / pour / avec / dans + determiner. */
export function frWith(preposition: string, p: FrPhrase) {
  if (!p.head) return "";
  return `${preposition} ${frDirect(p)}`;
}

/* ------------------------------------------------------------------ */
/* Hashtags                                                            */
/* ------------------------------------------------------------------ */

export function hashtagsFor(topic: string, keyword: string, locale: Locale, limit = 4) {
  const base = `${topic} ${keyword}`.toLowerCase();
  const words = base
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2 && !TERMS.some((term) => term.toLowerCase() === word));

  const seen = new Set<string>();
  const tags: string[] = [];

  const sanitise = (value: string) =>
    value.replace(/['’\-–—.,:;!?"«»()\[\]]/g, "").replace(/\s+/g, "");

  const push = (raw: string) => {
    if (!raw) return;
    const body = (locale === "ar" || locale === "zh" ? raw : sanitise(raw)).replace(/^#+/, "");
    if (!body) return;
    const tag = `#${body}`;
    if (tag !== "#" && !seen.has(tag.toLowerCase())) {
      seen.add(tag.toLowerCase());
      tags.push(tag);
    }
  };

  // Latin hashtags concatenate words ("#keywordresearch"); Arabic and Chinese
  // must not, so those languages use the first word only.
  const joined = keyword.trim().split(/\s+/).slice(0, 3).join("");
  if (keyword.trim()) {
    push(locale === "ar" || locale === "zh" ? keyword.trim().split(/\s+/)[0] : joined);
  }
  words.slice(0, 3).forEach(push);

  const local: Record<Locale, string[]> = {
    en: ["#tutorial", "#guide", "#howto"],
    ar: ["#دليل", "#شرح", "#نصائح"],
    fr: ["#tutoriel", "#guide", "#conseils"],
    zh: ["#教程", "#指南", "#技巧"],
  };

  local[locale].forEach(push);
  return tags.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* YouTube descriptions                                                */
/* ------------------------------------------------------------------ */

export type DescriptionStyleKey =
  | "balanced"
  | "seoFocused"
  | "professional"
  | "friendly"
  | "short"
  | "detailed";

export function buildDescriptions(options: {
  topic: string;
  keyword: string;
  audience: string;
  cta: string;
  locale: Locale;
  style: DescriptionStyleKey;
}): string[] {
  const { locale, style } = options;
  const topic = normaliseForLocale(options.topic, locale);
  const keyword = normaliseForLocale(options.keyword || options.topic, locale);
  const audience = normaliseForLocale(options.audience, locale);
  const cta = normaliseForLocale(options.cta, locale);

  const tp = frPhrase(topic);
  const kp = frPhrase(keyword);

  const L = {
    en: {
      intro: [
        `In this video we look at ${topic} — the practical side of it, and how to approach it without wasting time.`,
        `This video walks through ${topic}, from the core idea to the parts that usually cause problems.`,
        `If you have been trying to get ${topic} right, this walkthrough focuses on the steps that actually matter.`,
      ],
      body: [
        `We start with the basics of ${keyword}, then move into the practical decisions that change the outcome.`,
        `Along the way you will see the common mistakes people make with ${keyword} and how to avoid them.`,
        `Everything is explained with concrete examples, so you can apply it to your own setup right away.`,
        `The aim is a clear, repeatable process rather than a list of tips to memorise.`,
      ],
      audience: (who: string) => `Aimed at ${who}.`,
      cta: (text: string) => text || "If this was useful, subscribe for more practical walkthroughs.",
      shortIntro: `A short, practical look at ${topic}.`,
      shortCta: "Subscribe for more.",
    },
    ar: {
      intro: [
        `في هذا الفيديو نتناول ${topic}، ونبيّن الفكرة العملية التي تفيدك مباشرة دون إضاعة وقت.`,
        `نستعرض في هذا الفيديو ${topic} من الفكرة الأساسية إلى النقاط التي تسبب المشكلات عادةً.`,
        `إذا كنت تحاول إتقان ${topic}، فهذا الشرح يركّز على الخطوات التي تُحدث فرقًا فعليًا.`,
      ],
      body: [
        `نبدأ بأساسيات ${keyword}، ثم ننتقل إلى القرارات العملية التي تغيّر النتيجة.`,
        `خلال الشرح ستتعرّف على الأخطاء الشائعة في ${keyword} وكيفية تجنّبها.`,
        `كل نقطة مشروحة بأمثلة ملموسة حتى تطبّقها مباشرة على حالتك.`,
        `الهدف هو عملية واضحة وقابلة للتكرار، لا قائمة نصائح تُحفظ.`,
      ],
      audience: (who: string) => `الفيديو موجّه إلى ${who}.`,
      cta: (text: string) => text || "إذا كان الفيديو مفيدًا، اشترك للمزيد من الشروحات العملية.",
      shortIntro: `نظرة قصيرة وعملية على ${topic}.`,
      shortCta: "اشترك للمزيد.",
    },
    fr: {
      intro: [
        `Dans cette vidéo, nous abordons ${frDirect(tp)} : ce que cela signifie concrètement et comment avancer sans perdre de temps.`,
        `Cette vidéo passe en revue ${frDirect(tp)}, de l'idée de base aux points qui posent généralement problème.`,
        `Si vous voulez maîtriser ${frDirect(tp)}, cette présentation se concentre sur les étapes qui changent vraiment le résultat.`,
      ],
      body: [
        `Nous commençons par les bases ${frDe(kp)}, puis nous passons aux décisions pratiques qui influencent le résultat.`,
        `Vous verrez aussi les erreurs courantes ${frWith("avec", kp)} et comment les éviter.`,
        `Chaque point est illustré par des exemples concrets, applicables immédiatement.`,
        `L'objectif est une méthode claire et reproductible, pas une liste d'astuces à mémoriser.`,
      ],
      audience: (who: string) => `Idéal ${frWith("pour", frPhrase(who))}.`,
      cta: (text: string) => text || "Si cette vidéo vous a été utile, abonnez-vous pour la suite.",
      shortIntro: `Un aperçu court et pratique ${frDe(tp)}.`,
      shortCta: "Abonnez-vous pour la suite.",
    },
    zh: {
      intro: [
        `本期视频聊聊${topic}：它实际意味着什么，以及怎样少走弯路。`,
        `这段讲解从${topic}的基本概念讲到最容易出问题的环节。`,
        `如果你正想把${topic}做好，这里集中讲真正影响结果的步骤。`,
      ],
      body: [
        `先从${keyword}的基础讲起，再谈会改变结果的具体判断。`,
        `过程中会提到${keyword}的常见问题以及如何避开。`,
        `每个要点都配合具体例子，方便你直接套用到自己的场景。`,
        `目标是形成清晰、可重复的流程，而不是背一堆技巧。`,
      ],
      audience: (who: string) => `适合${who}观看。`,
      cta: (text: string) => text || "如果这期内容有帮助，欢迎订阅获取更多实操讲解。",
      shortIntro: `用几分钟讲清${topic}。`,
      shortCta: "订阅获取更多内容。",
    },
  }[locale];

  const pick = (list: string[], index: number) => list[index % list.length];
  const finish = (text: string) => {
    const joined = text.replace(/[ \t]{2,}/g, " ").trim();
    return locale === "zh" ? zhSpacing(joined) : joined;
  };

  const hashtagLine = hashtagsFor(topic, keyword, locale).join(" ");

  if (style === "short") {
    return [
      finish(`${L.shortIntro} ${L.shortCta} ${hashtagLine}`),
      finish(`${L.shortIntro} ${audience ? L.audience(audience) : ""} ${L.shortCta}`),
    ];
  }

  const intro = [pick(L.intro, 0), pick(L.intro, 1), pick(L.intro, 2)];

  const bodySets = {
    balanced: [pick(L.body, 0), pick(L.body, 2)],
    seoFocused: [pick(L.body, 0), pick(L.body, 1), pick(L.body, 2)],
    professional: [pick(L.body, 3), pick(L.body, 0)],
    friendly: [pick(L.body, 1), pick(L.body, 2)],
    detailed: [pick(L.body, 0), pick(L.body, 1), pick(L.body, 2), pick(L.body, 3)],
  } as const;

  const descriptions: string[] = [];

  for (let variant = 0; variant < 2; variant += 1) {
    const parts = [
      pick(intro, variant),
      ...bodySets[style],
      audience ? L.audience(audience) : "",
      L.cta(cta),
      hashtagLine,
    ].filter(Boolean);

    descriptions.push(finish(parts.join(" ")));
  }

  return descriptions;
}

/* ------------------------------------------------------------------ */
/* Keyword ideas                                                       */
/* ------------------------------------------------------------------ */

export type KeywordIntentKey =
  | "broad"
  | "howTo"
  | "beginner"
  | "comparison"
  | "problem"
  | "review";

/**
 * Patterns take a noun phrase and return a phrase. They stay noun-first so the
 * result reads like a search query in every language, and none of them append
 * the audience value (which produced duplicated words such as
 * "for beginners beginners").
 */
const KEYWORD_PATTERNS: Record<Locale, Record<KeywordIntentKey, ((kw: string) => string)[]>> = {
  en: {
    broad: [(k) => `${k}`, (k) => `${k} explained`, (k) => `${k} overview`, (k) => `${k} examples`],
    howTo: [
      (k) => `how to do ${k}`,
      (k) => `${k} step by step`,
      (k) => `${k} tutorial`,
      (k) => `getting started with ${k}`,
    ],
    beginner: [(k) => `${k} for beginners`, (k) => `${k} basics`, (k) => `${k} from scratch`, (k) => `easy ${k}`],
    comparison: [(k) => `${k} vs alternatives`, (k) => `best ${k} tools`, (k) => `${k} comparison`, (k) => `is ${k} worth it`],
    problem: [(k) => `${k} not working`, (k) => `${k} mistakes`, (k) => `fix ${k} issues`, (k) => `why ${k} fails`],
    review: [(k) => `${k} review`, (k) => `${k} pros and cons`, (k) => `${k} results`, (k) => `${k} honest opinion`],
  },
  ar: {
    broad: [(k) => `${k}`, (k) => `شرح ${k}`, (k) => `${k} باختصار`, (k) => `أمثلة على ${k}`],
    howTo: [
      (k) => `كيف تبدأ مع ${k}`,
      (k) => `${k} خطوة بخطوة`,
      (k) => `درس عملي في ${k}`,
      (k) => `دليل ${k}`,
    ],
    beginner: [(k) => `${k} للمبتدئين`, (k) => `أساسيات ${k}`, (k) => `${k} من الصفر`, (k) => `${k} ببساطة`],
    comparison: [(k) => `${k} مقابل البدائل`, (k) => `أفضل البدائل في ${k}`, (k) => `مقارنة ${k}`, (k) => `هل ${k} خيار مناسب`],
    problem: [(k) => `مشاكل ${k}`, (k) => `أخطاء ${k}`, (k) => `حل مشاكل ${k}`, (k) => `أسباب ضعف نتائج ${k}`],
    review: [(k) => `مراجعة ${k}`, (k) => `مزايا وعيوب ${k}`, (k) => `نتائج ${k}`, (k) => `رأي صريح في ${k}`],
  },
  fr: {
    broad: [
      (k) => `${k}`,
      (k) => `${k} : explication`,
      (k) => `${k} en bref`,
      (k) => `exemples ${frDe(frPhrase(k))}`,
    ],
    howTo: [
      (k) => `comment aborder ${frDirect(frPhrase(k))}`,
      (k) => `${k} étape par étape`,
      (k) => `tutoriel : ${k}`,
      (k) => `débuter avec ${frDirect(frPhrase(k))}`,
    ],
    beginner: [
      (k) => `${k} pour débutants`,
      (k) => `les bases ${frDe(frPhrase(k))}`,
      (k) => `${k} de zéro`,
      (k) => `${k} pas à pas`,
    ],
    comparison: [
      (k) => `${k} : comparatif`,
      (k) => `comparatif ${k}`,
      (k) => `quelles alternatives ${frA(frPhrase(k))}`,
      (k) => `${k} : est-ce que ça vaut le coup`,
    ],
    problem: [
      (k) => `${frDirect(frPhrase(k))} : problèmes fréquents`,
      (k) => `erreurs à éviter ${frWith("avec", frPhrase(k))}`,
      (k) => `résoudre les problèmes ${frDe(frPhrase(k))}`,
      (k) => `pourquoi ça coince ${frWith("avec", frPhrase(k))}`,
    ],
    review: [
      (k) => `avis ${frWith("sur", frPhrase(k))}`,
      (k) => `${k} : avantages et inconvénients`,
      (k) => `résultats ${frWith("avec", frPhrase(k))}`,
      (k) => `${k} : retour honnête`,
    ],
  },
  zh: {
    broad: [(k) => `${k}`, (k) => `${k}讲解`, (k) => `${k}概览`, (k) => `${k}案例`],
    howTo: [(k) => `${k}怎么做`, (k) => `${k}步骤`, (k) => `${k}教程`, (k) => `如何开始${k}`],
    beginner: [(k) => `${k}入门`, (k) => `${k}基础`, (k) => `从零学${k}`, (k) => `${k}简单讲`],
    comparison: [(k) => `${k}对比`, (k) => `推荐${k}`, (k) => `${k}哪个好`, (k) => `${k}值得吗`],
    problem: [(k) => `${k}没效果`, (k) => `${k}常见错误`, (k) => `${k}问题排查`, (k) => `为什么${k}没有效果`],
    review: [(k) => `${k}评测`, (k) => `${k}优缺点`, (k) => `${k}效果`, (k) => `${k}真实反馈`],
  },
};

export function buildKeywords(options: {
  topic: string;
  seed: string;
  audience: string;
  locale: Locale;
  intents: KeywordIntentKey[];
}): Record<KeywordIntentKey, string[]> {
  const { locale, intents } = options;
  const topic = normaliseForLocale(options.topic, locale);
  const seed = normaliseForLocale(options.seed || options.topic, locale);

  const clean = (value: string) =>
    locale === "zh" ? zhSpacing(value) : value.replace(/[ \t]{2,}/g, " ").trim();

  const result = {} as Record<KeywordIntentKey, string[]>;

  for (const intent of intents) {
    const patterns = KEYWORD_PATTERNS[locale][intent];
    const seen = new Set<string>();
    const items: string[] = [];

    for (const build of patterns) {
      // The seed is the phrase the patterns were written for; the topic is only
      // a fallback, otherwise pairs like "how to do seo tools" get generated.
      for (const source of [seed || topic]) {
        if (!source) continue;
        const value = clean(build(source));
        const key = value.toLowerCase();
        if (value && !seen.has(key)) {
          seen.add(key);
          items.push(value);
        }
      }
    }

    result[intent] = items.slice(0, 8);
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* Script structure                                                    */
/* ------------------------------------------------------------------ */

export type ScriptStyleKey =
  | "educational"
  | "conversational"
  | "professional"
  | "storytelling"
  | "tutorial";

export type ScriptOutput = {
  hook: string;
  introduction: string;
  mainPoints: { title: string; content: string }[];
  transitions: string[];
  cta: string;
  outro: string;
  hookAlternatives: string[];
  ctaAlternatives: string[];
};

export function buildScriptContent(options: {
  topic: string;
  keyword: string;
  audience: string;
  goal: string;
  locale: Locale;
  style: ScriptStyleKey;
  points: number;
}): ScriptOutput {
  const { locale, style, points } = options;
  const topic = normaliseForLocale(options.topic, locale);
  const keyword = normaliseForLocale(options.keyword || options.topic, locale);
  const audience = normaliseForLocale(options.audience, locale);
  const goal = normaliseForLocale(options.goal, locale);

  const tp = frPhrase(topic);
  const kp = frPhrase(keyword);

  const hooks: Record<Locale, Record<ScriptStyleKey, string[]>> = {
    en: {
      educational: [
        `Let's take the confusion out of ${topic} — this video breaks it into the ideas that actually matter.`,
        `Most explanations of ${topic} skip the part that matters. Let's fix that in the next few minutes.`,
      ],
      conversational: [
        `If you have been thinking about ${topic}, you are in the right place — we will make it much easier to understand.`,
        `Let's talk about ${topic}, without the jargon and without pretending it is harder than it is.`,
      ],
      professional: [
        `In this video we examine ${topic} in a structured way, focusing on the decisions with real impact.`,
        `This walkthrough covers ${topic} end to end, with the trade-offs made explicit.`,
      ],
      storytelling: [
        `Most people only think about ${topic} after something breaks. Here is what usually happens next.`,
        `A short story first: what ${topic} looked like before anyone paid attention to it.`,
      ],
      tutorial: [
        `By the end of this video you will know how to handle ${topic} step by step.`,
        `Follow along and you will have ${topic} working before the video ends.`,
      ],
    },
    ar: {
      educational: [
        `إذا وجدت ${topic} أصعب مما يجب، فهذا الفيديو يفكّكه إلى الأفكار التي تهم فعلًا.`,
        `معظم الشروحات تتجاوز الجزء المهم في ${topic}. سنعالجه هنا خلال دقائق.`,
      ],
      conversational: [
        `إن كان موضوع ${topic} من أولوياتك، فأنت في المكان المناسب — سنوضّحه خطوة بخطوة.`,
        `لنتحدث عن ${topic} بلا تعقيد وبلا مصطلحات زائدة.`,
      ],
      professional: [
        `نستعرض في هذا الفيديو ${topic} بطريقة منظمة، مع التركيز على القرارات ذات الأثر الحقيقي.`,
        `يغطي هذا الشرح ${topic} من البداية إلى النهاية مع توضيح المقايضات.`,
      ],
      storytelling: [
        `معظم الناس لا يفكرون في ${topic} إلا بعد حدوث مشكلة. وهذا ما يحدث عادةً بعدها.`,
        `قصة قصيرة أولًا: كيف بدأ الاهتمام بهذا الموضوع — ${topic}.`,
      ],
      tutorial: [
        `بنهاية هذا الفيديو ستعرف كيف تتعامل مع ${topic} خطوة بخطوة.`,
        `تابع معي وستنجز ${topic} قبل نهاية الفيديو.`,
      ],
    },
    fr: {
      educational: [
        `Cette vidéo découpe ${frDirect(tp)} en idées qui comptent vraiment, sans détour.`,
        `La plupart des explications ${frDe(tp)} oublient l'essentiel. On corrige cela en quelques minutes.`,
      ],
      conversational: [
        `Si vous vous intéressez ${frA(tp)}, vous êtes au bon endroit : on va rendre cela beaucoup plus clair.`,
        `Parlons ${frDe(tp)}, sans jargon et sans compliquer ce qui ne l'est pas.`,
      ],
      professional: [
        `Dans cette vidéo, nous examinons ${frDirect(tp)} de façon structurée, en nous concentrant sur les décisions qui comptent.`,
        `Ce tour d'horizon couvre ${frDirect(tp)} de bout en bout, compromis inclus.`,
      ],
      storytelling: [
        `La plupart des gens ne pensent ${frA(tp)} qu'après un problème. Voici ce qui se passe ensuite.`,
        `Une courte histoire d'abord : à quoi ressemblait ${frDirect(tp)} avant qu'on s'y intéresse.`,
      ],
      tutorial: [
        `À la fin de cette vidéo, vous saurez traiter ${frDirect(tp)} étape par étape.`,
        `Suivez la démonstration et mettez ${frDirect(tp)} en pratique avant la fin.`,
      ],
    },
    zh: {
      educational: [
        `如果${topic}看起来比实际更复杂，这期视频会把它拆成真正重要的几个要点。`,
        `很多讲解都跳过了${topic}最关键的部分，这里用几分钟补上。`,
      ],
      conversational: [
        `如果你最近在琢磨${topic}，那这期正好——我们会把它讲得简单很多。`,
        `聊聊${topic}，不堆术语，也不把它说得比实际更难。`,
      ],
      professional: [
        `本期视频用结构化的方式分析${topic}，聚焦真正影响结果的决策。`,
        `这次讲解覆盖${topic}的完整流程，并把取舍讲清楚。`,
      ],
      storytelling: [
        `大多数人都是在出问题之后才开始关注${topic}。接下来看看通常会怎样。`,
        `先讲个小故事：在大家重视之前，${topic}是什么样子。`,
      ],
      tutorial: [
        `看完这期视频，你会知道如何一步步处理${topic}。`,
        `跟着做，视频结束前就能把${topic}跑通。`,
      ],
    },
  };

  const intros: Record<Locale, string[]> = {
    en: [
      `We will cover ${topic} from the ground up, then the practical steps for ${keyword}.`,
      `Here is what we will go through: the context, the common pitfalls, and a repeatable process.`,
    ],
    ar: [
      `سنغطي الموضوع ولماذا يهم، ثم الخطوات العملية في ${keyword}.`,
      `سنتناول السياق، والأخطاء الشائعة، ثم عملية قابلة للتكرار.`,
    ],
    fr: [
      `Au programme : ${frDirect(tp)}, pourquoi cela compte, et les étapes pratiques ${frDe(kp)}.`,
      `Au programme : le contexte, les pièges courants et une méthode reproductible.`,
    ],
    zh: [
      `我们会讲清${topic}是什么、为什么重要，以及${keyword}的具体步骤。`,
      `内容顺序是：背景、常见坑，以及一套可重复的流程。`,
    ],
  };

  const pointTitles: Record<Locale, (index: number) => string> = {
    en: (i) => `Point ${i}`,
    ar: (i) => `النقطة ${i}`,
    fr: (i) => `Point ${i}`,
    zh: (i) => `要点 ${i}`,
  };

  const pointBodies: Record<Locale, string[]> = {
    en: [
      `Explain ${keyword} in plain language, then show one concrete example on screen.`,
      `Walk through the decision that changes the result, and say what you would avoid.`,
      `Show a before/after or a quick demonstration so the point is visible, not just claimed.`,
      `Summarise the takeaway in one sentence before moving on.`,
      `Connect this point back to ${topic} so the viewer keeps the thread.`,
    ],
    ar: [
      `اشرح ${keyword} بلغة واضحة، ثم اعرض مثالًا واحدًا ملموسًا على الشاشة.`,
      `تناول القرار الذي يغيّر النتيجة، ووضّح ما يجب تجنّبه.`,
      `اعرض "قبل وبعد" أو عرضًا سريعًا حتى تكون الفكرة مرئية لا مجرد كلام.`,
      `لخّص الخلاصة في جملة واحدة قبل الانتقال.`,
      `اربط هذه النقطة بموضوع ${topic} حتى يبقى الخيط واضحًا للمشاهد.`,
    ],
    fr: [
      `Expliquez ${frDirect(kp)} simplement, puis montrez un exemple concret à l'écran.`,
      `Détaillez la décision qui change le résultat et ce qu'il faut éviter.`,
      `Montrez un avant/après ou une démonstration rapide pour rendre le point visible.`,
      `Résumez l'idée en une phrase avant de passer à la suite.`,
      `Reliez ce point ${frA(tp)} pour garder le fil conducteur.`,
    ],
    zh: [
      `用通俗的语言解释${keyword}，再在画面上给出一个具体例子。`,
      `讲清会改变结果的那个判断，以及应该避免的做法。`,
      `用前后对比或快速演示让要点看得见，而不只是口头结论。`,
      `在进入下一点前，用一句话总结要点。`,
      `把这一点重新扣回${topic}，让观众不丢线索。`,
    ],
  };

  const transitionsByLocale: Record<Locale, string[]> = {
    en: [
      "With that in place, let's look at the next step.",
      "Now let's move to the part people usually get wrong.",
      "Next, a detail that changes how this works.",
    ],
    ar: [
      "بعد أن اتضحت هذه النقطة، لننتقل إلى الخطوة التالية.",
      "الآن ننتقل إلى الجزء الذي يخطئ فيه كثيرون.",
      "بعد ذلك، تفصيل يغيّر طريقة عمل الأمر.",
    ],
    fr: [
      "Ce point étant posé, passons à l'étape suivante.",
      "Voyons maintenant la partie souvent mal comprise.",
      "Ensuite, un détail qui change le fonctionnement.",
    ],
    zh: ["这一点讲完，我们看下一步。", "接下来是最容易做错的部分。", "再讲一个会改变结果的细节。"],
  };

  const lines = hooks[locale][style];
  const pointCount = Math.max(1, Math.min(points, 5));

  const mainPoints = Array.from({ length: pointCount }, (_, index) => ({
    title: pointTitles[locale](index + 1),
    content: pointBodies[locale][index % pointBodies[locale].length],
  }));

  const ctas: Record<Locale, string> = {
    en: goal
      ? `If you want to go further, ${goal.charAt(0).toLowerCase()}${goal.slice(1)} — the next step is in the description.`
      : "If this was useful, subscribe and check the next video in the series.",
    ar: goal
      ? `إذا أردت المضي قدمًا: ${goal} — الخطوة التالية موجودة في الوصف.`
      : "إذا كان الفيديو مفيدًا، اشترك وتابع الفيديو التالي في السلسلة.",
    fr: goal
      ? `Pour aller plus loin : ${goal} — la prochaine étape est dans la description.`
      : "Si cette vidéo vous a aidé, abonnez-vous et regardez la suivante.",
    zh: goal
      ? `想继续深入的话：${goal} —— 下一步写在描述区。`
      : "如果这期有帮助，欢迎订阅并继续看下一期。",
  };

  const outros: Record<Locale, string> = {
    en: `That's the full picture for ${topic}. Apply one step today, then review what changed.`,
    ar: `هذه هي الصورة الكاملة: ${topic}. طبّق خطوة واحدة اليوم ثم راجع ما تغيّر.`,
    fr: `Voilà l'essentiel ${frWith("pour", tp)}. Appliquez une étape aujourd'hui, puis observez ce qui change.`,
    zh: `${topic}的整体思路就是这些。今天就先落地一步，再回看变化。`,
  };

  const output: ScriptOutput = {
    hook: lines[0],
    introduction: intros[locale][0],
    mainPoints,
    transitions: transitionsByLocale[locale].slice(0, Math.max(1, pointCount - 1)),
    cta: ctas[locale],
    outro: outros[locale],
    hookAlternatives: lines.slice(1, 3),
    ctaAlternatives: [
      audience
        ? {
            en: `Built for ${audience}.`,
            ar: `موجّه إلى ${audience}.`,
            fr: `Pensé pour ${audience}.`,
            zh: `面向${audience}。`,
          }[locale]
        : {
            en: "Start with the first step today.",
            ar: "ابدأ بالخطوة الأولى اليوم.",
            fr: "Commencez par la première étape aujourd'hui.",
            zh: "今天就从第一步开始。",
          }[locale],
    ],
  };

  if (locale === "zh") {
    return {
      ...output,
      hook: zhSpacing(output.hook),
      introduction: zhSpacing(output.introduction),
      mainPoints: output.mainPoints.map((point) => ({
        title: zhSpacing(point.title),
        content: zhSpacing(point.content),
      })),
      transitions: output.transitions.map(zhSpacing),
      cta: zhSpacing(output.cta),
      outro: zhSpacing(output.outro),
      hookAlternatives: output.hookAlternatives.map(zhSpacing),
      ctaAlternatives: output.ctaAlternatives.map(zhSpacing),
    };
  }

  return output;
}
