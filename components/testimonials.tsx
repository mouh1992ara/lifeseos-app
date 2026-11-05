"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Quote,
  Sparkles,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { TOOL_ACCENT, TOOL_ICON } from "@/components/tool-card";
import { FEATURE_CARDS } from "@/content/community-features";
import { TESTIMONIALS, type Locale } from "@/content/testimonials";

/** 3s between groups. */
const AUTOPLAY_MS = 3000;
/** Half the travel time for a deliberate swipe. */
const SWIPE_THRESHOLD = 44;

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Grouped horizontal community carousel.
 *
 * Two content modes, one mechanism:
 *   - `TESTIMONIALS` non-empty → real, authorised customer reviews.
 *   - otherwise → real LifeSeos tools, so the slot stays useful without
 *     inventing social proof. Tool card copy comes from the existing
 *     `Tools.catalog` translations; every card links to a live route.
 *
 * `perView` follows the viewport (3 desktop / 2 tablet / 1 phone) and one step
 * advances a whole group, so the cards travel together in a single composited
 * transform.
 */
export default function Testimonials() {
  const t = useTranslations("Community");
  const tTool = useTranslations("Tools.catalog");
  const locale = useLocale() as Locale;

  const isReviews = TESTIMONIALS.length > 0;
  const count = isReviews ? TESTIMONIALS.length : FEATURE_CARDS.length;

  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [dragging, setDragging] = useState(false);

  const regionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; active: boolean }>({ x: 0, active: false });

  const maxIndex = Math.max(0, count - perView);

  /* Breakpoints follow the viewport, not the container: the section has its own
     padding, so an 834px tablet yields a ~754px rail and would otherwise be
     misread as a phone. Card size is derived from the rail in CSS. */
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const tablet = window.matchMedia("(min-width: 768px)");

    const sync = () => setPerView(desktop.matches ? 3 : tablet.matches ? 2 : 1);

    sync();
    desktop.addEventListener("change", sync);
    tablet.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      tablet.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* One step = one group. Wrap only after the last full group, so the final
     frame is never a partial, half-empty view. */
  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => {
        const next = i + dir * perView;
        if (dir === 1) {
          if (next <= maxIndex) return next;
          return i < maxIndex ? maxIndex : 0;
        }
        if (next >= 0) return next;
        return i > 0 ? 0 : maxIndex;
      });
    },
    [maxIndex, perView],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  /* Autoplay restarts on every group change, so a manual click re-arms the
     timer instead of stopping rotation. */
  useEffect(() => {
    if (paused || reduced || count <= perView) return;
    if (typeof document !== "undefined" && document.hidden) return;

    const timer = setTimeout(() => step(1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, reduced, step, count, perView]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
  };

  /* Swipe offset is written straight to the track's custom property: it changes
     every frame and must not re-render the subtree. */
  const setDrag = (px: number) => {
    trackRef.current?.style.setProperty("--drag", `${px}px`);
  };

  const rtl = () =>
    trackRef.current
      ? getComputedStyle(trackRef.current).direction === "rtl"
      : false;

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return;
    drag.current = { x: event.clientX, active: true };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current.active) return;
    const width = trackRef.current?.clientWidth ?? 600;
    const dx = event.clientX - drag.current.x;
    setDrag(Math.max(-width, Math.min(width, dx)));
  };

  const finishDrag = (event: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.x;
    drag.current.active = false;
    setDragging(false);
    setDrag(0);

    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    const advancing = rtl() ? dx > 0 : dx < 0;
    if (advancing) next();
    else prev();
  };

  const from = index + 1;
  const to = Math.min(index + perView, count);
  const multiplePages = maxIndex > 0;

  const eyebrow = isReviews ? t("eyebrow") : t("featuresEyebrow");
  const heading = isReviews ? t("title") : t("featuresTitle");
  const subtitle = isReviews ? t("subtitle") : t("featuresSubtitle");

  return (
    <section
      id="community"
      className="scroll-mt-24 px-6 py-20 sm:px-10 lg:px-16"
      aria-labelledby="community-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            {eyebrow}
          </p>

          <h2
            id="community-title"
            className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-bold leading-tight sm:text-4xl"
          >
            {heading}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-[15px] leading-7 text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          ref={regionRef}
          className="testimonial-shell relative mt-10"
          role="group"
          aria-roledescription="carousel"
          aria-label={heading}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onPointerLeave={finishDrag}
          onFocus={() => setPaused(true)}
          onBlur={(e) => {
            if (!regionRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
          }}
          data-carousel
          data-carousel-mode={isReviews ? "reviews" : "features"}
          data-per-view={perView}
        >
          <div className="testimonial-viewport">
            <div
              ref={trackRef}
              className={`testimonial-track ${dragging ? "is-dragging" : ""}`}
              style={{ "--i": index, "--pv": perView } as React.CSSProperties}
              data-carousel-track
              data-carousel-index={index}
            >
              {isReviews
                ? TESTIMONIALS.map((item, i) => {
                    const visible = i >= index && i < index + perView;
                    const quote = item.translations?.[locale] ?? item.quote;

                    return (
                      <div
                        key={`${item.name}-${i}`}
                        className="testimonial-slide"
                        aria-hidden={visible ? "false" : "true"}
                        aria-roledescription="slide"
                        data-carousel-slide={i}
                      >
                        <article className="testimonial-card">
                          <span aria-hidden="true" className="testimonial-ring" />

                          <div className="relative flex h-full flex-col gap-4 p-6 sm:p-7">
                            <div className="flex items-center gap-3">
                              {item.avatar ? (
                                /* Only present when the customer approved the photo. */
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.avatar}
                                  alt=""
                                  width={44}
                                  height={44}
                                  loading="lazy"
                                  className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
                                />
                              ) : (
                                <span
                                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-violet-400/20 text-sm font-semibold text-emerald-200"
                                  aria-hidden="true"
                                >
                                  {initialsOf(item.name)}
                                </span>
                              )}

                              <div className="min-w-0">
                                <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                                  <span className="truncate">{item.name}</span>
                                  {item.verified ? (
                                    <BadgeCheck
                                      className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                                      aria-label={t("verified")}
                                    />
                                  ) : null}
                                </p>
                                <p className="truncate text-[11px] leading-tight text-slate-500">
                                  {item.role}
                                </p>
                              </div>
                            </div>

                            <Quote
                              className="h-4 w-4 text-emerald-400/40"
                              aria-hidden="true"
                            />

                            <p className="text-pretty text-[14.5px] leading-7 text-slate-300">
                              {quote}
                            </p>
                          </div>
                        </article>
                      </div>
                    );
                  })
                : FEATURE_CARDS.map((feature, i) => {
                    const visible = i >= index && i < index + perView;
                    const Icon = TOOL_ICON[feature.key] ?? Sparkles;
                    const accent = TOOL_ACCENT[feature.category];

                    return (
                      <div
                        key={feature.key}
                        className="testimonial-slide"
                        aria-hidden={visible ? "false" : "true"}
                        aria-roledescription="slide"
                        data-carousel-slide={i}
                      >
                        <Link
                          href={feature.href}
                          className="testimonial-card showcase-card"
                          style={{ ["--accent" as string]: accent }}
                          data-feature-card={feature.key}
                        >
                          <span aria-hidden="true" className="testimonial-ring" />

                          <div className="relative flex h-full flex-col gap-3 p-6 sm:p-7">
                            <span className="showcase-icon" aria-hidden="true">
                              <Icon className="h-[19px] w-[19px]" />
                            </span>

                            <h3 className="mt-1 text-[15px] font-semibold leading-snug text-white">
                              {tTool(`${feature.key}.title`)}
                            </h3>

                            <p className="text-pretty text-[13.5px] leading-6 text-slate-400">
                              {tTool(`${feature.key}.short`)}
                            </p>

                            <span className="showcase-cta mt-auto pt-2 text-[12px] font-semibold">
                              {t("openTool")}
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Controls only make sense once there is somewhere to go. */}
          {multiplePages ? (
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label={isReviews ? t("prev") : t("featuresPrev")}
                  data-carousel-prev=""
                  className="testimonial-btn"
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label={isReviews ? t("next") : t("featuresNext")}
                  data-carousel-next=""
                  className="testimonial-btn"
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? t("play") : t("pause")}
                  aria-pressed={paused}
                  data-carousel-toggle=""
                  className="testimonial-btn ms-1"
                >
                  {paused ? (
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="text-[11px] font-medium tabular-nums text-slate-500"
                  data-carousel-position=""
                >
                  {isReviews ? t("range", { from, to, total: count }) : t("featuresRange", { from, to, total: count })}
                </span>

                <div
                  role="tablist"
                  aria-label={heading}
                  className="flex items-center gap-1.5"
                >
                  {Array.from({ length: maxIndex + 1 }, (_, i) => {
                    const on = i === index;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        aria-label={isReviews ? t("dot", { index: i + 1 }) : t("featuresDot", { index: i + 1 })}
                        data-carousel-dot={i}
                        onClick={() => setIndex(i)}
                        className={`testimonial-dot ${on ? "is-on" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* CTA belongs to the review mode; in feature mode the cards are the CTA. */}
        {isReviews ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-center" data-reveal>
            <p className="text-lg font-semibold text-white sm:text-xl">{t("ctaTitle")}</p>

            <Link href="/tools" className="btn-primary h-11 px-6 text-sm">
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 flex justify-center" data-reveal>
            <Link href="/tools" className="btn-secondary h-11 px-6 text-sm">
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
