"use client";

import { Link } from "@/i18n/navigation";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { getFixLink } from "@/lib/fix-links";

type SEOResult = {
  url?: string;
  score: number;
  grade?: string;
  status: string;
  title?: string;
  description?: string;
  h1?: string;
  canonical?: string;
  images?: {
    total: number;
    missingAlt: number;
  };
  social?: {
    ogTitle?: string;
  };
  passed?: string[];
  errors?: string[];
  warnings?: string[];
};

/* ------------------------------------------------------------------ */
/* Arabic copy for the fixed messages returned by /api/analyze         */
/* ------------------------------------------------------------------ */

const ISSUES: Record<string, { label: string; why: string }> = {
  "Missing page title": {
    label: "عنوان الصفحة مفقود",
    why: "عنوان الصفحة هو أهم عنصر يظهر في نتائج البحث وعلى تبويب المتصفح. أضف وسم title واضحاً بطول يقارب 50 إلى 60 حرفاً ويتضمن الكلمة المفتاحية الرئيسية.",
  },
  "Missing meta description": {
    label: "وصف الميتا مفقود",
    why: "وصف الميتا يلخّص الصفحة تحت العنوان في نتائج البحث ويؤثر في قرار الزائر بالنقر. اكتب وصفاً فريداً بطول يقارب 140 إلى 160 حرفاً. وقد يعيد محرك البحث كتابته أحياناً.",
  },
  "Missing H1 heading": {
    label: "عنوان H1 مفقود",
    why: "عنوان H1 يعرّف الزائر ومحركات البحث بموضوع الصفحة. استخدم عنواناً رئيسياً واحداً واضحاً في كل صفحة.",
  },
  "Missing canonical URL": {
    label: "الرابط الأساسي (canonical) مفقود",
    why: "الرابط الأساسي يحدد النسخة المفضلة للصفحة ويقلل مشاكل المحتوى المكرر عندما يمكن الوصول إليها بأكثر من رابط.",
  },
  "Some images missing ALT attributes": {
    label: "بعض الصور بدون نص بديل (ALT)",
    why: "النص البديل يساعد محركات البحث وقارئات الشاشة على فهم الصور، ويظهر عند تعذّر تحميلها. أضف وصفاً مختصراً لكل صورة مهمة.",
  },
  "Missing social metadata": {
    label: "بيانات المشاركة الاجتماعية (Open Graph) مفقودة",
    why: "وسوم Open Graph تتحكم في شكل الرابط عند مشاركته على فيسبوك وواتساب وغيرهما، من عنوان وصورة ووصف.",
  },
};

const PASSED: Record<string, string> = {
  "Page title detected": "تم العثور على عنوان الصفحة",
  "Meta description detected": "تم العثور على وصف الميتا",
  "H1 heading detected": "تم العثور على عنوان H1",
  "Canonical URL detected": "تم العثور على الرابط الأساسي (canonical)",
  "Images ALT attributes detected": "جميع الصور تحتوي على نص بديل (ALT)",
  "Social OG title detected": "تم العثور على عنوان المشاركة الاجتماعية (OG)",
};

const STATUS: Record<string, string> = {
  Excellent: "ممتاز",
  Good: "جيد",
  "Needs Improvement": "يحتاج إلى تحسين",
};

const MISSING_VALUES = new Set([
  "Not found",
  "No title found",
  "No description found",
  "No H1 found",
]);

/* ------------------------------------------------------------------ */
/* Static educational content                                          */
/* ------------------------------------------------------------------ */

const HOW_STEPS = [
  {
    title: "أدخل رابط الصفحة",
    text: "الصق رابط أي صفحة عامة: الرئيسية أو مقال أو صفحة منتج.",
  },
  {
    title: "افهم النتائج",
    text: "نعرض لك الدرجة والمشاكل مرتبة بالأولوية، مع شرح لسبب أهمية كل مشكلة.",
  },
  {
    title: "أصلح ثم أعد الفحص",
    text: "استخدم أزرار الإصلاح أو عدّل صفحتك بنفسك، ثم حلّل الرابط مرة أخرى لترى الفرق.",
  },
];

const CHECKS = [
  {
    icon: "🏷️",
    title: "عنوان الصفحة (title)",
    ideal: "المثالي: 50 إلى 60 حرفاً",
    text: "أول ما يراه الباحث في النتائج، ومن أهم العناصر التي تساعد محرك البحث على فهم موضوع الصفحة.",
  },
  {
    icon: "📝",
    title: "وصف الميتا (meta description)",
    ideal: "المثالي: 140 إلى 160 حرفاً",
    text: "لا يرفع الترتيب مباشرة في الغالب، لكنه يؤثر في إقناع الزائر بالنقر على نتيجتك.",
  },
  {
    icon: "🔠",
    title: "عنوان H1",
    ideal: "المثالي: عنوان واحد واضح",
    text: "العنوان الرئيسي داخل الصفحة. يربط ما وعدت به في نتائج البحث بما يراه الزائر فعلاً.",
  },
  {
    icon: "🔗",
    title: "الرابط الأساسي (canonical)",
    ideal: "المثالي: يشير إلى النسخة المفضلة",
    text: "يخبر محركات البحث أي رابط هو الأصل عندما تتكرر الصفحة بأكثر من رابط.",
  },
  {
    icon: "🖼️",
    title: "النص البديل للصور (ALT)",
    ideal: "المثالي: وصف مختصر لكل صورة مهمة",
    text: "يساعد على فهم الصور ويفيد الزوار الذين يستخدمون قارئات الشاشة.",
  },
  {
    icon: "📣",
    title: "بيانات المشاركة (Open Graph)",
    ideal: "المثالي: عنوان ووصف وصورة",
    text: "تتحكم في شكل رابطك عند مشاركته في فيسبوك وواتساب وتويتر وغيرها.",
  },
];

const SCORE_LEVELS = [
  { label: "ضعيف", range: "0 – 39", grade: "F", width: 40, bar: "bg-rose-500/70" },
  { label: "مقبول", range: "40 – 59", grade: "D", width: 20, bar: "bg-orange-400/70" },
  { label: "جيد", range: "60 – 74", grade: "C", width: 15, bar: "bg-amber-400/70" },
  { label: "جيد جداً", range: "75 – 89", grade: "B", width: 15, bar: "bg-lime-400/70" },
  { label: "ممتاز", range: "90 – 100", grade: "A", width: 10, bar: "bg-emerald-400/80" },
];

const LOADING_STEPS = [
  "جلب الصفحة",
  "قراءة العنوان والوصف",
  "فحص الصور والروابط",
  "حساب الدرجة",
];

const RELATED_TOOLS = [
  {
    href: "/tools/meta-tag-generator",
    icon: "✨",
    title: "مولّد وسوم الميتا",
    text: "اكتب عنواناً ووصفاً جاهزين للصفحة.",
  },
  {
    href: "/tools/robots-txt-generator",
    icon: "🤖",
    title: "مولّد robots.txt",
    text: "حدّد ما يمكن لمحركات البحث زحفه.",
  },
  {
    href: "/tools/xml-sitemap-generator",
    icon: "🌐",
    title: "مولّد خريطة الموقع",
    text: "ساعد محركات البحث على اكتشاف صفحاتك.",
  },
  {
    href: "/tools/schema-markup-generator",
    icon: "🧩",
    title: "مولّد بيانات Schema",
    text: "أنشئ بيانات منظمة جاهزة للصق.",
  },
];

const FAQ = [
  {
    q: "هل الأداة مجانية؟",
    a: "نعم، يمكنك تحليل الصفحات مجاناً. وقد يوجد حد للمحاولات خلال فترة قصيرة لحماية الخدمة من الإساءة.",
  },
  {
    q: "هل الدرجة العالية تضمن ترتيباً متقدماً؟",
    a: "لا. الدرجة مؤشر على سلامة العناصر الأساسية في الصفحة فقط. ترتيب موقعك يعتمد على جودة المحتوى والمنافسة وعوامل كثيرة أخرى، ولا يمكن لأي أداة أن تضمن ترتيباً محدداً.",
  },
  {
    q: "ما الدرجة التي تُعد جيدة؟",
    a: "في هذه الأداة: 80 فأكثر تعني ممتاز، ومن 60 إلى 79 تعني جيد، وأقل من ذلك يحتاج إلى تحسين. والأهم من الرقم أن تعالج المشاكل الظاهرة في القائمة.",
  },
  {
    q: "لماذا لم تكتشف الأداة عنصراً أضفته؟",
    a: "قد تكون الصفحة تضيف هذا العنصر عبر JavaScript بعد التحميل، أو أن التعديل لم يُنشر بعد أو ما زال محفوظاً في ذاكرة التخزين المؤقت. انتظر قليلاً وأعد التحليل.",
  },
  {
    q: "هل تحلل الأداة الموقع كله؟",
    a: "تحلل الأداة الصفحة التي تدخل رابطها فقط. كرّر الفحص لكل صفحة مهمة، مثل الرئيسية وأهم المقالات والمنتجات.",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-amber-300";
  return "text-rose-300";
}

function scoreStroke(score: number) {
  if (score >= 80) return "stroke-emerald-400";
  if (score >= 60) return "stroke-amber-400";
  return "stroke-rose-400";
}

function isMissing(value?: string) {
  return !value || MISSING_VALUES.has(value.trim());
}

function charCount(value?: string) {
  return isMissing(value) ? 0 : Array.from((value as string).trim()).length;
}

function formatBreadcrumb(rawUrl?: string) {
  if (!rawUrl) return "";

  try {
    const parsed = new URL(rawUrl);
    const parts = parsed.pathname.split("/").filter(Boolean).slice(0, 2);

    return [parsed.hostname.replace(/^www\./, ""), ...parts].join(" › ");
  } catch {
    return rawUrl;
  }
}

function truncate(value: string, max: number) {
  const chars = Array.from(value);

  return chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : value;
}

const animationStyles = `
@keyframes ar-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}
@keyframes ar-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-18px) scale(1.05); }
}
@keyframes ar-sweep {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
@keyframes ar-pop {
  0% { transform: scale(0.6); opacity: 0; }
  70% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}
.ar-fade-up { animation: ar-fade-up 0.6s ease both; }
.ar-float { animation: ar-float 9s ease-in-out infinite; }
.ar-float-slow { animation: ar-float 13s ease-in-out infinite; }
.ar-sweep { animation: ar-sweep 1.6s ease-in-out infinite; }
.ar-pop { animation: ar-pop 0.5s ease both; }
.ar-reveal {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.ar-reveal[data-visible="true"] {
  opacity: 1;
  transform: none;
}
.ar-lift {
  transition: transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
}
.ar-lift:hover {
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .ar-fade-up, .ar-float, .ar-float-slow, .ar-sweep, .ar-pop { animation: none; }
  .ar-reveal { opacity: 1; transform: none; transition: none; }
  .ar-lift:hover { transform: none; }
}
`;

/* ------------------------------------------------------------------ */
/* Hooks and small animated pieces                                     */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    setValue(0);
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function CountUp({ value }: { value: number }) {
  const animated = useCountUp(value, 1100);

  return <>{animated}</>;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible}
      className={`ar-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SeoAnalyzerArClient() {
  const prefillHandledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function analyzeWebsite(event?: FormEvent, overrideUrl?: string) {
    event?.preventDefault();

    const cleanUrl = (overrideUrl ?? url).trim();

    if (!cleanUrl) {
      setError("الرجاء إدخال رابط الموقع.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "وصلت إلى الحد المسموح من المحاولات حالياً. انتظر قليلاً ثم حاول مرة أخرى."
          );
        }

        throw new Error(
          "تعذّر تحليل هذا الموقع. تأكد من صحة الرابط وأن الموقع متاح للعامة، ثم أعد المحاولة."
        );
      }

      void fetch("/api/tool-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool_name: "SEO Analyzer (Arabic)" }),
      }).catch((trackingError) => {
        console.error("Unable to record tool usage:", trackingError);
      });

      setResult({
        ...data,
        score: Number(data.score ?? 0),
        status: data.status ?? "Unknown",
        passed: data.passed ?? [],
        warnings: data.warnings ?? [],
        errors: data.errors ?? [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذّر تحليل هذا الموقع. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (prefillHandledRef.current) {
      return;
    }

    const incomingUrl = new URLSearchParams(window.location.search)
      .get("url")
      ?.trim();

    if (!incomingUrl) {
      return;
    }

    prefillHandledRef.current = true;
    setUrl(incomingUrl);

    void analyzeWebsite(undefined, incomingUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle through the loading steps while a request is running.
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStep((step) => Math.min(step + 1, LOADING_STEPS.length - 1));
    }, 1100);

    return () => window.clearInterval(timer);
  }, [loading]);

  // Bring the results into view once they arrive.
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  const issues = result
    ? [
        ...(result.errors ?? []).map((text) => ({
          text,
          severity: "error" as const,
        })),
        ...(result.warnings ?? []).map((text) => ({
          text,
          severity: "warning" as const,
        })),
      ]
    : [];

  async function copySummary() {
    if (!result) {
      return;
    }

    const lines = [
      "تقرير السيو من LifeSeos",
      `الصفحة: ${result.url ?? url}`,
      `الدرجة: ${result.score}/100 (${result.grade ?? getGrade(result.score)})`,
      "",
      issues.length > 0 ? "المشاكل المطلوب إصلاحها:" : "لا توجد مشاكل في الفحوص الأساسية.",
      ...issues.map(
        (issue, index) =>
          `${index + 1}. ${ISSUES[issue.text]?.label ?? issue.text}`
      ),
      "",
      "https://www.lifeseos.com/ar/tools/seo-analyzer",
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (copyError) {
      console.error("Unable to copy summary:", copyError);
    }
  }

  function analyzeAnother() {
    setResult(null);
    setError("");
    setUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => inputRef.current?.focus(), 400);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <style>{animationStyles}</style>

      <noscript>
        <style>{`.ar-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-6rem] h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl ar-float"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-5rem] top-40 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl ar-float-slow"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <section className="relative mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="ar-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <span>🔍</span>
              <span>محلل السيو من LifeSeos</span>
            </div>

            <h1
              className="ar-fade-up mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
              style={{ animationDelay: "80ms" }}
            >
              افحص سيو موقعك
              <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                مجاناً وبالعربية
              </span>
            </h1>

            <p
              className="ar-fade-up mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg"
              style={{ animationDelay: "160ms" }}
            >
              أدخل رابط أي صفحة لتفحص عنوانها ووصفها وعنوان H1 والرابط الأساسي
              والصور وبيانات المشاركة، ثم احصل على المشاكل مرتبة مع شرح سبب
              أهميتها وكيف تصلحها.
            </p>

            <ul
              className="ar-fade-up mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-300"
              style={{ animationDelay: "240ms" }}
            >
              {["مجاني", "شرح لكل مشكلة", "أزرار إصلاح جاهزة", "نتائج سريعة"].map(
                (chip) => (
                  <li
                    key={chip}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5"
                  >
                    <span className="text-emerald-300">✓</span>
                    {chip}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* FORM */}
          <form
            onSubmit={(event) => void analyzeWebsite(event)}
            className="ar-fade-up mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:flex-row"
            style={{ animationDelay: "320ms" }}
          >
            <label htmlFor="site-url" className="sr-only">
              رابط الموقع
            </label>

            <input
              ref={inputRef}
              id="site-url"
              type="text"
              inputMode="url"
              dir="ltr"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-left text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50 focus:shadow-[0_0_0_4px_rgba(52,211,153,0.08)]"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-4 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جارٍ التحليل..." : "حلّل الموقع"}
            </button>
          </form>

          {error ? (
            <div
              role="alert"
              className="ar-pop mx-auto mt-5 max-w-3xl rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm leading-7 text-rose-200"
            >
              {error}
            </div>
          ) : null}

          {/* LOADING */}
          {loading ? (
            <div className="ar-fade-up mx-auto mt-8 max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="ar-sweep absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
              </div>

              <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                {LOADING_STEPS.map((step, index) => {
                  const done = index < loadingStep;
                  const active = index === loadingStep;

                  return (
                    <li
                      key={step}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                        done
                          ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200"
                          : active
                            ? "border-cyan-400/30 bg-cyan-400/[0.07] text-white"
                            : "border-white/5 bg-black/10 text-slate-600"
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                        {done ? "✓" : index + 1}
                      </span>
                      {step}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </section>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-16 sm:px-6 lg:px-8">
        {/* RESULTS */}
        {result ? (
          <div ref={resultsRef} className="scroll-mt-6 space-y-8">
            {/* SCORE */}
            <section className="ar-fade-up grid gap-6 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:grid-cols-[auto_1fr] sm:items-center sm:p-9">
              <div className="mx-auto">
                <ScoreRing score={result.score} />
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  نتيجة التحليل
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  التقدير {result.grade ?? getGrade(result.score)} ·{" "}
                  <span className={scoreColor(result.score)}>
                    {STATUS[result.status] ?? result.status}
                  </span>
                </h2>

                {result.url ? (
                  <p
                    dir="ltr"
                    className="mt-3 truncate text-left text-sm text-slate-500"
                  >
                    {result.url}
                  </p>
                ) : null}

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  هذه الدرجة مؤشر على عناصر السيو الأساسية في الصفحة
                  فقط، وليست ضماناً لترتيب معين في نتائج البحث.
                </p>

                <ScoreScale score={result.score} />

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void copySummary()}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    {copied ? "تم النسخ ✓" : "نسخ ملخص التقرير"}
                  </button>

                  <button
                    type="button"
                    onClick={analyzeAnother}
                    className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                  >
                    تحليل موقع آخر
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK STATS */}
            <section className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="فحوص ناجحة"
                value={(result.passed ?? []).length}
                tone="emerald"
                delay={0}
              />
              <StatCard
                label="أخطاء"
                value={(result.errors ?? []).length}
                tone="rose"
                delay={100}
              />
              <StatCard
                label="تحذيرات"
                value={(result.warnings ?? []).length}
                tone="amber"
                delay={200}
              />
            </section>

            {/* ISSUES */}
            <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-9">
              <h2 className="text-2xl font-bold">ما يجب إصلاحه</h2>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                مرتّبة بحيث تبدأ بالأخطاء ثم التحذيرات. ابدأ من الأعلى.
              </p>

              {issues.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {issues.map((issue, index) => {
                    const copy = ISSUES[issue.text];
                    const fix = getFixLink(
                      issue.text,
                      {
                        url: result.url,
                        title: result.title,
                        description: result.description,
                      },
                      "ar"
                    );

                    return (
                      <article
                        key={`${issue.text}-${index}`}
                        className={`ar-fade-up ar-lift rounded-2xl border p-5 ${
                          issue.severity === "error"
                            ? "border-rose-400/20 bg-rose-400/[0.05] hover:border-rose-400/40"
                            : "border-amber-400/20 bg-amber-400/[0.05] hover:border-amber-400/40"
                        }`}
                        style={{ animationDelay: `${index * 90}ms` }}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-200">
                            {index + 1}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              issue.severity === "error"
                                ? "bg-rose-400/15 text-rose-200"
                                : "bg-amber-400/15 text-amber-200"
                            }`}
                          >
                            {issue.severity === "error" ? "خطأ" : "تحذير"}
                          </span>

                          <h3 className="font-semibold text-white">
                            {copy?.label ?? issue.text}
                          </h3>
                        </div>

                        {copy ? (
                          <p className="mt-3 text-sm leading-7 text-slate-400">
                            {copy.why}
                          </p>
                        ) : null}

                        {fix ? (
                          <Link
                            href={fix.href}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-400/20"
                          >
                            {fix.label} ←
                          </Link>
                        ) : null}
                      </article>
                    );
                  })}

                  <p className="text-xs leading-6 text-slate-500">
                    أدوات الإصلاح متاحة حالياً بالإنجليزية، وسنضيف نسخها
                    العربية تدريجياً.
                  </p>
                </div>
              ) : (
                <div className="ar-pop mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4 text-sm leading-7 text-emerald-300">
                  لم نجد مشاكل في الفحوص الأساسية. هذا لا يعني أن الصفحة
                  مثالية، فقد تحتاج فحوصاً أعمق.
                </div>
              )}
            </section>

            {/* SERP PREVIEW + LENGTHS */}
            <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-9">
              <h2 className="text-2xl font-bold">كيف قد تظهر صفحتك في البحث</h2>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                معاينة تقريبية مبنية على عنوان صفحتك ووصفها الحاليين. شكل النتيجة
                الفعلي يقرره محرك البحث.
              </p>

              <SerpPreview
                url={result.url}
                title={result.title}
                description={result.description}
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <LengthMeter
                  label="طول العنوان"
                  value={charCount(result.title)}
                  min={50}
                  max={60}
                />
                <LengthMeter
                  label="طول الوصف"
                  value={charCount(result.description)}
                  min={140}
                  max={160}
                />
              </div>
            </section>

            {/* PASSED */}
            {(result.passed ?? []).length > 0 ? (
              <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-9">
                <h2 className="text-2xl font-bold">ما يعمل جيداً</h2>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(result.passed ?? []).map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="ar-fade-up flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-3 text-sm leading-6 text-slate-300"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <span className="mt-0.5 text-emerald-300">✓</span>
                      <span>{PASSED[item] ?? item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* DETAILS */}
            <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-9">
              <h2 className="text-2xl font-bold">بيانات الصفحة</h2>

              <dl className="mt-6 space-y-4">
                <DetailRow label="عنوان الصفحة" value={result.title} />
                <DetailRow label="وصف الميتا" value={result.description} />
                <DetailRow label="عنوان H1" value={result.h1} />
                <DetailRow
                  label="الرابط الأساسي"
                  value={result.canonical}
                  ltr
                />
                <DetailRow
                  label="الصور"
                  value={
                    result.images
                      ? `${result.images.total} صورة، منها ${result.images.missingAlt} بدون نص بديل`
                      : undefined
                  }
                />
                <DetailRow
                  label="عنوان المشاركة (OG)"
                  value={result.social?.ogTitle}
                />
              </dl>
            </section>
          </div>
        ) : null}

        {/* HOW IT WORKS */}
        <Reveal className="mt-16">
          <p className="text-center text-xs font-semibold tracking-wide text-cyan-300">
            كيف تعمل الأداة
          </p>

          <h2 className="mt-3 text-center text-3xl font-bold sm:text-4xl">
            ثلاث خطوات فقط
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {HOW_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="ar-lift rounded-[24px] border border-white/10 bg-white/[0.03] p-6 hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-lg font-bold text-emerald-300">
                  {index + 1}
                </div>

                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* WHAT WE CHECK */}
        <Reveal className="mt-20">
          <p className="text-center text-xs font-semibold tracking-wide text-emerald-300">
            ماذا نفحص ولماذا
          </p>

          <h2 className="mt-3 text-center text-3xl font-bold sm:text-4xl">
            ستة عناصر أساسية في كل صفحة
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-slate-400 sm:text-base">
            هذه العناصر هي أساس ظهور صفحتك ومظهرها في نتائج البحث. القيم
            المثالية أدناه إرشادات عملية وليست قواعد صارمة.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((check, index) => (
              <Reveal key={check.title} delay={index * 70}>
                <div className="ar-lift h-full rounded-[24px] border border-white/10 bg-white/[0.03] p-6 hover:border-emerald-400/30 hover:bg-white/[0.05]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                    {check.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">{check.title}</h3>

                  <p className="mt-1 text-xs font-semibold text-emerald-300">
                    {check.ideal}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {check.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* SCORE EXPLAINED */}
        <Reveal className="mt-20 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-10">
          <h2 className="text-2xl font-bold">كيف نحسب الدرجة؟</h2>

          <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
            تبدأ كل صفحة من 100 نقطة، وتُخصم نقاط عند غياب عنصر أساسي. غياب
            العنوان أو الوصف أو H1 يخصم أكثر من غياب الرابط الأساسي أو النص
            البديل أو بيانات المشاركة. هي طريقة مبسطة لترتيب الأولويات وليست
            مقياساً رسمياً من محركات البحث.
          </p>

          <ScoreLegend />
        </Reveal>

        {/* RELATED TOOLS */}
        <Reveal className="mt-20">
          <p className="text-center text-xs font-semibold tracking-wide text-violet-300">
            أدوات تكمل الفحص
          </p>

          <h2 className="mt-3 text-center text-3xl font-bold sm:text-4xl">
            أصلح ما وجدته بأدوات جاهزة
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-slate-400">
            هذه الأدوات متاحة حالياً بالإنجليزية، وتُنتج كوداً جاهزاً للنسخ
            واللصق في موقعك.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {RELATED_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="ar-lift group rounded-[24px] border border-white/10 bg-white/[0.03] p-6 hover:border-violet-400/40 hover:bg-white/[0.06]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                  {tool.icon}
                </div>

                <h3 className="mt-5 text-base font-semibold transition group-hover:text-violet-300">
                  {tool.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {tool.text}
                </p>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal className="mt-20">
          <p className="text-center text-xs font-semibold tracking-wide text-blue-300">
            أسئلة شائعة
          </p>

          <h2 className="mt-3 text-center text-3xl font-bold sm:text-4xl">
            قبل أن تبدأ
          </h2>

          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 transition open:border-blue-400/30 open:bg-white/[0.05]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                  <span>{item.q}</span>

                  <span
                    aria-hidden="true"
                    className="text-xl text-blue-300 transition duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>

        {/* FOOTER LINKS */}
        <Reveal className="mt-16 rounded-[28px] border border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10 p-8 text-center">
          <p className="text-sm leading-7 text-slate-400">
            لا تغني هذه الأداة عن مراجعة بشرية: ترتيب موقعك يعتمد على جودة
            المحتوى والمنافسة وعوامل أخرى كثيرة، ولا يمكن لأي أداة أن تضمن
            ترتيباً محدداً.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm font-semibold">
            <Link
              href="/tools/seo-analyzer"
              className="text-blue-300 transition hover:text-blue-200"
            >
              النسخة الإنجليزية من الأداة ←
            </Link>

            <Link
              href="/tools"
              className="text-emerald-300 transition hover:text-emerald-200"
            >
              كل أدوات LifeSeos ←
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function ScoreRing({ score }: { score: number }) {
  const animated = useCountUp(Math.max(0, Math.min(100, score || 0)));
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animated / 100);

  return (
    <div className="relative h-44 w-44">
      <svg
        viewBox="0 0 160 160"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="12"
          className="stroke-white/10"
        />

        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={scoreStroke(score)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${scoreColor(score)}`}>
          {animated}
        </span>
        <span className="text-xs text-slate-500">من 100</span>
      </div>
    </div>
  );
}

function ScoreScale({ score }: { score: number }) {
  const safe = Math.max(0, Math.min(100, score || 0));

  return (
    <div className="mt-6">
      <div className="relative flex h-2 overflow-hidden rounded-full bg-white/10">
        {SCORE_LEVELS.map((level) => (
          <div
            key={level.grade}
            className={`h-full ${level.bar}`}
            style={{ width: `${level.width}%` }}
          />
        ))}
      </div>

      <div className="relative mt-1 h-4">
        <span
          aria-hidden="true"
          className="absolute -translate-x-1/2 text-xs text-white transition-all duration-1000 rtl:translate-x-1/2"
          style={{ insetInlineStart: `${safe}%` }}
        >
          ▲
        </span>
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}

function ScoreLegend() {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-5">
      {SCORE_LEVELS.map((level) => (
        <div
          key={level.grade}
          className="rounded-2xl border border-white/10 bg-black/10 p-4 text-center"
        >
          <div className={`mx-auto h-1.5 w-10 rounded-full ${level.bar}`} />

          <p className="mt-3 text-lg font-bold">{level.grade}</p>

          <p className="mt-1 text-sm text-slate-300">{level.label}</p>

          <p className="mt-1 text-xs text-slate-500">{level.range}</p>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  delay,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "amber";
  delay: number;
}) {
  const tones = {
    emerald: "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300",
    rose: "border-rose-400/20 bg-rose-400/[0.05] text-rose-300",
    amber: "border-amber-400/20 bg-amber-400/[0.05] text-amber-300",
  } as const;

  return (
    <div
      className={`ar-fade-up rounded-[24px] border p-6 text-center ${tones[tone]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-4xl font-bold">
        <CountUp value={value} />
      </p>

      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function SerpPreview({
  url,
  title,
  description,
}: {
  url?: string;
  title?: string;
  description?: string;
}) {
  const hasTitle = !isMissing(title);
  const hasDescription = !isMissing(description);

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 text-slate-900 shadow-lg shadow-black/20">
      <p dir="ltr" className="truncate text-left text-xs text-slate-600">
        {formatBreadcrumb(url)}
      </p>

      <p
        dir="auto"
        className={`mt-1 text-xl leading-snug ${
          hasTitle ? "text-[#1a0dab]" : "text-slate-400"
        }`}
      >
        {hasTitle ? truncate((title as string).trim(), 60) : "لا يوجد عنوان للصفحة"}
      </p>

      <p
        dir="auto"
        className={`mt-1 text-sm leading-6 ${
          hasDescription ? "text-slate-600" : "text-slate-400"
        }`}
      >
        {hasDescription
          ? truncate((description as string).trim(), 160)
          : "لا يوجد وصف ميتا، وقد يختار محرك البحث نصاً من الصفحة بنفسه."}
      </p>
    </div>
  );
}

function LengthMeter({
  label,
  value,
  min,
  max,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
}) {
  const scale = max * 1.4;
  const fill = Math.min(100, (value / scale) * 100);
  const bandStart = (min / scale) * 100;
  const bandWidth = ((max - min) / scale) * 100;

  const state =
    value === 0
      ? "missing"
      : value < min
        ? "short"
        : value > max
          ? "long"
          : "good";

  const copy = {
    missing: { text: "غير موجود", color: "text-slate-500", bar: "bg-slate-600" },
    short: {
      text: `قصير، المثالي ${min} إلى ${max}`,
      color: "text-amber-300",
      bar: "bg-amber-400",
    },
    long: {
      text: "طويل، وقد يُقتطع في النتائج",
      color: "text-amber-300",
      bar: "bg-amber-400",
    },
    good: { text: "طول مناسب", color: "text-emerald-300", bar: "bg-emerald-400" },
  }[state];

  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <p className="text-sm text-slate-400">{value} حرفاً</p>
      </div>

      <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 bg-emerald-400/20"
          style={{
            insetInlineStart: `${bandStart}%`,
            width: `${bandWidth}%`,
          }}
        />

        <div
          className={`absolute inset-y-0 rounded-full transition-all duration-1000 ${copy.bar}`}
          style={{ insetInlineStart: 0, width: `${fill}%` }}
        />
      </div>

      <p className={`mt-3 text-xs ${copy.color}`}>{copy.text}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value?: string;
  ltr?: boolean;
}) {
  const missing = isMissing(value);

  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 px-5 py-4">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>

      <dd
        dir={missing ? undefined : ltr ? "ltr" : "auto"}
        className={`mt-1 break-words text-sm leading-7 ${
          missing ? "text-slate-600" : "text-slate-200"
        } ${ltr && !missing ? "text-left" : ""}`}
      >
        {missing ? "غير موجود" : value}
      </dd>
    </div>
  );
}
