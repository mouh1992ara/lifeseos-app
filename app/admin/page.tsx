import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_TIME_ZONE = "Asia/Shanghai";

function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

function getDateKey(date: Date | string) {
  const value =
    typeof date === "string"
      ? new Date(date)
      : date;

  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: ADMIN_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(value);

  const year =
    parts.find((part) => part.type === "year")
      ?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")
      ?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")
      ?.value ?? "";

  return `${year}-${month}-${day}`;
}

function isSameDay(
  dateString: string,
  reference: Date
) {
  return (
    getDateKey(dateString) ===
    getDateKey(reference)
  );
}

type ToolEvent = {
  id: string;
  tool_name: string;
  user_id: string | null;
  created_at: string;
};

type ToolSummary = {
  toolName: string;
  totalUses: number;
  registeredUses: number;
  guestUses: number;
  lastUsedAt: string | null;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const adminUserId = process.env.ADMIN_USER_ID;

  if (!adminUserId || user.id !== adminUserId) {
    redirect("/dashboard");
  }

  const [
    usersResult,
    reportsResult,
    messagesResult,
    toolEventsCountResult,
    toolEventsDataResult,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    supabaseAdmin
      .from("seo_reports")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseAdmin
      .from("contact_messages")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseAdmin
      .from("tool_events")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseAdmin
      .from("tool_events")
      .select(
        `
          id,
          tool_name,
          user_id,
          created_at
        `
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1000),
  ]);

  const users = usersResult.data?.users ?? [];

  const toolEvents =
    (toolEventsDataResult.data as ToolEvent[] | null) ?? [];

  const totalUsers = users.length;
  const totalReports = reportsResult.count ?? 0;
  const totalMessages = messagesResult.count ?? 0;
  const totalToolUses =
    toolEventsCountResult.count ?? 0;

const now = new Date();

const todayKey = getDateKey(now);

const todayCalendarDate = new Date(
  `${todayKey}T00:00:00.000Z`
);

const startOfWeekDate = new Date(
  todayCalendarDate
);

startOfWeekDate.setUTCDate(
  startOfWeekDate.getUTCDate() - 6
);

const startOfWeekKey =
  startOfWeekDate
    .toISOString()
    .slice(0, 10);

const currentMonthKey =
  todayKey.slice(0, 7);

const newUsersToday = users.filter(
  (account) =>
    isSameDay(account.created_at, now)
).length;

const newUsersThisWeek = users.filter(
  (account) => {
    const accountDateKey = getDateKey(
      account.created_at
    );

    return (
      accountDateKey >= startOfWeekKey &&
      accountDateKey <= todayKey
    );
  }
).length;

const newUsersThisMonth = users.filter(
  (account) =>
    getDateKey(account.created_at).startsWith(
      currentMonthKey
    )
).length;

  const confirmedUsers = users.filter(
    (account) =>
      Boolean(account.email_confirmed_at)
  ).length;

  const unconfirmedUsers =
    totalUsers - confirmedUsers;

  const sortedUsers = [...users].sort((a, b) => {
    const aTime = a.last_sign_in_at
      ? new Date(a.last_sign_in_at).getTime()
      : 0;

    const bTime = b.last_sign_in_at
      ? new Date(b.last_sign_in_at).getTime()
      : 0;

    return bTime - aTime;
  });

  const registeredToolUses = toolEvents.filter(
    (event) => Boolean(event.user_id)
  ).length;

  const guestToolUses =
    toolEvents.length - registeredToolUses;

  const userEmailMap = new Map(
    users.map((account) => [
      account.id,
      account.email ?? "Unknown user",
    ])
  );

  const toolSummaryMap = new Map<
    string,
    ToolSummary
  >();

  for (const event of toolEvents) {
    const existing =
      toolSummaryMap.get(event.tool_name);

    if (!existing) {
      toolSummaryMap.set(event.tool_name, {
        toolName: event.tool_name,
        totalUses: 1,
        registeredUses: event.user_id ? 1 : 0,
        guestUses: event.user_id ? 0 : 1,
        lastUsedAt: event.created_at,
      });

      continue;
    }

    existing.totalUses += 1;

    if (event.user_id) {
      existing.registeredUses += 1;
    } else {
      existing.guestUses += 1;
    }

    if (
      !existing.lastUsedAt ||
      new Date(event.created_at).getTime() >
        new Date(existing.lastUsedAt).getTime()
    ) {
      existing.lastUsedAt =
        event.created_at;
    }
  }

  const toolSummaries = Array.from(
    toolSummaryMap.values()
  ).sort(
    (a, b) =>
      b.totalUses - a.totalUses
  );

  const recentToolEvents =
    toolEvents.slice(0, 20);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-emerald-400">
            LifeSeos Admin
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-slate-400">
            Manage users, reports, tool activity and website data.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Total Users
            </p>

            <p className="mt-3 text-3xl font-bold">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              SEO Reports
            </p>

            <p className="mt-3 text-3xl font-bold">
              {totalReports}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Tool Uses
            </p>

            <p className="mt-3 text-3xl font-bold">
              {totalToolUses}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Messages
            </p>

            <p className="mt-3 text-3xl font-bold">
              {totalMessages}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">
              New Today
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {newUsersToday}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">
              Last 7 Days
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {newUsersThisWeek}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">
              This Month
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {newUsersThisMonth}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">
              Confirmed
            </p>

            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {confirmedUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">
              Unconfirmed
            </p>

            <p className="mt-2 text-2xl font-semibold text-amber-300">
              {unconfirmedUsers}
            </p>
          </div>
        </div>

        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Users
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Registered LifeSeos users, ordered by latest sign-in.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Created
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Last Sign In
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email Status
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                    User ID
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-slate-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-white/5 last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm text-white">
                        {account.email ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(
                          account.created_at
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(
                          account.last_sign_in_at
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {account.email_confirmed_at ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                            Confirmed
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                            Unconfirmed
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {account.id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">
              Tool Activity
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Usage activity across LifeSeos tools.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">
                Total Tool Uses
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {totalToolUses}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">
                Registered Users
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {registeredToolUses}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">
                Guest Uses
              </p>

              <p className="mt-2 text-2xl font-semibold text-violet-300">
                {guestToolUses}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 px-6 py-5">
              <h3 className="text-lg font-semibold">
                Tool Performance
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Usage totals by tool.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Tool
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Total Uses
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Registered
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Guests
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Last Used
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {toolSummaries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-slate-400"
                      >
                        No tool activity yet.
                      </td>
                    </tr>
                  ) : (
                    toolSummaries.map((tool) => (
                      <tr
                        key={tool.toolName}
                        className="border-b border-white/5 last:border-b-0"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {tool.toolName}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {tool.totalUses}
                        </td>

                        <td className="px-6 py-4 text-sm text-emerald-300">
                          {tool.registeredUses}
                        </td>

                        <td className="px-6 py-4 text-sm text-violet-300">
                          {tool.guestUses}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatDate(
                            tool.lastUsedAt
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 px-6 py-5">
              <h3 className="text-lg font-semibold">
                Recent Tool Activity
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Latest tool usage events.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Tool
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      User
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Type
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentToolEvents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-sm text-slate-400"
                      >
                        No recent tool activity.
                      </td>
                    </tr>
                  ) : (
                    recentToolEvents.map(
                      (event) => (
                        <tr
                          key={event.id}
                          className="border-b border-white/5 last:border-b-0"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-white">
                            {event.tool_name}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-300">
                            {event.user_id
                              ? userEmailMap.get(
                                  event.user_id
                                ) ??
                                event.user_id
                              : "Guest"}
                          </td>

                          <td className="px-6 py-4">
                            {event.user_id ? (
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                Registered
                              </span>
                            ) : (
                              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                                Guest
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-300">
                            {formatDate(
                              event.created_at
                            )}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}