"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import ShareTool from "@/components/share-tool";

export default function MetaTagGeneratorPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const hasTrackedUse = useRef(false);

  const titleLength = title.length;
  const descriptionLength = description.length;

  async function recordToolUseOnce() {
    if (hasTrackedUse.current) {
      return;
    }

    hasTrackedUse.current = true;

    try {
      const response = await fetch(
        "/api/tool-events",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tool_name:
              "Meta Tag Generator",
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to record Meta Tag Generator usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  function handleTitleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setTitle(event.target.value);

    if (event.target.value.trim()) {
      void recordToolUseOnce();
    }
  }

  function handleDescriptionChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setDescription(event.target.value);

    if (event.target.value.trim()) {
      void recordToolUseOnce();
    }
  }

  function getTitleStatus() {
    if (titleLength === 0) {
      return {
        text: "Start typing",
        className: "text-slate-500",
      };
    }

    if (
      titleLength >= 50 &&
      titleLength <= 60
    ) {
      return {
        text: "Good length",
        className: "text-emerald-300",
      };
    }

    if (titleLength < 50) {
      return {
        text: "May be too short",
        className: "text-amber-300",
      };
    }

    return {
      text: "May be too long",
      className: "text-amber-300",
    };
  }

  function getDescriptionStatus() {
    if (descriptionLength === 0) {
      return {
        text: "Start typing",
        className: "text-slate-500",
      };
    }

    if (
      descriptionLength >= 140 &&
      descriptionLength <= 160
    ) {
      return {
        text: "Good length",
        className: "text-emerald-300",
      };
    }

    if (descriptionLength < 140) {
      return {
        text: "May be too short",
        className: "text-amber-300",
      };
    }

    return {
      text: "May be too long",
      className: "text-amber-300",
    };
  }

  const titleStatus = getTitleStatus();
  const descriptionStatus =
    getDescriptionStatus();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-medium text-fuchsia-300">
            <span>&lt;/&gt;</span>

            <span>
              LifeSeos Meta Tag Generator
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free Meta Tag Generator

            <span className="mt-2 block bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              Create SEO Titles & Descriptions
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Create search-friendly title tags and meta
            descriptions, check their length and preview
            the generated HTML instantly.
          </p>

        </div>


        {/* TOOL */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
              Create your metadata
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Page Information
            </h2>


            <label className="mt-6 block text-sm font-semibold text-slate-200">
              Meta title
            </label>

            <input
              value={title}
              onChange={handleTitleChange}
              placeholder="Example: Free SEO Tools for Better Rankings"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-400/60"
            />

            <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">

              <span className="text-slate-500">
                Recommended: around 50–60 characters
              </span>

              <div className="flex gap-3">
                <span className={titleStatus.className}>
                  {titleStatus.text}
                </span>

                <span className="text-slate-300">
                  {titleLength} characters
                </span>
              </div>

            </div>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              Meta description
            </label>

            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Describe the page clearly and encourage searchers to click."
              rows={7}
              className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-400/60"
            />

            <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">

              <span className="text-slate-500">
                Recommended: around 140–160 characters
              </span>

              <div className="flex gap-3">
                <span className={descriptionStatus.className}>
                  {descriptionStatus.text}
                </span>

                <span className="text-slate-300">
                  {descriptionLength} characters
                </span>
              </div>

            </div>

          </section>


          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Generated output
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Generated Meta Tags
            </h2>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/30 p-5">

              <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300">
{`<title>${title || "Your page title"}</title>

<meta name="description" content="${
                description || "Your meta description"
              }" />`}
              </pre>

            </div>


            <div className="mt-8">

              <p className="text-sm font-semibold text-slate-300">
                Search Preview
              </p>

              <div className="mt-4 rounded-2xl bg-white p-5 text-slate-900 shadow-xl">

                <p className="truncate text-xl font-medium text-blue-700">
                  {title || "Your page title"}
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  https://example.com/page
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {description ||
                    "Your meta description will appear here as a preview."}
                </p>

              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                This is a simplified preview. Search engines
                may display titles and snippets differently.
              </p>

            </div>

          </section>

        </div>


        <div className="mt-10">

          <ShareTool
            title="Meta Tag Generator"
            description="Create SEO-friendly title tags and meta descriptions with this free LifeSeos tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          {/* WHAT ARE META TAGS */}

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
              SEO Metadata
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Create Clear Titles and Meta Descriptions
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Title tags and meta descriptions provide
              important information about a webpage.
              Writing them clearly can make it easier for
              users and search engines to understand what
              the page is about.
            </p>

          </div>


          {/* EXPLANATION CARDS */}

          <div className="mt-12 grid gap-6 md:grid-cols-2">

            <InfoCard
              icon="T"
              title="SEO Title Tag"
              description="The title tag describes the main topic of a page and is commonly used as a prominent title in search results and browser tabs."
              points={[
                "Describe the page clearly",
                "Keep the wording specific",
                "Include the main topic naturally",
                "Avoid repetitive keyword stuffing",
              ]}
            />

            <InfoCard
              icon="D"
              title="Meta Description"
              description="The meta description summarizes the page and may be used as descriptive text in search results."
              points={[
                "Summarize the page accurately",
                "Write for real users",
                "Use natural and useful wording",
                "Give searchers a reason to visit",
              ]}
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                  How it works
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  How to Use the Meta Tag Generator
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Create your metadata before publishing a
                  new page or when improving an existing
                  page.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Write your page title"
                  description="Enter a concise title that accurately describes the main subject of the page."
                />

                <StepCard
                  number="2"
                  title="Add a meta description"
                  description="Write a short summary that explains what visitors can expect from the page."
                />

                <StepCard
                  number="3"
                  title="Review the length"
                  description="Use the character counters as practical guidance while keeping the wording natural."
                />

                <StepCard
                  number="4"
                  title="Copy the generated HTML"
                  description="Add the generated title and description tags to the head section of your webpage."
                />

              </div>

            </div>

          </div>


          {/* BEST PRACTICES */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Writing tips
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Meta Tag Best Practices
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Character counts are useful guidelines,
                but strong metadata should primarily
                describe the page accurately and help
                users understand whether the result is
                relevant to their search.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Avoid creating titles or descriptions
                simply to reach a specific character
                count. Clear, specific and useful wording
                is more important than filling every
                available character.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <TipCard
                title="Be specific"
                description="Make each title and description relevant to the exact page rather than reusing generic metadata."
              />

              <TipCard
                title="Match page content"
                description="Metadata should accurately reflect what users will find after opening the page."
              />

              <TipCard
                title="Avoid repetition"
                description="Do not repeat keywords unnaturally or fill metadata with unnecessary variations."
              />

              <TipCard
                title="Write for clicks"
                description="Use readable wording that helps users decide whether your page answers their query."
              />

            </div>

          </div>


          {/* IMPORTANT NOTE */}

          <div className="mt-16 rounded-[28px] border border-amber-400/15 bg-amber-400/[0.04] p-6 sm:p-8">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 font-bold text-amber-300">
                !
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Search Result Snippets Can Change
                </h2>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
                  The preview generated by this tool is
                  only an approximation. Search engines
                  may rewrite or display different title
                  and description text depending on the
                  search query, page content and other
                  factors.
                </p>

              </div>

            </div>

          </div>


          {/* RELATED TOOLS */}

          <div className="mt-20">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                  Continue optimizing
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Related SEO Tools
                </h2>

              </div>

              <Link
                href="/tools"
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                View all tools →
              </Link>

            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <RelatedToolCard
                href="/tools/seo-page-analyzer"
                icon="⌕"
                title="SEO Page Analyzer"
                description="Check whether a live webpage contains titles, descriptions, headings and other on-page SEO elements."
              />

              <RelatedToolCard
                href="/tools/seo-analyzer"
                icon="◎"
                title="SEO Analyzer"
                description="Run a broader website SEO audit covering technical, content and metadata signals."
              />

              <RelatedToolCard
                href="/tools/content-analyzer"
                icon="▤"
                title="Content Analyzer"
                description="Analyze readability, keyword usage, content structure and basic quality signals."
              />

              <RelatedToolCard
                href="/tools/keyword-density-checker"
                icon="%"
                title="Keyword Density Checker"
                description="Measure keyword frequency and density within your page content."
              />

              <RelatedToolCard
                href="/tools/page-speed"
                icon="⚡"
                title="Page Speed Analyzer"
                description="Measure Lighthouse performance and important loading metrics."
              />

              <RelatedToolCard
                href="/tools/xml-sitemap-generator"
                icon="⌘"
                title="XML Sitemap Generator"
                description="Create XML sitemaps that help search engines discover important website pages."
              />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


function InfoCard({
  icon,
  title,
  description,
  points,
}: {
  icon: string;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 sm:p-7">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 font-bold text-fuchsia-300">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

      <ul className="mt-5 space-y-2">

        {points.map((point) => (

          <li
            key={point}
            className="flex items-start gap-3 text-sm text-slate-300"
          >
            <span className="mt-0.5 text-emerald-400">
              ✓
            </span>

            <span>
              {point}
            </span>
          </li>

        ))}

      </ul>

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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 font-bold text-fuchsia-300">
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


function TipCard({
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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-fuchsia-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-fuchsia-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-fuchsia-300">
        Open tool →
      </div>

    </Link>
  );
}