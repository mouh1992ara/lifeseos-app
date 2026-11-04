import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileCode2,
  FileSearch,
  FileText,
  Gauge,
  Globe2,
  Layers3,
  Search,
  Sparkles,
  Tags,
  WandSparkles,
  Wrench,
  Youtube,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import {
  audiences,
  toolKeyForSlug,
  type AudienceSlug,
} from "@/lib/audiences";

const toolIcons: Record<string, LucideIcon> = {
  "seo-analyzer": Search,
  "seo-page-analyzer": FileSearch,
  "page-speed": Gauge,
  "content-analyzer": FileText,
  "http-status-checker": Layers3,
  "xml-sitemap-generator": Globe2,
  "robots-txt-generator": FileCode2,
  "meta-tag-generator": Tags,
  "serp-snippet-preview": Sparkles,
  "keyword-density-checker": BarChart3,
  "article-rewriter": WandSparkles,
  "schema-markup-generator": FileCode2,
  "youtube-keyword-ideas": Youtube,
  "youtube-title-generator": Youtube,
  "youtube-title-analyzer": Youtube,
  "youtube-description-generator": Youtube,
  "youtube-script-writer": Youtube,
};

export default async function AudiencePage({ slug }: { slug: AudienceSlug }) {
  const audience = audiences[slug];
  const t = await getTranslations("Audience");
  const ta = await getTranslations(`Audience.${slug}`);
  const toolCatalog = await getTranslations("Tools.catalog");

  return (
    <main className="bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-blue-500/10" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 text-sm text-emerald-300">
            <Sparkles className="h-4 w-4" />
            {ta("eyebrow")}
          </p>

          <h1 className="text-balance mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            {ta("headline")}{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-sky-400 bg-clip-text text-transparent">
              {ta("headlineAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            {ta("subheadline")}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={audience.primaryCtaHref}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200"
            >
              {ta("ctaLabel")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              {t("exploreAll")}
            </Link>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              <h2 className="mt-4 text-lg font-semibold">{ta(`pain${n}Title`)}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {ta(`pain${n}Body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("toolsTitle")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audience.tools.map((toolSlug) => {
            const Icon = toolIcons[toolSlug] ?? Wrench;
            return (
              <Link
                key={toolSlug}
                href={"/tools/" + toolSlug}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-white/[0.045]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{toolCatalog(`${toolKeyForSlug(toolSlug)}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {t(`toolDescriptions.${toolSlug}`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300">
                  {t("openTool")}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("stepsTitle")}</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n} className="rounded-2xl border border-white/10 bg-slate-950/40 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-semibold text-emerald-300">
                  {n}
                </span>
                <h3 className="mt-4 font-semibold">{ta(`step${n}Title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {ta(`step${n}Body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Guides */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("guidesTitle")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audience.guides.map((guideSlug) => (
            <Link
              key={guideSlug}
              href={"/blog/" + guideSlug}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-emerald-400/30"
            >
              <BookOpen className="h-5 w-5 shrink-0 text-emerald-300" />
              <span className="font-medium">{t(`guideTitles.${guideSlug}`)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 to-blue-500/10 p-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{ta("closingTitle")}</h2>
          <p className="mt-3 text-slate-400">{ta("closingBody")}</p>
          <Link
            href={audience.primaryCtaHref}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200"
          >
            {ta("ctaLabel")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </main>
  );
}