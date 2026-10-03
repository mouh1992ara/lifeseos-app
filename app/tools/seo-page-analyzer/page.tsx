"use client";

import { useState } from "react";

type SeoResult = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  robots: string;
  h1: string[];
  h1Count: number;
  h2Count: number;
  totalLinks: number;
  totalImages: number;
  imagesWithoutAlt: number;
  pageSizeKb: number;
};

export default function SeoPageAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzePage() {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/seo-page-analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to analyze this page.");
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to analyze this page.");
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
          SEO Page Analyzer
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Analyze important on-page SEO elements including title, meta
          description, headings, canonical tags, links and image alt text.
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <label className="text-sm font-semibold">
          Page URL
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") analyzePage();
            }}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <button
            onClick={analyzePage}
            disabled={loading}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze page"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>

      {result && (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="HTTP Status"
              value={String(result.status)}
            />

            <MetricCard
              label="H1 Tags"
              value={String(result.h1Count)}
            />

            <MetricCard
              label="Links"
              value={String(result.totalLinks)}
            />

            <MetricCard
              label="Page Size"
              value={`${result.pageSizeKb} KB`}
            />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <InfoCard
              title="Title"
              value={result.title || "No title found"}
              note={`${result.titleLength} characters`}
            />

            <InfoCard
              title="Meta Description"
              value={result.description || "No meta description found"}
              note={`${result.descriptionLength} characters`}
            />

            <InfoCard
              title="Canonical URL"
              value={result.canonical || "No canonical tag found"}
            />

            <InfoCard
              title="Robots Meta"
              value={result.robots || "No robots meta tag found"}
            />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">
                Heading structure
              </h2>

              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p>
                  H1 count:{" "}
                  <strong className="text-white">
                    {result.h1Count}
                  </strong>
                </p>

                <p>
                  H2 count:{" "}
                  <strong className="text-white">
                    {result.h2Count}
                  </strong>
                </p>
              </div>

              {result.h1.length > 0 && (
                <div className="mt-5 space-y-2">
                  {result.h1.map((heading, index) => (
                    <div
                      key={`${heading}-${index}`}
                      className="rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-300"
                    >
                      {heading}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">
                Images
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Total images
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {result.totalImages}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Missing alt text
                  </p>

                  <p className="mt-2 text-2xl font-bold text-amber-300">
                    {result.imagesWithoutAlt}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">
              Final URL
            </h2>

            <p className="mt-4 break-all text-sm text-slate-300">
              {result.finalUrl}
            </p>
          </section>
        </>
      )}
    </>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-emerald-400">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-sm font-semibold text-slate-400">
        {title}
      </h2>

      <p className="mt-3 break-words text-lg leading-7">
        {value}
      </p>

      {note && (
        <p className="mt-2 text-xs text-slate-500">
          {note}
        </p>
      )}
    </div>
  );
}