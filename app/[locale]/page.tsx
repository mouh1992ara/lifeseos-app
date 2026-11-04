import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileCode2,
  FileSearch,
  FileText,
  Gauge,
  Gift,
  Globe2,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  WandSparkles,
  Wrench,
  Youtube,
  Zap,
} from "lucide-react";
import AudienceCards from "@/components/audience-cards";
import { CountUp, Meter } from "@/components/count-up";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.meta" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = "/";

  return {
    title: { absolute: t("title") },
    description: t("description"),
    alternates: {
      canonical: localizePath(locale as Locale, path),
      languages: buildLanguageAlternates(siteUrl, path),
    },
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: siteUrl + localizePath(locale as Locale, path),
      siteName: tMeta("siteName"),
      type: "website",
      locale: meta.ogLocale,
      images: [
        { url: "/social/home.png", width: 1200, height: 630, alt: t("title") },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("ogDescription"),
      images: ["/social/home.png"],
    },
  };
}

// Slugs are resolved against the localized catalog, so titles and descriptions
// always follow the active language.
const FEATURED_TOOLS = [
  { key: "seoAnalyzer", href: "/tools/seo-analyzer", icon: Search },
  { key: "seoPageAnalyzer", href: "/tools/seo-page-analyzer", icon: FileSearch },
  { key: "pageSpeed", href: "/tools/page-speed", icon: Gauge },
  { key: "contentAnalyzer", href: "/tools/content-analyzer", icon: BarChart3 },
  { key: "httpStatusChecker", href: "/tools/http-status-checker", icon: Zap },
  { key: "xmlSitemapGenerator", href: "/tools/xml-sitemap-generator", icon: Globe2 },
] as const;

const CATEGORY_GROUPS = [
  { key: "technical", icon: Layers3, links: ["seoAnalyzer", "httpStatusChecker", "robotsTxtGenerator", "schemaMarkupGenerator"] },
  { key: "onPage", icon: FileSearch, links: ["seoPageAnalyzer", "metaTagGenerator", "serpSnippetPreview", "contentAnalyzer"] },
  { key: "crawling", icon: Globe2, links: ["xmlSitemapGenerator", "robotsTxtGenerator", "seoAnalyzer"] },
  { key: "performance", icon: Gauge, links: ["pageSpeed", "seoAnalyzer"] },
  { key: "content", icon: WandSparkles, links: ["articleRewriter", "contentAnalyzer", "keywordDensityChecker"] },
  {
    key: "youtube",
    icon: Youtube,
    links: [
      "youtubeKeywordIdeas",
      "youtubeTitleGenerator",
      "youtubeTitleAnalyzer",
      "youtubeDescriptionGenerator",
      "youtubeScriptWriter",
    ],
  },
] as const;

const TOOL_HREF: Record<string, string> = {
  seoAnalyzer: "/tools/seo-analyzer",
  seoPageAnalyzer: "/tools/seo-page-analyzer",
  pageSpeed: "/tools/page-speed",
  contentAnalyzer: "/tools/content-analyzer",
  httpStatusChecker: "/tools/http-status-checker",
  xmlSitemapGenerator: "/tools/xml-sitemap-generator",
  metaTagGenerator: "/tools/meta-tag-generator",
  serpSnippetPreview: "/tools/serp-snippet-preview",
  robotsTxtGenerator: "/tools/robots-txt-generator",
  keywordDensityChecker: "/tools/keyword-density-checker",
  schemaMarkupGenerator: "/tools/schema-markup-generator",
  articleRewriter: "/tools/article-rewriter",
  youtubeKeywordIdeas: "/tools/youtube-keyword-ideas",
  youtubeTitleGenerator: "/tools/youtube-title-generator",
  youtubeTitleAnalyzer: "/tools/youtube-title-analyzer",
  youtubeDescriptionGenerator: "/tools/youtube-description-generator",
  youtubeScriptWriter: "/tools/youtube-script-writer",
};

const TRUST_ITEMS = [
  { icon: Gift, key: "free" },
  { icon: Zap, key: "fast" },
  { icon: CreditCard, key: "start" },
  { icon: ShieldCheck, key: "clarity" },
] as const;

const GUIDE_ITEMS = [
  { key: "robots", href: "/blog/robots-txt-guide" },
  { key: "http", href: "/blog/http-status-codes-seo-guide" },
  { key: "technical", href: "/blog/technical-seo-guide" },
] as const;

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const tState = await getTranslations("State");
  const toolCatalog = await getTranslations("Tools.catalog");

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
    description: t("meta.description"),
    logo: "https://www.lifeseos.com/opengraph-image.png",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
    inLanguage: locale,
    description: t("meta.description"),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: [1, 2, 3, 4, 5].map((n) => ({
      "@type": "Question",
      name: t(`faq.q${n}`),
      acceptedAnswer: { "@type": "Answer", text: t(`faq.a${n}`) },
    })),
  };

  const previewScores = [
    { label: t("preview.technical"), score: 86 },
    { label: t("preview.onPage"), score: 91 },
    { label: t("preview.performance"), score: 78 },
    { label: t("preview.content"), score: 84 },
  ];

  const previewChecks = [
    { label: t("preview.https"), state: tc("yes"), tone: "ok" },
    { label: t("preview.metaDescription"), state: t("preview.improve"), tone: "warn" },
    { label: t("preview.brokenLinks"), state: t("preview.fix"), tone: "bad" },
  ];

  const commandCenter = [
    { label: t("commandCenter.technical"), value: 86, state: "good", tone: "good" },
    { label: t("commandCenter.indexability"), value: 94, state: "strong", tone: "good" },
    { label: t("commandCenter.onPage"), value: 91, state: "strong", tone: "good" },
    { label: t("commandCenter.performance"), value: 78, state: "needsWork", tone: "warn" },
  ] as const;

  return (
    <main className="relative isolate w-full overflow-x-hidden bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-12 pt-20 sm:px-10 lg:px-16 lg:pb-16 lg:pt-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />
          <div className="absolute right-0 top-20 h-[350px] w-[350px] rounded-full bg-emerald-400/10 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {t("hero.badge")}
            </div>

            <h1 className="text-balance max-w-4xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
              {t("hero.titleLine1")}
              <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {t("hero.titleAccent")}
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              {t("hero.subtitle")}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/tools/seo-analyzer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                {t("hero.primaryCta")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>

              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 font-semibold transition hover:bg-white/[0.06]"
              >
                {t("hero.secondaryCta")}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {[
                t("hero.highlightFree"),
                t("hero.highlightFast"),
                t("hero.highlightClear"),
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard preview (decorative sample data) */}
          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-400/20 to-blue-500/20 blur-3xl" />

            <div className="relative rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-slate-500">{t("preview.overview")}</p>
                  <p className="mt-1 font-semibold">
                    <span data-ltr-text>example.com</span>
                    <span className="ms-2 text-xs font-normal text-slate-500">
                      {t("preview.sample")}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
                  {t("preview.auditBadge")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6">
                {previewScores.map(({ label, score }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <p className="text-sm text-slate-500">{label}</p>
                    <CountUp
                      value={score}
                      delay={150}
                      className="mt-3 block text-3xl font-bold tabular-nums"
                    />

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <Meter
                        value={score}
                        delay={200}
                        className="h-full rounded-full bg-emerald-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {previewChecks.map(({ label, state, tone }) => (
                  <div
                    key={label}
                    className={
                      "flex items-center justify-between gap-4 rounded-xl px-4 py-3 " +
                      (tone === "ok"
                        ? "bg-emerald-400/5"
                        : tone === "warn"
                          ? "bg-amber-400/5"
                          : "bg-red-400/5")
                    }
                  >
                    <span className="text-sm text-slate-300">{label}</span>
                    <span
                      className={
                        "text-xs font-medium " +
                        (tone === "ok"
                          ? "text-emerald-300"
                          : tone === "warn"
                            ? "text-amber-300"
                            : "text-red-300")
                      }
                    >
                      {state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR TOOLS */}
      <section className="px-6 pb-24 pt-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {t("tools.eyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t("tools.title")}
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                {t("tools.subtitle")}
              </p>
            </div>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {t("tools.viewAll")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_TOOLS.map(({ key, href, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400 rtl:rotate-180" />
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  {toolCatalog(`${key}.title`)}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {toolCatalog(`${key}.long`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW TOOL WORKFLOWS */}
      <section className="px-6 pb-10 pt-2 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            <Link
              href="/tools/schema-markup-generator"
              className="group rounded-[26px] border border-cyan-400/15 bg-cyan-400/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.055]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                <FileCode2 className="h-5 w-5 text-cyan-300" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                {t("workflows.technicalEyebrow")}
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {t("workflows.schemaTitle")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("workflows.schemaBody")}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                {t("workflows.schemaCta")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
              </span>
            </Link>

            <Link
              href="/tools/article-rewriter"
              className="group rounded-[26px] border border-blue-400/15 bg-blue-400/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-400/[0.055]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                <WandSparkles className="h-5 w-5 text-blue-300" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                {t("workflows.contentEyebrow")}
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {t("workflows.rewriterTitle")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("workflows.rewriterBody")}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                {t("workflows.rewriterCta")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
              </span>
            </Link>

            <Link
              href="/tools/youtube-keyword-ideas"
              className="group rounded-[26px] border border-red-400/15 bg-red-400/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-red-400/30 hover:bg-red-400/[0.055]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10">
                <Youtube className="h-5 w-5 text-red-300" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                {t("workflows.youtubeEyebrow")}
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                {t("workflows.youtubeTitle")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t("workflows.youtubeBody")}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-300">
                {t("workflows.youtubeCta")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <AudienceCards />

      {/* SEO COMMAND CENTER */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-8 sm:p-12 lg:p-16">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-3 py-1.5 text-sm text-blue-300">
                <BarChart3 className="h-4 w-4" />
                {t("commandCenter.badge")}
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl">
                {t("commandCenter.title")}
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-slate-400">
                {t("commandCenter.body")}
              </p>

              <Link
                href="/tools/seo-analyzer"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                {t("commandCenter.cta")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {commandCenter.map(({ label, value, state, tone }, i) => (
                <div
                  key={label}
                  className="group rounded-2xl border border-white/10 bg-slate-950/40 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-slate-950/60"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <div className="mt-4 flex items-end justify-between gap-2">
                    <CountUp
                      value={value}
                      delay={i * 120}
                      className="text-3xl font-bold tabular-nums"
                    />
                    <span className="text-xs text-slate-400">
                      {tState(state)}
                    </span>
                  </div>

                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                    <Meter
                      value={value}
                      delay={i * 120 + 80}
                      className={
                        "h-full rounded-full " +
                        (tone === "good" ? "bg-emerald-400" : "bg-amber-400")
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TOOL CATEGORIES */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              {t("categories.eyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("categories.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              {t("categories.subtitle")}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {CATEGORY_GROUPS.map(({ key, icon: Icon, links }) => (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <Icon className="h-5 w-5 text-blue-300" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {t(`categories.${key}Title`)}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t(`categories.${key}Body`)}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {links.map((linkKey) => (
                    <Link
                      key={linkKey}
                      href={TOOL_HREF[linkKey]}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-400/30 hover:text-emerald-300"
                    >
                      {toolCatalog(`${linkKey}.title`)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {t("howItWorks.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-7"
              >
                <span className="text-sm font-bold text-emerald-400">
                  {String(n).padStart(2, "0")}
                </span>

                <h3 className="mt-5 text-xl font-semibold">
                  {t(`howItWorks.step${n}Title`)}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t(`howItWorks.step${n}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              {t("trust.eyebrow")}
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t("trust.title")}</h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
              {t("trust.subtitle")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-white/[0.04]"
              >
                <Icon className="h-7 w-7 text-emerald-400" />

                <h3 className="mt-5 font-semibold">{t(`trust.${key}Title`)}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {t(`trust.${key}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                {t("guides.eyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t("guides.title")}</h2>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400"
            >
              {t("guides.browseAll")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {GUIDE_ITEMS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-blue-400/30"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                  {t("guides.tag")}
                </p>

                <h3 className="mt-4 text-xl font-semibold">
                  {t(`guides.${key}Title`)}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t(`guides.${key}Body`)}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  {t("guides.readGuide")}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACCOUNT CTA */}
      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl rounded-[30px] border border-emerald-400/20 bg-emerald-400/[0.05] p-9 text-center sm:p-12">
          <h2 className="text-3xl font-bold">{t("cta.title")}</h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            {t("cta.body")}
          </p>

          <form
            action="/tools/seo-analyzer"
            method="GET"
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Globe2 className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                name="url"
                placeholder={t("cta.urlPlaceholder")}
                aria-label={t("cta.urlLabel")}
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pe-4 ps-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
              />
            </div>

            <button
              type="submit"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              {t("cta.submit")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
            </button>
          </form>

          <div className="mt-4 flex justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                {t("cta.openDashboard")}
              </Link>
            ) : (
              <Link
                href="/auth/sign-up"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                {t("cta.createAccount")}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            {t("faq.title")}
          </h2>

          <div className="mt-10 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <details
                key={n}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] transition duration-300 open:border-emerald-400/20 open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{t(`faq.q${n}`)}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition duration-300 group-open:rotate-180 group-open:border-emerald-400/20 group-open:text-emerald-400">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>

                <div className="px-6 pb-6">
                  <div className="mb-5 h-px bg-white/10" />
                  <p className="leading-7 text-slate-400">{t(`faq.a${n}`)}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}