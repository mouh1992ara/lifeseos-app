"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
} from "react";

import ShareTool from "@/components/share-tool";

export default function XmlSitemapGeneratorPage() {
  const [urls, setUrls] =
    useState("");

  const [
    changefreq,
    setChangefreq,
  ] = useState("weekly");

  const [
    priority,
    setPriority,
  ] = useState("0.8");

  const hasTrackedUse =
    useRef(false);

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
                "XML Sitemap Generator",
            }),
          }
        );

      if (!response.ok) {
        console.error(
          "Failed to record XML Sitemap Generator usage."
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

  function escapeXml(
    value: string
  ) {
    return value
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&apos;"
      );
  }

  const sitemap =
    useMemo(() => {
      const urlList =
        urls
          .split("\n")
          .map((url) =>
            url.trim()
          )
          .filter(Boolean);

      const entries =
        urlList
          .map(
            (url) => `  <url>
    <loc>${escapeXml(
      url
    )}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
          )
          .join("\n");

      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
    }, [
      urls,
      changefreq,
      priority,
    ]);

  const urlCount =
    useMemo(() => {
      return urls
        .split("\n")
        .map((url) =>
          url.trim()
        )
        .filter(Boolean)
        .length;
    }, [urls]);

  function handleUrlsChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const value =
      event.target.value;

    setUrls(value);

    if (value.trim()) {
      void recordToolUseOnce();
    }
  }

  function handleChangeFrequency(
    value: string
  ) {
    setChangefreq(value);
    void recordToolUseOnce();
  }

  function handlePriorityChange(
    value: string
  ) {
    setPriority(value);
    void recordToolUseOnce();
  }

  async function copySitemap() {
    await navigator.clipboard.writeText(
      sitemap
    );

    void recordToolUseOnce();
  }

  function downloadSitemap() {
    const blob = new Blob(
      [sitemap],
      {
        type: "application/xml",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      "sitemap.xml";

    document.body.appendChild(
      link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    void recordToolUseOnce();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-300">
            <span>⌘</span>

            <span>
              LifeSeos XML Sitemap Generator
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free XML Sitemap Generator

            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Create Your Sitemap.xml
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Create a valid XML sitemap
            from a list of website URLs,
            then copy or download the
            generated sitemap.xml file.
          </p>

        </div>


        {/* TOOL */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                  Sitemap URLs
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Add Your Website Pages
                </h2>

              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-center">

                <p className="text-xs text-slate-500">
                  URLs
                </p>

                <p className="mt-1 font-bold text-cyan-300">
                  {urlCount}
                </p>

              </div>

            </div>


            <label
              htmlFor="website-urls"
              className="mt-6 block text-sm font-semibold text-slate-200"
            >
              Website URLs
            </label>

            <textarea
              id="website-urls"
              value={urls}
              onChange={
                handleUrlsChange
              }
              placeholder={
                "https://example.com/\nhttps://example.com/about\nhttps://example.com/contact"
              }
              rows={12}
              className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Enter one complete absolute
              URL per line, including
              https://.
            </p>


            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              <div>

                <label
                  htmlFor="change-frequency"
                  className="text-sm font-semibold text-slate-200"
                >
                  Change frequency
                </label>

                <select
                  id="change-frequency"
                  value={
                    changefreq
                  }
                  onChange={(e) =>
                    handleChangeFrequency(
                      e.target.value
                    )
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition focus:border-blue-400/60"
                >
                  <option value="always">
                    Always
                  </option>

                  <option value="hourly">
                    Hourly
                  </option>

                  <option value="daily">
                    Daily
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="yearly">
                    Yearly
                  </option>

                  <option value="never">
                    Never
                  </option>
                </select>

              </div>


              <div>

                <label
                  htmlFor="priority"
                  className="text-sm font-semibold text-slate-200"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(e) =>
                    handlePriorityChange(
                      e.target.value
                    )
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition focus:border-blue-400/60"
                >
                  <option value="1.0">
                    1.0
                  </option>

                  <option value="0.9">
                    0.9
                  </option>

                  <option value="0.8">
                    0.8
                  </option>

                  <option value="0.7">
                    0.7
                  </option>

                  <option value="0.6">
                    0.6
                  </option>

                  <option value="0.5">
                    0.5
                  </option>
                </select>

              </div>

            </div>


            <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4">

              <p className="text-xs leading-6 text-amber-100/70">
                Change frequency and
                priority are optional
                sitemap protocol fields.
                Google currently ignores
                both values, so treat them
                only as optional metadata
                for compatible consumers.
              </p>

            </div>

          </section>


          {/* OUTPUT */}

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Generated output
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Generated Sitemap
                </h2>

              </div>


              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    copySitemap
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07]"
                >
                  Copy
                </button>

                <button
                  type="button"
                  onClick={
                    downloadSitemap
                  }
                  className="rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-blue-300 hover:to-cyan-300"
                >
                  Download
                </button>

              </div>

            </div>


            <div className="mt-5 max-h-[470px] overflow-auto rounded-2xl border border-white/5 bg-black/30 p-5">

              <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300">
                {sitemap}
              </pre>

            </div>


            <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  ✓
                </div>

                <p className="text-sm leading-6 text-slate-400">
                  When ready, upload the
                  file as{" "}
                  <span className="font-medium text-slate-200">
                    sitemap.xml
                  </span>{" "}
                  on your website and submit
                  its URL through your search
                  engine webmaster tools.
                </p>

              </div>

            </div>

          </section>

        </div>


        <div className="mt-10">

          <ShareTool
            title="XML Sitemap Generator"
            description="Create and download an XML sitemap for your website with this free LifeSeos tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          {/* INTRO */}

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
              URL Discovery
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Help Search Engines Discover Your Pages
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              An XML sitemap is a file
              containing information about
              URLs you consider important on
              your website. Search engines can
              use the sitemap as an additional
              source for discovering and
              crawling those URLs.
            </p>

          </div>


          {/* XML ELEMENTS */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <ElementCard
              tag="<urlset>"
              title="Sitemap Container"
              description="The main XML element that contains the URL entries in a standard XML sitemap."
            />

            <ElementCard
              tag="<url>"
              title="URL Entry"
              description="Groups the information associated with one webpage in the sitemap."
            />

            <ElementCard
              tag="<loc>"
              title="Page Location"
              description="Contains the complete absolute URL of the page included in the sitemap."
            />

            <ElementCard
              tag="Optional"
              title="Additional Fields"
              description="Protocol fields such as changefreq and priority may be included, although individual search engines may ignore them."
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
                  How to Use the XML Sitemap Generator
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Build a sitemap from your
                  important website URLs and
                  make it accessible to search
                  engines.
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title="Add your URLs"
                  description="Enter one complete website URL per line, including the protocol and domain."
                />

                <StepCard
                  number="2"
                  title="Choose optional settings"
                  description="Select change frequency and priority values if you want them included in the XML output."
                />

                <StepCard
                  number="3"
                  title="Download sitemap.xml"
                  description="Review the generated XML, then copy it or download the sitemap.xml file."
                />

                <StepCard
                  number="4"
                  title="Publish and submit it"
                  description="Place the sitemap on your website and submit its URL through the relevant webmaster tools."
                />

              </div>

            </div>

          </div>


          {/* IMPORTANT DISTINCTION */}

          <div className="mt-16 rounded-[32px] border border-violet-400/15 bg-violet-400/[0.04] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-6 sm:grid-cols-[auto_1fr]">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 font-bold text-violet-300">
                !
              </div>


              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Important SEO distinction
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  A Sitemap Helps Discovery, but Does Not Guarantee Indexing
                </h2>

                <p className="mt-4 max-w-4xl leading-8 text-slate-400">
                  Submitting a sitemap helps
                  search engines discover the
                  URLs you want them to know
                  about. However, inclusion in
                  a sitemap does not guarantee
                  that every URL will be
                  crawled, indexed or ranked.
                  Each page still needs to be
                  accessible and suitable for
                  indexing.
                </p>

              </div>

            </div>

          </div>


          {/* BEST PRACTICES */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Sitemap quality
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                XML Sitemap Best Practices
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                A sitemap should contain the
                URLs you actually want search
                engines to discover and
                potentially show in search
                results.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Use complete canonical URLs,
                avoid broken or redirected
                pages where possible and keep
                your sitemap updated as your
                website changes.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BestPracticeCard
                title="Use absolute URLs"
                description="Include complete URLs such as https://example.com/page rather than relative paths."
              />

              <BestPracticeCard
                title="Use canonical URLs"
                description="Prefer the URL version you want search engines to treat as the primary version of the page."
              />

              <BestPracticeCard
                title="Include important pages"
                description="Focus the sitemap on public pages that you actually want search engines to discover."
              />

              <BestPracticeCard
                title="Keep it updated"
                description="Update your sitemap when important pages are added, removed or significantly changed."
              />

            </div>

          </div>


          {/* COMMON PROBLEMS */}

          <div className="mt-16">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
                Avoid mistakes
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Common Sitemap Problems
              </h2>

            </div>


            <div className="mt-8 grid gap-4 md:grid-cols-3">

              <ProblemCard
                title="Relative URLs"
                description="Sitemap entries should use complete absolute URLs rather than paths such as /about."
              />

              <ProblemCard
                title="Broken URLs"
                description="Including error pages or invalid URLs can reduce the usefulness and cleanliness of your sitemap."
              />

              <ProblemCard
                title="Non-canonical URLs"
                description="Listing duplicate or alternate URL versions can send inconsistent signals about which URL you prefer."
              />

            </div>

          </div>


          {/* CONTINUE TECHNICAL SEO WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                Continue Your Technical SEO Workflow
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Control crawling, improve discovery and audit your site
              </h2>

              <p className="mt-4 leading-8 text-slate-400">
                Use these tools together to manage crawler access, publish a
                clean sitemap and then run a broader SEO audit.
              </p>

            </div>


            <div className="mt-10 grid gap-5 lg:grid-cols-3">

              <Link
                href="/tools/robots-txt-generator"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-lg text-emerald-300">
                    🤖
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    Step 1
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-emerald-300">
                  Robots.txt Generator
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Configure crawler access rules and reference the sitemap from
                  your robots.txt file.
                </p>

                <div className="mt-5 text-sm font-semibold text-emerald-300">
                  Configure crawling →
                </div>

              </Link>


              <div className="rounded-2xl border border-blue-400/30 bg-blue-400/[0.055] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 font-bold text-blue-300">
                    ⌘
                  </div>

                  <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                    Step 2 · Current
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  XML Sitemap Generator
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Create an XML sitemap that lists important canonical URLs and
                  helps search engines discover your website structure.
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  Create sitemap ✓
                </div>

              </div>


              <Link
                href="/tools/seo-analyzer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-lg text-cyan-300">
                    ⌕
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    Step 3
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-cyan-300">
                  SEO Analyzer
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Run a broader SEO audit after configuring crawling and URL
                  discovery to review additional technical and content signals.
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  Run SEO audit →
                </div>

              </Link>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/http-status-checker"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                HTTP Status Checker →
              </Link>

              <Link
                href="/tools/seo-page-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                SEO Page Analyzer →
              </Link>

              <Link
                href="/tools/page-speed"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                Page Speed Analyzer →
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.05] hover:text-white"
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


function ElementCard({
  tag,
  title,
  description,
}: {
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">

      <div className="inline-flex rounded-xl border border-blue-400/20 bg-blue-400/10 px-3 py-2 font-mono text-xs font-bold text-blue-300">
        {tag}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 font-bold text-blue-300">
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


function ProblemCard({
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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-blue-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-blue-300">
        Open tool →
      </div>

    </Link>
  );
}