"use client";

import { useState } from "react";
import {
  Copy,
  Facebook,
  Linkedin,
  Share2,
} from "lucide-react";

type ShareToolProps = {
  title: string;
  description?: string;
};

export default function ShareTool({
  title,
  description = "Try this free SEO tool from LifeSeos.",
}: ShareToolProps) {
  const [copied, setCopied] = useState(false);

  function getPageUrl() {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  }

  function openShareWindow(url: string) {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer,width=720,height=600"
    );
  }

  function shareOnX() {
    const pageUrl = getPageUrl();

    const text = `${title} — ${description}`;

    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(pageUrl)}`
    );
  }

  function shareOnLinkedIn() {
    const pageUrl = getPageUrl();

    openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        pageUrl
      )}`
    );
  }

  function shareOnFacebook() {
    const pageUrl = getPageUrl();

    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        pageUrl
      )}`
    );
  }

  async function copyLink() {
    const pageUrl = getPageUrl();

    try {
      await navigator.clipboard.writeText(pageUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      console.error("Unable to copy link.");
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-400" />

            <h2 className="text-lg font-semibold text-white">
              Share this tool
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Found this tool useful? Share it with others.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={shareOnX}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <span className="font-bold">𝕏</span>
            X
          </button>

          <button
            type="button"
            onClick={shareOnLinkedIn}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.06]"
          >
            <Linkedin className="h-4 w-4 text-blue-400" />
            LinkedIn
          </button>

          <button
            type="button"
            onClick={shareOnFacebook}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.06]"
          >
            <Facebook className="h-4 w-4 text-blue-400" />
            Facebook
          </button>

          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
          >
            <Copy className="h-4 w-4 text-emerald-400" />

            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </section>
  );
}
