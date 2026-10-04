"use client";

import { useState } from "react";

export default function MetaTagGeneratorPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const titleLength = title.length;
  const descriptionLength = description.length;

  return (
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          SEO Tool
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Meta Tag Generator
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Create a search-friendly title tag and meta description and preview
          the HTML tags instantly.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label className="text-sm font-semibold">
            Meta title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Free SEO Tools for Better Rankings"
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-300">
            <span>Recommended: around 50–60 characters</span>
            <span>{titleLength} characters</span>
          </div>

          <label className="mt-8 block text-sm font-semibold">
            Meta description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the page clearly and encourage searchers to click."
            rows={6}
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-300">
            <span>Recommended: around 140–160 characters</span>
            <span>{descriptionLength} characters</span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">
            Generated tags
          </h2>

          <div className="mt-5 rounded-xl bg-black/30 p-5">
            <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300">
{`<title>${title || "Your page title"}</title>

<meta name="description" content="${
              description || "Your meta description"
            }" />`}
            </pre>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-300">
              Search preview
            </p>

            <div className="mt-4 rounded-xl bg-white p-5 text-slate-900">
              <p className="text-xl text-blue-700">
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
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold">
          How to use this tool
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Enter the title and description you want search engines to understand
          for your page. Keep the wording specific, readable and relevant to
          the page content. The generated HTML can then be added inside the head
          section of your webpage.
        </p>
      </section>
    </>
  );
}