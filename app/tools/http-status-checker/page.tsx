"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import ShareTool from "@/components/share-tool";

type Result = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  redirected: boolean;
  ok: boolean;
};

const statusCodeGroups = [
  {
    code: "2xx",
    title: "Successful responses",
    description:
      "A 2xx status means the server successfully received and processed the request. The most common response is 200 OK.",
  },
  {
    code: "3xx",
    title: "Redirect responses",
    description:
      "A 3xx status means the requested URL redirects to another location. Common examples include 301 permanent redirects and 302 temporary redirects.",
  },
  {
    code: "4xx",
    title: "Client errors",
    description:
      "A 4xx status usually means the requested resource cannot be accessed. A 404 response, for example, means the page was not found.",
  },
  {
    code: "5xx",
    title: "Server errors",
    description:
      "A 5xx response means the server encountered a problem while processing the request. These errors can prevent users and search engines from accessing a page.",
  },
];

const commonCodes = [
  {
    code: "200",
    title: "OK",
    description:
      "The page loaded successfully and is generally available to users and search engines.",
  },
  {
    code: "301",
    title: "Moved Permanently",
    description:
      "The URL permanently redirects to a different location. This is commonly used when pages or domains are permanently moved.",
  },
  {
    code: "302",
    title: "Found / Temporary Redirect",
    description:
      "The URL temporarily redirects elsewhere. Search engines may continue to keep the original URL in their index.",
  },
  {
    code: "404",
    title: "Not Found",
    description:
      "The requested page does not exist at this URL. Broken internal links and outdated URLs frequently return this response.",
  },
  {
    code: "410",
    title: "Gone",
    description:
      "The page has been intentionally and permanently removed and is not expected to return.",
  },
  {
    code: "500",
    title: "Internal Server Error",
    description:
      "The server encountered an unexpected problem and could not complete the request.",
  },
  {
    code: "503",
    title: "Service Unavailable",
    description:
      "The server is temporarily unavailable, often because of maintenance, overload, or another temporary issue.",
  },
];

const faqs = [
  {
    question: "What is an HTTP status code?",
    answer:
      "An HTTP status code is a three-digit response sent by a web server after a browser, crawler, or other client requests a URL. It indicates whether the request succeeded, redirected, failed, or encountered a server problem.",
  },
  {
    question:
      "Why do HTTP status codes matter for SEO?",
    answer:
      "Search engines use HTTP responses to understand whether pages are available, redirected, missing, or temporarily unavailable. Incorrect status codes can create broken links or make important pages harder to crawl correctly.",
  },
  {
    question:
      "What status code should a normal webpage return?",
    answer:
      "A normal accessible webpage should usually return 200 OK. If the page has permanently moved, a 301 redirect is generally more appropriate.",
  },
  {
    question:
      "Is a 301 redirect bad for SEO?",
    answer:
      "No. A correctly implemented 301 redirect is a standard way to indicate that a URL has permanently moved to another location.",
  },
  {
    question:
      "What is the difference between 404 and 410?",
    answer:
      "A 404 means the requested resource was not found, while a 410 explicitly indicates that the resource has been permanently removed.",
  },
];

export default function HttpStatusCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] =
    useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const hasTrackedUse = useRef(false);

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
              "HTTP Status Checker",
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to record HTTP Status Checker usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  async function checkStatus() {
    const cleanUrl = url.trim();

    setError("");
    setResult(null);

    if (!cleanUrl) {
      setError(
        "Please enter a website URL."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/http-status",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url: cleanUrl,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Something went wrong."
        );
        return;
      }

      await recordToolUseOnce();

      setResult(data);
    } catch {
      setError(
        "Unable to check this URL."
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(
    status: number
  ) {
    if (
      status >= 200 &&
      status < 300
    ) {
      return "text-emerald-300";
    }

    if (
      status >= 300 &&
      status < 400
    ) {
      return "text-blue-300";
    }

    if (
      status >= 400 &&
      status < 500
    ) {
      return "text-amber-300";
    }

    if (status >= 500) {
      return "text-rose-300";
    }

    return "text-slate-300";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <span>↔</span>

            <span>
              LifeSeos HTTP Status Checker
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free HTTP Status Checker

            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Check Response Codes & Redirects
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Check a URL&apos;s HTTP response status,
            final destination and redirect behavior
            to identify successful pages, broken URLs
            and server errors.
          </p>

        </div>


        {/* TOOL */}

        <section className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 sm:p-6">

          <label
            htmlFor="http-status-url"
            className="text-sm font-semibold text-slate-200"
          >
            Website URL
          </label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">

            <input
              id="http-status-url"
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  checkStatus();
                }
              }}
              placeholder="https://example.com"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
            />

            <button
              type="button"
              onClick={
                checkStatus
              }
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Checking..."
                : "Check status"}
            </button>

          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter a complete public URL to
            check its HTTP response and final
            destination.
          </p>


          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}


          {loading && (
            <div className="mt-6 overflow-hidden rounded-full bg-slate-900">
              <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400" />
            </div>
          )}

        </section>


        {/* RESULT */}

        {result && (

          <section className="mt-8 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                HTTP response
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                HTTP Status Result
              </h2>

            </div>


            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Status code
                </p>

                <p
                  className={`mt-2 text-4xl font-bold ${getStatusColor(
                    result.status
                  )}`}
                >
                  {result.status}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {result.statusText ||
                    "HTTP response"}
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-black/10 p-5">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Redirect detected
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {result.redirected
                    ? "Yes"
                    : "No"}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {result.redirected
                    ? "The requested URL redirected to another destination."
                    : "No redirect was detected for this request."}
                </p>

              </div>

            </div>


            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <UrlCard
                label="Requested URL"
                value={
                  result.requestedUrl
                }
              />

              <UrlCard
                label="Final URL"
                value={
                  result.finalUrl
                }
              />

            </div>

          </section>

        )}


        <div className="mt-10">

          <ShareTool
            title="HTTP Status Checker"
            description="Check HTTP status codes, redirects and final URLs with this free LifeSeos technical SEO tool."
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          {/* BASICS */}

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              HTTP Basics
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              What Is an HTTP Status Code?
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              An HTTP status code is a
              three-digit response returned by
              a web server after a browser,
              search engine crawler or other
              client requests a URL.
            </p>

            <p className="mt-4 leading-8 text-slate-400">
              The response indicates whether
              the request succeeded, redirected,
              failed because the resource could
              not be found or encountered a
              server-side problem.
            </p>

          </div>


          {/* STATUS GROUPS */}

          <div className="mt-16">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                Response categories
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Understanding HTTP Status Code Groups
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                HTTP responses are grouped by
                their first digit, which makes
                it easier to understand how the
                server handled a request.
              </p>

            </div>


            <div className="mt-8 grid gap-5 md:grid-cols-2">

              {statusCodeGroups.map(
                (group) => (

                  <StatusGroupCard
                    key={
                      group.code
                    }
                    code={
                      group.code
                    }
                    title={
                      group.title
                    }
                    description={
                      group.description
                    }
                  />

                )
              )}

            </div>

          </div>


          {/* COMMON CODES */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="max-w-3xl">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
                Common responses
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Common HTTP Status Codes for SEO
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                These response codes appear
                frequently during technical SEO
                audits and website maintenance.
              </p>

            </div>


            <div className="mt-8 grid gap-4 md:grid-cols-2">

              {commonCodes.map(
                (item) => (

                  <CodeCard
                    key={
                      item.code
                    }
                    code={
                      item.code
                    }
                    title={
                      item.title
                    }
                    description={
                      item.description
                    }
                  />

                )
              )}

            </div>

          </div>


          {/* REDIRECTS */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Redirect management
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Check Redirects and Final URLs
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Redirects are normal when
                pages move, domains change or
                URL structures are updated.
                What matters is that redirects
                point users and crawlers to the
                correct final destination.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                Checking both the requested
                URL and final URL can help you
                discover unexpected redirects
                and identify URLs that no longer
                resolve directly.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BenefitCard
                title="Find broken URLs"
                description="Identify pages returning 404 or other error responses."
              />

              <BenefitCard
                title="Review redirects"
                description="Confirm whether a requested URL redirects to another destination."
              />

              <BenefitCard
                title="Check final URLs"
                description="Verify the destination that users and crawlers ultimately reach."
              />

              <BenefitCard
                title="Catch server errors"
                description="Detect 5xx responses that may temporarily prevent access to important pages."
              />

            </div>

          </div>


          {/* SEO IMPORTANCE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  Technical SEO
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  Why HTTP Status Codes Matter for SEO
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Search engines rely on HTTP
                  responses to understand whether
                  URLs are available, moved,
                  missing or temporarily
                  unavailable.
                </p>

              </div>


              <div className="space-y-4">

                <ReasonCard
                  number="1"
                  title="Crawlability"
                  description="Successful HTTP responses allow crawlers to access pages and process their content."
                />

                <ReasonCard
                  number="2"
                  title="Redirect Signals"
                  description="Redirect responses indicate that users and crawlers should continue to another URL."
                />

                <ReasonCard
                  number="3"
                  title="Broken URL Detection"
                  description="4xx responses can reveal outdated links and pages that are no longer available."
                />

                <ReasonCard
                  number="4"
                  title="Server Reliability"
                  description="5xx errors can indicate server problems that temporarily prevent crawling and access."
                />

              </div>

            </div>

          </div>


          {/* HOW TO USE */}

          <div className="mt-16">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                How it works
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                How to Use the HTTP Status Checker
              </h2>

            </div>


            <div className="mx-auto mt-8 max-w-3xl space-y-4">

              <StepCard
                number="1"
                title="Enter the URL"
                description="Paste the complete webpage or website URL you want to check."
              />

              <StepCard
                number="2"
                title="Run the status check"
                description="Select Check status and LifeSeos will request the URL and inspect its HTTP response."
              />

              <StepCard
                number="3"
                title="Review the response"
                description="Check the status code and status text to understand how the server handled the request."
              />

              <StepCard
                number="4"
                title="Check the final destination"
                description="If the URL redirects, compare the requested URL with the final URL returned by the tool."
              />

            </div>

          </div>


          {/* FAQ */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
              HTTP Status FAQ
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Frequently Asked Questions
            </h2>


            <div className="mt-8 divide-y divide-white/10">

              {faqs.map(
                (faq) => (

                  <article
                    key={
                      faq.question
                    }
                    className="py-6 first:pt-0 last:pb-0"
                  >

                    <h3 className="text-lg font-semibold text-white">
                      {
                        faq.question
                      }
                    </h3>

                    <p className="mt-3 leading-7 text-slate-400">
                      {
                        faq.answer
                      }
                    </p>

                  </article>

                )
              )}

            </div>

          </div>


          {/* RELATED TOOLS */}

          <div className="mt-20">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
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
                href="/tools/seo-analyzer"
                icon="⌕"
                title="SEO Analyzer"
                description="Run a broader SEO audit covering technical, content, image and metadata signals."
              />

              <RelatedToolCard
                href="/tools/seo-page-analyzer"
                icon="◎"
                title="SEO Page Analyzer"
                description="Inspect important on-page SEO elements including titles, headings and canonical tags."
              />

              <RelatedToolCard
                href="/tools/xml-sitemap-generator"
                icon="⌘"
                title="XML Sitemap Generator"
                description="Create a sitemap and verify important URLs before adding them to the file."
              />

              <RelatedToolCard
                href="/tools/robots-txt-generator"
                icon="🤖"
                title="Robots.txt Generator"
                description="Create crawler access rules and include your XML sitemap URL."
              />

              <RelatedToolCard
                href="/tools/page-speed"
                icon="⚡"
                title="Page Speed Analyzer"
                description="Measure Lighthouse performance and website loading metrics."
              />

              <RelatedToolCard
                href="/tools/meta-tag-generator"
                icon="<>"
                title="Meta Tag Generator"
                description="Create optimized page titles and meta descriptions."
              />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


function UrlCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm leading-6 text-slate-300">
        {value}
      </p>

    </div>
  );
}


function StatusGroupCard({
  code,
  title,
  description,
}: {
  code: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">

      <div className="inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-bold text-cyan-300">
        {code}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

    </article>
  );
}


function CodeCard({
  code,
  title,
  description,
}: {
  code: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">

      <div className="flex items-center gap-3">

        <span className="text-2xl font-bold text-cyan-300">
          {code}
        </span>

        <h3 className="font-semibold text-white">
          {title}
        </h3>

      </div>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

    </article>
  );
}


function BenefitCard({
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


function ReasonCard({
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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 font-bold text-cyan-300">
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
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 font-bold text-violet-300">
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
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white transition group-hover:text-cyan-300">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-4 text-sm font-semibold text-cyan-300">
        Open tool →
      </div>

    </Link>
  );
}