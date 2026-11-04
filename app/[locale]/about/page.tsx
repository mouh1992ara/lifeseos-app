import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { Link } from "@/i18n/navigation";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = "/about";
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    alternates: {
      canonical: localizePath(locale as Locale, path),
      languages: buildLanguageAlternates(siteUrl, path),
    },
    openGraph: {
      title,
      description,
      url: siteUrl + localizePath(locale as Locale, path),
      type: "website",
      siteName: "LifeSeos",
      locale: meta.ogLocale,
      images: [
        { url: "/social/about.png", width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social/about.png"],
    },
  };
}

/*
 * FOUNDER SECTION
 * Fill in real details below to show the "Meet the founder" section.
 * While `name` or `story` is empty the section (and the Person schema)
 * stays hidden, so nothing placeholder-like is ever published.
 */
const founder: {
  name: string;
  role: string;
  photo: string;
  story: string[];
  contactLabel: string;
  contactHref: string;
  profiles: string[];
} = {
  name: "",
  role: "",
  photo: "",
  story: [],
  contactLabel: "",
  contactHref: "",
  profiles: [],
};

const showFounder = Boolean(founder.name.trim()) && founder.story.length > 0;

const TOOL_LINKS = [
  { key: "seoAnalyzer", href: "/tools/seo-analyzer", icon: "🔍" },
  { key: "seoPageAnalyzer", href: "/tools/seo-page-analyzer", icon: "📄" },
  { key: "metaTagGenerator", href: "/tools/meta-tag-generator", icon: "✨" },
  { key: "robotsTxtGenerator", href: "/tools/robots-txt-generator", icon: "🤖" },
  { key: "xmlSitemapGenerator", href: "/tools/xml-sitemap-generator", icon: "🌐" },
  {
    key: "keywordDensityChecker",
    href: "/tools/keyword-density-checker",
    icon: "📊",
  },
  { key: "httpStatusChecker", href: "/tools/http-status-checker", icon: "⚡" },
  { key: "pageSpeed", href: "/tools/page-speed", icon: "🚀" },
  { key: "contentAnalyzer", href: "/tools/content-analyzer", icon: "📝" },
] as const;

const FOCUS_ITEMS = ["analysis", "recs", "tools", "guidance", "history"] as const;
const PRINCIPLES = [1, 2, 3, 4, 5] as const;

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("About");
  const tc = await getTranslations("Tools.catalog");

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t("meta.title"),
    url: siteUrl + localizePath(locale as Locale, "/about"),
    inLanguage: locale,
    description: t("meta.description"),
    mainEntity: {
      "@type": "Organization",
      name: "LifeSeos",
      url: "https://www.lifeseos.com",
      ...(showFounder
        ? {
            founder: {
              "@type": "Person",
              name: founder.name,
              ...(founder.role ? { jobTitle: founder.role } : {}),
              ...(founder.profiles.length > 0 ? { sameAs: founder.profiles } : {}),
            },
          }
        : {}),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          {/* HERO */}
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-300">
              <span aria-hidden="true">✦</span>
              <span>{t("badge")}</span>
            </div>

            <h1 className="text-balance mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("titleLine1")}
              <span className="mt-2 block bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                {t("titleAccent")}
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
              {t("subtitle")}
            </p>
          </section>

          {/* FOUNDER */}
          {showFounder ? (
            <section className="mt-16 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr] lg:items-center">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
                  {founder.photo ? (
                    <Image
                      src={founder.photo}
                      alt={founder.name}
                      width={160}
                      height={160}
                      className="mb-5 h-40 w-40 rounded-[28px] border border-white/10 object-cover"
                    />
                  ) : null}

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    {t("founder.eyebrow")}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">{founder.name}</h2>

                  {founder.role ? (
                    <p className="mt-2 text-sm text-slate-400">{founder.role}</p>
                  ) : null}
                </div>

                <div>
                  {founder.story.map((paragraph, index) => (
                    <p
                      key={index}
                      className={`text-sm leading-7 text-slate-400 sm:text-base ${
                        index === 0 ? "" : "mt-4"
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}

                  {founder.contactHref || founder.profiles.length > 0 ? (
                    <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                      {founder.contactHref ? (
                        <a
                          href={founder.contactHref}
                          className="text-emerald-300 transition hover:text-emerald-200"
                        >
                          {founder.contactLabel || t("founder.contact")}
                        </a>
                      ) : null}

                      {founder.profiles.map((profile) => (
                        <a
                          key={profile}
                          href={profile}
                          target="_blank"
                          rel="noopener noreferrer me"
                          className="text-blue-300 transition hover:text-blue-200"
                          data-ltr-text
                        >
                          {profile
                            .replace(/^https?:\/\/(www\.)?/, "")
                            .replace(/\/$/, "")}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {/* MISSION */}
          <section className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-7 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                {t("mission.eyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold">{t("mission.title")}</h2>

              <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
                {t("mission.p1")}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                {t("mission.p2")}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                {t("mission.p3")}
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10 p-7 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                {t("focus.eyebrow")}
              </p>

              <div className="mt-6 space-y-4">
                {FOCUS_ITEMS.map((key) => (
                  <FeatureItem
                    key={key}
                    title={t(`focus.${key}Title`)}
                    description={t(`focus.${key}Body`)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="mt-16">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                {t("how.eyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t("how.title")}</h2>

              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
                {t("how.body")}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <ValueCard
                  key={n}
                  title={t(`how.step${n}Title`)}
                  description={t(`how.step${n}Body`)}
                />
              ))}
            </div>
          </section>

          {/* TOOLS */}
          <section className="mt-16">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {t("toolkit.eyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t("toolkit.title")}
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                {t("toolkit.body")}
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TOOL_LINKS.map(({ key, href, icon }) => (
                <ToolCard
                  key={key}
                  href={href}
                  icon={icon}
                  title={tc(`${key}.title`)}
                  description={tc(`${key}.long`)}
                />
              ))}
            </div>

            <div className="mt-7 text-center">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 font-semibold text-emerald-300 transition hover:text-emerald-200"
              >
                {t("toolkit.viewAll")}
                <span aria-hidden="true" className="rtl:rotate-180">
                  →
                </span>
              </Link>
            </div>
          </section>

          {/* CONTENT */}
          <section className="mt-16 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                  {t("learning.eyebrow")}
                </p>

                <h2 className="mt-3 text-3xl font-bold">{t("learning.title")}</h2>

                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                  {t("learning.p1")}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                  {t("learning.p2")}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/10 p-6 sm:p-7">
                <h3 className="text-xl font-semibold">{t("learning.principlesTitle")}</h3>

                <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
                  {PRINCIPLES.map((n) => (
                    <SimpleListItem key={n}>{t(`learning.principle${n}`)}</SimpleListItem>
                  ))}
                </ul>

                <Link
                  href="/blog"
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-300 transition hover:text-blue-200"
                >
                  {t("learning.browse")}
                  <span aria-hidden="true" className="rtl:rotate-180">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </section>

          {/* VALUES */}
          <section className="mt-16 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  {t("approach.eyebrow")}
                </p>

                <h2 className="mt-3 text-3xl font-bold">{t("approach.title")}</h2>

                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                  {t("approach.body")}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(["clarity", "practicality", "transparency", "privacy"] as const).map(
                  (key) => (
                    <ValueCard
                      key={key}
                      title={t(`approach.${key}Title`)}
                      description={t(`approach.${key}Body`)}
                    />
                  ),
                )}
              </div>
            </div>
          </section>

          {/* IMPORTANT NOTE */}
          <section className="mt-16 rounded-[30px] border border-amber-400/15 bg-amber-400/[0.04] p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              {t("note.eyebrow")}
            </p>

            <h2 className="mt-3 text-2xl font-bold">{t("note.title")}</h2>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              {t("note.p1")}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              {t("note.p2")}
            </p>
          </section>

          {/* CTA */}
          <section className="mt-16 rounded-[30px] border border-white/10 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 p-8 text-center sm:p-10">
            <p className="text-sm font-semibold text-violet-300">{t("cta.eyebrow")}</p>

            <h2 className="mt-3 text-3xl font-bold">{t("cta.title")}</h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              {t("cta.body")}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link
                href="/tools/seo-analyzer"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                {t("cta.primary")}
              </Link>

              <Link
                href="/tools"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {t("cta.secondary")}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-xs font-bold text-emerald-300">
          ✓
        </div>

        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.06]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold transition group-hover:text-emerald-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <h3 className="font-semibold text-slate-200">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function SimpleListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-400/10 text-[10px] font-bold text-blue-300">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}