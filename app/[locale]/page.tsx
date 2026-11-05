import Image from "next/image";
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
  Gauge,
  Gift,
  Globe2,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Youtube,
  Zap,
} from "lucide-react";
import AudienceCards from "@/components/audience-cards";
import { CountUp, Meter } from "@/components/count-up";
import AnalyticsChart from "@/components/analytics-chart";
import HeroRadial from "@/components/hero-radial";
import HeroTitle from "@/components/hero-title";
import ScrollStagger from "@/components/scroll-stagger";
import Testimonials from "@/components/testimonials";
import ToolsEcosystem from "@/components/tools-ecosystem";
import { getArticles } from "@/lib/blog";

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

/** Decorative background motes. Deterministic so server and client agree. */
const MOTES = [
  { id: 1, left: "12%", top: "18%", dur: "16s", mx: "14px", my: "-52px", delay: "0s" },
  { id: 2, left: "78%", top: "12%", dur: "21s", mx: "-18px", my: "-40px", delay: "1.4s" },
  { id: 3, left: "36%", top: "62%", dur: "18s", mx: "22px", my: "-60px", delay: "2.8s" },
  { id: 4, left: "88%", top: "58%", dur: "24s", mx: "-12px", my: "-34px", delay: "0.7s" },
  { id: 5, left: "58%", top: "30%", dur: "13s", mx: "9px", my: "-48px", delay: "3.6s" },
  { id: 6, left: "24%", top: "76%", dur: "20s", mx: "16px", my: "-44px", delay: "2.1s" },
] as const;

const TRUST_ITEMS = [
  { icon: Gift, key: "free" },
  { icon: Zap, key: "fast" },
  { icon: CreditCard, key: "start" },
  { icon: ShieldCheck, key: "clarity" },
] as const;

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations("Home");
  const tState = await getTranslations("State");
  const tAnalytics = await getTranslations("Analytics");
  const tHeroForm = await getTranslations("HeroForm");
  const tBlogFeed = await getTranslations("BlogFeed");
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


  const commandCenter = [
    { label: t("commandCenter.technical"), value: 86, state: "good", tone: "good" },
    { label: t("commandCenter.indexability"), value: 94, state: "strong", tone: "good" },
    { label: t("commandCenter.onPage"), value: 91, state: "strong", tone: "good" },
    { label: t("commandCenter.performance"), value: 78, state: "needsWork", tone: "warn" },
  ] as const;

  /* Demo metrics. Explicitly labelled as sample data in the UI — these are
     not LifeSeos platform statistics. */
  const displayStats = [
    { label: tAnalytics("stats.organic"), value: 1.28, decimals: 2, suffix: "M", delta: "+18.4%", meter: 78, tone: "text-emerald-300" },
    { label: tAnalytics("stats.impressions"), value: 42.6, decimals: 1, suffix: "M", delta: "+26.1%", meter: 86, tone: "text-cyan-300" },
    { label: tAnalytics("stats.keywords"), value: 3480, decimals: 0, suffix: "", delta: "+412", meter: 64, tone: "text-blue-300" },
    { label: tAnalytics("stats.score"), value: 87, decimals: 0, suffix: "/100", delta: "+6", meter: 87, tone: "text-violet-300" },
    { label: tAnalytics("stats.pages"), value: 15.2, decimals: 1, suffix: "K", delta: "+3.1K", meter: 72, tone: "text-emerald-300" },
  ] as const;

  const latestPosts = (await getArticles(locale as Locale)).slice(0, 3);

  const dateFormatter = new Intl.DateTimeFormat(localeMeta[locale as Locale]?.htmlLang ?? locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="relative isolate w-full overflow-x-clip bg-slate-950 text-white">
      <ScrollStagger selector="[data-reveal]" step={80} max={5} />
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
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="orb left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 bg-blue-600/25"
            style={{ ["--dur" as string]: "26s", ["--ox" as string]: "60px", ["--oy" as string]: "40px" }}
          />
          <div
            className="orb end-0 top-20 h-[350px] w-[350px] bg-emerald-400/15"
            style={{ ["--dur" as string]: "19s", ["--ox" as string]: "-50px", ["--oy" as string]: "30px" }}
          />
          <div
            className="orb start-10 top-[420px] h-[280px] w-[280px] bg-violet-500/12"
            style={{ ["--dur" as string]: "31s", ["--ox" as string]: "40px", ["--oy" as string]: "-46px" }}
          />
          {MOTES.map((m) => (
            <span
              key={m.id}
              className="mote"
              style={{
                left: m.left,
                top: m.top,
                ["--dur" as string]: m.dur,
                ["--mx" as string]: m.mx,
                ["--my" as string]: m.my,
                animationDelay: m.delay,
              }}
            />
          ))}
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {t("hero.badge")}
            </div>

            <HeroTitle
              line1={t("hero.titleLine1")}
              accent={t("hero.titleAccent")}
              className="max-w-4xl text-balance text-4xl font-bold leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl"
            />

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              {t("hero.subtitle")}
            </p>

            <form
              action={localizePath(locale as Locale, "/tools/seo-analyzer")}
              method="GET"
              className="mt-9 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Globe2 className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="url"
                  inputMode="url"
                  autoComplete="url"
                  dir="ltr"
                  required
                  placeholder={tHeroForm("placeholder")}
                  aria-label={tHeroForm("label")}
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pe-4 ps-12 text-start text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
                />
              </div>

              <button
                type="submit"
                className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_12px_40px_-12px_rgba(52,211,153,.7)]"
              >
                {tHeroForm("cta")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
              </button>
            </form>

            <p className="mt-3 text-xs text-slate-500">{tHeroForm("hint")}</p>

            <Link
              href="/tools"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              {t("hero.secondaryCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>

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

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-emerald-500/10 blur-[110px]" />

            <HeroRadial />
          </div>
        </div>
      </section>

      {/* SEARCH PERFORMANCE — demo data, labelled as such */}
      <section id="analytics" className="scroll-mt-24 px-6 pb-10 pt-4 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.012] p-6 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {tAnalytics("eyebrow")}
            </p>

            <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">
              {tAnalytics("title")}
            </h2>

            <p className="mt-4 leading-8 text-slate-400">{tAnalytics("subtitle")}</p>
          </div>

          <div className="mt-8">
            <AnalyticsChart />
          </div>

          <div className="mt-10 grid gap-4 border-t border-white/[0.08] pt-8 sm:grid-cols-2 lg:grid-cols-5">
            {displayStats.map((stat, index) => (
              <div
                key={stat.label}
                className="surface group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.012] px-5 py-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-500">
                    {stat.label}
                  </p>

                  <span className="shrink-0 rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {stat.delta}
                  </span>
                </div>

                <p className="mt-3 text-[26px] font-bold leading-none tabular-nums">
                  <CountUp
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    delay={index * 90}
                  />
                </p>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <Meter
                    value={stat.meter}
                    delay={index * 90 + 120}
                    className={
                      "h-full rounded-full " +
                      (index === 1
                        ? "bg-cyan-400"
                        : index === 3
                          ? "bg-violet-400"
                          : index === 2
                            ? "bg-blue-400"
                            : "bg-emerald-400")
                    }
                  />
                </div>
              </div>
            ))}
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

          <div className="mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_TOOLS.map(({ key, href, icon: Icon }, index) => {
              const isFeature = index === 0;

              return (
                <Link
                  key={key}
                  href={href}
                  data-reveal
                  className={`bento-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.05] ${
                    isFeature ? "sm:col-span-2 lg:row-span-2 lg:p-8" : ""
                  }`}
                >
                  <div className="bento-glow pointer-events-none absolute inset-0" />

                  <div className="relative flex items-center justify-between">
                    <div
                      className={`flex items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/20 transition duration-300 group-hover:bg-emerald-400/15 ${
                        isFeature ? "h-14 w-14" : "h-11 w-11"
                      }`}
                    >
                      <Icon
                        className={`text-emerald-400 ${isFeature ? "h-7 w-7" : "h-5 w-5"}`}
                      />
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-600 transition duration-300 group-hover:translate-x-1 group-hover:text-emerald-400 rtl:rotate-180" />
                  </div>

                  <h3
                    className={`relative mt-6 font-semibold ${
                      isFeature ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {toolCatalog(`${key}.title`)}
                  </h3>

                  <p
                    className={`relative mt-3 text-slate-400 ${
                      isFeature ? "text-base leading-8" : "text-sm leading-7"
                    }`}
                  >
                    {isFeature
                      ? toolCatalog(`${key}.long`)
                      : toolCatalog(`${key}.short`)}
                  </p>

                  {isFeature ? (
                    <div className="relative mt-auto pt-8">
                      <svg
                        viewBox="0 0 240 60"
                        className="h-16 w-full"
                        aria-hidden="true"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="bento-spark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 48 L34 40 L68 44 L102 30 L136 34 L170 20 L204 24 L240 8 L240 60 L0 60 Z"
                          fill="url(#bento-spark)"
                        />
                        <path
                          d="M0 48 L34 40 L68 44 L102 30 L136 34 L170 20 L204 24 L240 8"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                        {t("tools.viewAll")}
                      </span>
                    </div>
                  ) : null}
                </Link>
              );
            })}
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

      {/* COMMUNITY — horizontal testimonial carousel */}
      <div data-reveal>
        <Testimonials />
      </div>

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

      {/* TOOL ECOSYSTEM */}
      <ToolsEcosystem />

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

      {/* BLOG / GUIDES — real articles, real URLs */}
      <section id="blog" className="scroll-mt-24 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                {tBlogFeed("eyebrow")}
              </p>

              <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl">
                {tBlogFeed("title")}
              </h2>

              <p className="mt-4 max-w-2xl leading-8 text-slate-400">
                {tBlogFeed("subtitle")}
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              {tBlogFeed("all")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                data-reveal
                className="surface group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] hover:-translate-y-1 hover:bg-white/[0.04]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                  <Image
                    src={post.featuredImage}
                    alt={post.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />

                  <span className="absolute start-4 top-4 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 backdrop-blur">
                    {post.category}
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col p-6">
                  <h3 className="text-balance text-lg font-semibold leading-snug transition group-hover:text-white">
                    {post.title}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                    {post.description}
                  </p>

                  <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
                    <span>{dateFormatter.format(new Date(post.publishedAt))}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    {tBlogFeed("read")}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACCOUNT CTA */}
      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div
          className="cta-sheen mx-auto max-w-5xl rounded-[30px] border border-emerald-400/20 p-9 text-center shadow-[0_40px_120px_-60px_rgba(52,211,153,0.5)] sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(52,211,153,0.12), rgba(34,211,238,0.07) 35%, rgba(167,139,250,0.09) 65%, rgba(52,211,153,0.12))",
          }}
        >
          <h2 className="text-3xl font-bold">{t("cta.title")}</h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            {t("cta.body")}
          </p>

          <form
            action={localizePath(locale as Locale, "/tools/seo-analyzer")}
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