"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  ClipboardCopy,
  Copy,
  ExternalLink,
  FileText,
  Gauge,
  Globe2,
  Monitor,
  RefreshCcw,
  Search,
  Share2,
  Smartphone,
  Sparkles,
} from "lucide-react";

type LengthStatus = {
  label: "Empty" | "Too short" | "Good" | "Too long";
  className: string;
};

function getTitleStatus(length: number): LengthStatus {
  if (length === 0) return { label: "Empty", className: "text-slate-500" };
  if (length < 30) return { label: "Too short", className: "text-amber-300" };
  if (length <= 60) return { label: "Good", className: "text-emerald-300" };
  return { label: "Too long", className: "text-red-300" };
}

function getDescriptionStatus(length: number): LengthStatus {
  if (length === 0) return { label: "Empty", className: "text-slate-500" };
  if (length < 70) return { label: "Too short", className: "text-amber-300" };
  if (length <= 160) return { label: "Good", className: "text-emerald-300" };
  return { label: "Too long", className: "text-red-300" };
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "https://www.example.com/page";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getDisplayUrl(value: string) {
  try {
    const url = new URL(normalizeUrl(value));
    const path = url.pathname
      .split("/")
      .filter(Boolean)
      .slice(0, 3)
      .join(" › ");

    return path ? `${url.hostname} › ${path}` : url.hostname;
  } catch {
    return value.trim() || "www.example.com";
  }
}

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export default function SerpSnippetPreviewClient() {
  const [title, setTitle] = useState(
    "Free SEO Tools for Website Analysis | LifeSeos"
  );
  const [description, setDescription] = useState(
    "Analyze your website, find technical SEO issues and improve search visibility with practical free SEO tools from LifeSeos."
  );
  const [url, setUrl] = useState("https://www.lifeseos.com/tools");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [copiedField, setCopiedField] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const titleStatus = useMemo(
    () => getTitleStatus(title.length),
    [title.length]
  );

  const descriptionStatus = useMemo(
    () => getDescriptionStatus(description.length),
    [description.length]
  );

  const displayUrl = useMemo(() => getDisplayUrl(url), [url]);

  const previewTitle = useMemo(
    () =>
      truncateText(
        title || "Your page title will appear here",
        previewMode === "desktop" ? 68 : 62
      ),
    [title, previewMode]
  );

  const previewDescription = useMemo(
    () =>
      truncateText(
        description ||
          "Your meta description preview will appear here as you type.",
        previewMode === "desktop" ? 165 : 150
      ),
    [description, previewMode]
  );

  function handleReset() {
    setTitle("");
    setDescription("");
    setUrl("");
    setPreviewMode("desktop");
    setCopiedField("");
  }

async function copyField(field: string, value: string) {
  if (!value.trim()) return;

  try {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);

    void fetch("/api/tool-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool_name: "SERP Snippet Preview",
      }),
    }).catch(() => {
      // Tracking should never interrupt the tool.
    });

    window.setTimeout(() => {
      setCopiedField("");
    }, 1800);
  } catch {
    setCopiedField("");
  }
}

  async function handleShare() {
    const shareData = {
      title: "Free SERP Snippet Preview Tool | LifeSeos",
      text: "Preview page titles and meta descriptions before publishing.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);

      window.setTimeout(() => {
        setShareCopied(false);
      }, 1800);
    } catch {
      // Ignore cancelled share actions.
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:px-10 lg:px-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[150px]" />
          <div className="absolute right-0 top-20 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-2 text-sm font-medium text-blue-300">
            <Search className="h-4 w-4" />
            On-Page SEO Tool
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Preview your search result
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
              before you publish.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            See how your page title, URL and meta description may look in a
            search result and review their length before publishing.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              Desktop preview
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              Mobile preview
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              Length guidance
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[.92fr_1.08fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Build your SERP snippet
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Enter the main search snippet fields below.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="page-title"
                    className="text-sm font-medium text-slate-200"
                  >
                    Page Title
                  </label>
                  <span className={`text-xs font-semibold ${titleStatus.className}`}>
                    {title.length} / 60 · {titleStatus.label}
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="page-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter your page title"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />

                  {title ? (
                    <button
                      type="button"
                      onClick={() => copyField("title", title)}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-white"
                      aria-label="Copy page title"
                    >
                      {copiedField === "title" ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Character count is only a guideline. Search engines may
                  truncate or rewrite titles depending on the query and device.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="page-description"
                    className="text-sm font-medium text-slate-200"
                  >
                    Meta Description
                  </label>
                  <span
                    className={`text-xs font-semibold ${descriptionStatus.className}`}
                  >
                    {description.length} / 160 · {descriptionStatus.label}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    id="page-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Write a concise description of the page"
                    rows={6}
                    className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 p-4 pr-12 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />

                  {description ? (
                    <button
                      type="button"
                      onClick={() => copyField("description", description)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-white"
                      aria-label="Copy meta description"
                    >
                      {copiedField === "description" ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Search engines may use a different passage when another part
                  of the page better matches the query.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="page-url"
                    className="text-sm font-medium text-slate-200"
                  >
                    Page URL
                  </label>
                  <span className="text-xs text-slate-500">
                    {url.length} characters
                  </span>
                </div>

                <div className="relative">
                  <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="page-url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/page"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                    previewMode === "desktop"
                      ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  Desktop
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                    previewMode === "mobile"
                      ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset Preview
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Live Preview
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {previewMode === "desktop"
                    ? "Desktop search result"
                    : "Mobile search result"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This is an approximate visual preview, not an exact Google
                  rendering.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                {previewMode === "desktop" ? (
                  <Monitor className="h-5 w-5 text-blue-400" />
                ) : (
                  <Smartphone className="h-5 w-5 text-blue-400" />
                )}
              </div>
            </div>

            <div
              className={`mx-auto mt-8 rounded-2xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl ${
                previewMode === "mobile" ? "max-w-[430px]" : "max-w-full"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <Globe2 className="h-4 w-4 text-slate-500" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-800">
                    {url ? normalizeUrl(url) : "https://www.example.com"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {displayUrl}
                  </p>
                </div>
              </div>

              <h3 className="mt-4 text-[20px] leading-7 text-[#1a0dab]">
                {previewTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {previewDescription}
              </p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <MetricCard
                icon={FileText}
                label="Title Length"
                value={`${title.length} chars`}
                status={titleStatus.label}
                statusClass={titleStatus.className}
              />
              <MetricCard
                icon={Gauge}
                label="Description Length"
                value={`${description.length} chars`}
                status={descriptionStatus.label}
                statusClass={descriptionStatus.className}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm font-semibold text-slate-200">
                Preview notes
              </p>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                <div className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    Visible result width depends on character width, device and
                    search context, not just character count.
                  </span>
                </div>
                <div className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    Search engines can rewrite titles and descriptions when
                    another version better matches the query.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
                <Share2 className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold">Share this tool</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Share the SERP Snippet Preview with marketers, writers and
                  website owners.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
            >
              {shareCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Link copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share tool
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Search Appearance
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Review your snippet before publishing
            </h2>
            <p className="mt-5 leading-8 text-slate-400">
              A SERP preview can help you spot titles that are too long,
              descriptions that are too short and URLs that may look unclear in
              search results.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Title Review",
                text: "Check whether your title is concise enough for a search result preview.",
              },
              {
                icon: Gauge,
                title: "Description Length",
                text: "Review description length before adding metadata to your page.",
              },
              {
                icon: Globe2,
                title: "URL Preview",
                text: "See how the hostname and page path may look in a search result.",
              },
              {
                icon: Monitor,
                title: "Desktop Preview",
                text: "Review the snippet in a wider desktop-style search result layout.",
              },
              {
                icon: Smartphone,
                title: "Mobile Preview",
                text: "Switch to a narrower layout to review mobile presentation.",
              },
              {
                icon: ClipboardCopy,
                title: "Easy Copy",
                text: "Copy your finished title or description when you are ready to publish.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-7 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                How It Works
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                How to use the SERP Snippet Preview
              </h2>
              <p className="mt-5 leading-8 text-slate-400">
                Use the preview while writing metadata, then make your final
                decision based on relevance and clarity rather than character
                count alone.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  number: "1",
                  title: "Enter your page title",
                  text: "Add the title you plan to use in your page metadata.",
                },
                {
                  number: "2",
                  title: "Write a meta description",
                  text: "Summarize the page clearly and explain why the result is relevant.",
                },
                {
                  number: "3",
                  title: "Add your page URL",
                  text: "Review how the domain and page path may appear in the result.",
                },
                {
                  number: "4",
                  title: "Check desktop and mobile",
                  text: "Review both layouts and copy the final metadata when ready.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-sm font-bold text-blue-300">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Continue Your SEO Workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Move from metadata creation to page optimization
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-400">
              Use these tools together to create your metadata, preview how it
              may appear in search and then review the finished page.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Link
              href="/tools/meta-tag-generator"
              className="group relative rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                  Step 1
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Meta Tag Generator
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Create a strong page title and meta description before checking
                how the snippet may look in search.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition group-hover:text-blue-200">
                Create metadata
                <ExternalLink className="h-4 w-4" />
              </div>
            </Link>

            <div className="relative rounded-2xl border border-blue-400/30 bg-blue-400/[0.055] p-6 shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <Monitor className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  Step 2 · Current
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                SERP Snippet Preview
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Preview your page title, URL and meta description on desktop and
                mobile before publishing.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                Preview metadata
                <Check className="h-4 w-4" />
              </div>
            </div>

            <Link
              href="/tools/seo-page-analyzer"
              className="group relative rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                  Step 3
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                SEO Page Analyzer
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Analyze the finished page and review metadata, headings, links
                and other important on-page SEO elements.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition group-hover:text-blue-200">
                Analyze page
                <ExternalLink className="h-4 w-4" />
              </div>
            </Link>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href="/tools/content-analyzer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-white/[0.05] hover:text-white"
            >
              <FileText className="h-4 w-4 text-blue-400" />
              Also review your page content with Content Analyzer
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  status,
  statusClass,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  status: string;
  statusClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>

        <span className={`text-xs font-semibold ${statusClass}`}>
          {status}
        </span>
      </div>

      <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
