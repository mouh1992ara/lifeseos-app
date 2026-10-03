import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Welcome to LifeSeos
        </h1>

        <p className="mt-4 text-slate-400">
          Signed in as {user.email}
        </p>


        <div className="mt-10 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Plan
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Free
            </h2>
          </div>


          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Available tools
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              6
            </h2>
          </div>


          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Usage
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Unlimited Free Tools
            </h2>
          </div>

        </div>


        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">

          <h2 className="text-xl font-semibold">
            Account information
          </h2>

          <p className="mt-4 text-slate-400">
            Email
          </p>

          <p className="mt-1 text-emerald-400">
            {user.email}
          </p>

        </div>

      </div>
    </main>
  );
}