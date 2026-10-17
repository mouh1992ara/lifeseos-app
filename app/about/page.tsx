import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About LifeSeos - Free SEO Tools",

  description:
    "Learn about LifeSeos, our mission, and the SEO tools and educational resources we build to make website analysis, technical SEO and content optimization simpler.",

  alternates: {
    canonical: "/about",
  },

  openGraph: {
    title: "About LifeSeos",
    description:
      "Learn about LifeSeos and our mission to make SEO analysis, technical optimization and content improvement simpler and more accessible.",
    url: "/about",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/about.png",
        width: 1200,
        height: 630,
        alt: "About LifeSeos",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "About LifeSeos",
    description:
      "Learn about LifeSeos and our mission to make SEO analysis and website optimization simpler and more accessible.",
    images: ["/social/about.png"],
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About LifeSeos",
  url: "https://www.lifeseos.com/about",
  description:
    "Learn about LifeSeos and our mission to make SEO analysis, technical optimization and content improvement simpler and more accessible.",
  mainEntity: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd),
        }}
      />

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
              LifeSeos provides practical SEO tools and educational resources
              designed to help creators, developers, marketers, and website
              owners understand their websites and identify opportunities for
              improvement.
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
                metadata, content structure, performance, and search engine
                requirements are spread across many different tools and
                resources.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                LifeSeos aims to bring useful SEO checks into one simple
                workspace, with clear results, practical recommendations, and
                tools that are easy to use.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                We also publish educational SEO guides that explain the ideas
                behind the tools so users can understand why an issue matters
                instead of relying only on an automated score.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10 p-7 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                What We Focus On
              </p>

              <div className="mt-6 space-y-4">
                <FeatureItem
                  title="Simple analysis"
                  description="Turn technical SEO signals into clearer results that are easier to review."
                />

                <FeatureItem
                  title="Useful recommendations"
                  description="Highlight potential issues and provide practical next steps for further evaluation."
                />

                <FeatureItem
                  title="Practical tools"
                  description="Help users complete common SEO tasks without unnecessary complexity."
                />

                <FeatureItem
                  title="Educational guidance"
                  description="Explain SEO concepts so users can make informed optimization decisions."
                />

                <FeatureItem
                  title="Account-based history"
                  description="Allow signed-in users to save supported SEO reports and review them later."
                />
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="mt-16">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                How LifeSeos Works
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Tools support decisions — they do not replace them
              </h2>

              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
                LifeSeos combines automated checks with explanatory guidance.
                The tools can identify patterns, technical signals, metadata,
                content characteristics, and other SEO-related information,
                but automated results should always be reviewed in context.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <ValueCard
                title="1. Analyze"
                description="Use a LifeSeos tool to inspect a webpage, text, metadata, performance signal, or other supported SEO element."
              />

              <ValueCard
                title="2. Understand"
                description="Review the results together with explanations, recommendations, and related educational guides."
              />

              <ValueCard
                title="3. Improve"
                description="Decide which changes are appropriate for your website, then test and monitor the results."
              />
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
                LifeSeos combines practical SEO utilities in one place so you
                can analyze, generate, check, measure, and improve important
                website signals.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <ToolCard
                href="/tools/seo-analyzer"
                icon="🔍"
                title="SEO Analyzer"
                description="Analyze important technical, content, image, and social SEO signals."
              />

              <ToolCard
                href="/tools/seo-page-analyzer"
                icon="📄"
                title="SEO Page Analyzer"
                description="Review titles, descriptions, headings, links, canonical tags and image SEO."
              />

              <ToolCard
                href="/tools/meta-tag-generator"
                icon="✨"
                title="Meta Tag Generator"
                description="Create title and description ideas for your pages."
              />

              <ToolCard
                href="/tools/robots-txt-generator"
                icon="🤖"
                title="Robots.txt Generator"
                description="Generate crawler instructions for search engines."
              />

              <ToolCard
                href="/tools/xml-sitemap-generator"
                icon="🌐"
                title="XML Sitemap Generator"
                description="Create sitemap structures that help search engines discover pages."
              />

              <ToolCard
                href="/tools/keyword-density-checker"
                icon="📊"
                title="Keyword Density Checker"
                description="Review keyword frequency, density and content balance."
              />

              <ToolCard
                href="/tools/http-status-checker"
                icon="⚡"
                title="HTTP Status Checker"
                description="Check redirects, errors and HTTP response information."
              />

              <ToolCard
                href="/tools/page-speed"
                icon="🚀"
                title="Page Speed Analyzer"
                description="Review loading performance and important performance metrics."
              />

              <ToolCard
                href="/tools/content-analyzer"
                icon="📝"
                title="Content Analyzer"
                description="Analyze readability, content length, keywords and SEO-related content signals."
              />
            </div>

            <div className="mt-7 text-center">
              <Link
                href="/tools"
                className="inline-flex font-semibold text-emerald-300 transition hover:text-emerald-200"
              >
                View all LifeSeos tools →
              </Link>
            </div>
          </section>

          {/* CONTENT */}
          <section className="mt-16 rounded-[32px] border border-white/10 bg-slate-900/80 p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                  SEO Learning
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Practical guides alongside the tools
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                  Our SEO guides cover topics such as technical SEO, on-page
                  optimization, metadata, page speed, HTTP status codes,
                  robots.txt, XML sitemaps, keyword usage, and content
                  analysis.
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                  The goal is to provide useful context so users can understand
                  what a tool is measuring and make their own informed
                  decisions.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/10 p-6 sm:p-7">
                <h3 className="text-xl font-semibold">
                  Our content principles
                </h3>

                <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
                  <SimpleListItem>
                    Explain SEO concepts in clear and practical language.
                  </SimpleListItem>

                  <SimpleListItem>
                    Avoid presenting arbitrary SEO scores as guarantees.
                  </SimpleListItem>

                  <SimpleListItem>
                    Distinguish automated checks from editorial judgment.
                  </SimpleListItem>

                  <SimpleListItem>
                    Update important guidance when tools, practices, or
                    standards change.
                  </SimpleListItem>

                  <SimpleListItem>
                    Focus on information that helps users make better website
                    decisions.
                  </SimpleListItem>
                </ul>

                <Link
                  href="/blog"
                  className="mt-6 inline-flex font-semibold text-blue-300 transition hover:text-blue-200"
                >
                  Explore SEO guides →
                </Link>
              </div>
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
                  Clear, practical, and user-focused
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                  LifeSeos is built around a simple idea: useful SEO tools
                  should be understandable, practical, and straightforward to
                  use.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ValueCard
                  title="Clarity"
                  description="Present results and explanations in a way that is easier to understand."
                />

                <ValueCard
                  title="Practicality"
                  description="Focus on checks and recommendations that can support real website improvements."
                />

                <ValueCard
                  title="Transparency"
                  description="Treat automated results as indicators rather than promises of search performance."
                />

                <ValueCard
                  title="Privacy"
                  description="Handle account, report and website usage information responsibly."
                />
              </div>
            </div>
          </section>

          {/* IMPORTANT NOTE */}
          <section className="mt-16 rounded-[30px] border border-amber-400/15 bg-amber-400/[0.04] p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              Important
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              SEO results can vary
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              LifeSeos tools and guides provide informational analysis and
              recommendations. Search engine rankings depend on many factors,
              and no SEO tool can guarantee a specific ranking, traffic level,
              indexing outcome, or search performance result.
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Users should review recommendations in the context of their own
              website, audience, technical environment, and business goals.
            </p>
          </section>

          {/* CTA */}
          <section className="mt-16 rounded-[30px] border border-white/10 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 p-8 text-center sm:p-10">
            <p className="text-sm font-semibold text-violet-300">
              Ready to review your website?
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Start with a free SEO analysis
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Run an SEO audit, review your website signals, and identify
              areas that may need further attention.
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

            <Link href="/blog" className="transition hover:text-white">
              Blog
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
    </>
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
          <h3 className="font-semibold text-white">{title}</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function ToolCard({
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
      className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.06]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold transition group-hover:text-emerald-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
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
      <h3 className="font-semibold text-slate-200">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SimpleListItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-400/10 text-[10px] font-bold text-blue-300">
        ✓
      </span>

      <span>{children}</span>
    </li>
  );
}