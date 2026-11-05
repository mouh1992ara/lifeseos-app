"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const W = 1000;
const H = 330;
const PAD_X = 14;
const PAD_TOP = 22;
const PAD_BOTTOM = 38;

type SeriesKey = "clicks" | "impressions" | "keywords";

/**
 * Hand-authored, deliberately uneven twelve-month series. A monotonic curve
 * would look like a marketing mock, so each series has real dips.
 */
const SERIES: {
  key: SeriesKey;
  color: string;
  area: boolean;
  /** Fraction of the plot height this series may use, so curves don't overlap. */
  band: number;
  values: number[];
}[] = [
  {
    key: "clicks",
    color: "#34d399",
    area: true,
    band: 1,
    values: [38, 45, 41, 52, 48, 60, 57, 66, 62, 74, 70, 83],
  },
  {
    key: "impressions",
    color: "#38bdf8",
    area: false,
    band: 0.74,
    values: [104, 110, 122, 128, 126, 140, 148, 146, 158, 166, 180, 194],
  },
  {
    key: "keywords",
    color: "#a78bfa",
    area: false,
    band: 0.48,
    values: [16, 16, 17, 17, 24, 24, 25, 25, 30, 30, 31, 31],
  },
];

const COUNT = SERIES[0].values.length;
const STEP = (W - PAD_X * 2) / (COUNT - 1);

function xAt(i: number) {
  return PAD_X + i * STEP;
}

type Series = (typeof SERIES)[number];

/** Each series is scaled to its own peak and confined to its own band. */
function yAt(series: Series, value: number) {
  const max = Math.max(...series.values) * 1.04;
  const plot = H - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + plot - (value / max) * plot * series.band;
}

/**
 * Catmull-Rom → cubic bezier. Straight segments are the fastest way to make a
 * chart look like a mock-up; a light tension keeps the trend honest while the
 * joins flow.
 */
function linePath(series: Series) {
  const pts = series.values.map((v, i) => ({ x: xAt(i), y: yAt(series, v) }));
  const tension = 0.16;

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

function areaPath(series: Series) {
  const base = H - PAD_BOTTOM;
  return `${linePath(series)} L ${xAt(COUNT - 1).toFixed(2)} ${base} L ${xAt(0).toFixed(2)} ${base} Z`;
}

export default function AnalyticsChart() {
  const tA = useTranslations("Analytics");
  const locale = useLocale();
  const box = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());

  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
    return Array.from({ length: COUNT }, (_, i) =>
      fmt.format(new Date(2025, 10 + i, 1)),
    );
  }, [locale]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setDrawn(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = box.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const idx = Math.round((ratio * W - PAD_X) / STEP);
    setHover(Math.min(COUNT - 1, Math.max(0, idx)));
  };

  const activeSeries = SERIES.filter((s) => !hidden.has(s.key));

  return (
    <div>
      {/* Legend / series toggles */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {SERIES.map((s) => {
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
              className={`group flex items-center gap-2 text-xs font-medium transition ${
                off ? "text-slate-600" : "text-slate-300"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full transition"
                style={{
                  backgroundColor: off ? "#475569" : s.color,
                  boxShadow: off ? "none" : `0 0 10px ${s.color}80`,
                }}
              />
              {tA(`series.${s.key}`)}
            </button>
          );
        })}

        <span className="ms-auto rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
          {tA("demo")}
        </span>
      </div>

      <div
        ref={box}
        data-drawn={drawn ? "true" : "false"}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        className="relative mt-4"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={tA("title")}
        >
          <defs>
            <clipPath id="plot-clip">
              <rect
                x={PAD_X}
                y={PAD_TOP - 8}
                width={W - PAD_X * 2}
                height={H - PAD_TOP - PAD_BOTTOM + 16}
              />
            </clipPath>
            <linearGradient id="scan-band" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            {SERIES.map((s) => (
              <linearGradient id={`fill-${s.key}`} key={s.key} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid */}
          {[0, 1, 2, 3].map((n) => {
            const y = PAD_TOP + ((H - PAD_TOP - PAD_BOTTOM) / 3) * n;
            return (
              <line
                key={n}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={y}
                y2={y}
                stroke="#ffffff"
                strokeOpacity="0.06"
              />
            );
          })}

          {activeSeries.map((s, si) =>
            s.area ? (
              <path
                key={`area-${s.key}`}
                d={areaPath(s)}
                fill={`url(#fill-${s.key})`}
                className="chart-area"
                style={{ animationDelay: `${220 + si * 90}ms` }}
              />
            ) : null,
          )}

          {activeSeries.map((s, si) => (
            <path
              key={`line-${s.key}`}
              d={linePath(s)}
              pathLength={1}
              fill="none"
              stroke={s.color}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-line"
              style={{
                animationDelay: `${si * 130}ms`,
                filter: `drop-shadow(0 0 6px ${s.color}55)`,
              }}
            />
          ))}

          {/* Data points */}
          {/* Live marker on the latest point of the lead series */}
          {!hidden.has("clicks") ? (
            <g className="chart-dot" style={{ animationDelay: "900ms" }}>
              <circle
                cx={xAt(COUNT - 1)}
                cy={yAt(SERIES[0], SERIES[0].values[COUNT - 1])}
                r={7}
                fill="#34d399"
                fillOpacity={0.16}
              />
              <circle
                cx={xAt(COUNT - 1)}
                cy={yAt(SERIES[0], SERIES[0].values[COUNT - 1])}
                r={3.4}
                fill="#34d399"
              />
            </g>
          ) : null}

          {activeSeries.flatMap((s, si) =>
            s.values.map((v, i) => (
              <circle
                key={`${s.key}-${i}`}
                cx={xAt(i)}
                cy={yAt(s, v)}
                r={hover === i ? 4 : 2.4}
                fill="#0b1220"
                stroke={s.color}
                strokeWidth={1.8}
                className="chart-dot"
                style={{ animationDelay: `${400 + si * 90 + i * 28}ms` }}
              />
            )),
          )}

          {/* Scanning highlight — a soft band sweeping across the plot */}
          <g clipPath="url(#plot-clip)">
            <rect
              x={-140}
              y={PAD_TOP - 8}
              width="130"
              height={H - PAD_TOP - PAD_BOTTOM + 16}
              fill="url(#scan-band)"
              className="chart-scan"
            />
          </g>

          {/* Hover guide */}
          {hover !== null ? (
            <line
              x1={xAt(hover)}
              x2={xAt(hover)}
              y1={PAD_TOP - 6}
              y2={H - PAD_BOTTOM}
              stroke="#ffffff"
              strokeOpacity="0.18"
              strokeDasharray="3 4"
            />
          ) : null}

          {/* Month labels, every other month to stay readable */}
          {months.map((m, i) =>
            i % 2 === 0 || i === COUNT - 1 ? (
              <text
                key={m + i}
                x={xAt(i)}
                y={H - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[11px]"
              >
                {m}
              </text>
            ) : null,
          )}
        </svg>

        {/* Tooltip */}
        {hover !== null ? (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-[9.5rem] -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/95 p-3 text-xs shadow-2xl backdrop-blur"
            style={{
              left: `${(xAt(hover) / W) * 100}%`,
              transform:
                hover > COUNT * 0.75
                  ? "translateX(-90%)"
                  : hover < COUNT * 0.25
                    ? "translateX(-10%)"
                    : "translateX(-50%)",
            }}
          >
            <p className="mb-2 font-semibold text-slate-200">{months[hover]}</p>
            <ul className="space-y-1">
              {SERIES.filter((s) => !hidden.has(s.key)).map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {tA(`series.${s.key}`)}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-200" data-ltr-text>
                    {s.values[hover]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{tA("demoNote")}</p>
    </div>
  );
}
