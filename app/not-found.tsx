import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-300">
          <span>404</span>
          <span>Page not found</span>
        </div>

        <h1 className="mt-8 text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl">
          Lost in the
          <span className="mt-2 block bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            search results?
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          The page you&apos;re looking for doesn&apos;t exist, may have moved,
          or the URL may be incorrect.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5"
          >
            Back Home
          </Link>

          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Explore Tools
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>

        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">

          <QuickLink
            href="/tools/seo-analyzer"
            icon="🔍"
            title="SEO Analyzer"
            description="Run a website SEO audit."
          />

          <QuickLink
            href="/about"
            icon="✦"
            title="About"
            description="Learn more about LifeSeos."
          />

          <QuickLink
            href="/contact"
            icon="✉"
            title="Contact"
            description="Get help or send feedback."
          />

        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-5 text-sm text-slate-600">

          <Link href="/privacy" className="transition hover:text-slate-300">
            Privacy
          </Link>

          <Link href="/terms" className="transition hover:text-slate-300">
            Terms
          </Link>

          <Link href="/contact" className="transition hover:text-slate-300">
            Contact
          </Link>

        </div>

      </div>

    </main>
  );
}


function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.05]"
    >
      <div className="text-2xl">
        {icon}
      </div>

      <h2 className="mt-4 font-semibold text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}
