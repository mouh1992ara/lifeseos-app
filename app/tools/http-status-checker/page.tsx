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

export default function HttpStatusCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkStatus() {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/http-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
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
          it redirects.
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <label className="text-sm font-semibold">
          Website URL
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") checkStatus();
            }}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <button
            onClick={checkStatus}
            disabled={loading}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check status"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>

      {result && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">
            Result
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Status code
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-400">
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
            </div>
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

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold">
          Understanding HTTP status codes
        </h2>

        <div className="mt-5 space-y-3 text-slate-400">
          <p>
            <strong className="text-white">2xx:</strong> The request completed successfully.
          </p>

          <p>
            <strong className="text-white">3xx:</strong> The URL redirects to another location.
          </p>

          <p>
            <strong className="text-white">4xx:</strong> There is a client-side error such as a missing page.
          </p>

          <p>
            <strong className="text-white">5xx:</strong> The target server encountered an error.
          </p>
        </div>
      </section>
    </>
  );
}