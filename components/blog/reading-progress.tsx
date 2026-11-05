"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Thin reading progress bar pinned under the sticky header.
 *
 * The value is written to a CSS variable inside a rAF callback instead of React
 * state: this updates on every scroll frame and re-rendering the article tree
 * for that would be wasteful.
 */
export function ReadingProgress({ label }: { label: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.querySelector("[data-article-body]");
    if (!article) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.35;
      const scrolled = -rect.top + window.innerHeight * 0.15;
      const ratio = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      barRef.current?.style.setProperty("--p", ratio.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="read-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      ref={barRef}
    >
      <span aria-hidden="true" className="read-progress-fill" />
    </div>
  );
}

/**
 * Table of contents with the current section highlighted.
 *
 * Observes the section headings directly rather than computing offsets, so the
 * active item stays correct when fonts or images shift the layout.
 */
export function ArticleToc({
  sections,
  label,
}: {
  sections: { id: string; title: string }[];
  label: string;
}) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 },
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav
      className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5"
      /* A long guide can have 15 sections; the list scrolls inside the sticky
         column instead of pushing past the viewport. */
      style={{ maxHeight: "calc(100vh - var(--header-h, 76px) - 2.5rem)", overflowY: "auto" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <ol className="mt-4 space-y-1">
        {sections.map((section, index) => {
          const active = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "true" : undefined}
                data-toc-item={section.id}
                data-active={active ? "1" : "0"}
                className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-6 transition-colors ${
                  active
                    ? "bg-emerald-400/[0.08] text-emerald-200"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span
                  className={`font-mono text-[11px] ${active ? "text-emerald-400" : "text-slate-600"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{section.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
