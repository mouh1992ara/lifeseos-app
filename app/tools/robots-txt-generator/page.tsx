"use client";

import { useMemo, useRef, useState } from "react";
import ShareTool from "@/components/share-tool";

export default function RobotsTxtGeneratorPage() {
  const [userAgent, setUserAgent] = useState("*");
  const [allowPath, setAllowPath] = useState("/");
  const [disallowPaths, setDisallowPaths] = useState("");
  const [sitemap, setSitemap] = useState("");

  const hasTrackedUse = useRef(false);

  const robotsTxt = useMemo(() => {
    const lines = [`User-agent: ${userAgent || "*"}`];

    if (allowPath.trim()) {
      lines.push(`Allow: ${allowPath.trim()}`);
    }

    const disallowList = disallowPaths
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    disallowList.forEach((path) => {
      lines.push(`Disallow: ${path}`);
    });

    if (sitemap.trim()) {
      lines.push("");
      lines.push(`Sitemap: ${sitemap.trim()}`);
    }

    return lines.join("\n");
  }, [userAgent, allowPath, disallowPaths, sitemap]);

  async function recordToolUseOnce() {
    if (hasTrackedUse.current) {
      return;
    }

    hasTrackedUse.current = true;

    try {
      const response = await fetch("/api/tool-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool_name: "Robots.txt Generator",
        }),
      });

      if (!response.ok) {
        console.error(
          "Failed to record Robots.txt Generator usage."
        );
      }
    } catch (trackingError) {
      console.error(
        "Unable to record tool usage:",
        trackingError
      );
    }
  }

  function handleUserAgentChange(value: string) {
    setUserAgent(value);
    void recordToolUseOnce();
  }

  function handleAllowPathChange(value: string) {
    setAllowPath(value);
    void recordToolUseOnce();
  }

  function handleDisallowPathsChange(value: string) {
    setDisallowPaths(value);
    void recordToolUseOnce();
  }

  function handleSitemapChange(value: string) {
    setSitemap(value);
    void recordToolUseOnce();
  }

  async function copyRobotsTxt() {
    await navigator.clipboard.writeText(robotsTxt);

    void recordToolUseOnce();
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          SEO Tool
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Robots.txt Generator
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Create a clean robots.txt file to control how search engine crawlers
          access sections of your website.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label className="text-sm font-semibold">
            User-agent
          </label>

          <input
            value={userAgent}
            onChange={(e) =>
              handleUserAgentChange(e.target.value)
            }
            placeholder="*"
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <p className="mt-2 text-xs text-slate-500">
            Use * to target all crawlers.
          </p>

          <label className="mt-8 block text-sm font-semibold">
            Allow path
          </label>

          <input
            value={allowPath}
            onChange={(e) =>
              handleAllowPathChange(e.target.value)
            }
            placeholder="/"
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <label className="mt-8 block text-sm font-semibold">
            Disallow paths
          </label>

          <textarea
            value={disallowPaths}
            onChange={(e) =>
              handleDisallowPathsChange(e.target.value)
            }
            placeholder={"/admin/\n/private/\n/search/"}
            rows={6}
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />

          <p className="mt-2 text-xs text-slate-500">
            Enter one path per line.
          </p>

          <label className="mt-8 block text-sm font-semibold">
            Sitemap URL
          </label>

          <input
            value={sitemap}
            onChange={(e) =>
              handleSitemapChange(e.target.value)
            }
            placeholder="https://example.com/sitemap.xml"
            className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Generated robots.txt
            </h2>

            <button
              type="button"
              onClick={copyRobotsTxt}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Copy
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-black/30 p-5">
            <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300">
              {robotsTxt}
            </pre>
          </div>

          <div className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <p className="text-sm leading-6 text-amber-200">
              Robots.txt controls crawler access, but it should not be used to
              protect sensitive information.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold">
          How to use this tool
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Choose the crawler you want to target, define allowed and blocked
          paths, then optionally add your sitemap URL. Copy the generated
          content and save it as robots.txt in the root directory of your
          website.
        </p>
      </section>

      <ShareTool
        title="Robots.txt Generator"
        description="Create a clean robots.txt file and manage crawler access with this free LifeSeos tool."
      />
    </>
  );
}