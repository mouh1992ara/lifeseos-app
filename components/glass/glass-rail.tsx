"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * A glass rail with a sliding selection indicator.
 *
 * The indicator is measured from the real active element rather than computed
 * from index arithmetic: labels differ in width across four languages, so any
 * formula would drift the moment a translation changes. Measuring also means RTL
 * needs no special case — `offsetLeft` is already mirrored by the browser, and
 * the thumb is positioned in the same coordinate system.
 *
 * Layout reads are confined to a layout effect that runs on mount, on resize and
 * when the active index changes; the animation itself is a transform, so frames
 * stay on the compositor.
 *
 * Items opt in with `{...lgItem(index, isActive)}` spread onto whatever element
 * they already are — a Link, a button, an anchor. No wrapper element is added.
 */

export type GlassItemProps = {
  "data-lg-item": string;
  "data-active": "true" | "false";
  className: string;
};

/** Spread onto a Link/button. Keeps semantics: the element stays what it was. */
export function lgItem(index: number, active: boolean, extra = ""): GlassItemProps {
  return {
    "data-lg-item": String(index),
    "data-active": active ? "true" : "false",
    className: `lg-item ${extra}`.trim(),
  };
}

export function GlassRail({
  children,
  activeIndex,
  orientation = "horizontal",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  /** -1 renders no indicator (nothing selected on this route). */
  activeIndex: number;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  className?: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail || activeIndex < 0) {
      setBox(null);
      return;
    }

    const target = rail.querySelector<HTMLElement>(`[data-lg-item="${activeIndex}"]`);
    if (!target) {
      setBox(null);
      return;
    }

    /* Rectangle maths rather than offsetLeft: an item may sit inside a
       positioned wrapper (the Solutions dropdown needs one), and offsetLeft
       would then be relative to that wrapper instead of the rail. */
    const railRect = rail.getBoundingClientRect();
    const itemRect = target.getBoundingClientRect();
    // The thumb is absolutely positioned inside the border box, so the 1px
    // border has to come off or the indicator sits one pixel wide.
    const border = Number.parseFloat(getComputedStyle(rail).borderTopWidth) || 0;

    setBox(
      orientation === "horizontal"
        ? { x: itemRect.left - railRect.left - border, y: 0, w: itemRect.width, h: 0 }
        : { x: 0, y: itemRect.top - railRect.top - border, w: 0, h: itemRect.height },
    );
  }, [activeIndex, orientation]);

  // Before paint, so the thumb never flashes at x=0 on first render.
  useLayoutEffect(() => {
    measure();
  }, [measure, children]);

  useEffect(() => {
    if (!box) {
      setReady(false);
      return;
    }
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [box]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(rail);

    // Web fonts land after first paint and change item widths.
    if (document.fonts?.ready) void document.fonts.ready.then(measure);

    return () => observer.disconnect();
  }, [measure]);

  const style =
    orientation === "horizontal" && box
      ? ({ "--x": `${box.x}px`, "--w": `${box.w}px` } as React.CSSProperties)
      : box
        ? ({ "--y": `${box.y}px`, "--h": `${box.h}px` } as React.CSSProperties)
        : undefined;

  return (
    <div
      ref={railRef}
      className={`lg-rail ${className}`.trim()}
      data-size={size}
      data-orientation={orientation}
      style={style}
    >
      {activeIndex >= 0 ? (
        <span
          className="lg-thumb"
          aria-hidden="true"
          data-ready={ready && box ? "true" : "false"}
        />
      ) : null}
      {children}
    </div>
  );
}