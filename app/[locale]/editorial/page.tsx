import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { Link } from "@/i18n/navigation";

import en from "@/content/editorial/en.json";
import ar from "@/content/editorial/ar.json";
import fr from "@/content/editorial/fr.json";
import zh from "@/content/editorial/zh.json";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

const PATH = "/editorial";

/** Shown as dateModified in the page schema and in the byline. */
const LAST_REVIEWED = "2026-11-10";

type Content = typeof en;

const CONTENT: Record<string, Content> = { en, ar, fr, zh };

function contentFor(locale: string): Content {
  return CONTENT[locale] ?? CONTENT.en;
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = contentFor(locale);
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;

  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: {
      canonical: localizePath(locale as Locale, PATH),
      languages: buildLanguageAlternates(siteUrl, PATH),
    },
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: siteUrl + localizePath(locale as Locale, PATH),
      type: "article",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
    },
    twitter: {
      card: "summary",
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

export default async function EditorialPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = contentFor(locale);
  const t = await getTranslations("Editorial");
  const path = localizePath(locale as Locale, PATH);

  /* WebPage with an explicit review date. Not Article: this is a policy page,
     and marking it up as journalism would overstate what it is. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.meta.title,
    description: content.meta.description,
    url: siteUrl + path,
    inLanguage: localeMeta[locale as Locale]?.htmlLang ?? "en",
    dateModified: LAST_REVIEWED,
    isPartOf: { "@type": "WebSite", name: "LifeSeos", url: siteUrl },
    publisher: { "@type": "Organization", name: "LifeSeos", url: siteUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {t("eyebrow")}
            </p>

            <h1 className="text-balance mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {content.heading}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
              {content.intro}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              {t("lastReviewed")}: <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time>
            </p>
          </section>

          {/* Jump links: the page is long, and a reader looking for one specific
              policy should not have to scroll the whole thing. */}
          <nav
            aria-label={content.heading}
            className="mt-10 rounded-2xl border border-white/10 bg-slate-900/60 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("onThisPage")}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {content.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-14 space-y-12">
            {content.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-[15px] leading-7 text-slate-400"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

              </section>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <p className="text-sm leading-7 text-slate-400">{t("footerNote")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                {t("browseTools")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
              >
                {t("reportIssue")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

