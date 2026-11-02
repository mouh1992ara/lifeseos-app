"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SeoAnalyzerArClient() {
  const prefillHandledRef = useRef(false);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [error, setError] = useState("");

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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <span>🔍</span>
            <span>محلل السيو من LifeSeos</span>
          </div>

          <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            افحص سيو موقعك
            <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              مجاناً وبالعربية
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            أدخل رابط أي صفحة لتفحص عنوانها ووصفها وعنوان H1 والرابط الأساسي
            والصور وبيانات المشاركة، ثم احصل على المشاكل مرتبة مع شرح سبب
            أهميتها وكيف تصلحها.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={(event) => void analyzeWebsite(event)}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-900/80 p-4 sm:flex-row"
        >
          <label htmlFor="site-url" className="sr-only">
            رابط الموقع
          </label>

          <input
            id="site-url"
            type="text"
            inputMode="url"
            dir="ltr"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-left text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-4 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "جارٍ التحليل..." : "حلّل الموقع"}
          </button>
        </form>

        {error ? (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-3xl rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm leading-7 text-rose-200"
          >
            {error}
          </div>
        ) : null}

        {/* RESULTS */}
        {result ? (
          <div className="mt-12 space-y-8">
            {/* SCORE */}
            <section className="grid gap-6 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:grid-cols-[auto_1fr] sm:items-center sm:p-9">
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
              </div>
            </section>

            {/* ISSUES */}
            <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-9">
              <h2 className="text-2xl font-bold">ما يجب إصلاحه</h2>

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
                        className={`rounded-2xl border p-5 ${
                          issue.severity === "error"
                            ? "border-rose-400/20 bg-rose-400/[0.05]"
                            : "border-amber-400/20 bg-amber-400/[0.05]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-3">
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
                <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4 text-sm text-emerald-300">
                  لم نجد مشاكل في الفحوص الأساسية. هذا لا يعني أن الصفحة
                  مثالية، فقد تحتاج فحوصاً أعمق.
                </div>
              )}
            </section>

            {/* PASSED */}
            {(result.passed ?? []).length > 0 ? (
              <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-9">
                <h2 className="text-2xl font-bold">ما يعمل جيداً</h2>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(result.passed ?? []).map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-3 text-sm leading-6 text-slate-300"
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

        {/* ABOUT THE TOOL */}
        <section className="mt-16 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-9">
          <h2 className="text-2xl font-bold">ماذا تفحص هذه الأداة؟</h2>

          <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
            تفحص الأداة العناصر الأساسية في الصفحة التي تؤثر في ظهورها
            ومظهرها في نتائج البحث:
          </p>

          <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-300 sm:grid-cols-2">
            <li>• عنوان الصفحة (title)</li>
            <li>• وصف الميتا (meta description)</li>
            <li>• عنوان H1 الرئيسي</li>
            <li>• الرابط الأساسي (canonical)</li>
            <li>• النص البديل للصور (ALT)</li>
            <li>• بيانات المشاركة الاجتماعية (Open Graph)</li>
          </ul>

          <p className="mt-6 text-sm leading-7 text-slate-500">
            لا تغني هذه الأداة عن مراجعة بشرية: ترتيب موقعك يعتمد على جودة
            المحتوى والمنافسة وعوامل أخرى كثيرة، ولا يمكن لأي أداة أن تضمن
            ترتيباً محدداً.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
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
        </section>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function ScoreRing({ score }: { score: number }) {
  const safe = Math.max(0, Math.min(100, score || 0));
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - safe / 100);

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
          className={scoreStroke(safe)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${scoreColor(safe)}`}>
          {safe}
        </span>
        <span className="text-xs text-slate-500">من 100</span>
      </div>
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
  const missing = !value || MISSING_VALUES.has(value.trim());

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
