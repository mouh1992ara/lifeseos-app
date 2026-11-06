import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Link } from "@/i18n/navigation";

/**
 * Shared frame for every auth screen.
 *
 * Two columns on desktop: the form on the inline-start, and a brand panel that
 * states what an account is actually for. On mobile the panel collapses to a
 * compact header so the form is the first thing above the fold.
 */
export default async function AuthShell({
  children,
  heading,
}: {
  children: ReactNode;
  heading: string;
}) {
  const t = await getTranslations("Auth.shell");

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute -top-40 start-1/2 h-[32rem] w-[46rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[110px]" />
        <div className="absolute bottom-0 end-0 h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-14">
        {/* ---------------------------- Brand panel ---------------------------- */}
        <aside className="order-2 hidden lg:order-1 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            {t("eyebrow")}
          </p>

          <h2 className="mt-4 text-balance text-3xl font-bold leading-tight text-white">
            {t("headline")}
          </h2>

          <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-400">
            {t("body")}
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: Sparkles, key: "workspace" },
              { icon: ShieldCheck, key: "private" },
              { icon: Zap, key: "free" },
            ].map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08]">
                  <Icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                </span>

                <span>
                  <span className="block text-sm font-semibold text-white">
                    {t(`${key}Title`)}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-6 text-slate-400">
                    {t(`${key}Body`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t("back")}
          </Link>
        </aside>

        {/* ------------------------------- Form ------------------------------- */}
        <div className="order-1 w-full lg:order-2">
          <div className="mx-auto w-full max-w-[26rem]">
            <div className="mb-6 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-400 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                {t("back")}
              </Link>
            </div>

            <div className="lg-surface auth-panel px-6 py-7 sm:px-8 sm:py-9">
              <h1 className="text-2xl font-bold tracking-tight text-white">{heading}</h1>
              {children}
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-600">
              {t("legal")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}