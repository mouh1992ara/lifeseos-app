import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  type Locale,
} from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import ContactForm from "./contact-form";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const path = "/contact";
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
        { url: "/social/contact.png", width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social/contact.png"],
    },
  };
}

const CARDS = [
  { icon: "💬", titleKey: "cardGeneralTitle", bodyKey: "cardGeneralBody" },
  { icon: "🛠", titleKey: "cardSupportTitle", bodyKey: "cardSupportBody" },
  { icon: "🔒", titleKey: "cardPrivacyTitle", bodyKey: "cardPrivacyBody" },
  { icon: "✨", titleKey: "cardFeedbackTitle", bodyKey: "cardFeedbackBody" },
] as const;

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Contact");
  const tf = await getTranslations("Footer");

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("meta.title"),
    url: siteUrl + localizePath(locale as Locale, "/contact"),
    inLanguage: locale,
    description: t("meta.description"),
    mainEntity: {
      "@type": "Organization",
      name: "LifeSeos",
      url: "https://www.lifeseos.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          {/* HERO */}
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              <span aria-hidden="true">✉</span>
              <span>{t("badge")}</span>
            </div>

            <h1 className="text-balance mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              {t("subtitle")}
            </p>
          </section>

          {/* CONTACT OPTIONS + FORM */}
          <section className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-5">
              {CARDS.map(({ icon, titleKey, bodyKey }) => (
                <ContactCard
                  key={titleKey}
                  icon={icon}
                  title={t(titleKey)}
                  description={t(bodyKey)}
                />
              ))}
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                {t("formEyebrow")}
              </p>

              <h2 className="mt-2 text-2xl font-bold">{t("formTitle")}</h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">{t("formIntro")}</p>

              <ContactForm />

              <p className="mt-5 text-center text-xs leading-5 text-slate-600">
                {t.rich("formPrivacyNote", {
                  link: (chunks) => (
                    <Link
                      href="/privacy"
                      className="font-semibold text-violet-300 transition hover:text-violet-200"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </section>

          {/* RESPONSE INFO */}
          <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.02] p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-200">
              {t("responseTitle")}
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {t("responseBody")}
            </p>
          </section>

          {/* TOOLS CTA */}
          <section className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  {t("ctaEyebrow")}
                </p>

                <h2 className="mt-2 text-2xl font-bold">{t("ctaTitle")}</h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  {t("ctaBody")}
                </p>
              </div>

              <Link
                href="/tools"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                {t("ctaButton")}
              </Link>
            </div>
          </section>

          {/* NAVIGATION */}
          <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-white">
              {tf("home")}
            </Link>
            <Link href="/tools" className="transition hover:text-white">
              {tf("tools")}
            </Link>
            <Link href="/about" className="transition hover:text-white">
              {tf("about")}
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              {tf("privacy")}
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              {tf("terms")}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function ContactCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-semibold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}