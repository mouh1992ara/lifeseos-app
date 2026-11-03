import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/tools", key: "tools" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" },
] as const;

export default async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-base font-semibold text-white">LifeSeos</p>
            <p className="mt-2 text-sm text-slate-300">{t("tagline")}</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-white">
                {t(l.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div role="separator" className="m-rule mt-8 border-t border-white/5" />

        <div className="flex flex-col gap-3 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-200">{t("rights")}</p>
          <p className="text-slate-200">{t("built")}</p>
        </div>
      </div>
    </footer>
  );
}
