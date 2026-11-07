"use client";

import { Link } from "@/i18n/navigation";
import { hasRealOutput, useToolOutcome } from "@/lib/use-tool-outcome";
import { useMemo, useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { normalisePath, normaliseUrl, splitLines } from "@/lib/tool-input";

import ShareTool from "@/components/share-tool";

export default function RobotsTxtGeneratorPage() {
  const { start: startOutcome } = useToolOutcome("robots-txt-generator");
  const t = useTranslations("Tool.robotsTxt");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");

  const [userAgent, setUserAgent] =
    useState("*");

  const [allowPath, setAllowPath] =
    useState("/");

  const [
    disallowPaths,
    setDisallowPaths,
  ] = useState("");

  const [sitemap, setSitemap] =
    useState("");


  const robotsTxt = useMemo(() => {
    const lines = [
      `User-agent: ${userAgent || "*"}`,
    ];

    if (allowPath.trim()) {
      lines.push(
        `Allow: ${normalisePath(allowPath)}`
      );
    }

    // robots.txt requires a leading "/" — "Disallow: admin" is ignored by
    // crawlers, which is a silent, common mistake.
    const disallowList = Array.from(
      new Set(
        splitLines(disallowPaths).map(normalisePath)
      )
    );

    disallowList.forEach(
      (path) => {
        lines.push(
          `Disallow: ${path}`
        );
      }
    );

    const sitemapUrl = normaliseUrl(sitemap);
    if (sitemapUrl) {
      lines.push("");
      lines.push(
        `Sitemap: ${sitemapUrl}`
      );
    }

    return lines.join("\n");
  }, [
    userAgent,
    allowPath,
    disallowPaths,
    sitemap,
  ]);

  /* One success per visit, and only for output the visitor caused.
     These tools recompute on every keystroke, so counting each change would
     record dozens of operations for one person typing. `hasRealOutput` stops an
     empty result counting, and the mount snapshot stops a non-empty default
     from being recorded as work nobody did. */
  const outcomeOutput = robotsTxt;
  const initialOutcomeOutput = useRef(outcomeOutput);
  const outcomeTrackedRef = useRef(false);
  useEffect(() => {
    if (outcomeTrackedRef.current) return;
    if (outcomeOutput === initialOutcomeOutput.current) return;
    if (!hasRealOutput(outcomeOutput)) return;
    outcomeTrackedRef.current = true;
    startOutcome().success();
  }, [outcomeOutput, startOutcome]);


  function handleUserAgentChange(
    value: string
  ) {
    setUserAgent(value);
  }

  function handleAllowPathChange(
    value: string
  ) {
    setAllowPath(value);
  }

  function handleDisallowPathsChange(
    value: string
  ) {
    setDisallowPaths(value);
  }

  function handleSitemapChange(
    value: string
  ) {
    setSitemap(value);
  }

  async function copyRobotsTxt() {
    await navigator.clipboard.writeText(
      robotsTxt
    );

  }

  return (
    <main data-tool-surface className="min-h-screen bg-slate-950 text-white">

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <span aria-hidden="true">🤖</span>

            <span>
              {t("badge")}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}

            <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {t("subtitle")}
          </p>

        </div>


        {/* TOOL */}

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {t("rulesEyebrow")}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {t("rulesTitle")}
            </h2>


            <label className="mt-6 block text-sm font-semibold text-slate-200">
              {t("userAgentLabel")}
            </label>

            <input
              value={userAgent}
              onChange={(e) =>
                handleUserAgentChange(
                  e.target.value
                )
              }
              placeholder={t("userAgentPlaceholder")}
              dir="ltr"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t("userAgentHint")}
            </p>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              {t("allowLabel")}
            </label>

            <input
              value={allowPath}
              onChange={(e) =>
                handleAllowPathChange(
                  e.target.value
                )
              }
              placeholder={t("allowPlaceholder")}
              dir="ltr"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t("allowHint")}
            </p>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              {t("disallowLabel")}
            </label>

            <textarea
              value={disallowPaths}
              onChange={(e) =>
                handleDisallowPathsChange(
                  e.target.value
                )
              }
              placeholder={t("disallowPlaceholder")}
              rows={6}
              dir="ltr"
              className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t("disallowHint")}
            </p>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              {t("sitemapLabel")}
            </label>

            <input
              value={sitemap}
              onChange={(e) =>
                handleSitemapChange(
                  e.target.value
                )
              }
              placeholder={t("sitemapPlaceholder")}
              dir="ltr"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t("sitemapHint")}
            </p>

          </section>


          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  {t("outputEyebrow")}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {t("outputTitle")}
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  copyRobotsTxt
                }
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-cyan-300"
              >
                {tCommon("copy")}
              </button>

            </div>


            <div className="mt-5 rounded-2xl border border-white/5 bg-black/30 p-5">

              <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300" data-ltr-text>
                {robotsTxt}
              </pre>

            </div>


            <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 font-bold text-amber-300">
                  !
                </div>

                <div>

                  <h3 className="font-semibold text-amber-200">
                    {t("noteTitle")}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-amber-100/70">
                    {t("noteBody")}
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>


        <div className="mt-10">

          <ShareTool
            title={tc("robotsTxtGenerator.title")}
            description={t("shareBody")}
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {t("introEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("introTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("introP1")}
            </p>

          </div>


          {/* DIRECTIVES */}

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <DirectiveCard
              directive="User-agent"
              title={t("dirUserAgentTitle")}
              description={t("dirUserAgentBody")}
              example="User-agent: *"
            />

            <DirectiveCard
              directive="Allow"
              title={t("dirAllowTitle")}
              description={t("dirAllowBody")}
              example="Allow: /"
            />

            <DirectiveCard
              directive="Disallow"
              title={t("dirDisallowTitle")}
              description={t("dirDisallowBody")}
              example="Disallow: /private/"
            />

            <DirectiveCard
              directive="Sitemap"
              title={t("dirSitemapTitle")}
              description={t("dirSitemapBody")}
              example="Sitemap: https://example.com/sitemap.xml"
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  {t("howEyebrow")}
                </p>

                <h2 className="mt-4 text-3xl font-bold">
                  {t("howTitle")}
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  {t("howBody")}
                </p>

              </div>


              <div className="space-y-4">

                <StepCard
                  number="1"
                  title={t("how1Title")}
                  description={t("how1Body")}
                />

                <StepCard
                  number="2"
                  title={t("how2Title")}
                  description={t("how2Body")}
                />

                <StepCard
                  number="3"
                  title={t("how3Title")}
                  description={t("how3Body")}
                />

                <StepCard
                  number="4"
                  title={t("how4Title")}
                  description={t("how4Body")}
                />

              </div>

            </div>

          </div>


          {/* IMPORTANT DISTINCTION */}

          <div className="mt-16 rounded-[32px] border border-violet-400/15 bg-violet-400/[0.04] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-8 lg:grid-cols-[auto_1fr]">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-lg font-bold text-violet-300">
                !
              </div>


              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  {t("distEyebrow")}
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  {t("distTitle")}
                </h2>

                <p className="mt-4 max-w-4xl leading-8 text-slate-400">
                  {t("distBody")}
                </p>

              </div>

            </div>

          </div>


          {/* BEST PRACTICES */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
                {t("tipsEyebrow")}
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                {t("tipsTitle")}
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                {t("tipsP1")}
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                {t("tipsP2")}
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <BestPracticeCard
                title={t("tip1Title")}
                description={t("tip1Body")}
              />

              <BestPracticeCard
                title={t("tip2Title")}
                description={t("tip2Body")}
              />

              <BestPracticeCard
                title={t("tip3Title")}
                description={t("tip3Body")}
              />

              <BestPracticeCard
                title={t("tip4Title")}
                description={t("tip4Body")}
              />

            </div>

          </div>


          {/* COMMON MISTAKES */}

          <div className="mt-16">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
                {t("mistakesEyebrow")}
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                {t("mistakesTitle")}
              </h2>

            </div>


            <div className="mt-8 grid gap-4 md:grid-cols-3">

              <MistakeCard
                title={t("mistake1Title")}
                description={t("mistake1Body")}
              />

              <MistakeCard
                title={t("mistake2Title")}
                description={t("mistake2Body")}
              />

              <MistakeCard
                title={t("mistake3Title")}
                description={t("mistake3Body")}
              />

            </div>

          </div>


          {/* CONTINUE TECHNICAL SEO WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                {t("nextEyebrow")}
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t("nextTitle")}
              </h2>

              <p className="mt-4 leading-8 text-slate-400">
                {t("nextBody")}
              </p>

            </div>


            <div className="mt-10 grid gap-5 lg:grid-cols-3">

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.055] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-lg text-emerald-300">
                    🤖
                  </div>

                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {t("wfStep1")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {tc("robotsTxtGenerator.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf1Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-emerald-300">
                  {t("wf1Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block">
                    ✓
                  </span>
                </div>

              </div>


              <Link
                href="/tools/xml-sitemap-generator"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300">
                    ⌘
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("wfStep2")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-cyan-300">
                  {tc("xmlSitemapGenerator.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf2Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  {t("wf2Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>


              <Link
                href="/tools/seo-analyzer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-lg text-blue-300">
                    ⌕
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("wfStep3")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  {tc("seoAnalyzer.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf3Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  {t("wf3Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/http-status-checker"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("httpStatusChecker.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/seo-page-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("seoPageAnalyzer.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/page-speed"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("pageSpeed.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tCommon("viewAllTools")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


function DirectiveCard({
  directive,
  title,
  description,
  example,
}: {
  directive: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">

      <div className="inline-flex rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 font-mono text-xs font-bold text-emerald-300" data-ltr-text>
        {directive}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 px-3 py-2 font-mono text-xs leading-5 text-slate-400" data-ltr-text>
        {example}
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
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 font-bold text-emerald-300" data-ltr-text>
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


function MistakeCard({
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
