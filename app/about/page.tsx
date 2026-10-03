import Link from "next/link";

export const metadata = {
  title: "About | LifeSeos",
  description:
    "Learn more about LifeSeos and our mission to make SEO analysis simpler, faster, and more accessible.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">

        {/* HERO */}

        <section className="text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-300">
            <span>✦</span>
            <span>About LifeSeos</span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            SEO tools built to make
            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              optimization simpler
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
            LifeSeos is a collection of practical SEO tools designed to help
            creators, developers, marketers, and website owners understand
            their websites and identify opportunities for improvement.
          </p>

        </section>


        {/* MISSION */}

        <section className="mt-16 grid gap-6 lg:grid-cols-2">

          <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-7 sm:p-8">

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Our Mission
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Make SEO easier to understand
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
              SEO can feel complicated, especially when technical issues,
              metadata, content structure, and search engine requirements are
              spread across many different tools.
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              LifeSeos aims to bring useful SEO checks into one simple
              workspace, with clear results, practical recommendations, and
              tools that are easy to use.
            </p>

          </div>


          <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10 p-7 sm:p-8">

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
              What We Focus On
            </p>

            <div className="mt-6 space-y-4">

              <FeatureItem
                title="Simple analysis"
                description="Turn technical SEO signals into clear scores and understandable results."
              />

              <FeatureItem
                title="Useful recommendations"
                description="Highlight important issues and provide practical next steps."
              />

              <FeatureItem
                title="Fast tools"
                description="Help users complete common SEO tasks without unnecessary complexity."
              />

              <FeatureItem
                title="Account-based history"
                description="Allow signed-in users to save SEO reports and review them later."
              />

            </div>

          </div>

        </section>


        {/* TOOLS */}

        <section className="mt-16">

          <div className="text-center">

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              LifeSeos Toolkit
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Tools designed for everyday SEO work
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              LifeSeos combines several SEO utilities in one place so you can
              analyze, generate, check, and improve important website signals.
            </p>

          </div>


          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <ToolCard
              icon="🔍"
              title="SEO Analyzer"
              description="Analyze important technical, content, image, and social SEO signals."
            />

            <ToolCard
              icon="✨"
              title="Meta Tag Generator"
              description="Create optimized title and description ideas for your pages."
            />

            <ToolCard
              icon="🤖"
              title="Robots.txt Generator"
              description="Generate crawler instructions for search engines."
            />

            <ToolCard
              icon="📊"
              title="Keyword Density Checker"
              description="Review keyword usage and improve content balance."
            />

            <ToolCard
              icon="⚡"
              title="HTTP Status Checker"
              description="Check redirects, errors, and HTTP response information."
            />

            <ToolCard
              icon="🌐"
              title="XML Sitemap Generator"
              description="Create sitemap structures that help search engines discover pages."
            />

          </div>

        </section>


        {/* VALUES */}

        <section className="mt-16 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-10">

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Our Approach
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Clear, practical, and user-friendly
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                LifeSeos is built around a simple idea: useful SEO tools
                should be easy to understand and quick to use.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <ValueCard
                title="Clarity"
                description="Present results in a way that is easy to understand."
              />

              <ValueCard
                title="Practicality"
                description="Focus on useful checks and actionable improvements."
              />

              <ValueCard
                title="Accessibility"
                description="Keep core SEO tools simple and approachable."
              />

              <ValueCard
                title="Privacy"
                description="Handle account and saved report data responsibly."
              />

            </div>

          </div>

        </section>


        {/* CTA */}

        <section className="mt-16 rounded-[30px] border border-white/10 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 p-8 text-center sm:p-10">

          <p className="text-sm font-semibold text-violet-300">
            Ready to improve your website?
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Start with a free SEO analysis
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Run an SEO audit, review your website signals, and discover areas
            that may need improvement.
          </p>


          <div className="mt-7 flex flex-wrap justify-center gap-4">

            <Link
              href="/tools/seo-analyzer"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Analyze Website
            </Link>

            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Explore Tools
            </Link>

          </div>

        </section>


        {/* NAVIGATION */}

        <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-slate-500">

          <Link href="/" className="transition hover:text-white">
            Home
          </Link>

          <Link href="/tools" className="transition hover:text-white">
            Tools
          </Link>

          <Link href="/contact" className="transition hover:text-white">
            Contact
          </Link>

          <Link href="/privacy" className="transition hover:text-white">
            Privacy
          </Link>

          <Link href="/terms" className="transition hover:text-white">
            Terms
          </Link>

        </div>

      </div>
    </main>
  );
}


function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

      <div className="flex items-start gap-3">

        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-xs font-bold text-emerald-300">
          ✓
        </div>

        <div>

          <h3 className="font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


function ToolCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">

      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

      <h3 className="font-semibold text-slate-200">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}
