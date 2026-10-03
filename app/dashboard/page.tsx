import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SEOReport = {
  id: string;
  url: string;
  score: number;
  grade: string | null;
  status: string | null;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: reports, error } = await supabase
    .from("seo_reports")
    .select(
      "id, url, score, grade, status, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const seoReports: SEOReport[] =
    reports ?? [];

  const totalAudits =
    seoReports.length;

  const averageScore =
    totalAudits > 0
      ? Math.round(
          seoReports.reduce(
            (total, report) =>
              total + Number(report.score ?? 0),
            0
          ) / totalAudits
        )
      : 0;

  const bestScore =
    totalAudits > 0
      ? Math.max(
          ...seoReports.map(
            (report) =>
              Number(report.score ?? 0)
          )
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <span>◉</span>
              <span>LifeSeos Dashboard</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome back
            </h1>

            <p className="mt-3 text-slate-400">
              Signed in as{" "}
              <span className="text-slate-200">
                {user.email}
              </span>
            </p>
          </div>

          <Link
            href="/tools/seo-analyzer"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5"
          >
            New SEO Analysis
          </Link>
        </div>


        <section className="mt-10 grid gap-5 md:grid-cols-3">

          <DashboardStatCard
            label="Total Audits"
            value={String(totalAudits)}
            description="SEO reports saved to your account"
          />

          <DashboardStatCard
            label="Average Score"
            value={`${averageScore}/100`}
            description="Average score across your audits"
          />

          <DashboardStatCard
            label="Best Score"
            value={`${bestScore}/100`}
            description="Highest SEO score recorded"
          />

        </section>


        {error && (
          <div className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-300">
            Unable to load your SEO reports.
          </div>
        )}


        <section className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80">

          <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                SEO History
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Recent Reports
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
              {totalAudits} reports
            </div>
          </div>


          {seoReports.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-2xl text-violet-300">
                ⌕
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No SEO reports yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Run your first SEO analysis and the
                report will automatically appear here.
              </p>

              <Link
                href="/tools/seo-analyzer"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Analyze Website
              </Link>

            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">

                <thead>
                  <tr className="border-b border-white/10 bg-black/10 text-left text-xs uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-4 font-medium">
                      Website
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Score
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Grade
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>

                  </tr>
                </thead>


                <tbody>
                  {seoReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.03]"
                    >

                      <td className="px-6 py-5">
                        <div className="max-w-xs truncate font-medium text-slate-200">
                          {report.url}
                        </div>
                      </td>


                      <td className="px-6 py-5">
                        <ScoreBadge
                          score={report.score}
                        />
                      </td>


                      <td className="px-6 py-5">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold text-slate-200">
                          {report.grade ?? "-"}
                        </span>
                      </td>


                      <td className="px-6 py-5">
                        <StatusBadge
                          score={report.score}
                          status={
                            report.status ??
                            "Unknown"
                          }
                        />
                      </td>


                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(
                          report.created_at
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </section>


        <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Account
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Account Information
          </h2>

          <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 px-5 py-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Email
            </p>

            <p className="mt-2 break-all font-medium text-emerald-300">
              {user.email}
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}


function DashboardStatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


function ScoreBadge({
  score,
}: {
  score: number;
}) {
  const safeScore =
    Number(score ?? 0);

  const className =
    safeScore >= 80
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : safeScore >= 60
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-rose-400/20 bg-rose-400/10 text-rose-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${className}`}
    >
      {safeScore}/100
    </span>
  );
}


function StatusBadge({
  score,
  status,
}: {
  score: number;
  status: string;
}) {
  const className =
    score >= 80
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : score >= 60
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-rose-400/20 bg-rose-400/10 text-rose-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}


function formatDate(
  dateString: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(
    new Date(dateString)
  );
}