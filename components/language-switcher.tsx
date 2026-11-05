"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import Flag from "@/components/flag";
import { localeList, type Locale } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("Language");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = localeList.find((l) => l.code === locale);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("change")}
        title={t("change")}
        onClick={() => setOpen((v) => !v)}
        className={
          /* The compact (mobile) trigger is an icon + chevron, ~38x16px. Padding
             grows the touch target to 54x44 (WCAG 2.5.5); the equal negative
             margins cancel it out, so the header layout does not move at all. */
          compact
            ? "inline-flex items-center gap-2 px-2 -mx-2 py-[14px] -my-[14px] text-slate-300 transition hover:text-white"
            : "inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-sm text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white aria-expanded:border-emerald-400/30 aria-expanded:bg-emerald-400/[0.08] aria-expanded:text-white"
        }
      >
        {compact ? (
          <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Flag code={locale} className="h-4 w-4 shrink-0" />
        )}

        {!compact && (
          <span className="hidden whitespace-nowrap sm:inline">
            {current?.nativeName}
          </span>
        )}

        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 opacity-60 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className="lang-panel absolute end-0 top-full z-50 mt-2 w-64 origin-top overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl"
        >
          <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t("label")}
          </p>

          {localeList.map((l, i) => {
            const active = l.code === locale;
            return (
              <Link
                key={l.code}
                role="menuitemradio"
                aria-checked={active}
                href={pathname}
                locale={l.code}
                lang={l.htmlLang}
                dir={l.dir}
                onClick={() => setOpen(false)}
                className={`lang-item group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition ${
                  active
                    ? "bg-emerald-400/10 text-white"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`}
                style={{ animationDelay: `${i * 38}ms` }}
              >
                <Flag code={l.code} className="h-5 w-5 shrink-0" />

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium leading-tight">
                    {l.nativeName}
                  </span>
                  <span className="block truncate text-[11px] leading-tight text-slate-500">
                    {l.englishName}
                  </span>
                </span>

                {active ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                    <Check className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 rounded-full border border-white/10 transition group-hover:border-white/25"
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
