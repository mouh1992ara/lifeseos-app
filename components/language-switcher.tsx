"use client";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useEffect, useRef, useState } from "react";

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
          compact
            ? "inline-flex items-center text-slate-300 transition hover:text-white"
            : "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white"
        }
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!compact && (
          <span lang={current?.htmlLang} className="whitespace-nowrap">
            {current?.nativeName}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className="absolute end-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl"
        >
          {localeList.map((l) => {
            const active = l.code === locale;
            return (
              <Link
                key={l.code}
                role="menuitemradio"
                aria-checked={active}
                // next-intl's usePathname returns the locale-less path, so the
                // view keeps its current page when the language changes.
                href={pathname}
                locale={l.code}
                lang={l.htmlLang}
                dir={l.dir}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <span className="whitespace-nowrap">{l.nativeName}</span>
                {active && (
                  <Check
                    className="h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
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