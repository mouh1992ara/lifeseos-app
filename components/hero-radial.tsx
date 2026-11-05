"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Braces,
  FileSearch,
  FileText,
  Gauge,
  Network,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";

import YouTubeMark from "@/components/youtube-mark";
import { Link } from "@/i18n/navigation";

/* ---------------------------------------------------------------------------
   Geometry
   ---------------------------------------------------------------------------
   Everything the eye aligns to is derived from two numbers: the ring radius
   and the icon size. The SVG publishes them in viewBox units (so the arrows
   are resolution-independent and identical at every screen size), and the HTML
   nodes turn the *same ratios* into pixels from a single measured container
   width. Because both sides of the composition come from one ratio, an arrow
   can never end short of its icon or overshoot it.

   Eight nodes at 45° intervals, starting at twelve o'clock, so the ring is
   symmetric about both axes and no two icons can crowd each other.
--------------------------------------------------------------------------- */

const SIZE = 600;
const C = SIZE / 2;

/** Ring radius and icon size as a fraction of the composition width. */
const R_RATIO = 0.42;
const NODE_RATIO = 0.088;

/** Same values in viewBox units, for the SVG layer. */
const R_VB = SIZE * R_RATIO;
const NODE_VB = SIZE * NODE_RATIO;

/** Arrows stop just outside the icon so they never run underneath it. */
const ARROW_END_VB = R_VB - NODE_VB / 2 - 6;
/** Gentle outward bow, so the connectors read as paths rather than spokes. */
const BOW_VB = 26;

type Node = {
  key: string;
  href: string;
  Icon: LucideIcon | null;
  /** Accent used by the connector, the tip and the hover glow. */
  color: string;
  text: string;
};

const NODES: Node[] = [
  { key: "technical", href: "/tools/seo-analyzer", Icon: ShieldCheck, color: "#34d399", text: "text-emerald-300" },
  { key: "onPage", href: "/tools/seo-page-analyzer", Icon: FileSearch, color: "#60a5fa", text: "text-blue-300" },
  { key: "crawling", href: "/tools/xml-sitemap-generator", Icon: Network, color: "#22d3ee", text: "text-cyan-300" },
  { key: "performance", href: "/tools/page-speed", Icon: Gauge, color: "#a78bfa", text: "text-violet-300" },
  { key: "content", href: "/tools/content-analyzer", Icon: FileText, color: "#34d399", text: "text-emerald-300" },
  { key: "schema", href: "/tools/schema-markup-generator", Icon: Braces, color: "#60a5fa", text: "text-blue-300" },
  { key: "keywords", href: "/tools/keyword-density-checker", Icon: Target, color: "#22d3ee", text: "text-cyan-300" },
  // The one brand mark in the ring: YouTube tools are a whole discipline here.
  { key: "youtube", href: "/tools/youtube-keyword-ideas", Icon: null, color: "#ff3b5c", text: "text-red-400" },
];

const GEOM = NODES.map((_, i) => {
  const a = ((-90 + i * 45) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    /** Unit vector: the only thing the markup needs for direction. */
    cos,
    sin,
    /** Arrow end point, in viewBox units. */
    ex: C + cos * ARROW_END_VB,
    ey: C + sin * ARROW_END_VB,
    /** Quadratic control point, bowed perpendicular to the radius. */
    qx: C + cos * ARROW_END_VB * 0.55 - sin * BOW_VB,
    qy: C + sin * ARROW_END_VB * 0.55 + cos * BOW_VB,
  };
});

/* ---------------------------------------------------------------------------
   Timeline
   ---------------------------------------------------------------------------
   One clock drives the whole sequence. Each icon and each connector has its own
   window on that clock, which is what makes the composition build up in order
   instead of everything arriving at once:

     hub        0    →  520ms
     icons    260    → +900ms, 45ms apart
     arrows   520    → +900ms, 40ms apart
     settle  1800    → idle
--------------------------------------------------------------------------- */

const EMERGE_START = 260;
const EMERGE_DUR = 900;
const EMERGE_GAP = 45;

const ARROW_START = 520;
const ARROW_DUR = 900;
const ARROW_GAP = 40;

const TOTAL = 1850;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * The hero's signature graphic: eight SEO disciplines arranged around a central
 * SEO hub, connected by arrows that draw themselves outward.
 *
 * Position is `translate`d from the hub to a fixed final slot, so the layout is
 * never touched — scrolling and hovering cannot shift the icons. The final slot
 * itself is a percentage of the measured container, so the ring stays
 * symmetric at every width.
 */
export default function HeroRadial() {
  const t = useTranslations("Radial");
  const wrap = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [nodeSize, setNodeSize] = useState(48);

  /* Geometry: one measurement, shared by the HTML nodes. */
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (!w) return;
      const size = Math.max(32, Math.min(58, Math.round(w * NODE_RATIO)));
      setNodeSize(size);
      // Ring radius in px — the same ratio the SVG uses for its viewBox radius.
      el.style.setProperty("--ring", `${(w * R_RATIO).toFixed(2)}px`);
      // Offset each icon travels from the hub to its slot.
      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        const g = GEOM[i];
        node.style.setProperty("--ux", g.cos.toFixed(4));
        node.style.setProperty("--uy", g.sin.toFixed(4));
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Sequence: runs once, before the first paint if possible. */
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const nodes = nodeRefs.current;
    const reduced = !document.documentElement.classList.contains("motion-on");

    const write = (p: number) => {
      nodes.forEach((node, i) => {
        if (!node) return;
        const pe = clamp01((p * TOTAL - (EMERGE_START + i * EMERGE_GAP)) / EMERGE_DUR);
        const pa = clamp01((p * TOTAL - (ARROW_START + i * ARROW_GAP)) / ARROW_DUR);
        node.style.setProperty("--pi", easeOutCubic(pe).toFixed(4));
        node.style.setProperty("--ai", easeOutCubic(pa).toFixed(4));
      });
      el.style.setProperty("--p", p.toFixed(4));
    };

    if (reduced) {
      write(1);
      el.setAttribute("data-done", "1");
      return;
    }

    write(0);
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / TOTAL);
      write(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        el.setAttribute("data-done", "1");
      }
    };

    raf = requestAnimationFrame(tick);

    // If the tab was backgrounded the clock can stall; never leave icons at the hub.
    const safety = window.setTimeout(() => {
      if (el.getAttribute("data-done") !== "1") {
        write(1);
        el.setAttribute("data-done", "1");
      }
    }, TOTAL + 1200);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={wrap}
        role="group"
        aria-label={t("label")}
        data-radial=""
        className="radial relative mx-auto aspect-square w-full max-w-[680px] select-none"
        style={{ ["--node" as string]: `${nodeSize}px` }}
      >
        {/* ---------------- Connectors ---------------- */}
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id="radial-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
              <stop offset="42%" stopColor="#22d3ee" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={C} cy={C} r={R_VB + 30} fill="url(#radial-halo)" />

          {/* Static rails: dotted outer ring, hairline inner ring. */}
          <circle
            cx={C}
            cy={C}
            r={R_VB}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.08"
            strokeDasharray="2 10"
          />
          <circle cx={C} cy={C} r={R_VB * 0.6} fill="none" stroke="#ffffff" strokeOpacity="0.045" />

          {GEOM.map((g, i) => {
            const node = NODES[i];
            const hot = active === i;
            const d = `M ${C} ${C} Q ${g.qx.toFixed(2)} ${g.qy.toFixed(2)} ${g.ex.toFixed(2)} ${g.ey.toFixed(2)}`;

            return (
              <g key={node.key}>
                {/* Hover halo behind the active connector */}
                {hot ? (
                  <path
                    d={d}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={7}
                    strokeOpacity={0.15}
                    strokeLinecap="round"
                    className="radial-arrow"
                    data-halo=""
                    style={{ ["--ai" as string]: 1 }}
                  />
                ) : null}

                <path
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={hot ? 2 : 1.4}
                  strokeOpacity={hot ? 0.95 : 0.42}
                  className="radial-arrow"
                />

                {/* Light packet travelling out to the icon once everything has settled */}
                <path
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={hot ? 3.2 : 2.2}
                  strokeLinecap="round"
                  className="radial-comet"
                  style={{ animationDelay: `${1.6 + i * 0.34}s` }}
                />

                {/* Tip: appears as the connector reaches the icon */}
                <circle cx={g.ex} cy={g.ey} r={hot ? 3.4 : 2.4} fill={node.color} className="radial-tip" />
              </g>
            );
          })}
        </svg>

        {/* ---------------- Hub ---------------- */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="radial-orbit absolute -inset-6 rounded-full" />

            <span aria-hidden="true" className="orbit-mote" style={{ ["--r" as string]: "102px", ["--dur" as string]: "17s", ["--c" as string]: "#34d399" }} />
            <span aria-hidden="true" className="orbit-mote" style={{ ["--r" as string]: "124px", ["--dur" as string]: "26s", ["--c" as string]: "#22d3ee", animationDirection: "reverse" }} />
            <span aria-hidden="true" className="orbit-mote" style={{ ["--r" as string]: "86px", ["--dur" as string]: "12s", ["--c" as string]: "#a78bfa" }} />

            <div className="radial-core relative flex h-[132px] w-[132px] items-center justify-center rounded-full bg-slate-950/85 backdrop-blur-md sm:h-[156px] sm:w-[156px]">
              <span aria-hidden="true" className="absolute inset-0 animate-[spin_26s_linear_infinite] rounded-full border border-emerald-400/20" style={{ borderStyle: "dashed" }} />
              <span aria-hidden="true" className="absolute inset-[10px] animate-[spin_40s_linear_infinite_reverse] rounded-full border border-cyan-400/15" style={{ borderStyle: "dotted" }} />

              <span className="relative flex flex-col items-center leading-none">
                <span
                  data-latin
                  className="bg-gradient-to-br from-white via-emerald-200 to-cyan-300 bg-clip-text text-[26px] font-black tracking-tight text-transparent drop-shadow-[0_0_22px_rgba(52,211,153,0.45)] sm:text-3xl"
                >
                  SEO
                </span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {t("hubLabel")}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- Discipline nodes ---------------- */}
        {NODES.map((node, i) => {
          const g = GEOM[i];
          const hot = active === i;
          /**
           * Label placement follows the slot, not the hover target:
           *   upper half → above the icon
           *   lower half → below the icon
           *   three / nine o'clock → sideways, pointing inward, because a
           *   centred chip there would spill past the composition's edge.
           */
          const side =
            Math.abs(g.sin) <= 0.2 ? (g.cos > 0 ? "start" : "end") : null;

          return (
            <Link
              key={node.key}
              href={node.href}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={t(`nodes.${node.key}`)}
              data-radial-node={node.key}
              data-hot={hot ? "1" : "0"}
              className="radial-node absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/85 ring-1"
              style={{ ["--glow" as string]: node.color }}
            >
              <span className="radial-node-inner flex h-full w-full items-center justify-center">
                {node.Icon ? (
                  <node.Icon className={`radial-icon ${node.text}`} aria-hidden="true" />
                ) : (
                  <YouTubeMark className="radial-icon text-red-500" />
                )}
              </span>

              <span
                className={`radial-label ${hot ? "is-on" : ""}`}
                data-side={side ?? (g.sin < 0 ? "up" : "down")}
                aria-hidden="true"
              >
                {t(`nodes.${node.key}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}