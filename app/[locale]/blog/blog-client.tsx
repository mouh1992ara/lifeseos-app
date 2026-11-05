"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { BlogArticle } from "@/lib/blog";
import { CATEGORY_ORDER, categoryOf } from "@/lib/blog-categories";
import BlogHero from "@/components/blog/blog-hero";
import FeaturedArticle from "@/components/blog/featured-article";
import ArticleDiscovery from "@/components/blog/article-discovery";

const FEATURED_SLUG = "complete-seo-audit-guide";

/**
 * Blog index.
 *
 * Three blocks only — hero, featured guide, discovery grid — then one CTA. The
 * page is intentionally short: the guides themselves are the content, and a
 * long landing page buries them.
 */
export default function BlogClient({ articles }: { articles: BlogArticle[] }) {
  const t = useTranslations("Blog");

  const featured =
    articles.find((a) => a.slug === FEATURED_SLUG) ?? articles[0];

  const rest = articles.filter((a) => a.slug !== featured?.slug);

  /* Only categories that actually contain guides are offered. */
  const categories = CATEGORY_ORDER.map((key) => ({
    key,
    label: t(`categories.${key}`),
    count: rest.filter((a) => categoryOf(a.slug) === key).length,
  })).filter((category) => category.count > 0);

  const chips = categories.map((category) => category.label);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <BlogHero
        badge={t("badge")}
        titleLead={t("titleLine1")}
        titleAccent={t("titleAccent")}
        subtitle={t("subtitle")}
        cta={t("heroCta")}
        chips={chips}
      />

      {featured ? (
        <FeaturedArticle
          article={featured}
          eyebrow={t("featuredEyebrow")}
          badge={t("featuredBadge")}
          cta={t("featuredCta")}
        />
      ) : null}

      <ArticleDiscovery
        articles={rest}
        categories={categories}
        labels={{
          listEyebrow: t("listEyebrow"),
          listTitle: t("listTitle"),
          listBody: t("listBody"),
          resultsCount: (count: number) => t("resultsCount", { count }),
          searchPlaceholder: t("searchPlaceholder"),
          searchLabel: t("searchLabel"),
          clearSearch: t("clearSearch"),
          filterLabel: t("filterLabel"),
          readGuide: t("readGuide"),
          emptyTitle: t("emptyTitle"),
          emptyBody: t("emptyBody"),
          emptyReset: t("emptyReset"),
          allLabel: t("categories.all"),
        }}
      />

      {/* Single closing CTA — the tools are the natural next step after a guide. */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.025] px-6 py-9 sm:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"
          />

          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {t("cta.eyebrow")}
              </p>
              <h2 className="mt-2 max-w-xl text-balance text-xl font-bold tracking-tight sm:text-2xl">
                {t("cta.title")}
              </h2>
            </div>

            <Link href="/tools" className="btn-primary group h-11 shrink-0 px-6 text-sm">
              {t("cta.button")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
