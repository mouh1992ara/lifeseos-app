"use client";

import { useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Braces,
  Bot,
  FileSearch,
  FileText,
  Gauge,
  Globe,
  Monitor,
  Server,
  Sparkles,
  Tag,
  Target,
  TextSearch,
  TrendingUp,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import YouTubeMark from "@/components/youtube-mark";
import { Link } from "@/i18n/navigation";
import { toolHref, type ToolCategory, type ToolEntry } from "@/lib/tool-catalog";

/** Every tool gets one glyph and one accent, so cards read as one system. */
export const TOOL_ICON: Record<string, LucideIcon | null> = {
  seoAnalyzer: FileSearch,
  seoPageAnalyzer: FileText,
  robotsTxtGenerator: Bot,
  xmlSitemapGenerator: Globe,
  schemaMarkupGenerator: Braces,
  httpStatusChecker: Server,
  metaTagGenerator: Tag,
  serpSnippetPreview: Monitor,
  pageSpeed: Gauge,
  keywordDensityChecker: Target,
  articleRewriter: WandSparkles,
  contentAnalyzer: TrendingUp,
  youtubeKeywordIdeas: Sparkles,
  youtubeTitleGenerator: Sparkles,
  youtubeTitleAnalyzer: TextSearch,
  youtubeDescriptionGenerator: FileText,
  youtubeScriptWriter: TextSearch,
};

export const TOOL_ACCENT: Record<ToolCategory, string> = {
  technical: "#60a5fa",
  onPage: "#34d399",
  crawling: "#22d3ee",
  performance: "#a78bfa",
  content: "#2dd4bf",
  youtube: "#ff3b5c",
};

/**
 * A tool card.
 *
 * Hover motion is a uniform lift owned by CSS (`.tool-card` in liquid-glass.css),
 * not a pointer-tracking tilt. The tilt ran a getBoundingClientRect plus two
 * style writes on every pointermove across a 17-card grid; it read as jitter on
 * diagonal movement and bought nothing a consistent lift does not.
 */
export default function ToolCard({
  tool,
  index,
}: {
  tool: ToolEntry;
  index: number;
}) {
  const catalog = useTranslations("Tools.catalog");
  const tc = useTranslations("Tools.categories");
  const common = useTranslations("Common");

  const Icon = TOOL_ICON[tool.key] ?? FileSearch;
  const accent = TOOL_ACCENT[tool.primary];
  const isYouTube = tool.primary === "youtube";

  return (
    <Link
      href={toolHref(tool)}
      data-tool-card={tool.key}
      data-tool-category={tool.primary}
      className="tool-card group relative flex flex-col rounded-[22px] border border-white/[0.07] bg-white/[0.022] p-5 sm:p-6"
      style={{
        ["--accent" as string]: accent,
        ["--i" as string]: index,
      }}
    >
      {/* Gradient border + corner bloom, both driven by the same accent. */}
      <span aria-hidden="true" className="tool-card-border" />
      <span aria-hidden="true" className="tool-card-glow" />

      <div className="relative flex items-start justify-between gap-3">
        <span className="tool-card-icon flex h-11 w-11 items-center justify-center rounded-[14px] sm:h-12 sm:w-12">
          {isYouTube ? (
            <YouTubeMark className="tool-card-glyph h-[22px] w-[22px] text-[#ff3b5c]" />
          ) : (
            <Icon className="tool-card-glyph h-[21px] w-[21px]" aria-hidden="true" />
          )}
        </span>

        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{
            color: accent,
            borderColor: `${accent}33`,
            backgroundColor: `${accent}0f`,
          }}
        >
          {tc(tool.primary)}
        </span>
      </div>

      <h3 className="relative mt-4 text-[15px] font-semibold leading-snug text-white sm:text-base">
        {catalog(`${tool.key}.title`)}
      </h3>

      <p className="relative mt-2 line-clamp-3 text-[13px] leading-6 text-slate-400">
        {catalog(`${tool.key}.short`)}
      </p>

      <span className="tool-card-cta relative mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold">
        {common("openTool")}
        <ArrowUpRight className="tool-card-arrow h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}