"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Animated score readout.
 *
 * Server-renders the final value (so crawlers and no-JS visitors see real
 * numbers), then counts up from zero the first time it scrolls into view.
 * The reset to zero happens in a layout effect, i.e. before the first paint,
 * so there is no visible jump from the server value.
 */
export function CountUp({
  value,
  duration = 1400,
  delay = 0,
  className,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  // Runs before paint: hides the server value behind the starting zero.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    setDisplay(0);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let safety: ReturnType<typeof setTimeout> | undefined;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutQuart: fast start, gentle settle — reads as "measuring".
        const eased = 1 - Math.pow(1 - t, 4);
        setDisplay(eased * value);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (started) return;
      started = true;
      clearTimeout(safety);
      timer = setTimeout(run, delay);
    };

    // Above the fold: run at once, so the first thing a visitor sees is the
    // count. Below the fold: wait until it is actually in view.
    if (inView(node)) {
      start();
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              start();
              observer.disconnect();
            }
          }
        },
        { threshold: 0.35 },
      );
      observer.observe(node);
      // Safety net: a score must never be stuck at zero.
      safety = setTimeout(start, 2600);

      return () => {
        observer.disconnect();
        clearTimeout(safety);
        if (timer) clearTimeout(timer);
        cancelAnimationFrame(raf);
      };
    }

    return () => {
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [value, duration, delay]);

  return (
    <span ref={ref} className={className} data-ltr-text>
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  );
}

/**
 * Thin score bar that fills to `value` percent when it enters the viewport.
 * Width (not transform) is animated so the fill grows from the inline-start
 * edge in both LTR and RTL without extra rules.
 */
export function Meter({
  value,
  duration = 1200,
  delay = 0,
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(value);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    setWidth(0);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let filled = false;

    const fill = () => {
      if (filled) return;
      filled = true;
      timer = setTimeout(() => setWidth(value), delay);
    };

    if (inView(node)) {
      fill();
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fill();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    // Safety net: a meter must never stay empty just because the observer
    // never fired (hidden container, zero-height parent, tab restored).
    const safety = setTimeout(fill, 2600);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
      if (timer) clearTimeout(timer);
    };
  }, [value, delay]);

  const style: CSSProperties = {
    width: `${width}%`,
    transitionProperty: "width",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return <div ref={ref} className={className} style={style} />;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Cheap viewport test used before falling back to an observer. */
function inView(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 1.05 && rect.bottom > 0;
}
