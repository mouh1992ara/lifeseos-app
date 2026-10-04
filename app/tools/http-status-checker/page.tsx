"use client";

import { useState } from "react";

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
    question: "Why do HTTP status codes matter for SEO?",
    answer:
      "Search engines use HTTP responses to understand whether pages are available, redirected, missing, or temporarily unavailable. Incorrect status codes can waste crawl resources, create broken links, or prevent important pages from being indexed correctly.",
  },
  {
    question: "What status code should a normal webpage return?",
    answer:
      "A normal accessible webpage should usually return 200 OK. If the page has permanently moved, a 301 redirect is generally more appropriate.",
  },
  {
    question: "Is a 301 redirect bad for SEO?",
    answer:
      "No. A correctly implemented 301 redirect is the standard way to tell browsers and search engines that a URL has permanently moved to another location.",
  },
  {
    question: "What is the difference between 404 and 410?",
    answer:
      "A 404 means the requested resource was not found, while a 410 explicitly indicates that the resource has been permanently removed.",
  },
];

export default function HttpStatusCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkStatus() {
    const cleanUrl = url.trim();

    setError("");
    setResult(null);

    if (!cleanUrl) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/http-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to check this URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          SEO Tool
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          HTTP Status Checker
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Check a URL&apos;s HTTP response status, final destination, and whether
          it redirects. Quickly identify successful pages, redirects, broken
          URLs, and server errors that can affect users and search engines.
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <label
          htmlFor="http-status-url"
          className="text-sm font-semibold"
        >
          Website URL
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="http-status-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkStatus();
              }
            }}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <button
            type="button"
            onClick={checkStatus}
            disabled={loading}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check status"}
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter a full website address to check its HTTP response code and
          final destination.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>

      {result && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">
            HTTP Status Result
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Status code
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${
                  result.ok
                    ? "text-emerald-400"
                    : "text-amber-300"
                }`}
              >
                {result.status}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {result.statusText || "HTTP response"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Redirect
              </p>

              <p className="mt-2 text-xl font-bold">
                {result.redirected ? "Yes" : "No"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {result.redirected
                  ? "The requested URL redirected to another location."
                  : "No redirect was detected for this request."}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Requested URL
            </p>

            <p className="mt-2 break-all text-sm text-slate-300">
              {result.requestedUrl}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Final URL
            </p>

            <p className="mt-2 break-all text-sm text-slate-300">
              {result.finalUrl}
            </p>
          </div>
        </section>
      )}

      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            HTTP Basics
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            What is an HTTP status code?
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            An HTTP status code is a three-digit response returned by a web
            server after a browser, search engine crawler, or other client
            requests a URL. It tells the requester whether the page loaded
            successfully, redirected somewhere else, could not be found, or
            encountered a server problem.
          </p>

          <p className="mt-4 leading-7 text-slate-400">
            Checking HTTP responses is an important part of technical SEO
            because search engines need clear signals about which URLs are
            available, which have moved, and which should no longer be
            accessed.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold">
          Understanding HTTP status code groups
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          HTTP responses are grouped into categories based on their first
          digit. These categories make it easier to understand how a server
          handled a request.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {statusCodeGroups.map((group) => (
            <article
              key={group.code}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">
                  {group.code}
                </span>

                <h3 className="font-semibold text-white">
                  {group.title}
                </h3>
              </div>

              <p className="mt-4 leading-7 text-slate-400">
                {group.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <h2 className="text-2xl font-bold">
          Common HTTP status codes for SEO
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Some response codes appear frequently during technical SEO audits.
          Understanding what they mean can help you identify broken links,
          incorrect redirects, unavailable pages, and server problems.
        </p>

        <div className="mt-7 space-y-4">
          {commonCodes.map((item) => (
            <article
              key={item.code}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-xl font-bold text-emerald-400">
                  {item.code}
                </span>

                <h3 className="font-semibold text-white">
                  {item.title}
                </h3>
              </div>

              <p className="mt-3 leading-7 text-slate-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold">
          Why HTTP status codes matter for SEO
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-semibold text-white">
              Crawlability
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Search engines rely on HTTP responses to determine whether they
              can access and crawl a page successfully.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-semibold text-white">
              Redirect management
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Correct redirects help search engines understand when content has
              moved and which URL should be treated as the destination.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-semibold text-white">
              Broken URL detection
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Finding 404 and server errors helps you repair broken links and
              improve the experience for both users and crawlers.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <h2 className="text-2xl font-bold">
          How to use the LifeSeos HTTP Status Checker
        </h2>

        <div className="mt-6 space-y-5">
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 font-bold text-emerald-300">
              1
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Enter the URL
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                Paste the webpage or website address you want to check into
                the URL field above.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 font-bold text-emerald-300">
              2
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Run the check
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                Select Check status and LifeSeos will request the URL and
                inspect its HTTP response.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 font-bold text-emerald-300">
              3
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Review the result
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                Review the status code, redirect information, and final URL to
                identify potential technical issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold">
          Frequently asked questions
        </h2>

        <div className="mt-6 divide-y divide-white/10">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="py-5 first:pt-0 last:pb-0"
            >
              <h3 className="font-semibold text-white">
                {faq.question}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
