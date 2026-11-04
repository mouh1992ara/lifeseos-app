"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Check, Copy, Facebook, Linkedin, Share2 } from "lucide-react";

type ShareToolProps = {
  /** Localized tool name, used as the share text prefix. */
  title: string;
  /** Localized one-line description; falls back to the generic catalog string. */
  description?: string;
};

export default function ShareTool({ title, description }: ShareToolProps) {
  const t = useTranslations("Share");
  const [copied, setCopied] = useState(false);

  const shareText = description
    ? `${title} — ${description}`
    : `${title} — ${t("defaultText")}`;

  function getPageUrl() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=600");
  }

  function shareOnX() {
    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText,
      )}&url=${encodeURIComponent(getPageUrl())}`,
    );
  }

  function shareOnLinkedIn() {
    openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        getPageUrl(),
      )}`,
    );
  }

  function shareOnFacebook() {
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getPageUrl(),
      )}`,
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getPageUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error(t("copyError"));
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 shrink-0 text-emerald-400" />

            <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          </div>

          <p className="mt-2 text-sm text-slate-400">{t("body")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={shareOnX}
            aria-label="X"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <span className="font-bold" aria-hidden="true">
              𝕏
            </span>
            <span data-latin>X</span>
          </button>

          <button
            type="button"
            onClick={shareOnLinkedIn}
            aria-label="LinkedIn"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.06]"
          >
            <Linkedin className="h-4 w-4 shrink-0 text-blue-400" />
            <span data-latin>LinkedIn</span>
          </button>

          <button
            type="button"
            onClick={shareOnFacebook}
            aria-label="Facebook"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.06]"
          >
            <Facebook className="h-4 w-4 shrink-0 text-blue-400" />
            <span data-latin>Facebook</span>
          </button>

          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
          >
            {copied ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
    </section>
  );
}