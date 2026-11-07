"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Records a page view for the visit log and the analytics event stream.
 *
 * Two destinations, one beacon, on purpose: /api/page-visit keeps the existing
 * country-level visit table fed, while /api/analytics carries the new
 * dimensions (locale, device, session) that the visit table cannot express.
 * Sending both from the same effect keeps them consistent — they cannot drift
 * into disagreeing about which page was viewed.
 *
 * Duplicate protection lives on the server: the analytics endpoint derives a
 * deterministic event id from (event, path, session, minute), so a StrictMode
 * double-invoke in development, a reload, or a back-navigation inside the same
 * minute collapses to one row instead of inflating the numbers.
 */
export default function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    void fetch("/api/page-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: pathname,
      }),
    }).catch(() => {
      // Tracking should never interrupt the website.
    });

    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: "page_view",
        path: pathname,
      }),
    }).catch(() => {
      // Same rule: a failed beacon is invisible to the visitor.
    });
  }, [pathname]);

  return null;
}
