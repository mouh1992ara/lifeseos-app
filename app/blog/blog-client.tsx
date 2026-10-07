"use client";

import Link from "next/link";

import {
  articles,
  type BlogArticle,
} from "./articles";

const categories = [
  "All Guides",
  "Technical SEO",
  "On-Page SEO",
  "Content SEO",
  "Performance",
];

type ArticleVisual = {
  icon: string;
  gradient: string;
  accent: string;
};

const articleVisuals: Record<string, ArticleVisual> = {
  "complete-seo-audit-guide": {
    icon: "search",
    gradient:
      "from-blue-500/30 via-cyan-400/10 to-transparent",
    accent: "text-cyan-300",
  },

  "seo-meta-tags-guide": {
    icon: "code",
    gradient:
      "from-violet-500/30 via-fuchsia-400/10 to-transparent",
    accent: "text-violet-300",
  },

  "page-speed-seo-guide": {
    icon: "speed",
    gradient:
      "from-emerald-500/30 via-cyan-400/10 to-transparent",
    accent: "text-emerald-300",
  },

  "xml-sitemap-guide": {
    icon: "sitemap",
    gradient:
      "from-sky-500/30 via-blue-400/10 to-transparent",
    accent: "text-sky-300",
  },

  "robots-txt-guide": {
    icon: "robot",
    gradient:
      "from-fuchsia-500/30 via-violet-400/10 to-transparent",
    accent: "text-fuchsia-300",
  },

  "http-status-codes-seo": {
    icon: "server",
    gradient:
      "from-orange-500/30 via-amber-400/10 to-transparent",
    accent: "text-amber-300",
  },

  "keyword-density-guide": {
    icon: "keyword",
    gradient:
      "from-pink-500/30 via-rose-400/10 to-transparent",
    accent: "text-pink-300",
  },

  "content-analysis-seo-guide": {
    icon: "document",
    gradient:
      "from-teal-500/30 via-emerald-400/10 to-transparent",
    accent: "text-teal-300",
  },

  "on-page-seo-checklist": {
    icon: "check",
    gradient:
      "from-indigo-500/30 via-violet-400/10 to-transparent",
    accent: "text-indigo-300",
  },
};

const fallbackVisual: ArticleVisual = {
  icon: "check",
  gradient:
    "from-blue-500/30 via-violet-400/10 to-transparent",
  accent: "text-cyan-300",
};

function getArticleVisual(article: BlogArticle) {
  return articleVisuals[article.slug] ?? fallbackVisual;
}

export default function BlogClient() {
  const featuredArticle =
    articles.find(
      (article) =>
        article.slug === "complete-seo-audit-guide"
    ) ?? articles[0];

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* HERO */}
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.14),transparent_36%)]" />

        <div className="absolute left-[8%] top-28 h-64 w-64 animate-pulse rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="absolute right-[10%] top-20 h-72 w-72 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 sm:pt-28 lg:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <SparkIcon />
              SEO Insights & Guides
            </div>

            <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Learn SEO.

              <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Grow Smarter.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Practical SEO tutorials, technical guides and
              actionable strategies designed to help you
              understand your website and improve it with
              confidence.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <span
                  key={category}
                  className={
                    index === 0
                      ? "rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300"
                      : "rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
                  }
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featuredArticle && (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Featured guide
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Start with the fundamentals
              </h2>
            </div>
          </div>

          <Link
            href={`/blog/${featuredArticle.slug}`}
            className="group relative block overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-400/5 to-emerald-400/10 opacity-80 transition duration-700 group-hover:scale-105" />

            <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:p-12">
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                    {featuredArticle.category}
                  </span>

                  <span className="text-slate-500">
                    {featuredArticle.readTime}
                  </span>
                </div>

                <h3 className="mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  {featuredArticle.title}
                </h3>

                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
                  {featuredArticle.description}
                </p>

                <div className="mt-8 inline-flex items-center gap-3 font-semibold text-emerald-300">
                  Read the complete guide

                  <span className="transition duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </div>

            <div className="relative flex min-h-[320px] items-center justify-center">

  <div className="absolute h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl transition duration-700 group-hover:scale-125" />

  <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 shadow-2xl transition duration-500 group-hover:-translate-y-3 group-hover:rotate-1">

    <img
      src={featuredArticle.featuredImage}
      alt={featuredArticle.imageAlt}
      className="h-72 w-full object-cover sm:h-80"
      loading="eager"
    />

  </div>

</div>
            </div>
          </Link>
        </section>
      )}

      {/* ARTICLES */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-9">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
            Latest knowledge
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Explore SEO guides
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Each guide connects directly with a LifeSeos tool
            so you can learn the concept and immediately put it
            into practice.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* MID PAGE CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-900/80 p-8 sm:p-12 lg:p-14">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="font-semibold text-emerald-300">
                Learn it. Test it. Improve it.
              </p>

              <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                Turn every SEO lesson into an actionable
                improvement.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                LifeSeos gives you practical tools to analyze
                pages, evaluate content, test performance and
                identify technical SEO problems.
              </p>
            </div>

            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-7 py-4 font-bold text-slate-950 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(52,211,153,0.18)]"
            >
              Explore SEO Tools
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
            <BookIcon />
          </div>

          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Keep learning. Keep improving.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            Explore practical SEO guides and use LifeSeos
            tools alongside them to understand exactly what is
            happening on your website.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/tools"
              className="rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Browse Tools
            </Link>

            <Link
              href="/about"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              About LifeSeos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ArticleCard({
  article,
  index,
}: {
  article: BlogArticle;
  index: number;
}) {
  const visual = getArticleVisual(article);

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-6 transition duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
      style={{
        animation: "blogCardEnter 700ms ease both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div
        className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${visual.gradient} opacity-70 transition duration-500 group-hover:opacity-100`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 ${visual.accent} transition duration-500 group-hover:scale-110 group-hover:-rotate-3`}
          >
            <ArticleIcon name={visual.icon} />
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
            {article.readTime}
          </span>
        </div>

        <div className="mt-7">
          <p
            className={`text-sm font-semibold ${visual.accent}`}
          >
            {article.category}
          </p>

          <h3 className="mt-3 text-xl font-bold leading-snug transition group-hover:text-white sm:text-2xl">
            {article.title}
          </h3>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-400">
            {article.description}
          </p>
        </div>

        <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-300 transition group-hover:text-white">
          Read guide

          <span className="transition duration-300 group-hover:translate-x-2">
            →
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes blogCardEnter {
          from {
            opacity: 0;
            transform: translateY(28px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Link>
  );
}

function ArticleIcon({
  name,
}: {
  name: string;
}) {
  const props = {
    width: 27,
    height: 27,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "search") {
    return (
      <svg {...props}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
        <path d="M8 11h6" />
        <path d="M11 8v6" />
      </svg>
    );
  }

  if (name === "code") {
    return (
      <svg {...props}>
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
      </svg>
    );
  }

  if (name === "speed") {
    return (
      <svg {...props}>
        <path d="M5 19a9 9 0 1 1 14 0" />
        <path d="m12 13 4-4" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  if (name === "sitemap") {
    return (
      <svg {...props}>
        <rect
          x="9"
          y="3"
          width="6"
          height="4"
          rx="1"
        />

        <rect
          x="3"
          y="17"
          width="6"
          height="4"
          rx="1"
        />

        <rect
          x="15"
          y="17"
          width="6"
          height="4"
          rx="1"
        />

        <path d="M12 7v5" />
        <path d="M6 17v-5h12v5" />
      </svg>
    );
  }

  if (name === "robot") {
    return (
      <svg {...props}>
        <rect
          x="4"
          y="7"
          width="16"
          height="12"
          rx="3"
        />

        <path d="M12 3v4" />
        <circle cx="9" cy="13" r="1" />
        <circle cx="15" cy="13" r="1" />
        <path d="M8 17h8" />
      </svg>
    );
  }

  if (name === "server") {
    return (
      <svg {...props}>
        <rect
          x="4"
          y="4"
          width="16"
          height="6"
          rx="2"
        />

        <rect
          x="4"
          y="14"
          width="16"
          height="6"
          rx="2"
        />

        <path d="M8 7h.01" />
        <path d="M8 17h.01" />
      </svg>
    );
  }

  if (name === "keyword") {
    return (
      <svg {...props}>
        <circle cx="8" cy="15" r="4" />
        <path d="m11 12 8-8" />
        <path d="m16 7 2 2" />
        <path d="m14 9 2 2" />
      </svg>
    );
  }

  if (name === "document") {
    return (
      <svg {...props}>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />

      <path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
    </svg>
  );
}

function SearchIconLarge() {
  return (
    <svg
      width="118"
      height="118"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-cyan-300"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="6.5"
      />

      <path d="m15.5 15.5 5 5" />
      <path d="M7.5 10.5h6" />
      <path d="M10.5 7.5v6" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="text-blue-300"
    >
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="text-emerald-300"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />

      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </svg>
  );
}