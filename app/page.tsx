import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free SEO Tools for Website Analysis and Optimization",
  description:
    "Analyze websites, check technical SEO, generate metadata, review keyword usage, create sitemaps and improve search performance with free LifeSeos tools.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LifeSeos - Free SEO Tools for Smarter Growth",
    description:
      "Analyze websites, discover SEO issues and improve your search performance with free LifeSeos tools.",
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
      "LifeSeos provides free SEO tools for website analysis, technical SEO, metadata optimization, keyword analysis and search performance.",
    logo: "https://www.lifeseos.com/opengraph-image.png",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
    description:
      "Free SEO tools for website analysis, technical SEO and smarter search growth.",
  };

  const tools = [
    {
      title: "SEO Analyzer",
      description:
        "Analyze your website health, technical SEO and optimization opportunities.",
      href: "/tools/seo-analyzer",
      icon: "🔍",
    },
    {
      title: "Meta Tag Generator",
      description:
        "Create optimized titles and descriptions for better search visibility.",
      href: "/tools/meta-tag-generator",
      icon: "✨",
    },
    {
      title: "Robots.txt Generator",
      description:
        "Generate crawler rules and improve search engine accessibility.",
      href: "/tools/robots-txt-generator",
      icon: "🤖",
    },
    {
      title: "Keyword Density Checker",
      description:
        "Understand keyword usage and improve your content strategy.",
      href: "/tools/keyword-density-checker",
      icon: "📊",
    },
    {
      title: "HTTP Status Checker",
      description:
        "Detect redirects, errors and technical website issues.",
      href: "/tools/http-status-checker",
      icon: "⚡",
    },
    {
      title: "XML Sitemap Generator",
      description:
        "Create search-engine friendly sitemap structures.",
      href: "/tools/xml-sitemap-generator",
      icon: "🌐",
    },
  ];

 return (
  <main className="overflow-hidden bg-slate-950 text-white">

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

    {/* HERO */}

      <section className="relative">

        <div
          className="
          absolute
          left-1/2
          top-20
          h-96
          w-96
          -translate-x-1/2
          rounded-full
          bg-blue-600/20
          blur-3xl
          "
        />

        <div
          className="
          relative
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          px-6
          py-24
          text-center
          "
        >

          <div
            className="
            rounded-full
            border
            border-emerald-400/20
            bg-emerald-400/10
            px-5
            py-2
            text-sm
            text-emerald-300
            "
          >
            🚀 Free SEO tools for smarter growth
          </div>

          <h1
            className="
            mt-8
            max-w-5xl
            text-5xl
            font-black
            leading-tight
            md:text-7xl
            "
          >
            Analyze, optimize and{" "}
            <span
              className="
              bg-gradient-to-r
              from-blue-400
              via-purple-400
              to-emerald-400
              bg-clip-text
              text-transparent
              "
            >
              grow your website
            </span>
          </h1>

          <p
            className="
            mt-8
            max-w-3xl
            text-lg
            leading-8
            text-slate-400
            "
          >
            Powerful SEO tools to analyze websites, improve rankings,
            optimize content and discover technical issues instantly.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Link
              href="/tools"
              className="
              rounded-xl
              bg-gradient-to-r
              from-emerald-400
              to-cyan-400
              px-7
              py-3
              font-bold
              text-slate-950
              transition
              hover:scale-105
              "
            >
              Explore tools
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="
                rounded-xl
                border
                border-white/20
                px-7
                py-3
                font-bold
                transition
                hover:bg-white/10
                "
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/sign-up"
                className="
                rounded-xl
                border
                border-white/20
                px-7
                py-3
                font-bold
                transition
                hover:bg-white/10
                "
              >
                Create account
              </Link>
            )}

          </div>

          {/* Fake Dashboard */}

          <div
            className="
            mt-20
            w-full
            max-w-3xl
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-8
            shadow-2xl
            backdrop-blur-xl
            "
          >

            <div className="flex justify-between text-sm text-slate-400">
              <span>Website SEO Score</span>
              <span className="text-emerald-400">
                Excellent
              </span>
            </div>

            <div
              className="
              mt-6
              text-6xl
              font-black
              text-white
              "
            >
              92
            </div>

            <div
              className="
              mt-6
              h-3
              overflow-hidden
              rounded-full
              bg-white/10
              "
            >
              <div
                className="
                h-full
                w-[92%]
                rounded-full
                bg-gradient-to-r
                from-emerald-400
                to-blue-500
                "
              />
            </div>

          </div>

        </div>

      </section>

      {/* TOOLS */}

      <section
        className="
        mx-auto
        max-w-7xl
        px-6
        py-20
        "
      >

        <p
          className="
          text-sm
          uppercase
          tracking-widest
          text-emerald-400
          "
        >
          Tools
        </p>

        <h2
          className="
          mt-3
          text-4xl
          font-black
          "
        >
          Everything you need for SEO
        </h2>

        <div
          className="
          mt-10
          grid
          gap-6
          md:grid-cols-2
          lg:grid-cols-3
          "
        >

          {tools.map((tool) => (

            <Link
              key={tool.title}
              href={tool.href}
              className="
              group
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-7
              transition
              hover:-translate-y-2
              hover:border-emerald-400/40
              "
            >

              <div className="text-3xl">
                {tool.icon}
              </div>

              <h3
                className="
                mt-5
                text-xl
                font-bold
                "
              >
                {tool.title}
              </h3>

              <p
                className="
                mt-3
                text-slate-400
                leading-7
                "
              >
                {tool.description}
              </p>

              <div
                className="
                mt-6
                text-emerald-400
                "
              >
                Open tool →
              </div>

            </Link>

          ))}

        </div>

      </section>

      {/* TRUST */}

      <section
        className="
        border-t
        border-white/10
        bg-white/[0.02]
        px-6
        py-16
        text-center
        "
      >

        <h2 className="text-3xl font-bold">
          Built for creators, developers and marketers
        </h2>

        <div
          className="
          mt-8
          flex
          flex-wrap
          justify-center
          gap-8
          text-slate-300
          "
        >

          <span>✓ Free tools</span>
          <span>✓ Instant analysis</span>
          <span>✓ No credit card</span>
          <span>✓ Privacy friendly</span>

        </div>

      </section>

    </main>
  );
}