import type { ReactNode } from "react";

/**
 * The tools section wrapper.
 *
 * Individual tools were written with raw Tailwind (`bg-slate-950/70` inputs,
 * `bg-white/[0.03]` panels) rather than the shared classes the rest of the site
 * uses, so the Liquid Glass system never reached inside them — the directory
 * looked redesigned while every tool interface stayed flat.
 *
 * Editing 17 client components was the wrong fix: it is a large diff, it would
 * be repeated for the next tool, and it risks behaviour changes in files that
 * also hold generation and analysis logic. A single scope attribute here lets
 * `liquid-glass.css` target those existing utilities by substring, so the
 * styling stays in one file and not one line of tool logic changes.
 */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <div data-lg-scope="tools">{children}</div>;
}
