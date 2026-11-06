import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import LiveVisitors from "@/components/admin/live-visitors";
import { requireVerifiedUser } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_TIME_ZONE = "Asia/Shanghai";

// Dates are rendered in the active locale, but grouped in the admin time zone.
function formatDate(locale: string, date?: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat(locale, {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

// Fixed en-CA parts keep the YYYY-MM-DD key sortable; this value is never shown.
function getDateKey(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const year = parts.find((part) => part.type === "year")?.value ?? "";

  const month = parts.find((part) => part.type === "month")?.value ?? "";

  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function isSameDay(dateString: string, reference: Date) {
  return getDateKey(dateString) === getDateKey(reference);
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

type PageVisit = {
  id: number;
  country_code: string | null;
  country_name: string | null;
  path: string | null;
  created_at: string;
};

type CountrySummary = {
  countryCode: string;
  countryName: string;
  visits: number;
  lastVisitAt: string | null;
};

function countryCodeToFlag(countryCode: string) {
  const code = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code) || code === "XX") {
    return "🌐";
  }

  return String.fromCodePoint(
    ...code
      .split("")
      .map((character) => 127397 + character.charCodeAt(0)),
  );
}

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin");

  const user = await requireVerifiedUser("/admin");

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
    pageVisitsCountResult,
    pageVisitsDataResult,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    supabaseAdmin.from("seo_reports").select("*", {
      count: "exact",
      head: true,
    }),

    supabaseAdmin.from("contact_messages").select("*", {
      count: "exact",
      head: true,
    }),

    supabaseAdmin.from("tool_events").select("*", {
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
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1000),

    supabaseAdmin.from("page_visits").select("*", {
      count: "exact",
      head: true,
    }),

    supabaseAdmin
      .from("page_visits")
      .select(
        `
          id,
          country_code,
          country_name,
          path,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(10000),
  ]);

  const users = usersResult.data?.users ?? [];

  const toolEvents = (toolEventsDataResult.data as ToolEvent[] | null) ?? [];

  const pageVisits = (pageVisitsDataResult.data as PageVisit[] | null) ?? [];

  const totalUsers = users.length;

  const totalReports = reportsResult.count ?? 0;

  const totalMessages = messagesResult.count ?? 0;

  const totalToolUses = toolEventsCountResult.count ?? 0;

  const totalPageVisits = pageVisitsCountResult.count ?? 0;

  const now = new Date();

  const todayKey = getDateKey(now);

  const todayCalendarDate = new Date(`${todayKey}T00:00:00.000Z`);

  const startOfWeekDate = new Date(todayCalendarDate);

  startOfWeekDate.setUTCDate(startOfWeekDate.getUTCDate() - 6);

  const startOfWeekKey = startOfWeekDate.toISOString().slice(0, 10);

  const currentMonthKey = todayKey.slice(0, 7);

  const newUsersToday = users.filter((account) =>
    isSameDay(account.created_at, now),
  ).length;

  const newUsersThisWeek = users.filter((account) => {
    const accountDateKey = getDateKey(account.created_at);

    return accountDateKey >= startOfWeekKey && accountDateKey <= todayKey;
  }).length;

  const newUsersThisMonth = users.filter((account) =>
    getDateKey(account.created_at).startsWith(currentMonthKey),
  ).length;

  const confirmedUsers = users.filter((account) =>
    Boolean(account.email_confirmed_at),
  ).length;

  const unconfirmedUsers = totalUsers - confirmedUsers;

  const sortedUsers = [...users].sort((a, b) => {
    const aTime = a.last_sign_in_at
      ? new Date(a.last_sign_in_at).getTime()
      : 0;

    const bTime = b.last_sign_in_at
      ? new Date(b.last_sign_in_at).getTime()
      : 0;

    return bTime - aTime;
  });

  const registeredToolUses = toolEvents.filter((event) =>
    Boolean(event.user_id),
  ).length;

  const guestToolUses = toolEvents.length - registeredToolUses;

  const userEmailMap = new Map(
    users.map((account) => [
      account.id,
      account.email ?? t("tools.unknownUser"),
    ]),
  );

  const liveUserEmails = Object.fromEntries(userEmailMap);

  const toolSummaryMap = new Map<string, ToolSummary>();

  for (const event of toolEvents) {
    const existing = toolSummaryMap.get(event.tool_name);

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
      existing.lastUsedAt = event.created_at;
    }
  }

  const toolSummaries = Array.from(toolSummaryMap.values()).sort(
    (a, b) => b.totalUses - a.totalUses,
  );

  const recentToolEvents = toolEvents.slice(0, 20);

  const visitsToday = pageVisits.filter((visit) =>
    isSameDay(visit.created_at, now),
  ).length;

  const unknownLocationVisits = pageVisits.filter((visit) => {
    const code = visit.country_code?.trim().toUpperCase();

    return (
      !code ||
      code === "XX" ||
      !visit.country_name ||
      visit.country_name === "Unknown"
    );
  }).length;

  const countrySummaryMap = new Map<string, CountrySummary>();

  for (const visit of pageVisits) {
    const countryCode = visit.country_code?.trim().toUpperCase() || "XX";

    const countryName =
      visit.country_name?.trim() ||
      (countryCode === "XX" ? t("geo.unknownCountry") : countryCode);

    const key = `${countryCode}:${countryName}`;

    const existing = countrySummaryMap.get(key);

    if (!existing) {
      countrySummaryMap.set(key, {
        countryCode,
        countryName,
        visits: 1,
        lastVisitAt: visit.created_at,
      });

      continue;
    }

    existing.visits += 1;

    if (
      !existing.lastVisitAt ||
      new Date(visit.created_at).getTime() >
        new Date(existing.lastVisitAt).getTime()
    ) {
      existing.lastVisitAt = visit.created_at;
    }
  }

  const countrySummaries = Array.from(countrySummaryMap.values()).sort(
    (a, b) => b.visits - a.visits,
  );

  const knownCountries = countrySummaries.filter(
    (country) => country.countryCode !== "XX",
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-emerald-400">
            {t("eyebrow")}
          </p>

          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>

          <p className="mt-3 text-slate-400">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">{t("stats.totalUsers")}</p>

            <p className="mt-3 text-3xl font-bold" data-ltr-text>
              {totalUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">{t("stats.seoReports")}</p>

            <p className="mt-3 text-3xl font-bold" data-ltr-text>
              {totalReports}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">{t("stats.toolUses")}</p>

            <p className="mt-3 text-3xl font-bold" data-ltr-text>
              {totalToolUses}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">{t("stats.messages")}</p>

            <p className="mt-3 text-3xl font-bold" data-ltr-text>
              {totalMessages}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">{t("users.newToday")}</p>

            <p className="mt-2 text-2xl font-semibold" data-ltr-text>
              {newUsersToday}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">{t("users.last7Days")}</p>

            <p className="mt-2 text-2xl font-semibold" data-ltr-text>
              {newUsersThisWeek}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">{t("users.thisMonth")}</p>

            <p className="mt-2 text-2xl font-semibold" data-ltr-text>
              {newUsersThisMonth}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">{t("users.confirmed")}</p>

            <p className="mt-2 text-2xl font-semibold text-emerald-300" data-ltr-text>
              {confirmedUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">{t("users.unconfirmed")}</p>

            <p className="mt-2 text-2xl font-semibold text-amber-300" data-ltr-text>
              {unconfirmedUsers}
            </p>
          </div>
        </div>

        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold">{t("users.title")}</h2>

            <p className="mt-1 text-sm text-slate-400">{t("users.subtitle")}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-start">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("table.email")}
                  </th>

                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("table.created")}
                  </th>

                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("table.lastSignIn")}
                  </th>

                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("table.emailStatus")}
                  </th>

                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("table.userId")}
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
                      {t("table.noUsers")}
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-white/5 last:border-b-0"
                    >
                      <td
                        className="px-6 py-4 text-sm text-white"
                        data-ltr-text
                      >
                        {account.email ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(locale, account.created_at)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(locale, account.last_sign_in_at)}
                      </td>

                      <td className="px-6 py-4">
                        {account.email_confirmed_at ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                            {t("users.confirmed")}
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                            {t("users.unconfirmed")}
                          </span>
                        )}
                      </td>

                      <td
                        className="px-6 py-4 font-mono text-xs text-slate-400"
                        data-ltr-text
                      >
                        {account.id}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <LiveVisitors userEmails={liveUserEmails} />

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">{t("geo.title")}</h2>

            <p className="mt-1 text-sm text-slate-400">{t("geo.subtitle")}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">{t("geo.totalVisits")}</p>

              <p className="mt-2 text-2xl font-semibold" data-ltr-text>
                {totalPageVisits}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">{t("geo.countries")}</p>

              <p className="mt-2 text-2xl font-semibold text-cyan-300" data-ltr-text>
                {knownCountries}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">{t("geo.visitsToday")}</p>

              <p className="mt-2 text-2xl font-semibold text-emerald-300" data-ltr-text>
                {visitsToday}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">{t("geo.unknownLocation")}</p>

              <p className="mt-2 text-2xl font-semibold text-amber-300" data-ltr-text>
                {unknownLocationVisits}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 px-6 py-5">
              <h3 className="text-lg font-semibold">{t("geo.topCountries")}</h3>

              <p className="mt-1 text-sm text-slate-400">
                {t("geo.topCountriesBody")}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-start">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("geo.table.country")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("geo.table.code")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("geo.table.visits")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("geo.table.share")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("geo.table.lastVisit")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {countrySummaries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-slate-400"
                      >
                        {t("geo.noData")}
                      </td>
                    </tr>
                  ) : (
                    countrySummaries.map((country) => {
                      const share =
                        pageVisits.length > 0
                          ? (
                              (country.visits / pageVisits.length) *
                              100
                            ).toFixed(1)
                          : "0.0";

                      return (
                        <tr
                          key={`${country.countryCode}-${country.countryName}`}
                          className="border-b border-white/5 last:border-b-0"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl" aria-hidden="true">
                                {countryCodeToFlag(country.countryCode)}
                              </span>

                              <span
                                className="text-sm font-medium text-white"
                                data-ltr-text
                              >
                                {country.countryName}
                              </span>
                            </div>
                          </td>

                          <td
                            className="px-6 py-4 font-mono text-xs text-slate-400"
                            data-ltr-text
                          >
                            {country.countryCode}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-300" data-ltr-text>
                            {country.visits}
                          </td>

                          <td className="px-6 py-4 text-sm text-cyan-300" data-ltr-text>
                            {share}%
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-300">
                            {formatDate(locale, country.lastVisitAt)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">{t("tools.title")}</h2>

            <p className="mt-1 text-sm text-slate-400">{t("tools.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">{t("tools.totalUses")}</p>

              <p className="mt-2 text-2xl font-semibold" data-ltr-text>
                {totalToolUses}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">
                {t("tools.registeredUsers")}
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-300" data-ltr-text>
                {registeredToolUses}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">{t("tools.guestUses")}</p>

              <p className="mt-2 text-2xl font-semibold text-violet-300" data-ltr-text>
                {guestToolUses}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 px-6 py-5">
              <h3 className="text-lg font-semibold">{t("tools.performance")}</h3>

              <p className="mt-1 text-sm text-slate-400">
                {t("tools.performanceBody")}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-start">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.table.tool")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.table.totalUses")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.table.registered")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.table.guests")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.table.lastUsed")}
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
                        {t("tools.noActivity")}
                      </td>
                    </tr>
                  ) : (
                    toolSummaries.map((tool) => (
                      <tr
                        key={tool.toolName}
                        className="border-b border-white/5 last:border-b-0"
                      >
                        <td
                          className="px-6 py-4 text-sm font-medium text-white"
                          data-ltr-text
                        >
                          {tool.toolName}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300" data-ltr-text>
                          {tool.totalUses}
                        </td>

                        <td className="px-6 py-4 text-sm text-emerald-300" data-ltr-text>
                          {tool.registeredUses}
                        </td>

                        <td className="px-6 py-4 text-sm text-violet-300" data-ltr-text>
                          {tool.guestUses}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatDate(locale, tool.lastUsedAt)}
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
              <h3 className="text-lg font-semibold">{t("tools.recentTitle")}</h3>

              <p className="mt-1 text-sm text-slate-400">
                {t("tools.recentSubtitle")}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-start">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.recentTable.tool")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.recentTable.user")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.recentTable.type")}
                    </th>

                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wide text-slate-400">
                      {t("tools.recentTable.date")}
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
                        {t("tools.noRecent")}
                      </td>
                    </tr>
                  ) : (
                    recentToolEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-white/5 last:border-b-0"
                      >
                        <td
                          className="px-6 py-4 text-sm font-medium text-white"
                          data-ltr-text
                        >
                          {event.tool_name}
                        </td>

                        <td
                          className="px-6 py-4 text-sm text-slate-300"
                          data-ltr-text={event.user_id ? "" : undefined}
                        >
                          {event.user_id
                            ? userEmailMap.get(event.user_id) ?? event.user_id
                            : t("tools.guest")}
                        </td>

                        <td className="px-6 py-4">
                          {event.user_id ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                              {t("tools.registered")}
                            </span>
                          ) : (
                            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                              {t("tools.guest")}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatDate(locale, event.created_at)}
                        </td>
                      </tr>
                    ))
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
