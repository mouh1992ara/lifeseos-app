"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { escapeHtmlAttribute, escapeHtmlText } from "@/lib/tool-input";

import ShareTool from "@/components/share-tool";

export default function MetaTagGeneratorPage() {
  const t = useTranslations("Tool.metaTag");
  const tc = useTranslations("Tools.catalog");
  const tCommon = useTranslations("Common");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const hasTrackedUse = useRef(false);
  const prefillHandledRef = useRef(false);

  useEffect(() => {
    if (prefillHandledRef.current) {
      return;
    }

    prefillHandledRef.current = true;

    const params = new URLSearchParams(
      window.location.search
    );

    const incomingTitle = params
      .get("title")
      ?.trim()
      .slice(0, 200);

    const incomingDescription = params
      .get("description")
      ?.trim()
      .slice(0, 400);

    if (incomingTitle) {
      setTitle(incomingTitle);
    }

    if (incomingDescription) {
      setDescription(incomingDescription);
    }
  }, []);

  const titleLength = title.length;
  const descriptionLength = description.length;

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
              "Meta Tag Generator",
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to record Meta Tag Generator usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  function handleTitleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setTitle(event.target.value);

    if (event.target.value.trim()) {
      void recordToolUseOnce();
    }
  }

  function handleDescriptionChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setDescription(event.target.value);

    if (event.target.value.trim()) {
      void recordToolUseOnce();
    }
  }

  function getTitleStatus() {
    if (titleLength === 0) {
      return {
        text: t("statusStart"),
        className: "text-slate-500",
      };
    }

    if (
      titleLength >= 50 &&
      titleLength <= 60
    ) {
      return {
        text: t("statusGood"),
        className: "text-emerald-300",
      };
    }

    if (titleLength < 50) {
      return {
        text: t("statusShort"),
        className: "text-amber-300",
      };
    }

    return {
      text: t("statusLong"),
      className: "text-amber-300",
    };
  }

  function getDescriptionStatus() {
    if (descriptionLength === 0) {
      return {
        text: t("statusStart"),
        className: "text-slate-500",
      };
    }

    if (
      descriptionLength >= 140 &&
      descriptionLength <= 160
    ) {
      return {
        text: t("statusGood"),
        className: "text-emerald-300",
      };
    }

    if (descriptionLength < 140) {
      return {
        text: t("statusShort"),
        className: "text-amber-300",
      };
    }

    return {
      text: t("statusLong"),
      className: "text-amber-300",
    };
  }

  const titleStatus = getTitleStatus();
  const descriptionStatus =
    getDescriptionStatus();

  return (
    <main data-tool-surface className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">

        {/* HERO */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-medium text-fuchsia-300">
            <span aria-hidden="true">&lt;/&gt;</span>

            <span>
              {t("badge")}
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("titleLine1")}

            <span className="mt-2 block bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
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

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
              {t("formEyebrow")}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {t("formTitle")}
            </h2>


            <label className="mt-6 block text-sm font-semibold text-slate-200">
              {t("titleLabel")}
            </label>

            <input
              value={title}
              onChange={handleTitleChange}
              placeholder={t("titlePlaceholder")}
              dir="ltr"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-start text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-400/60"
            />

            <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">

              <span className="text-slate-500">
                {t("titleHint")}
              </span>

              <div className="flex gap-3">
                <span className={titleStatus.className}>
                  {titleStatus.text}
                </span>

                <span className="text-slate-300">
                  {t("charsCount", { count: titleLength })}
                </span>
              </div>

            </div>


            <label className="mt-8 block text-sm font-semibold text-slate-200">
              {t("descriptionLabel")}
            </label>

            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder={t("descriptionPlaceholder")}
              rows={7}
              className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-400/60"
            />

            <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">

              <span className="text-slate-500">
                {t("descriptionHint")}
              </span>

              <div className="flex gap-3">
                <span className={descriptionStatus.className}>
                  {descriptionStatus.text}
                </span>

                <span className="text-slate-300">
                  {t("charsCount", { count: descriptionLength })}
                </span>
              </div>

            </div>

          </section>


          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              {t("outputEyebrow")}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {t("outputTitle")}
            </h2>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/30 p-5">

              <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300" data-ltr-text>
{`<title>${escapeHtmlText(title || t("titleFallback"))}</title>

<meta name="description" content="${escapeHtmlAttribute(
                description || t("descriptionFallback")
              )}" />`}
              </pre>

            </div>


            <div className="mt-8">

              <p className="text-sm font-semibold text-slate-300">
                {t("previewTitle")}
              </p>

              <div className="mt-4 rounded-2xl bg-white p-5 text-slate-900 shadow-xl">

                <p className="truncate text-xl font-medium text-blue-700">
                  {title || t("titleFallback")}
                </p>

                <p className="mt-1 text-sm text-emerald-700" data-ltr-text>
                  https://example.com/page
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {description || t("descriptionFallback")}
                </p>

              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {t("previewNote")}
              </p>

            </div>

          </section>

        </div>


        <div className="mt-10">

          <ShareTool
            title={tc("metaTagGenerator.title")}
            description={t("shareBody")}
          />

        </div>

      </section>


      {/* SEO CONTENT */}

      <section className="border-t border-white/10">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          {/* WHAT ARE META TAGS */}

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
              {t("infoEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("infoTitle")}
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              {t("infoP1")}
            </p>

          </div>


          {/* EXPLANATION CARDS */}

          <div className="mt-12 grid gap-6 md:grid-cols-2">

            <InfoCard
              icon="T"
              title={t("titleCardTitle")}
              description={t("titleCardBody")}
              points={[
                t("titlePoint1"),
                t("titlePoint2"),
                t("titlePoint3"),
                t("titlePoint4"),
              ]}
            />

            <InfoCard
              icon="D"
              title={t("descCardTitle")}
              description={t("descCardBody")}
              points={[
                t("descPoint1"),
                t("descPoint2"),
                t("descPoint3"),
                t("descPoint4"),
              ]}
            />

          </div>


          {/* HOW TO USE */}

          <div className="mt-16 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">
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


          {/* BEST PRACTICES */}

          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
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

              <TipCard
                title={t("tip1Title")}
                description={t("tip1Body")}
              />

              <TipCard
                title={t("tip2Title")}
                description={t("tip2Body")}
              />

              <TipCard
                title={t("tip3Title")}
                description={t("tip3Body")}
              />

              <TipCard
                title={t("tip4Title")}
                description={t("tip4Body")}
              />

            </div>

          </div>


          {/* IMPORTANT NOTE */}

          <div className="mt-16 rounded-[28px] border border-amber-400/15 bg-amber-400/[0.04] p-6 sm:p-8">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 font-bold text-amber-300">
                !
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  {t("noteTitle")}
                </h2>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
                  {t("noteBody")}
                </p>

              </div>

            </div>

          </div>


          {/* CONTINUE SEO WORKFLOW */}

          <div className="mt-20">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
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

              <div className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/[0.05] p-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 font-bold text-fuchsia-300">
                    T
                  </div>

                  <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold text-fuchsia-300">
                    {t("wfStep1")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {tc("metaTagGenerator.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf1Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-fuchsia-300">
                  {t("wf1Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block">
                    ✓
                  </span>
                </div>

              </div>


              <Link
                href="/tools/serp-snippet-preview"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-lg text-blue-300">
                    ◫
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("wfStep2")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-blue-300">
                  {tc("serpSnippetPreview.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf2Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-blue-300">
                  {t("wf2Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>


              <Link
                href="/tools/seo-page-analyzer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-lg text-cyan-300">
                    ⌕
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
                    {t("wfStep3")}
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-semibold text-white transition group-hover:text-cyan-300">
                  {tc("seoPageAnalyzer.title")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {t("wf3Body")}
                </p>

                <div className="mt-5 text-sm font-semibold text-cyan-300">
                  {t("wf3Cta")}
                  <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                    →
                  </span>
                </div>

              </Link>

            </div>


            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/tools/content-analyzer"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-fuchsia-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("contentAnalyzer.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools/keyword-density-checker"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-fuchsia-400/20 hover:bg-white/[0.05] hover:text-white"
              >
                {tc("keywordDensityChecker.title")}
                <span aria-hidden="true" className="ms-1 inline-block rtl:rotate-180">
                  →
                </span>
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-fuchsia-400/20 hover:bg-white/[0.05] hover:text-white"
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


function InfoCard({
  icon,
  title,
  description,
  points,
}: {
  icon: string;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 sm:p-7">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 font-bold text-fuchsia-300">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

      <ul className="mt-5 space-y-2">

        {points.map((point) => (

          <li
            key={point}
            className="flex items-start gap-3 text-sm text-slate-300"
          >
            <span className="mt-0.5 text-emerald-400" aria-hidden="true">
              ✓
            </span>

            <span>
              {point}
            </span>
          </li>

        ))}

      </ul>

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

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 font-bold text-fuchsia-300" data-ltr-text>
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


function TipCard({
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
