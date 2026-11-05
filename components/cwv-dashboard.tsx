"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Core Web Vitals dashboard — pure SVG + HTML, no raster asset.
 *
 * Everything scales with the container: the gauge is an SVG arc drawn in
 * viewBox units (so it is crisp at any DPI), and the indicator bars are plain
 * boxes. Values count up and bars fill once the panel scrolls into view, and
 * the whole thing degrades to static final values under
 * `prefers-reduced-motion`.
 *
 * The caller decides whether the numbers are real Lighthouse results or a
 * sample; `demo` renders the badge so a sample can never be mistaken for a
 * measurement.
 */

export type CwvKey = "lcp" | "inp" | "cls";

export type CwvMetric = {
  key: CwvKey;
  label: string;
  /** Display string, already including the unit ("1.2 s", "180 ms", "0.04"). */
  value: string;
  /** Numeric value used for the bar; null when the metric is unavailable. */
  num: number | null;
};

/** Threshold table from the published Core Web Vitals guidance. */
const LIMITS: Record<CwvKey, { good: number; poor: number }> = {
  // LCP in seconds.
  lcp: { good: 2.5, poor: 4 },
  // INP in milliseconds.
  inp: { good: 200, poor: 500 },
  // CLS is unitless.
  cls: { good: 0.1, poor: 0.25 },
};

const UNITS: Record<CwvKey, string> = { lcp: "s", inp: "ms", cls: "" };

/** Pull a number out of "1.2 s" / "180 ms" / "0.04". */
export function parseMetric(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = String(raw).replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

export function cwvStatus(key: CwvKey, num: number | null) {
  if (num === null) return "unknown" as const;
  const { good, poor } = LIMITS[key];
  if (num <= good) return "good" as const;
  if (num <= poor) return "warn" as const;
  return "poor" as const;
}

const TONE = {
  good: { text: "text-emerald-300", bar: "#34d399", ring: "border-emerald-400/25 bg-emerald-400/10" },
  warn: { text: "text-amber-300", bar: "#fbbf24", ring: "border-amber-400/25 bg-amber-400/10" },
  poor: { text: "text-rose-300", bar: "#fb7185", ring: "border-rose-400/25 bg-rose-400/10" },
  unknown: { text: "text-slate-400", bar: "#64748b", ring: "border-white/10 bg-white/5" },
};

/** Bar fill: 0 at zero, 100% at (and beyond) the "poor" threshold. */
function fillRatio(key: CwvKey, num: number | null) {
  if (num === null) return 0;
  const ceiling = LIMITS[key].poor;
  return Math.max(0.02, Math.min(1, num / ceiling));
}

/* -------------------------------------------------------------------------- */

function Gauge({ score, label, outOf }: { score: number | null; label: string; outOf: string }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // 270° arc with the opening centred at the bottom, like a speedometer.
  // Angles are plain SVG angles (y grows downwards), so 90° is straight down.
  const R = 74;
  const CX = 90;
  const CY = 90;
  const START = 135;
  const SWEEP = 270;
  const polar = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  };
  const p0 = polar(START);
  const p1 = polar(START + SWEEP);
  const arc = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${R} ${R} 0 1 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;

  const safe = score === null ? null : Math.max(0, Math.min(100, score));
  const tone = safe === null ? TONE.unknown : safe >= 90 ? TONE.good : safe >= 50 ? TONE.warn : TONE.poor;
  const colour = safe === null ? TONE.unknown.bar : safe >= 90 ? TONE.good.bar : safe >= 50 ? TONE.warn.bar : TONE.poor.bar;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || safe === null) {
      setShown(safe ?? 0);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      const from = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - from) / 1100);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(eased * safe);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            run();
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    // Never leave the gauge at zero if the observer cannot fire.
    const safety = window.setTimeout(() => {
      if (!started) {
        started = true;
        setShown(safe);
      }
    }, 1500);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, [safe]);

  const progress = safe === null ? 0 : Math.min(1, shown / 100);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 180 180" className="h-[172px] w-[172px]" role="img" aria-label={`${label}: ${safe ?? "—"} ${outOf}`}>
          <defs>
            <linearGradient id="cwv-gauge" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={colour} stopOpacity="0.55" />
              <stop offset="100%" stopColor={colour} />
            </linearGradient>
          </defs>

          {/* Track */}
          <path d={arc} fill="none" stroke="#1e293b" strokeWidth="13" strokeLinecap="round" />
          {/* Progress */}
          <path
            d={arc}
            fill="none"
            stroke="url(#cwv-gauge)"
            strokeWidth="13"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
            style={{
              transition: "stroke-dashoffset 120ms linear",
              filter: `drop-shadow(0 0 8px ${colour}66)`,
            }}
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[40px] font-bold leading-none tabular-nums text-white" data-ltr-text>
            {safe === null ? "—" : Math.round(shown)}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">{outOf}</span>
        </div>
      </div>

      <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.16em] ${tone.text}`} data-ltr-text>
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function CwvDashboard({
  headline,
  score,
  scoreLabel,
  scoreOutOf,
  metrics,
  demo = false,
  demoLabel,
  statusLabels,
  note,
}: {
  headline: string;
  score: number | null;
  scoreLabel: string;
  scoreOutOf: string;
  metrics: CwvMetric[];
  demo?: boolean;
  demoLabel: string;
  statusLabels: Record<"good" | "warn" | "poor" | "unknown", string>;
  note?: string;
}) {
  const [visible, setVisible] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    // Fallback: reveal even if the observer never fires.
    const safety = window.setTimeout(() => setVisible(true), 1500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <div
      ref={box}
      data-cwv-dashboard
      data-cwv-demo={demo ? "1" : "0"}
      className="relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-900/70 p-5 sm:p-7"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -end-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{headline}</h3>

        {demo ? (
          <span
            data-cwv-demo-badge
            className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300"
          >
            {demoLabel}
          </span>
        ) : null}
      </div>

      <div className="relative mt-5 grid items-center gap-7 sm:grid-cols-[auto_1fr] sm:gap-9">
        <Gauge score={score} label={scoreLabel} outOf={scoreOutOf} />

        <ul className="grid gap-3.5">
          {metrics.map((m, i) => {
            const status = cwvStatus(m.key, m.num);
            const tone = TONE[status];
            const ratio = fillRatio(m.key, m.num);

            return (
              <li key={m.key} data-cwv-metric={m.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium text-slate-300">{m.label}</span>

                  <span className="flex items-baseline gap-2">
                    <span
                      className="text-[15px] font-semibold tabular-nums text-white"
                      data-ltr-text
                    >
                      {m.num === null ? "—" : m.value}
                      {m.num !== null && UNITS[m.key] && !m.value.includes(UNITS[m.key]) ? UNITS[m.key] : ""}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.ring} ${tone.text}`}>
                      {statusLabels[status]}
                    </span>
                  </span>
                </div>

                {/* Threshold ticks sit behind the fill so the bar reads as a scale. */}
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: visible ? `${ratio * 100}%` : "0%",
                      background: `linear-gradient(90deg, ${tone.bar}88, ${tone.bar})`,
                      transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${i * 90}ms`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {note ? <p className="relative mt-5 text-[11px] leading-relaxed text-slate-500">{note}</p> : null}
    </div>
  );
}