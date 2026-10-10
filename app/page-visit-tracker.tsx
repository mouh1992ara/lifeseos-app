"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
  }, [pathname]);

  return null;
}
