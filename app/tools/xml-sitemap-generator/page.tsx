"use client";

import { useMemo, useState } from "react";

export default function XmlSitemapGeneratorPage() {
  const [urls, setUrls] = useState("");
  const [changefreq, setChangefreq] = useState("weekly");
  const [priority, setPriority] = useState("0.8");

  const sitemap = useMemo(() => {
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    const entries = urlList
      .map(
        (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
      )
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
  }, [urls, changefreq, priority]);

  async function copySitemap() {
    await navigator.clipboard.writeText(sitemap);
  }

  function downloadSitemap() {
    const blob = new Blob([sitemap], {
      type: "application/xml",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sitemap.xml";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          SEO Tool
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          XML Sitemap Generator
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Create a simple XML sitemap for your website by adding one URL per
          line.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label
            htmlFor="website-urls"
            className="text-sm font-semibold"
          >
            Website URLs
          </label>

          <textarea
            id="website-urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={
              "https://example.com/\nhttps://example.com/about\nhttps://example.com/contact"
            }
            rows={12}
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 leading-7 outline-none focus:border-emerald-400"
          />

          <p className="mt-2 text-xs text-slate-300">
            Enter one full URL per line.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="change-frequency"
                className="text-sm font-semibold"
              >
                Change frequency
              </label>

              <select
                id="change-frequency"
                value={changefreq}
                onChange={(e) => setChangefreq(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
              >
                <option value="always">Always</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="text-sm font-semibold"
              >
                Priority
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
              >
                <option value="1.0">1.0</option>
                <option value="0.9">0.9</option>
                <option value="0.8">0.8</option>
                <option value="0.7">0.7</option>
                <option value="0.6">0.6</option>
                <option value="0.5">0.5</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Generated sitemap
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copySitemap}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5"
              >
                Copy
              </button>

              <button
                type="button"
                onClick={downloadSitemap}
                className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
              >
                Download
              </button>
            </div>
          </div>

          <div className="mt-5 max-h-[430px] overflow-auto rounded-xl bg-black/30 p-5">
            <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300">
              {sitemap}
            </pre>
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold">
          How to use this tool
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Add the URLs you want search engines to discover, choose a change
          frequency and priority, then copy or download the generated XML file.
          Upload sitemap.xml to your website and submit its URL through your
          preferred search engine webmaster tools.
        </p>
      </section>
    </>
  );
}