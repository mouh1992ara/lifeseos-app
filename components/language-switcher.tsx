"use client";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";

const LANGUAGES = [
  { code: "ar", name: "العربية" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "zh", name: "中文" },
] as const;

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const locale = useLocale();
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

  const current = LANGUAGES.find((l) => l.code === locale);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
        className={
          compact
            ? "inline-flex items-center text-slate-300 hover:text-white"
            : "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white"
        }
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        {!compact && <span lang={locale}>{current?.name}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl"
        >
          {LANGUAGES.map((l) => (
            <Link
              key={l.code}
              role="menuitem"
              href={pathname}
              locale={l.code}
              lang={l.code}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <span>{l.name}</span>
              {l.code === locale && <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
