"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { Briefcase, ChevronDown, FileText, Youtube } from "lucide-react";

import { Link } from "@/i18n/navigation";

const SLUGS = ["youtubers", "bloggers", "agencies"] as const;
type Slug = (typeof SLUGS)[number];

const icons: Record<Slug, LucideIcon> = {
  youtubers: Youtube,
  bloggers: FileText,
  agencies: Briefcase,
};

const dropdownTriggerClass =
  "inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white";
const sheetTriggerClass =
  "inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white";

const dropdownPanelClass =
  "absolute start-1/2 top-full z-50 mt-3 w-[22rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl rtl:translate-x-1/2";
// The sheet spans the whole width of the nearest positioned parent (the mobile bar).
const sheetPanelClass =
  "absolute inset-x-0 top-full z-50 mt-2 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl shadow-black/40";

type SolutionsMenuProps = {
  label?: string;
  /**
   * "dropdown": panel centered under the trigger (desktop).
   * "sheet": panel as wide as the nearest `relative` parent (mobile bar).
   */
  variant?: "dropdown" | "sheet";
  /** Pass the same classes your other header links use so the trigger matches them. */
  className?: string;
};

/**
 * Click-to-open menu with the audience pages. Closes on outside click, Escape
 * or navigation. The links stay in the page HTML while closed (the panel is
 * only hidden), so search engines can still follow them.
 */
export function SolutionsMenu({
  label,
  variant = "dropdown",
  className,
}: SolutionsMenuProps) {
  const t = useTranslations("Solutions");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const pathname = usePathname() ?? "";
  const isSheet = variant === "sheet";

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={isSheet ? "" : "relative"}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={className ?? (isSheet ? sheetTriggerClass : dropdownTriggerClass)}
      >
        {label ?? t("label")}
        <ChevronDown
          className={
            (isSheet ? "h-3.5 w-3.5 " : "h-4 w-4 ") +
            "transition-transform duration-200 " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className={isSheet ? sheetPanelClass : dropdownPanelClass}
      >
        <ul>
          {SLUGS.map((slug) => {
            const Icon = icons[slug];
            const active = pathname === "/for/" + slug;
            return (
              <li key={slug}>
                <Link
                  href={"/for/" + slug}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={
                    "flex items-start gap-3 rounded-xl p-3 text-start transition hover:bg-white/[0.06] " +
                    (active ? "bg-white/[0.04]" : "")
                  }
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">
                      {t(`items.${slug}.title`)}
                    </span>
                    <span className="mt-0.5 block text-sm leading-5 text-slate-400">
                      {t(`items.${slug}.description`)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}