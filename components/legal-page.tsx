import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export type LegalItem = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Props = {
  locale: string;
  badge: string;
  title: string;
  subtitle: string;
  updated: string;
  tocTitle: string;
  notice: string;
  noticeTitle: string;
  cta: { eyebrow: string; title: string; body: string; button: string };
  items: LegalItem[];
};

/**
 * Shared renderer for the privacy policy and the terms of service.
 * All copy arrives from the catalog, so every locale renders its own text.
 */
export default async function LegalPage({
  locale,
  badge,
  title,
  subtitle,
  updated,
  tocTitle,
  notice,
  noticeTitle,
  cta,
  items,
}: Props) {
  const t = await getTranslations("Footer");
  const tc = await getTranslations("Common");
  const accent = "violet";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <span aria-hidden="true">🔒</span>
            <span>{badge}</span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {subtitle}
          </p>

          <p className="mt-4 text-sm text-slate-500">{updated}</p>
        </section>

        {/* TRANSLATION NOTICE — only on non-English pages */}
        {locale !== "en" ? (
          <div
            role="note"
            className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-200"
          >
            <p className="font-semibold">{noticeTitle}</p>
            <p className="mt-1 text-amber-200/80">{notice}</p>
            <Link
              href="/"
              locale="en"
              className="mt-2 inline-block font-semibold underline underline-offset-4"
            >
              English version
            </Link>
          </div>
        ) : null}

        {/* TABLE OF CONTENTS */}
        <nav
          aria-label={tocTitle}
          className="mt-10 rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            {tocTitle}
          </h2>

          <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {items.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="flex items-start gap-3 text-slate-400 transition hover:text-white"
                >
                  <span className="mt-0.5 font-mono text-xs text-slate-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* CONTENT */}
        <div className="mt-8 space-y-6">
          {items.map((item, index) => (
            <section
              key={item.id}
              id={item.id}
              className="scroll-mt-24 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                    accent === "violet"
                      ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
                      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold sm:text-2xl">{item.title}</h2>

                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-400 sm:text-base">
                    {item.paragraphs?.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}

                    {item.bullets?.length ? (
                      <ul className="space-y-3">
                        {item.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[10px] font-bold text-emerald-300"
                            >
                              ✓
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* TOOLS CTA */}
        <section className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-300">{cta.eyebrow}</p>

              <h2 className="mt-2 text-2xl font-bold">{cta.title}</h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                {cta.body}
              </p>
            </div>

            <Link
              href="/tools"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              {cta.button}
            </Link>
          </div>
        </section>

        {/* NAVIGATION */}
        <nav
          aria-label={tc("details")}
          className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-slate-500"
        >
          <Link href="/" className="transition hover:text-white">
            {t("home")}
          </Link>
          <Link href="/tools" className="transition hover:text-white">
            {t("tools")}
          </Link>
          <Link href="/about" className="transition hover:text-white">
            {t("about")}
          </Link>
          <Link href="/contact" className="transition hover:text-white">
            {t("contact")}
          </Link>
          <Link
            href="/privacy"
            className="transition hover:text-white"
            aria-current={undefined}
          >
            {t("privacy")}
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            {t("terms")}
          </Link>
        </nav>
      </div>
    </main>
  );
}