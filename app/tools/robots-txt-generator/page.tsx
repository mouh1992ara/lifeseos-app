"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
} from "react";

import ShareTool from "@/components/share-tool";

export default function RobotsTxtGeneratorPage() {
  const [userAgent, setUserAgent] =
    useState("*");

  const [allowPath, setAllowPath] =
    useState("/");

  const [
    disallowPaths,
    setDisallowPaths,
  ] = useState("");

  const [sitemap, setSitemap] =
    useState("");

  const hasTrackedUse = useRef(false);

  const robotsTxt = useMemo(() => {
    const lines = [
      `User-agent: ${userAgent || "*"}`,
    ];

    if (allowPath.trim()) {
      lines.push(
        `Allow: ${allowPath.trim()}`
      );
    }

    const disallowList =
      disallowPaths
        .split("\n")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    disallowList.forEach(
      (path) => {
        lines.push(
          `Disallow: ${path}`
        );
      }
    );

    if (sitemap.trim()) {
      lines.push("");
      lines.push(
        `Sitemap: ${sitemap.trim()}`
      );
    }

    return lines.join("\n");
  }, [
    userAgent,
    allowPath,
    disallowPaths,
    sitemap,
  ]);

  async function recordToolUseOnce() {
    if (
      hasTrackedUse.current
    ) {
      return;
    }

    hasTrackedUse.current =
      true;

    try {
      const response =
        await fetch(
          "/api/tool-events",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              tool_name:
                "Robots.txt Generator",
            }),
          }
        );

      if (!response.ok) {
        console.error(
          "Failed to record Robots.txt Generator usage."
        );
      }
    } catch (
      trackingError
    ) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  function handleUserAgentChange(
    value: string
  ) {
    setUserAgent(value);
    void recordToolUseOnce();
  }

  function handleAllowPathChange(
    value: string
  ) {
    setAllowPath(value);
    void recordToolUseOnce();
  }

  function handleDisallowPathsChange(
    value: string
  ) {
    setDisallowPaths(value);
    void recordToolUseOnce();
  }

  function handleSitemapChange(
    value: string
  ) {
    setSitemap(value);
    void recordToolUseOnce();
  }

  async function copyRobotsTxt() {
    await navigator.clipboard.writeText(
      robotsTxt
    );

    void recordToolUseOnce();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <span>🤖</span>

            <span>
              LifeSeos Robots.txt Generator
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free Robots.txt Generator

            <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Control Search Engine Crawling
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Create a clean robots.txt file,
            define crawler access rules and
            optionally include your XML sitemap
            URL.
          </p>

        </div>


        {/* TOOL */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Crawler rules
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Configure Your Robots.txt
            </h2>


            <label className="mt-6 block text-sm font-semibold text-slate-200">
              User-agent
            </label>

            <input
              value={userAgent}
              onChange={(e) =>
                handleUserAgentChange(
                  e.target.value
                )
              }
              placeholder="*"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Use * to apply the rule group
              to all compatible crawlers.
            </p>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              Allow path
            </label>

            <input
              value={allowPath}
              onChange={(e) =>
                handleAllowPathChange(
                  e.target.value
                )
              }
              placeholder="/"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Example: / allows crawling from
              the root unless a more specific
              rule restricts a path.
            </p>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              Disallow paths
            </label>

            <textarea
              value={disallowPaths}
              onChange={(e) =>
                handleDisallowPathsChange(
                  e.target.value
                )
              }
              placeholder={
                "/admin/\n/private/\n/search/"
              }
              rows={6}
              className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Enter one path per line.
            </p>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              Sitemap URL
            </label>

            <input
              value={sitemap}
              onChange={(e) =>
                handleSitemapChange(
                  e.target.value
                )
              }
              placeholder="https://example.com/sitemap.xml"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Use the full absolute URL of
              your XML sitemap.
            </p>

          </section>


          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Generated output
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Generated robots.txt
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  copyRobotsTxt
                }
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-cyan-300"
              >
                Copy
              </button>

            </div>


            <div className="mt-5 rounded-2xl border border-white/5 bg-black/30 p-5">

              <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300">
                {robotsTxt}
              </pre>

            </div>


            <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 font-bold text-amber-300">
                  !
                </div>

                <div>

                  <h3 className="font-semibold text-amber-200">
                    Important
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-amber-100/70">
                    Robots.txt controls crawler
                    access. It should not be used
                    to protect confidential or
                    sensitive information.
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>


        <div className="mt-10">

          <ShareTool
            title="Robots.txt Generator"
            description="Create a clean robots.txt file and manage crawler access with this free LifeSeos tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Crawler Management
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Understand How Robots.txt Works
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              A robots.txt file gives supported
              web crawlers instructions about
              which areas of a website they may
              or may not crawl. It is normally
              placed at the root of the website
              so crawlers can discover the rules
              before requesting other URLs.
            </p>

          </div>


          {/* DIRECTIVES */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <DirectiveCard
              directive="User-agent"
              title="Choose the Crawler"
              description="Defines which crawler or group of crawlers the following rules apply to."
              example="User-agent: *"
            />

            <DirectiveCard
              directive="Allow"
              title="Allow a Path"
              description="Allows crawling of a specific path when the rule is applicable to the selected crawler."
              example="Allow: /"
            />

            <DirectiveCard
              directive="Disallow"
              title="Block Crawling"
              description="Requests that compatible crawlers do not crawl a specified path or directory."
              example="Disallow: /private/"
            />

            <DirectiveCard
              directive="Sitemap"
              title="Reference Your Sitemap"
              description="Provides crawlers with the absolute URL of an XML sitemap."
              example="Sitemap: https://example.com/sitemap.xml"
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  How it works
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  How to Use the Robots.txt Generator
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Configure the crawler rules,
                  review the generated text and
                  place the final file in your
                  website root.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Choose a user-agent"
                  description="Use * for a general rule group or enter the crawler token you specifically want to target."
                />

                <StepCard
                  number="2"
                  title="Define allowed and blocked paths"
                  description="Add the paths that crawlers should be permitted or requested not to crawl."
                />

                <StepCard
                  number="3"
                  title="Add your sitemap"
                  description="Optionally include the full URL of your XML sitemap."
                />

                <StepCard
                  number="4"
                  title="Publish robots.txt"
                  description="Copy the generated content and save it as robots.txt at the root of your website."
                />

              </div>

            </div>

          </div>


          {/* IMPORTANT DISTINCTION */}

          <div className="mt-16 rounded-[32px] border border-violet-400/15 bg-violet-400/[0.04] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-8 lg:grid-cols-[auto_1fr]">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-lg font-bold text-violet-300">
                !
              </div>


              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Important SEO distinction
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  Blocking Crawling Is Not the Same as Preventing Indexing
                </h2>

                <p className="mt-4 max-w-4xl leading-8 text-slate-400">
                  A robots.txt rule primarily
                  controls crawling. It should
                  not be treated as a guaranteed
                  method for keeping a URL out
                  of search results. If you need
                  to control indexing, review the
                  appropriate indexing directives
                  and make sure search engines can
                  access the page when those
                  directives need to be read.
                </p>

              </div>

            </div>

          </div>


          {/* BEST PRACTICES */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                Configuration tips
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Robots.txt Best Practices
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Small robots.txt mistakes can
                restrict crawler access to pages
                or resources you intended to keep
                crawlable. Review every rule
                carefully before publishing the
                file.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                After making changes, verify the
                live robots.txt file and check
                that important public pages and
                resources are still accessible
                to the crawlers you want to
                support.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BestPracticeCard
                title="Use precise paths"
                description="Avoid broad Disallow rules unless you are certain the entire path should not be crawled."
              />

              <BestPracticeCard
                title="Check your syntax"
                description="Review user-agent groups and path rules before uploading the file."
              />

              <BestPracticeCard
                title="Include your sitemap"
                description="Add your XML sitemap URL when appropriate so crawlers can discover it easily."
              />

              <BestPracticeCard
                title="Test after changes"
                description="Confirm that important public pages remain crawlable after updating robots.txt."
              />

            </div>

          </div>


          {/* COMMON MISTAKES */}

          <div className="mt-16">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
                Avoid mistakes
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Common Robots.txt Problems
              </h2>

            </div>


            <div className="mt-8 grid gap-4 md:grid-cols-3">

              <MistakeCard
                title="Blocking the whole site"
                description="A broad Disallow rule can prevent crawlers from accessing far more pages than intended."
              />

              <MistakeCard
                title="Blocking important resources"
                description="Restricting CSS, JavaScript or other resources can make it harder for crawlers to render a page properly."
              />

              <MistakeCard
                title="Using robots.txt for security"
                description="Blocked paths remain publicly accessible if someone knows the URL, so sensitive data requires real access control."
              />

            </div>

          </div>


          {/* CONTINUE TECHNICAL SEO WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Continue Your Technical SEO Workflow
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Control crawling, improve discovery and audit your site
              </h2>

              <p className="mt-4 leading-8 text-slate-400">
                Use these tools together to manage crawler access, provide a
                structured list of important URLs and then run a broader SEO audit.
              </p>

            </div>


            <div className="mt-10 grid gap-5 lg:grid-cols-3">

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.055] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-lg text-emerald-300">
                    🤖
                  </div>

                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Step 1 · Current
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  Robots.txt Generator
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Create crawler access rules and reference your sitemap from a
                  correctly structured robots.txt file.
                </p>

                <div className="mt-5 text-sm font-semibold text-emerald-300">
                  Configure crawling ✓
                </div>

              </div>


              <Link
                href="/tools/xml-sitemap-generator"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300">
                    ⌘
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    Step 2
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-cyan-300">
                  XML Sitemap Generator
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Create an XML sitemap that lists important URLs and helps
                  search engines discover your website structure.
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  Create sitemap →
                </div>

              </Link>


              <Link
                href="/tools/seo-analyzer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-lg text-blue-300">
                    ⌕
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    Step 3
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  SEO Analyzer
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Run a broader SEO audit after configuring crawling and
                  discovery to review technical and content signals.
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  Run SEO audit →
                </div>

              </Link>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/http-status-checker"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                HTTP Status Checker →
              </Link>

              <Link
                href="/tools/seo-page-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                SEO Page Analyzer →
              </Link>

              <Link
                href="/tools/page-speed"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                Page Speed Analyzer →
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                View All Tools →
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


function DirectiveCard({
  directive,
  title,
  description,
  example,
}: {
  directive: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">

      <div className="inline-flex rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 font-mono text-xs font-bold text-emerald-300">
        {directive}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 px-3 py-2 font-mono text-xs leading-5 text-slate-400">
        {example}
      </div>

    </div>
  );
}


function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 font-bold text-emerald-300">
        {number}
      </div>

      <div>

        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}


function BestPracticeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        ✓
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

    </div>
  );
}


function MistakeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.03] p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 font-bold text-amber-300">
        !
      </div>

      <h3 className="mt-4 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

    </div>
  );
}


function RelatedToolCard({
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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-emerald-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-emerald-300">
        Open tool →
      </div>

    </Link>
  );
}