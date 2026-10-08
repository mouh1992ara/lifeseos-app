import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Gift,
  Zap,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is LifeSeos?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "LifeSeos provides free SEO tools that help website owners analyze, optimize and improve website performance.",
        },
      },
      {
        "@type": "Question",
        name: "Are LifeSeos SEO tools free?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. LifeSeos provides free SEO tools for website analysis, technical SEO, content optimization and search performance improvement.",
        },
      },
      {
        "@type": "Question",
        name: "What SEO tools are available on LifeSeos?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "LifeSeos provides SEO analysis tools, metadata generators, keyword analysis tools, sitemap tools, robots.txt tools and technical SEO checkers.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need SEO experience to use LifeSeos?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No. LifeSeos tools are designed for beginners, marketers, developers and website owners.",
        },
      },
      {
        "@type": "Question",
        name: "Can LifeSeos improve my Google rankings?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "LifeSeos helps identify SEO issues and optimization opportunities, but rankings also depend on content quality, competition and other search factors.",
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
    <main
      className="
        relative
        z-0
        isolate
        w-full
        overflow-x-hidden
        bg-slate-950
        text-white
      "
    >
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

      <section
        className="
          relative
          z-0
          px-6
          pb-24
          pt-24
          sm:px-10
          lg:px-16
        "
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 22%, rgba(59,130,246,0.30) 0%, rgba(124,58,237,0.16) 30%, rgba(15,23,42,0) 65%)",
        }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <h1
            className="
              text-4xl
              font-bold
              leading-tight
              sm:text-6xl
            "
          >
            Free SEO Tools to Analyze,
            <br />
            Optimize and Grow Your Website
          </h1>

          <p
            className="
              mx-auto
              mt-6
              max-w-3xl
              text-lg
              leading-8
              text-slate-400
            "
          >
            Improve your website performance with free SEO tools for
            technical analysis, content optimization, metadata,
            crawling and search visibility.
          </p>

          <div
            className="
              mt-10
              flex
              flex-wrap
              justify-center
              gap-4
            "
          >
            <Link
              href="/tools"
              className="
                rounded-xl
                bg-emerald-400
                px-7
                py-3
                font-semibold
                text-slate-950
                transition
                hover:bg-emerald-300
              "
            >
              Explore SEO Tools
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="
                  rounded-xl
                  border
                  border-white/10
                  px-7
                  py-3
                  font-semibold
                  transition
                  hover:bg-white/5
                "
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/sign-up"
                className="
                  rounded-xl
                  border
                  border-white/10
                  px-7
                  py-3
                  font-semibold
                  transition
                  hover:bg-white/5
                "
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>


      {/* TOOLS */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">
            Powerful SEO Tools
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-center
              text-slate-400
            "
          >
            Everything you need to analyze and improve your website SEO.
          </p>

          <div
            className="
              mt-12
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-6
                  transition
                  hover:border-emerald-400/40
                  hover:bg-white/[0.05]
                "
              >
                <div className="text-3xl">
                  {tool.icon}
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {tool.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* TRUST */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div
          className="
            mx-auto
            grid
            max-w-6xl
            gap-6
            md:grid-cols-4
          "
        >
          {[
            {
              icon: Gift,
              title: "Free Forever",
              text: "Use essential SEO tools without payment.",
            },
            {
              icon: Zap,
              title: "Fast Analysis",
              text: "Get instant insights and recommendations.",
            },
            {
              icon: CreditCard,
              title: "No Credit Card",
              text: "Start using tools without commitment.",
            },
            {
              icon: ShieldCheck,
              title: "Secure",
              text: "Your data is handled safely.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-6
                "
              >
                <Icon className="h-8 w-8 text-emerald-400" />

                <h3 className="mt-5 font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>


      {/* WHY CHOOSE LIFESEOS */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">
            Why Choose LifeSeos?
          </h2>

          <div
            className="
              mt-10
              grid
              gap-6
              md:grid-cols-3
            "
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">
                Simple SEO Analysis
              </h3>
              <p className="mt-3 text-slate-400">
                Understand website issues with clear reports and practical insights.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">
                Complete SEO Toolkit
              </h3>
              <p className="mt-3 text-slate-400">
                Analyze technical SEO, content, keywords, speed and search signals in one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">
                Built for Everyone
              </h3>
              <p className="mt-3 text-slate-400">
                Designed for beginners, marketers, developers and website owners.
              </p>
            </div>
          </div>
        </div>
      </section>


           {/* FAQ */}

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="mt-10 space-y-5">
            {[
              {
                q: "What is LifeSeos?",
                a: "LifeSeos provides free SEO tools that help website owners analyze and improve website performance.",
              },
              {
                q: "Are LifeSeos tools free?",
                a: "Yes. Most LifeSeos SEO tools are available for free.",
              },
              {
                q: "Who can use LifeSeos?",
                a: "Anyone managing a website, including beginners, marketers and developers.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-6
                "
              >
                <h3 className="font-semibold">
                  {item.q}
                </h3>

                <p className="mt-3 text-slate-400">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FINAL CTA */}

      <section
        className="
          px-6
          py-20
          sm:px-10
          lg:px-16
        "
      >
        <div
          className="
            mx-auto
            max-w-4xl
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            p-10
            text-center
          "
        >
          <h2 className="text-3xl font-bold">
            Ready to improve your website SEO?
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              leading-7
              text-slate-400
            "
          >
            Analyze your website, discover SEO issues and improve your search
            performance with free LifeSeos tools.
          </p>

          <Link
            href="/tools/seo-analyzer"
            className="
              mt-8
              inline-flex
              rounded-xl
              bg-emerald-400
              px-8
              py-3
              font-semibold
              text-slate-950
              transition
              hover:bg-emerald-300
            "
          >
            Start Free SEO Analysis
          </Link>
        </div>
      </section>


    </main>
  );
}