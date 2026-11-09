import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";

const GROUPS = [
  {
    key: "product",
    links: [
      { href: "/tools", key: "tools" },
      { href: "/blog", key: "blog" },
      { href: "/dashboard", key: "dashboard" },
    ],
  },
  {
    key: "company",
    links: [
      { href: "/about", key: "about" },
      { href: "/editorial", key: "editorial" },
      { href: "/contact", key: "contact" },
    ],
  },
  {
    key: "legal",
    links: [
      { href: "/privacy", key: "privacy" },
      { href: "/terms", key: "terms" },
    ],
  },
] as const;

export default async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-white/[0.08] bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <p className="text-lg font-bold tracking-tight text-white" data-latin>
              LifeSeos
            </p>

            <p className="mt-2.5 max-w-xs text-[13px] leading-6 text-slate-400">
              {t("tagline")}
            </p>

            <Link
              href="/tools"
              className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              {t("browseTools")}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.key} aria-label={t(`groups.${group.key}`)}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {t(`groups.${group.key}`)}
              </p>

              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link text-[13px]">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div role="separator" className="mt-10 h-px bg-white/[0.07]" />

        <div className="flex flex-col gap-2 pt-6 text-[11.5px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <p>{t("built")}</p>
        </div>
      </div>
    </footer>
  );
}