"use client";

import { useId } from "react";

/**
 * Minimal circular flags for the four locales the site actually ships.
 * Drawn inline so they render identically on every OS (emoji flags are missing
 * on Windows) and cost no network requests.
 */
export default function Flag({
  code,
  className = "h-4 w-4",
}: {
  code: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`f-${id}`}>
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>

      <g clipPath={`url(#f-${id})`}>
        {code === "en" && (
          <>
            <rect width="24" height="24" fill="#b22234" />
            {[2, 5.4, 8.8, 12.2, 15.6, 19, 22.4].map((y) => (
              <rect key={y} x="0" y={y} width="24" height="1.7" fill="#fff" />
            ))}
            <rect width="12" height="11" fill="#3c3b6e" />
            {[1.6, 4.2, 6.8, 9.4].map((y) =>
              [1.4, 3.9, 6.4, 8.9, 11.4].map((x) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="0.42" fill="#fff" />
              )),
            )}
          </>
        )}

        {code === "ar" && (
          <>
            <rect width="24" height="24" fill="#006c35" />
            <rect x="3" y="10.4" width="18" height="1.5" rx="0.4" fill="#fff" />
            <rect x="3" y="13.1" width="11" height="1.2" rx="0.4" fill="#fff" />
            <path d="M16 13.2h4l-1.2 1.4H16z" fill="#fff" />
          </>
        )}

        {code === "fr" && (
          <>
            <rect width="8" height="24" fill="#0055a4" />
            <rect x="8" width="8" height="24" fill="#fff" />
            <rect x="16" width="8" height="24" fill="#ef4135" />
          </>
        )}

        {code === "zh" && (
          <>
            <rect width="24" height="24" fill="#de2910" />
            <path
              d="M8.6 4 9.9 7.9 14 8l-3.3 2.4 1.2 4-3.3-2.5L5.3 14.4l1.2-4L3.2 8l4.1-.1z"
              fill="#ffde00"
            />
            {[
              [14.6, 4.6],
              [16.4, 7.2],
              [16.4, 10.2],
              [14.6, 12.6],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="0.85" fill="#ffde00" />
            ))}
          </>
        )}
      </g>

      <circle cx="12" cy="12" r="11.4" fill="none" stroke="#fff" strokeOpacity="0.22" />
    </svg>
  );
}
