"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Info, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { GlassRail, lgItem } from "@/components/glass/glass-rail";
import type { Bucket } from "@/lib/dashboard-analytics";

type RangeKey = "24h" | "7d" | "28d" | "90d";

const RANGES: { key: RangeKey; days: number }[] = [
  { key: "24h", days: 1 },
  { key: "7d", days: 7 },
  { key: "28d", days: 28 },
  { key: "90d", days: 90 },
];

const COLORS = {
  avg: "#34d399",
  best: "#a78bfa",
  siteA: "#fbbf24",
  siteB: "#38bdf8",
};

/* Chart geometry, in viewBox units so it stays sharp at any size. */
const W = 960;
const H = 330;
const PAD = { left: 44, right: 14, top: 16, bottom: 30 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

type Point = { i: number; v: number | null };

function yOf(value: number) {
  return PAD.top + (1 - value / 100) * INNER_H;
}

/** Catmull-Rom → cubic bezier, so the line curves without overshooting much. */
function linePath(points: Point[], count: number) {
  const solid = points.filter((p): p is { i: number; v: number } => p.v !== null);
  if (solid.length === 0) return "";
  if (solid.length === 1) {
    const p = solid[0];
    return `M ${xOf(p.i, count)} ${yOf(p.v)}`;
  }

  let d = `M ${xOf(solid[0].i, count)} ${yOf(solid[0].v)}`;
  for (let k = 0; k < solid.length - 1; k += 1) {
    const p0 = solid[Math.max(0, k - 1)];
    const p1 = solid[k];
    const p2 = solid[k + 1];
    const p3 = solid[Math.min(solid.length - 1, k + 2)];

    const c1x = xOf(p1.i, count) + (xOf(p2.i, count) - xOf(p0.i, count)) / 6;
    const c1y = yOf(p1.v) + (yOf(p2.v) - yOf(p0.v)) / 6;
    const c2x = xOf(p2.i, count) - (xOf(p3.i, count) - xOf(p1.i, count)) / 6;
    const c2y = yOf(p2.v) - (yOf(p3.v) - yOf(p1.v)) / 6;

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${xOf(p2.i, count).toFixed(2)} ${yOf(p2.v).toFixed(2)}`;
  }
  return d;
}

function xOf(i: number, count: number) {
  if (count <= 1) return PAD.left + INNER_W / 2;
  return PAD.left + (i / (count - 1)) * INNER_W;
}

function areaPath(points: Point[], count: number) {
  const solid = points.filter((p): p is { i: number; v: number } => p.v !== null);
  if (solid.length < 2) return "";
  const line = linePath(points, count);
  const last = solid[solid.length - 1];
  const first = solid[0];
  return `${line} L ${xOf(last.i, count)} ${PAD.top + INNER_H} L ${xOf(first.i, count)} ${PAD.top + INNER_H} Z`;
}

/** Counts up on mount and on value change; respects reduced motion. */
function Num({ value, decimals = 0 }: { value: number; decimals?: number }) {
  /* The first render must equal the server output, so the SSR text is the final
     value. The effect then counts 0 → value; without that distinction the
     "animation" would run from the value to the value and never be visible. */
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const mounted = useRef(false);

  useEffect(() => {
    const reduced = !document.documentElement.classList.contains("motion-on");
    if (reduced) {
      setShown(value);
      from.current = value;
      return;
    }

    const start = performance.now();
    const initial = mounted.current ? from.current : 0;
    mounted.current = true;
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(initial + (value - initial) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{shown.toFixed(decimals)}</>;
}

/**
 * KPI sparkline.
 *
 * It keeps its own coordinate system and normalises to the series' own min/max:
 * reusing the main chart's 0–100 domain (and a wide viewBox with
 * `preserveAspectRatio="none"`) flattened every line into a straight band in the
 * 36px-tall slot.
 */
function Sparkline({ values, color, id }: { values: (number | null)[]; color: string; id: string }) {
  const solid = values.filter((v): v is number => v !== null);
  if (solid.length < 2) return null;

  const SPARK_W = 120;
  const SPARK_H = 36;
  const padY = 4;
  const min = Math.min(...solid);
  const max = Math.max(...solid);
  const span = max - min || 1;

  const pts = values
    .map((v, i) => ({ i, v }))
    .filter((p): p is { i: number; v: number } => p.v !== null)
    .map((p) => ({
      x: (p.i / Math.max(1, values.length - 1)) * SPARK_W,
      y: padY + (1 - (p.v - min) / span) * (SPARK_H - padY * 2),
    }));

  const line = pts
    .map((p, i) => (i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`))
    .join(" ");

  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${SPARK_H} L ${pts[0].x.toFixed(1)} ${SPARK_H} Z`;

  return (
    <svg
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      className="kpi-spark"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.38" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function PerformanceAnalytics({
  buckets,
  siteLabels,
  sample,
  siteCount,
  labels,
}: {
  buckets: Bucket[];
  siteLabels: string[];
  sample: boolean;
  siteCount: number;
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    rangeLabel: string;
    ranges: Record<RangeKey, string>;
    chartTitle: string;
    chartHint: string;
    seriesAverage: string;
    seriesBest: string;
    kpiAudits: string;
    kpiAverage: string;
    kpiBest: string;
    kpiSites: string;
    auditsUnit: string;
    scoreUnit: string;
    vsPrevious: string;
    flat: string;
    sampleBadge: string;
    sampleNote: string;
    footnote: string;
    cta: string;
    ctaHref: string;
  };
}) {
  const [range, setRange] = useState<RangeKey>("28d");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const days = RANGES.find((r) => r.key === range)?.days ?? 28;

  const view = useMemo(() => {
    const slice = buckets.slice(-Math.max(1, days));
    const prev = buckets.slice(Math.max(0, buckets.length - days * 2), buckets.length - Math.max(1, days));

    const series = [
      {
        key: "avg",
        label: labels.seriesAverage,
        color: COLORS.avg,
        fill: true,
        points: slice.map((b, i) => ({ i, v: b.avg })),
      },
      {
        key: "best",
        label: labels.seriesBest,
        color: COLORS.best,
        fill: false,
        points: slice.map((b, i) => ({ i, v: b.best })),
      },
      ...siteLabels.map((site, idx) => ({
        key: site,
        label: site,
        color: idx === 0 ? COLORS.siteA : COLORS.siteB,
        fill: false,
        points: slice.map((b, i) => ({ i, v: b.sites[site] ?? null })),
      })),
    ];

    const auditsInRange = slice.reduce((sum, b) => sum + b.audits, 0);
    const scored = slice.filter((b) => b.avg !== null);
    const avgInRange = scored.length
      ? Math.round(scored.reduce((sum, b) => sum + (b.avg ?? 0), 0) / scored.length)
      : null;
    const bestInRange = slice.some((b) => b.best !== null)
      ? Math.max(...slice.map((b) => b.best ?? 0))
      : null;

    const prevScored = prev.filter((b) => b.avg !== null);
    const prevAvg = prevScored.length
      ? prevScored.reduce((sum, b) => sum + (b.avg ?? 0), 0) / prevScored.length
      : null;

    const delta =
      avgInRange !== null && prevAvg !== null ? Math.round(avgInRange - prevAvg) : null;

    return { slice, series, auditsInRange, avgInRange, bestInRange, delta };
  }, [buckets, days, siteLabels, labels.seriesAverage, labels.seriesBest]);

  const count = view.slice.length;
  const visible = view.series.filter((s) => !hidden.has(s.key));

  const kpis = [
    {
      key: "audits",
      label: labels.kpiAudits,
      value: view.auditsInRange,
      suffix: "",
      decimals: 0,
      color: COLORS.avg,
      spark: view.slice.map((b) => b.audits),
      delta: null as number | null,
    },
    {
      key: "average",
      label: labels.kpiAverage,
      value: view.avgInRange ?? 0,
      suffix: "",
      decimals: 0,
      color: COLORS.best,
      spark: view.slice.map((b) => b.avg),
      delta: view.delta,
    },
    {
      key: "best",
      label: labels.kpiBest,
      value: view.bestInRange ?? 0,
      suffix: "",
      decimals: 0,
      color: COLORS.siteA,
      spark: view.slice.map((b) => b.best),
      delta: null as number | null,
    },
    {
      key: "sites",
      label: labels.kpiSites,
      value: siteCount,
      suffix: "",
      decimals: 0,
      color: COLORS.siteB,
      spark: view.slice.map((b) => b.audits),
      delta: null as number | null,
    },
  ];

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const ratio = (x - PAD.left) / INNER_W;
    const index = Math.round(ratio * (count - 1));
    setHover(Math.max(0, Math.min(count - 1, index)));
  };

  const hovered = hover !== null ? view.slice[hover] : null;

  return (
    <section className="mt-9">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {labels.eyebrow}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
            {labels.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{labels.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Same rail primitive as the header: one sliding indicator instead of
              four independently-highlighted buttons. A range switcher is a
              selection, and a single moving pill communicates that better than a
              per-button background does. */}
          <GlassRail
            size="sm"
            className="dash-glass-rail"
            activeIndex={RANGES.findIndex((r) => r.key === range)}
          >
            {RANGES.map((r, index) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                aria-pressed={range === r.key}
                data-range={r.key}
                {...lgItem(index, range === r.key, "dash-seg-btn")}
              >
                {labels.ranges[r.key]}
              </button>
            ))}
          </GlassRail>

          <a href={labels.ctaHref} className="btn-primary h-9 px-4 text-[13px]">
            {labels.cta}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {sample ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-3.5 py-2.5 text-[12px] leading-5 text-amber-200/90">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold">{labels.sampleBadge}</strong> — {labels.sampleNote}
          </span>
        </p>
      ) : null}

      {/* ---------- KPI cards ---------- */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.key}
            className="dash-kpi group relative overflow-hidden rounded-2xl border border-white/[0.07] p-4"
            style={{ "--c": kpi.color } as React.CSSProperties}
            data-kpi={kpi.key}
          >
            <span aria-hidden="true" className="dash-kpi-glow" />

            <div className="relative flex items-start justify-between gap-2">
              <p className="text-[11.5px] font-medium text-slate-400">{kpi.label}</p>
              <span className="dash-kpi-dot" aria-hidden="true" />
            </div>

            <p
              className="relative mt-2 text-[26px] font-bold leading-none tabular-nums tracking-tight text-white"
              data-kpi-value
            >
              <Num value={kpi.value} decimals={kpi.decimals} />
              {kpi.key === "audits" || kpi.key === "sites" ? null : (
                <span className="ms-1 text-[11px] font-medium text-slate-500">/100</span>
              )}
            </p>

            <div className="relative mt-2 flex items-center gap-1.5 text-[11px]">
              {kpi.delta === null ? (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Minus className="h-3 w-3" aria-hidden="true" />
                  {labels.flat}
                </span>
              ) : kpi.delta === 0 ? (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Minus className="h-3 w-3" aria-hidden="true" />
                  {labels.flat}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    kpi.delta > 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {kpi.delta > 0 ? (
                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="h-3 w-3" aria-hidden="true" />
                  )}
                  {kpi.delta > 0 ? `+${kpi.delta}` : `${kpi.delta}`}
                </span>
              )}
              <span className="text-slate-600">{labels.vsPrevious}</span>
            </div>

            <div className="relative mt-3 h-9">
              <Sparkline values={kpi.spark} color={kpi.color} id={kpi.key} />
            </div>
          </article>
        ))}
      </div>

      {/* ---------- Main chart ---------- */}
      <div className="dash-chart mt-3 rounded-2xl border border-white/[0.07] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-white">{labels.chartTitle}</h3>
            <p className="mt-0.5 text-[11.5px] text-slate-500">{labels.chartHint}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5" role="group">
            {view.series.map((s) => {
              const off = hidden.has(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() =>
                    setHidden((prev) => {
                      const next = new Set(prev);
                      if (next.has(s.key)) next.delete(s.key);
                      else next.add(s.key);
                      return next;
                    })
                  }
                  aria-pressed={!off}
                  data-legend={s.key}
                  className={`dash-legend ${off ? "is-off" : ""}`}
                >
                  <span
                    aria-hidden="true"
                    className="dash-legend-dot"
                    style={{ background: s.color }}
                  />
                  <span className="max-w-[9rem] truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mt-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="dash-svg w-full"
            role="img"
            aria-label={labels.chartTitle}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            data-chart
          >
            <defs>
              <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.avg} stopOpacity="0.28" />
                <stop offset="100%" stopColor={COLORS.avg} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* gridlines */}
            {[0, 25, 50, 75, 100].map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={yOf(tick)}
                  y2={yOf(tick)}
                  stroke="rgb(255 255 255 / 0.06)"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 10}
                  y={yOf(tick) + 3.5}
                  textAnchor="end"
                  className="dash-axis"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* x labels: first, middle, last only — avoids crowding */}
            {view.slice
              .map((b, i) => ({ b, i }))
              .filter(({ i }) => count <= 8 || i === 0 || i === count - 1 || i === Math.floor((count - 1) / 2))
              .map(({ b, i }) => (
                <text
                  key={b.t}
                  x={xOf(i, count)}
                  y={H - 10}
                  textAnchor={i === 0 ? "start" : i === count - 1 ? "end" : "middle"}
                  className="dash-axis"
                >
                  {b.label}
                </text>
              ))}

            {/* crosshair */}
            {hover !== null && count > 0 ? (
              <line
                x1={xOf(hover, count)}
                x2={xOf(hover, count)}
                y1={PAD.top}
                y2={PAD.top + INNER_H}
                stroke="rgb(255 255 255 / 0.22)"
                strokeDasharray="3 4"
              />
            ) : null}

            {/* series */}
            <g key={`${range}-${visible.map((s) => s.key).join("-")}`}>
              {visible.map((s) => (
                <g key={s.key} data-series={s.key}>
                  {s.fill ? (
                    <path
                      d={areaPath(s.points, count)}
                      fill="url(#dash-area)"
                      className="dash-area-in"
                    />
                  ) : null}
                  <path
                    d={linePath(s.points, count)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    className="dash-line"
                  />
                </g>
              ))}
            </g>

            {/* hovered dots */}
            {hover !== null
              ? visible.map((s) => {
                  const v = view.slice[hover] ? s.points[hover]?.v : null;
                  if (v === null || v === undefined) return null;
                  return (
                    <circle
                      key={`dot-${s.key}`}
                      cx={xOf(hover, count)}
                      cy={yOf(v)}
                      r="4"
                      fill="#020617"
                      stroke={s.color}
                      strokeWidth="2.4"
                    />
                  );
                })
              : null}

            {/* last-value dots, like a live endpoint */}
            {visible.map((s) => {
              const last = s.points.filter((p) => p.v !== null).pop();
              if (!last) return null;
              return (
                <circle
                  key={`end-${s.key}`}
                  cx={xOf(last.i, count)}
                  cy={yOf(last.v as number)}
                  r="3.2"
                  fill={s.color}
                  className="dash-end-dot"
                />
              );
            })}
          </svg>

          {/* tooltip */}
          {hovered ? (
            <div
              className="dash-tip"
              style={{
                left: `${((xOf(hover as number, count) / W) * 100).toFixed(2)}%`,
                transform: `translate(${(hover as number) > count / 2 ? "-104%" : "4%"}, -50%)`,
              }}
              role="status"
            >
              <p className="text-[11px] font-semibold text-white">{hovered.label}</p>
              <ul className="mt-1.5 space-y-1">
                {visible.map((s) => {
                  const v = s.points[hover as number]?.v;
                  return (
                    <li key={s.key} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="max-w-[8rem] truncate">{s.label}</span>
                      </span>
                      <span className="text-[11px] font-semibold tabular-nums text-white">
                        {v === null || v === undefined ? "—" : v}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1.5 text-[10.5px] text-slate-500">
                {hovered.audits} {labels.auditsUnit}
              </p>
            </div>
          ) : null}

          {count === 0 ? (
            <p className="absolute inset-0 grid place-items-center text-sm text-slate-500">
              {labels.sampleNote}
            </p>
          ) : null}
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-4 text-slate-600">
          <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          {labels.footnote}
        </p>
      </div>
    </section>
  );
}
