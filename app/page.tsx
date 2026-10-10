import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileCode2,
  FileSearch,
  FileText,
  Gauge,
  Gift,
  Globe2,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  WandSparkles,
  Wrench,
  Youtube,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free SEO Tools for Website Analysis and Optimization",
  description:
    "Analyze websites, improve content, generate schema markup, optimize YouTube metadata and solve technical SEO issues with free LifeSeos tools.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LifeSeos - Free SEO Tools for Smarter Growth",
    description:
      "Analyze websites, improve content, generate structured data and use practical SEO and YouTube optimization tools with LifeSeos.",
    url: "/",
    type: "website",
  },
};

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
    description:
      "LifeSeos provides free tools for website analysis, technical SEO, content optimization, structured data and YouTube SEO workflows.",
    logo: "https://www.lifeseos.com/opengraph-image.png",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
    description:
      "Free tools for website analysis, technical SEO, content optimization, structured data and YouTube SEO.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is LifeSeos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "LifeSeos provides free SEO tools that help website owners analyze, optimize and improve website performance.",
        },
      },
      {
        "@type": "Question",
        name: "Are LifeSeos SEO tools free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. LifeSeos provides free SEO tools for website analysis, technical SEO, content optimization and search performance improvement.",
        },
      },
      {
        "@type": "Question",
        name: "What SEO tools are available on LifeSeos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "LifeSeos provides website analysis, technical SEO, content optimization, schema markup, metadata, sitemap and YouTube SEO tools.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need SEO experience to use LifeSeos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. LifeSeos tools are designed for beginners, marketers, developers and website owners.",
        },
      },
      {
        "@type": "Question",
        name: "Can LifeSeos improve my Google rankings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "LifeSeos helps identify SEO issues and optimization opportunities, but rankings also depend on content quality, competition and other search factors.",
        },
      },
    ],
  };

  const tools = [
    {
      title: "SEO Analyzer",
      description:
        "Analyze your website health, technical SEO and optimization opportunities.",
      href: "/tools/seo-analyzer",
      icon: Search,
      featured: true,
    },
    {
      title: "SEO Page Analyzer",
      description:
        "Review titles, descriptions, headings, links and image alt text.",
      href: "/tools/seo-page-analyzer",
      icon: FileSearch,
      featured: true,
    },
    {
      title: "Page Speed Analyzer",
      description:
        "Review website performance, loading speed and important Lighthouse metrics.",
      href: "/tools/page-speed",
      icon: Gauge,
      featured: true,
    },
    {
      title: "Content Analyzer",
      description:
        "Analyze content length, readability, keywords and basic SEO quality signals.",
      href: "/tools/content-analyzer",
      icon: BarChart3,
      featured: true,
    },
    {
      title: "HTTP Status Checker",
      description:
        "Detect redirects, errors and technical website issues.",
      href: "/tools/http-status-checker",
      icon: Zap,
      featured: true,
    },
    {
      title: "XML Sitemap Generator",
      description:
        "Create search-engine friendly sitemap structures.",
      href: "/tools/xml-sitemap-generator",
      icon: Globe2,
      featured: true,
    },
    {
      title: "Meta Tag Generator",
      description:
        "Create optimized titles and descriptions for better search visibility.",
      href: "/tools/meta-tag-generator",
      icon: Sparkles,
    },
    {
      title: "SERP Snippet Preview",
      description:
        "Preview how your title, meta description and URL may appear in Google search results.",
      href: "/tools/serp-snippet-preview",
      icon: FileSearch,
    },
    {
      title: "Robots.txt Generator",
      description:
        "Generate crawler rules and improve search engine accessibility.",
      href: "/tools/robots-txt-generator",
      icon: Wrench,
    },
    {
      title: "Keyword Density Checker",
      description:
        "Understand keyword usage and improve your content strategy.",
      href: "/tools/keyword-density-checker",
      icon: BarChart3,
    },
    {
      title: "Schema Markup Generator",
      description:
        "Generate JSON-LD structured data for articles, FAQs, products and businesses.",
      href: "/tools/schema-markup-generator",
      icon: FileCode2,
    },
    {
      title: "SEO Article Rewriter",
      description:
        "Rewrite website content for better clarity, readability, tone and SEO consistency.",
      href: "/tools/article-rewriter",
      icon: WandSparkles,
    },
    {
      title: "YouTube Keyword Ideas",
      description:
        "Generate useful keyword groups, long-tail phrases and video topic ideas.",
      href: "/tools/youtube-keyword-ideas",
      icon: Tags,
    },
    {
      title: "YouTube Title Generator",
      description:
        "Create engaging YouTube title ideas based on your topic, keyword and audience.",
      href: "/tools/youtube-title-generator",
      icon: Sparkles,
    },
    {
      title: "YouTube Title Analyzer",
      description:
        "Review title clarity, structure, keyword use, length and click appeal.",
      href: "/tools/youtube-title-analyzer",
      icon: FileSearch,
    },
    {
      title: "YouTube Description Generator",
      description:
        "Create structured YouTube descriptions with keyword support and calls to action.",
      href: "/tools/youtube-description-generator",
      icon: FileText,
    },
    {
      title: "YouTube Script Writer",
      description:
        "Build structured video scripts with hooks, main points, transitions and CTAs.",
      href: "/tools/youtube-script-writer",
      icon: Youtube,
    },
  ];

  const categories = [
    {
      icon: Layers3,
      title: "Technical SEO",
      description:
        "Find crawl, indexing, redirect and technical website issues.",
      links: [
        { label: "SEO Analyzer", href: "/tools/seo-analyzer" },
        { label: "HTTP Status Checker", href: "/tools/http-status-checker" },
        { label: "Robots.txt Generator", href: "/tools/robots-txt-generator" },
        {
          label: "Schema Markup Generator",
          href: "/tools/schema-markup-generator",
        },
      ],
    },
    {
      icon: FileSearch,
      title: "On-Page SEO",
      description:
        "Review page structure, metadata and important optimization signals.",
      links: [
        { label: "SEO Page Analyzer", href: "/tools/seo-page-analyzer" },
        { label: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
        { label: "SERP Snippet Preview", href: "/tools/serp-snippet-preview" },
        { label: "Content Analyzer", href: "/tools/content-analyzer" },
      ],
    },
    {
      icon: Globe2,
      title: "Crawling & Indexing",
      description:
        "Help search engines discover and understand your website.",
      links: [
        {
          label: "XML Sitemap Generator",
          href: "/tools/xml-sitemap-generator",
        },
        {
          label: "Robots.txt Generator",
          href: "/tools/robots-txt-generator",
        },
        { label: "SEO Analyzer", href: "/tools/seo-analyzer" },
      ],
    },
    {
      icon: Gauge,
      title: "Performance",
      description:
        "Measure loading performance and discover speed improvements.",
      links: [
        { label: "Page Speed Analyzer", href: "/tools/page-speed" },
        { label: "SEO Analyzer", href: "/tools/seo-analyzer" },
      ],
    },
    {
      icon: WandSparkles,
      title: "Content SEO",
      description:
        "Improve website copy, keyword usage and search-focused content.",
      links: [
        { label: "SEO Article Rewriter", href: "/tools/article-rewriter" },
        { label: "Content Analyzer", href: "/tools/content-analyzer" },
        {
          label: "Keyword Density Checker",
          href: "/tools/keyword-density-checker",
        },
      ],
    },
    {
      icon: Youtube,
      title: "YouTube SEO",
      description:
        "Plan video keywords, titles, descriptions and scripts in one workflow.",
      links: [
        {
          label: "YouTube Keyword Ideas",
          href: "/tools/youtube-keyword-ideas",
        },
        {
          label: "YouTube Title Generator",
          href: "/tools/youtube-title-generator",
        },
        {
          label: "YouTube Title Analyzer",
          href: "/tools/youtube-title-analyzer",
        },
        {
          label: "YouTube Description Generator",
          href: "/tools/youtube-description-generator",
        },
        {
          label: "YouTube Script Writer",
          href: "/tools/youtube-script-writer",
        },
      ],
    },
  ];

  const faq = [
    {
      q: "What is LifeSeos?",
      a: "LifeSeos provides free SEO tools that help website owners analyze, optimize and improve website performance.",
    },
    {
      q: "Are LifeSeos SEO tools free?",
      a: "Yes. LifeSeos provides free SEO tools for website analysis, technical SEO, content optimization and search performance improvement.",
    },
    {
      q: "What SEO tools are available on LifeSeos?",
      a: "LifeSeos provides website analysis, technical SEO, content optimization, schema markup, metadata, sitemap and YouTube SEO tools.",
    },
    {
      q: "Do I need SEO experience to use LifeSeos?",
      a: "No. LifeSeos tools are designed for beginners, marketers, developers and website owners.",
    },
    {
      q: "Can LifeSeos improve my Google rankings?",
      a: "LifeSeos helps identify SEO issues and optimization opportunities, but rankings also depend on content quality, competition and other search factors.",
    },
  ];

  return (
    <main className="relative isolate w-full overflow-x-hidden bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      {/* HERO */}

      <section className="relative overflow-hidden px-6 pb-12 pt-20 sm:px-10 lg:px-16 lg:pb-16 lg:pt-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />
          <div className="absolute right-0 top-20 h-[350px] w-[350px] rounded-full bg-emerald-400/10 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Free tools for smarter SEO decisions
            </div>

            <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Audit, analyze and
              <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                improve your SEO.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              Find technical SEO issues, improve website content, generate
              structured data and build stronger search and YouTube workflows.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/tools/seo-analyzer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Analyze Your Website
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 font-semibold transition hover:bg-white/[0.06]"
              >
                Explore Tools
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {["Free SEO tools", "Fast analysis", "Clear recommendations"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Dashboard Preview */}

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-emerald-400/20 to-blue-500/20 blur-3xl" />

            <div className="relative rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-slate-500">Website overview</p>
                  <p className="mt-1 font-semibold">example.com</p>
                </div>

                <div className="rounded-lg bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
                  SEO Audit
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6">
                {[
                  ["Technical SEO", "86"],
                  ["On-Page SEO", "91"],
                  ["Performance", "78"],
                  ["Content", "84"],
                ].map(([label, score]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-3 text-3xl font-bold">{score}</p>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out group-hover:brightness-110"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-400/5 px-4 py-3">
                  <span className="text-sm text-slate-300">
                    HTTPS configuration
                  </span>
                  <span className="text-xs font-medium text-emerald-300">
                    Passed
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-amber-400/5 px-4 py-3">
                  <span className="text-sm text-slate-300">
                    Meta description
                  </span>
                  <span className="text-xs font-medium text-amber-300">
                    Improve
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-red-400/5 px-4 py-3">
                  <span className="text-sm text-slate-300">
                    Broken links detected
                  </span>
                  <span className="text-xs font-medium text-red-300">
                    Fix issue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR TOOLS */}

      <section className="px-6 pb-24 pt-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                SEO Toolkit
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Popular SEO Tools
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                Analyze the areas of your website that matter most for search
                visibility and technical health.
              </p>
            </div>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter((tool) => tool.featured)
              .map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>

                      <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
                    </div>

                    <h3 className="mt-6 text-lg font-semibold">{tool.title}</h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {tool.description}
                    </p>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* NEW TOOL WORKFLOWS */}

      <section className="px-6 pb-10 pt-2 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            <Link
              href="/tools/schema-markup-generator"
              className="group rounded-[26px] border border-cyan-400/15 bg-cyan-400/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.055]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                <FileCode2 className="h-5 w-5 text-cyan-300" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Technical SEO
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Schema Markup Generator
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Generate JSON-LD for articles, FAQs, products, businesses,
                breadcrumbs and other common structured data types.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                Generate schema
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/tools/article-rewriter"
              className="group rounded-[26px] border border-blue-400/15 bg-blue-400/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-400/[0.055]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                <WandSparkles className="h-5 w-5 text-blue-300" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                Content SEO
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                SEO Article Rewriter
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Rewrite website content for better clarity, readability, tone
                and SEO consistency while preserving the main direction.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                Rewrite content
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/tools/youtube-keyword-ideas"
              className="group rounded-[26px] border border-red-400/15 bg-red-400/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-red-400/30 hover:bg-red-400/[0.055]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10">
                <Youtube className="h-5 w-5 text-red-300" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                YouTube SEO
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Build your YouTube workflow
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Move from keyword ideas to stronger titles, descriptions and
                structured video scripts with dedicated YouTube tools.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-300">
                Explore YouTube tools
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO COMMAND CENTER */}

      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-8 sm:p-12 lg:p-16">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-3 py-1.5 text-sm text-blue-300">
                <BarChart3 className="h-4 w-4" />
                SEO Command Center
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl">
                Understand your website from one SEO overview.
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-slate-400">
                Start with a complete website analysis, identify priority
                issues and then use specialized LifeSeos tools to investigate
                each area in more detail.
              </p>

              <Link
                href="/tools/seo-analyzer"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Run Website Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ["Technical SEO", "86", "Good"],
                ["Indexability", "94", "Strong"],
                ["On-Page SEO", "82", "Good"],
                ["Performance", "74", "Needs work"],
              ].map(([label, value, state]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-slate-950/60"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-3xl font-bold">{value}</span>
                    <span className="text-xs text-slate-400">{state}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TOOL CATEGORIES */}

      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Explore
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Tools for every part of SEO
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Find the right tool for technical SEO, content, performance,
              structured data or YouTube optimization.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <div
                  key={category.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                    <Icon className="h-5 w-5 text-blue-300" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {category.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {category.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {category.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-400/30 hover:text-emerald-300"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Improve your SEO in three steps
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Find problems, understand what they mean and take practical
              action.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Choose a tool",
                description:
                  "Select the SEO tool that matches the part of your website you want to analyze.",
              },
              {
                number: "02",
                title: "Analyze your website",
                description:
                  "Run the analysis and review important technical, content and performance signals.",
              },
              {
                number: "03",
                title: "Fix priority issues",
                description:
                  "Use the results and recommendations to improve your website step by step.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-7"
              >
                <span className="text-sm font-bold text-emerald-400">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}

<section className="px-6 py-20 sm:px-10 lg:px-16">
  <div className="mx-auto max-w-6xl">

    <div className="mb-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Why LifeSeos
      </p>

      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
        Simple, fast and built for everyday SEO
      </h2>

      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
        Use practical SEO tools without complicated setup, unnecessary steps
        or barriers.
      </p>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[
        {
          icon: Gift,
          title: "Free Tools",
          text: "Access useful SEO tools without paying for every analysis.",
        },
        {
          icon: Zap,
          title: "Fast Analysis",
          text: "Get clear SEO information without complicated workflows.",
        },
        {
          icon: CreditCard,
          title: "Easy to Start",
          text: "Explore core tools without unnecessary setup.",
        },
        {
          icon: ShieldCheck,
          title: "Built for Clarity",
          text: "Reports focus on useful information and practical improvements.",
        },
      ].map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-white/[0.04]"
          >
            <Icon className="h-7 w-7 text-emerald-400" />

            <h3 className="mt-5 font-semibold">{item.title}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {item.text}
            </p>
          </div>
        );
      })}
    </div>

  </div>
</section>

      {/* GUIDES */}

      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                Learn SEO
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                SEO guides and resources
              </h2>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400"
            >
              Browse all guides
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Robots.txt Guide",
                text: "Understand how robots.txt works and how search engines use it.",
                href: "/blog/robots-txt-guide",
              },
              {
                title: "HTTP Status Codes for SEO",
                text: "Learn what common HTTP status codes mean for crawling and indexing.",
                href: "/blog/http-status-codes-seo",
              },
              {
                title: "Technical SEO Guide",
                text: "Learn the technical foundations that help search engines understand your website.",
                href: "/blog/technical-seo-guide",
              },
            ].map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-blue-400/30"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                  Guide
                </p>

                <h3 className="mt-4 text-xl font-semibold">
                  {article.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {article.text}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  Read guide
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACCOUNT CTA */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl rounded-[30px] border border-emerald-400/20 bg-emerald-400/[0.05] p-9 text-center sm:p-12">
          <h2 className="text-3xl font-bold">
            Ready to understand your website SEO?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            Start with a website analysis and use LifeSeos tools to investigate
            technical, content and performance opportunities.
          </p>

          <form
            action="/tools/seo-analyzer"
            method="GET"
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                name="url"
                placeholder="https://example.com"
                aria-label="Website URL"
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
              />
            </div>

            <button
              type="submit"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_10px_30px_rgba(52,211,153,0.18)]"
            >
              Analyze Website
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-4 flex justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Open Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/sign-up"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}

      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <div className="mt-10 space-y-4">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] transition duration-300 open:border-emerald-400/20 open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition duration-300 group-open:rotate-180 group-open:border-emerald-400/20 group-open:text-emerald-400">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>

                <div className="px-6 pb-6">
                  <div className="mb-5 h-px bg-white/10" />
                  <p className="leading-7 text-slate-400">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}