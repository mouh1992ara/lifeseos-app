"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const PRESENCE_CHANNEL =
  "lifeseos-live-visitors";

function getVisitorId() {
  const storageKey =
    "lifeseos_visitor_id";

  const existing =
    window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const visitorId =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  window.localStorage.setItem(
    storageKey,
    visitorId
  );

  return visitorId;
}

export default function LivePresence() {
  const pathname = usePathname();

  const onlineSinceRef = useRef(
    new Date().toISOString()
  );

  useEffect(() => {
    /*
     * Do not count the administrator while
     * viewing the admin dashboard.
     */
    if (pathname.startsWith("/admin")) {
      return;
    }

    const supabase = createClient();

    let cancelled = false;

    const channel = supabase.channel(
      PRESENCE_CHANNEL
    );

    async function startPresence() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      const visitorId = getVisitorId();

      channel.subscribe(async (status) => {
        if (
          status !== "SUBSCRIBED" ||
          cancelled
        ) {
          return;
        }

        await channel.track({
          visitor_id: visitorId,

          user_id: user?.id ?? null,

          type: user
            ? "registered"
            : "guest",

          path: pathname,

          online_at:
            onlineSinceRef.current,

          updated_at:
            new Date().toISOString(),
        });
      });
    }

    void startPresence();

    return () => {
      cancelled = true;

      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [pathname]);

  return null;
}
