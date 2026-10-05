"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const PRESENCE_CHANNEL =
  "lifeseos-live-visitors";

const ADMIN_TIME_ZONE =
  "Asia/Shanghai";

type VisitorPresence = {
  visitor_id?: string;
  user_id?: string | null;
  type?: "registered" | "guest";
  path?: string;
  online_at?: string;
  updated_at?: string;
};

type OnlineVisitor = {
  id: string;
  userId: string | null;
  type: "registered" | "guest";
  path: string;
  onlineAt: string | null;
  updatedAt: string | null;
};

type Props = {
  userEmails: Record<string, string>;
};

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    timeZone: ADMIN_TIME_ZONE,
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export default function LiveVisitors({
  userEmails,
}: Props) {
  const [visitors, setVisitors] =
    useState<OnlineVisitor[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel(
      PRESENCE_CHANNEL
    );

    function updateVisitors() {
      const state =
        channel.presenceState() as Record<
          string,
          VisitorPresence[]
        >;

      const deduplicated =
        new Map<string, OnlineVisitor>();

      for (const presences of Object.values(
        state
      )) {
        for (const presence of presences) {
          const userId =
            presence.user_id ?? null;

          const visitorId =
            presence.visitor_id ??
            "unknown";

          const identity = userId
            ? `user:${userId}`
            : `guest:${visitorId}`;

          const visitor: OnlineVisitor = {
            id: identity,
            userId,
            type:
              presence.type === "registered"
                ? "registered"
                : "guest",
            path:
              presence.path || "/",
            onlineAt:
              presence.online_at || null,
            updatedAt:
              presence.updated_at || null,
          };

          const existing =
            deduplicated.get(identity);

          if (!existing) {
            deduplicated.set(
              identity,
              visitor
            );

            continue;
          }

          const existingTime =
            existing.updatedAt
              ? new Date(
                  existing.updatedAt
                ).getTime()
              : 0;

          const visitorTime =
            visitor.updatedAt
              ? new Date(
                  visitor.updatedAt
                ).getTime()
              : 0;

          if (
            visitorTime > existingTime
          ) {
            deduplicated.set(
              identity,
              visitor
            );
          }
        }
      }

      const list = Array.from(
        deduplicated.values()
      ).sort((a, b) => {
        const aTime = a.updatedAt
          ? new Date(a.updatedAt).getTime()
          : 0;

        const bTime = b.updatedAt
          ? new Date(b.updatedAt).getTime()
          : 0;

        return bTime - aTime;
      });

      setVisitors(list);
    }

    channel
      .on(
        "presence",
        {
          event: "sync",
        },
        updateVisitors
      )
      .on(
        "presence",
        {
          event: "join",
        },
        updateVisitors
      )
      .on(
        "presence",
        {
          event: "leave",
        },
        updateVisitors
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, []);

  const registeredCount = useMemo(
    () =>
      visitors.filter(
        (visitor) =>
          visitor.type === "registered"
      ).length,
    [visitors]
  );

  const guestCount =
    visitors.length -
    registeredCount;

  return (
    <section className="mt-10">
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">
            Live Visitors
          </h2>

          <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          Visitors currently connected to
          LifeSeos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">
            Online Now
          </p>

          <p className="mt-2 text-3xl font-semibold text-white">
            {visitors.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">
            Registered
          </p>

          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {registeredCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">
            Guests
          </p>

          <p className="mt-2 text-3xl font-semibold text-violet-300">
            {guestCount}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 px-6 py-5">
          <h3 className="text-lg font-semibold">
            Visitors Online
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Current visitor type, page and
            session start time.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                  User
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Type
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current Page
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Online Since
                </th>
              </tr>
            </thead>

            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-slate-400"
                  >
                    No visitors online right now.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm text-white">
                      {visitor.userId
                        ? userEmails[
                            visitor.userId
                          ] ??
                          "Registered user"
                        : "Guest"}
                    </td>

                    <td className="px-6 py-4">
                      {visitor.type ===
                      "registered" ? (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                          Registered
                        </span>
                      ) : (
                        <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                          Guest
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      {visitor.path}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {formatDate(
                        visitor.onlineAt
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
