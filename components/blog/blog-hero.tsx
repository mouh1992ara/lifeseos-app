import { ArrowRight, Code2, Gauge, Network, Search, Sparkles } from "lucide-react";

/**
 * Blog hero.
 *
 * Deliberately compact (py-16 → py-20, not a full-screen statement) because the
 * featured card and grid have to arrive quickly. Everything animated here is
 * CSS keyframes gated behind `html.motion-on`, so `prefers-reduced-motion`
 * users get the same layout with no motion and nothing hidden.
 */
export default function BlogHero({
  badge,
  titleLead,
  titleAccent,
  subtitle,
  cta,
  chips,
}: {
  badge: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  cta: string;
  chips: string[];
}) {
  return (
    <section className="blog-hero relative border-b border-white/[0.07]">
      {/* Slow gradient wash: three wide radials that drift out of phase. */}
      <div aria-hidden="true" className="blog-hero-aura" />
      <div aria-hidden="true" className="blog-hero-grid" />

      {/* Decorative glyphs — aria-hidden, pointer-events-none, transform-only. */}
      <span aria-hidden="true" className="blog-glyph left-[6%] top-[18%]">
        <Search className="h-5 w-5" />
      </span>
      <span aria-hidden="true" className="blog-glyph blog-glyph--b right-[8%] top-[24%]">
        <Gauge className="h-5 w-5" />
      </span>
      <span aria-hidden="true" className="blog-glyph blog-glyph--c left-[13%] bottom-[16%]">
        <Network className="h-4 w-4" />
      </span>
      <span aria-hidden="true" className="blog-glyph blog-glyph--d right-[14%] bottom-[20%]">
        <Code2 className="h-4 w-4" />
      </span>

      <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-16 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="blog-rise inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {badge}
          </p>

          <h1 className="text-balance mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            <span className="blog-rise block" style={{ "--bd": "90ms" } as React.CSSProperties}>
              {titleLead}
            </span>
            <span
              className="blog-rise mt-1.5 block"
              style={{ "--bd": "180ms" } as React.CSSProperties}
            >
              <span className="blog-gradient-text">{titleAccent}</span>
            </span>
          </h1>

          <p
            className="blog-rise mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-8 text-slate-400 sm:text-base"
            style={{ "--bd": "270ms" } as React.CSSProperties}
          >
            {subtitle}
          </p>

          <div
            className="blog-rise mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ "--bd": "360ms" } as React.CSSProperties}
          >
            <a href="#articles" className="btn-primary group h-11 px-6 text-sm">
              {cta}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180"
                aria-hidden="true"
              />
            </a>
          </div>

          <ul
            className="blog-rise mt-8 flex flex-wrap items-center justify-center gap-2"
            style={{ "--bd": "450ms" } as React.CSSProperties}
          >
            {chips.map((chip, i) => (
              <li key={chip}>
                <span
                  className="blog-chip"
                  style={{ "--bd": `${480 + i * 70}ms` } as React.CSSProperties}
                >
                  {chip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
