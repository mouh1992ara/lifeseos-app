import type { Locale } from "@/i18n/config";
import { arLi, frA, frDe, frDirect, frPhrase, frWith, frWorthQuestion, zhSpacing } from "./content-i18n";

/**
 * Title templates for the YouTube Title Generator.
 *
 * These are deterministic patterns, not "AI": each style has six structures and
 * the copy is written per language instead of being translated word-for-word,
 * because English word order produces awkward Arabic/French/Chinese titles.
 *
 * Placeholders: {topic} {keyword} {audience} keep the visitor's raw text.
 * French also supports grammatical forms so a bare noun is never spliced into a
 * sentence: {T} / {K} add the right article ("les outils SEO"), {T.de} and
 * {K.de} contract to "des/du/de la", {T.a} to "aux/au/à la". Those tokens fall
 * back to the raw text in the other three languages.
 */

export type TitleStyleKey =
  | "seoFocused"
  | "howTo"
  | "curiosity"
  | "list"
  | "beginnerFriendly"
  | "professional";

export const TITLE_TEMPLATES: Record<Locale, Record<TitleStyleKey, string[]>> = {
  en: {
    seoFocused: [
      "{keyword} Explained: A Practical Guide",
      "The Complete {keyword} Guide{audience}",
      "{topic}: How to Improve {keyword} Step by Step",
      "{keyword} Tips That Actually Work",
      "A Better {keyword} Strategy for {topic}",
      "What to Know About {keyword} Before You Start",
    ],
    howTo: [
      "A Step-by-Step Approach to {topic}",
      "How to Improve {keyword} Without Wasting Time",
      "How to Get Started with {keyword}{audience}",
      "How to Fix Common {keyword} Mistakes",
      "How to Build a Simple {keyword} Workflow",
      "How to Use {keyword} the Right Way",
    ],
    curiosity: [
      "Why Your {keyword} Is Not Working",
      "The Truth About {topic}",
      "What Most People Miss About {keyword}",
      "Is {keyword} Worth the Effort?",
      "The Hidden Cost of Getting {keyword} Wrong",
      "What Happens When You Fix {keyword}?",
    ],
    list: [
      "7 Practical {keyword} Tips",
      "5 {keyword} Mistakes to Avoid",
      "6 Things to Know About {topic}",
      "8 Ways to Improve {topic}",
      "10 {keyword} Ideas Worth Trying",
      "4 Simple Steps to Better {topic}",
    ],
    beginnerFriendly: [
      "{keyword} for Beginners: Start Here",
      "A Beginner's Guide to {topic}",
      "{topic} Made Simple",
      "Getting Started with {keyword}{audience}",
      "The Basics of {keyword}, Explained",
      "Your First Steps in {topic}",
    ],
    professional: [
      "A Practical Guide to {topic}",
      "{keyword}: Strategies and Best Practices",
      "Building a Reliable {keyword} Process",
      "{topic}: Key Decisions and Trade-offs",
      "A Framework for Better {keyword} Results",
      "What a Mature {keyword} Setup Looks Like",
    ],
  },

  ar: {
    seoFocused: [
      "{keyword}: دليل عملي مبسّط",
      "الدليل الكامل إلى {keyword}{audience}",
      "{topic}: كيف تحسّن {keyword} خطوة بخطوة",
      "نصائح عملية في {keyword} تستحق التجربة",
      "استراتيجية أفضل في {topic} مع {keyword}",
      "ما تحتاج معرفته عن {keyword} قبل البدء",
    ],
    howTo: [
      "كيف تنفّذ {topic} خطوة بخطوة",
      "كيف تحسّن {keyword} دون إضاعة الوقت",
      "كيف تبدأ مع {keyword}{audience}",
      "كيف تتجنّب الأخطاء الشائعة في {keyword}",
      "كيف تبني سير عمل بسيط في {keyword}",
      "كيف تستخدم {keyword} بالطريقة الصحيحة",
    ],
    curiosity: [
      "أسباب عدم تحقق النتائج في {keyword}",
      "الحقيقة حول {topic}",
      "ما يغفله معظم الناس عن {keyword}",
      "ما مدى جدوى {keyword} في البداية؟",
      "التكلفة الخفية لأخطاء {keyword}",
      "ماذا يحدث عندما تُصلح {keyword}؟",
    ],
    list: [
      "٧ نصائح عملية في {keyword}",
      "٥ أخطاء شائعة في {keyword} يجب تجنّبها",
      "٦ أمور يجب معرفتها عن {topic}",
      "٨ طرق لتحسين {topic}",
      "١٠ أفكار في {keyword} تستحق التجربة",
      "٤ خطوات بسيطة لتحسين {topic}",
    ],
    beginnerFriendly: [
      "{keyword} للمبتدئين: ابدأ من هنا",
      "دليل المبتدئين إلى {topic}",
      "{topic} بأسلوب مبسّط",
      "البدء مع {keyword}{audience}",
      "أساسيات {keyword} بشرح واضح",
      "خطواتك الأولى في {topic}",
    ],
    professional: [
      "دليل عملي إلى {topic}",
      "{keyword}: استراتيجيات وأفضل الممارسات",
      "بناء عملية موثوقة في {keyword}",
      "{topic}: قرارات ومقايضات أساسية",
      "إطار عمل لنتائج أفضل في {keyword}",
      "كيف يبدو إعداد {keyword} الناضج؟",
    ],
  },

  fr: {
    seoFocused: [
      "{keyword} : le guide pratique",
      "Le guide complet {K.de}{audience}",
      "{topic} : améliorer {K} étape par étape",
      "Des conseils concrets {K.sur}",
      "Une stratégie plus claire {K.pour}",
      "Ce qu'il faut savoir {K.sur} avant de commencer",
    ],
    howTo: [
      "Comment aborder {T} étape par étape",
      "Comment améliorer {K} sans perdre de temps",
      "Comment débuter avec {K}{audience}",
      "Comment éviter les erreurs courantes avec {K}",
      "Comment structurer un processus fiable {K.pour}",
      "Comment utiliser {K} correctement",
    ],
    curiosity: [
      "Le vrai problème avec {K}",
      "La vérité {T.sur}",
      "Ce que la plupart des gens ignorent {K.sur}",
      "{T.worth}",
      "Le coût caché des erreurs avec {K}",
      "Que se passe-t-il quand on corrige {K} ?",
    ],
    list: [
      "7 conseils pratiques {K.pour}",
      "5 erreurs courantes à éviter avec {K}",
      "6 choses à savoir {T.sur}",
      "8 façons d'améliorer {T}",
      "10 idées à tester {K.pour}",
      "4 étapes simples pour améliorer {T}",
    ],
    beginnerFriendly: [
      "{keyword} pour débutants : commencez ici",
      "Le guide du débutant {T.pour}",
      "Comprendre {T} simplement",
      "Débuter avec {K}{audience}",
      "Les bases {K.de}, expliquées",
      "Vos premiers pas avec {T}",
    ],
    professional: [
      "Un guide pratique {T.de}",
      "{keyword} : stratégies et bonnes pratiques",
      "Construire un processus fiable {K.pour}",
      "{topic} : décisions et compromis clés",
      "Un cadre pour de meilleurs résultats avec {K}",
      "À quoi ressemble une approche mature {K.de}",
    ],
  },

  zh: {
    seoFocused: [
      "{keyword}详解：一份实用指南",
      "{keyword}完整指南{audience}",
      "{topic}：一步步提升{keyword}",
      "真正有效的{keyword}技巧",
      "{topic}中更好的{keyword}策略",
      "开始之前你需要了解的{keyword}",
    ],
    howTo: [
      "如何一步步完成{topic}",
      "如何在不浪费时间的前提下提升{keyword}",
      "如何入门{keyword}{audience}",
      "如何避开常见的{keyword}错误",
      "如何搭建简单的{keyword}流程",
      "如何正确使用{keyword}",
    ],
    curiosity: [
      "为什么你的{keyword}没有效果",
      "关于{topic}的真相",
      "大多数人忽略的{keyword}细节",
      "{keyword}真的值得投入吗？",
      "{keyword}出错的隐性成本",
      "修正{keyword}之后会发生什么？",
    ],
    list: [
      "7 个实用的{keyword}技巧",
      "5 个需要避免的{keyword}错误",
      "关于{topic}的 6 件事",
      "8 种改善{topic}的方法",
      "10 个值得尝试的{keyword}思路",
      "改善{topic}的 4 个简单步骤",
    ],
    beginnerFriendly: [
      "{keyword}入门：从这里开始",
      "{topic}新手指南",
      "把{topic}讲简单",
      "从零开始学{keyword}{audience}",
      "{keyword}基础讲解",
      "{topic}的第一步",
    ],
    professional: [
      "{topic}实用指南",
      "{keyword}：策略与最佳实践",
      "搭建可靠的{keyword}流程",
      "{topic}：关键决策与取舍",
      "让{keyword}更见效的框架",
      "成熟的{keyword}体系是什么样",
    ],
  },
};

const AUDIENCE_CLAUSE: Record<Locale, (who: string) => string> = {
  en: (who) => ` for ${who}`,
  ar: (who) => ` ${arLi(who)}`,
  fr: (who) => ` pour ${who}`,
  zh: (who) => `（面向${who}）`,
};

/**
 * Keep the user's own capitalisation (so "SEO" never becomes "Seo"); only the
 * first character of the finished title is capitalised, and only for en/fr.
 */
export function normaliseText(value: string, locale: Locale) {
  void locale;
  return value.trim().replace(/\s+/g, " ");
}

function capitaliseFirst(value: string, locale: Locale) {
  if (locale === "ar" || locale === "zh" || value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const YOUTUBE_TITLE_LIMIT = 100;

export function buildTitles(options: {
  topic: string;
  keyword: string;
  audience: string;
  locale: Locale;
  style: TitleStyleKey;
}): string[] {
  const { audience, locale, style } = options;

  const topicText = normaliseText(options.topic, locale);
  const keywordText = normaliseText(options.keyword || options.topic, locale);
  const audienceText = audience.trim() ? AUDIENCE_CLAUSE[locale](audience.trim()) : "";

  const topicPhrase = frPhrase(topicText);
  const keywordPhrase = frPhrase(keywordText);

  /** French-only grammatical forms; other locales use the raw text. */
  const topicForm = (mode?: string) => {
    if (locale !== "fr") return topicText;
    if (mode === "de") return frDe(topicPhrase);
    if (mode === "a") return frA(topicPhrase);
    if (mode === "sur") return frWith("sur", topicPhrase);
    if (mode === "pour") return frWith("pour", topicPhrase);
    if (mode === "worth") return frWorthQuestion(topicPhrase);
    return frDirect(topicPhrase);
  };

  const keywordForm = (mode?: string) => {
    if (locale !== "fr") return keywordText;
    if (mode === "de") return frDe(keywordPhrase);
    if (mode === "a") return frA(keywordPhrase);
    if (mode === "sur") return frWith("sur", keywordPhrase);
    if (mode === "pour") return frWith("pour", keywordPhrase);
    return frDirect(keywordPhrase);
  };

  const rendered = TITLE_TEMPLATES[locale][style].map((template) => {
    const filled = template
      .replace(/\{T\.(de|a|sur|pour|worth)\}/g, (_match, mode: string) => topicForm(mode))
      .replace(/\{K\.(de|a|sur|pour)\}/g, (_match, mode: string) => keywordForm(mode))
      .replace(/\{T\}/g, () => topicForm())
      .replace(/\{K\}/g, () => keywordForm())
      .replace(/\{topic\}/g, () => topicText)
      .replace(/\{keyword\}/g, () => keywordText)
      .replace(/\{audience\}/g, () => audienceText);

    const tidy = filled.replace(/[ \t]{2,}/g, " ").trim();
    return locale === "zh" ? zhSpacing(tidy) : tidy;
  });

  // De-duplicate and stay inside YouTube's 100-character limit by dropping the
  // optional audience clause first, rather than truncating mid-word.
  const seen = new Set<string>();
  const output: string[] = [];

  for (const title of rendered) {
    let candidate = title;
    if (candidate.length > YOUTUBE_TITLE_LIMIT && audienceText) {
      candidate = candidate.replace(audienceText, "").replace(/[ \t]{2,}/g, " ").trim();
    }
    candidate = capitaliseFirst(candidate, locale);
    if (candidate.length > YOUTUBE_TITLE_LIMIT) {
      candidate = `${candidate.slice(0, YOUTUBE_TITLE_LIMIT - 1).trimEnd()}…`;
    }
    const key = candidate.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(candidate);
    }
  }

  return output;
}
