import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",

  description:
    "Read the terms and conditions that govern the use of LifeSeos SEO tools, accounts, educational content and related services.",

  alternates: {
    canonical: "/terms",
  },

  openGraph: {
    title: "Terms of Service | LifeSeos",
    description:
      "Read the terms and conditions that govern the use of LifeSeos SEO tools, content and services.",
    url: "/terms",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/terms.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Terms of Service",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | LifeSeos",
    description:
      "Read the terms and conditions that govern the use of LifeSeos SEO tools, content and services.",
    images: ["/social/terms.png"],
  },
};

const termsJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "LifeSeos Terms of Service",
  url: "https://www.lifeseos.com/terms",
  description:
    "Read the terms and conditions that govern the use of LifeSeos SEO tools, content and services.",
  dateModified: "2026-10-17",
  publisher: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(termsJsonLd),
        }}
      />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          {/* HERO */}
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-300">
              <span>📄</span>
              <span>Terms & Conditions</span>
            </div>

            <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Terms of Service
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              These Terms of Service explain the rules and conditions that
              apply when you access or use LifeSeos, its SEO tools, content,
              accounts, and related services.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Last updated: October 17, 2026
            </p>
          </section>

          {/* CONTENT */}
          <div className="mt-14 space-y-6">
            <TermsSection number="01" title="Acceptance of Terms">
              <p>
                By accessing or using LifeSeos, you agree to these Terms of
                Service and to comply with applicable laws and regulations.
              </p>

              <p className="mt-4">
                If you do not agree with these Terms, you should not use
                LifeSeos or its services.
              </p>
            </TermsSection>

            <TermsSection number="02" title="About LifeSeos">
              <p>
                LifeSeos provides SEO-related tools, educational resources,
                website analysis features, and related services designed to
                help users better understand and evaluate website
                optimization.
              </p>

              <p className="mt-4">
                Features may include website analysis, SEO scoring,
                recommendations, metadata tools, sitemap tools, robots.txt
                generation, keyword analysis, content analysis, performance
                checks, technical SEO utilities, and educational guides.
              </p>

              <p className="mt-4">
                Features may change, expand, or be discontinued as LifeSeos
                develops.
              </p>
            </TermsSection>

            <TermsSection number="03" title="User Accounts">
              <p>
                Some LifeSeos features may require you to create and use an
                account.
              </p>

              <ul className="mt-4 space-y-3">
                <ListItem>
                  You are responsible for providing accurate account
                  information.
                </ListItem>

                <ListItem>
                  You are responsible for maintaining the security of your
                  account.
                </ListItem>

                <ListItem>
                  You should not share access to your account with unauthorized
                  users.
                </ListItem>

                <ListItem>
                  You are responsible for activity performed through your
                  account.
                </ListItem>
              </ul>
            </TermsSection>

            <TermsSection number="04" title="Use of the Service">
              <p>
                You may use LifeSeos only for lawful purposes and in a manner
                that does not interfere with the operation, security,
                availability, or integrity of the service.
              </p>

              <p className="mt-4">
                You agree not to misuse LifeSeos, attempt unauthorized access,
                interfere with other users, circumvent technical restrictions,
                or use the service in a way that could damage, overload, or
                disrupt our systems or infrastructure.
              </p>
            </TermsSection>

            <TermsSection number="05" title="Website Analysis">
              <p>
                LifeSeos allows users to submit website URLs for SEO analysis
                and related technical checks.
              </p>

              <p className="mt-4">
                You should only submit websites that you are legally permitted
                to analyze or publicly accessible websites where such analysis
                is appropriate.
              </p>

              <p className="mt-4">
                LifeSeos may retrieve publicly available webpage information
                to generate SEO scores, warnings, recommendations, reports,
                technical results, or other requested outputs.
              </p>

              <p className="mt-4">
                You are responsible for ensuring that your use of LifeSeos and
                any URLs or content you submit complies with applicable law
                and does not violate third-party rights.
              </p>
            </TermsSection>

            <TermsSection
              number="06"
              title="SEO Results and Recommendations"
            >
              <p>
                SEO scores, recommendations, reports, guides, and other
                information provided by LifeSeos are intended for informational
                and educational purposes.
              </p>

              <p className="mt-4">
                Automated results are based on the information available to the
                tool at the time of analysis and should be reviewed in context.
              </p>

              <p className="mt-4">
                Search engine algorithms, ranking systems, technical standards,
                and best practices can change over time. LifeSeos does not
                guarantee that following any recommendation will result in
                higher rankings, increased traffic, indexing, revenue,
                conversions, or any other specific outcome.
              </p>

              <p className="mt-4">
                You are responsible for deciding whether a recommendation is
                appropriate for your website before implementing it.
              </p>
            </TermsSection>

            <TermsSection number="07" title="Educational Content">
              <p>
                LifeSeos may publish articles, guides, explanations, examples,
                and other educational content relating to SEO, websites,
                content optimization, technical performance, and related
                topics.
              </p>

              <p className="mt-4">
                This content is provided for general informational purposes and
                may not apply to every website, technical environment, or
                situation.
              </p>

              <p className="mt-4">
                Although we aim to keep important information useful and
                current, we do not guarantee that all content will always be
                complete, error-free, or immediately updated following changes
                to search engines, third-party platforms, technologies, or
                industry practices.
              </p>
            </TermsSection>

            <TermsSection number="08" title="Saved Reports">
              <p>
                If you are signed in, LifeSeos may allow supported SEO reports
                or analysis results to be saved to your account.
              </p>

              <p className="mt-4">
                Saved reports may include website URLs, SEO scores, grades,
                statuses, recommendations, creation dates, and related analysis
                data.
              </p>

              <p className="mt-4">
                LifeSeos may modify, improve, limit, or discontinue
                report-related features as the service evolves.
              </p>

              <p className="mt-4">
                You should not rely on LifeSeos as the only storage location
                for information that is important to you.
              </p>
            </TermsSection>

            <TermsSection number="09" title="Prohibited Activities">
              <p>
                You may not use LifeSeos to engage in activities that are
                unlawful, abusive, harmful, fraudulent, or intended to disrupt
                or misuse the service.
              </p>

              <ul className="mt-4 space-y-3">
                <ListItem>
                  Attempting to bypass security protections or access controls.
                </ListItem>

                <ListItem>
                  Introducing malware, malicious code, or harmful automated
                  traffic.
                </ListItem>

                <ListItem>
                  Using the service to violate the rights of another person or
                  organization.
                </ListItem>

                <ListItem>
                  Attempting to overload, excessively scrape, probe, or disrupt
                  LifeSeos systems.
                </ListItem>

                <ListItem>
                  Using LifeSeos for fraudulent, deceptive, abusive, or
                  unlawful purposes.
                </ListItem>

                <ListItem>
                  Attempting to reverse engineer, interfere with, or gain
                  unauthorized access to protected parts of the service where
                  prohibited by law.
                </ListItem>
              </ul>
            </TermsSection>

            <TermsSection number="10" title="Intellectual Property">
              <p>
                The LifeSeos name, branding, website design, software,
                interfaces, original written content, graphics, and other
                original materials are protected by applicable intellectual
                property laws.
              </p>

              <p className="mt-4">
                These Terms do not grant you ownership of LifeSeos or any
                intellectual property associated with the service.
              </p>

              <p className="mt-4">
                You may use publicly available LifeSeos tools for their
                intended purposes, but you may not copy, reproduce, republish,
                or distribute protected LifeSeos materials except where
                permitted by law or with appropriate authorization.
              </p>
            </TermsSection>

            <TermsSection number="11" title="Third-Party Services">
              <p>
                LifeSeos may rely on third-party providers for services such as
                hosting, deployment, authentication, databases, analytics,
                advertising, security, performance measurement, or other
                technical functions.
              </p>

              <p className="mt-4">
                Third-party services may operate under their own terms,
                policies, and privacy practices.
              </p>

              <p className="mt-4">
                LifeSeos is not responsible for the availability, security,
                content, products, services, or policies of third-party
                websites or services that are outside our reasonable control.
              </p>
            </TermsSection>

            <TermsSection number="12" title="Advertising">
              <p>
                LifeSeos may display advertisements or use third-party
                advertising services, including services provided by Google or
                other advertising partners.
              </p>

              <p className="mt-4">
                Advertisements, links, or references to third-party products or
                services do not necessarily constitute an endorsement by
                LifeSeos.
              </p>

              <p className="mt-4">
                Your interaction with an advertiser or third-party service is
                between you and that third party and may be subject to separate
                terms and privacy practices.
              </p>
            </TermsSection>

            <TermsSection number="13" title="Service Availability">
              <p>
                We aim to keep LifeSeos available and reliable, but we do not
                guarantee uninterrupted, continuous, secure, or error-free
                operation.
              </p>

              <p className="mt-4">
                The service may occasionally be unavailable due to maintenance,
                technical problems, updates, security issues, infrastructure
                failures, third-party services, or events outside our control.
              </p>
            </TermsSection>

            <TermsSection number="14" title="Changes to the Service">
              <p>
                LifeSeos may add, modify, replace, restrict, or discontinue
                tools, features, content, or services at any time as the
                product develops.
              </p>

              <p className="mt-4">
                We may also change usage limits or technical requirements where
                reasonably necessary for security, performance, reliability,
                abuse prevention, or service development.
              </p>
            </TermsSection>

            <TermsSection number="15" title="Disclaimer">
              <p>
                LifeSeos is provided on an &quot;as is&quot; and
                &quot;as available&quot; basis.
              </p>

              <p className="mt-4">
                To the extent permitted by law, we make no guarantees regarding
                the accuracy, completeness, reliability, availability,
                timeliness, effectiveness, or suitability of SEO analysis
                results, recommendations, educational content, or other
                information provided through the service.
              </p>

              <p className="mt-4">
                LifeSeos does not provide legal, financial, tax, or other
                regulated professional advice. You are responsible for
                evaluating information and recommendations before acting on
                them.
              </p>
            </TermsSection>

            <TermsSection number="16" title="Limitation of Liability">
              <p>
                To the extent permitted by applicable law, LifeSeos and its
                operators will not be liable for indirect, incidental,
                consequential, special, exemplary, or similar damages arising
                from your use of or inability to use the service.
              </p>

              <p className="mt-4">
                This includes losses related to website performance, search
                rankings, indexing, traffic, revenue, conversions, data,
                business opportunities, third-party services, or other
                outcomes.
              </p>

              <p className="mt-4">
                Nothing in these Terms excludes or limits liability where such
                exclusion or limitation is prohibited by applicable law.
              </p>
            </TermsSection>

            <TermsSection
              number="17"
              title="Account Suspension or Termination"
            >
              <p>
                We may restrict, suspend, or terminate access to LifeSeos where
                reasonably necessary to protect the service, users, third
                parties, or our systems.
              </p>

              <p className="mt-4">
                This may include cases involving misuse, abuse, security
                threats, fraudulent activity, unlawful activity, or serious or
                repeated violations of these Terms.
              </p>
            </TermsSection>

            <TermsSection number="18" title="Privacy">
              <p>
                Your use of LifeSeos is also subject to our Privacy Policy,
                which explains how information may be collected, used,
                processed, shared, and stored.
              </p>

              <Link
                href="/privacy"
                className="mt-4 inline-flex items-center gap-2 font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                Read our Privacy Policy
                <span>→</span>
              </Link>
            </TermsSection>

            <TermsSection number="19" title="Changes to These Terms">
              <p>
                We may update these Terms from time to time as LifeSeos
                develops or when legal, technical, operational, or business
                requirements change.
              </p>

              <p className="mt-4">
                Updated Terms will be posted on this page with a revised
                effective date.
              </p>

              <p className="mt-4">
                Your continued use of LifeSeos after updated Terms become
                effective may constitute acceptance of those updated Terms to
                the extent permitted by applicable law.
              </p>
            </TermsSection>

            <TermsSection number="20" title="Contact">
              <p>
                If you have questions about these Terms of Service, you may
                contact LifeSeos through the contact options provided on the
                website.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                Contact LifeSeos
                <span>→</span>
              </Link>
            </TermsSection>
          </div>

          {/* CTA */}
          <section className="mt-12 rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10 p-7 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-300">
                  LifeSeos
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Practical SEO tools and resources
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Analyze websites, review SEO signals, use practical tools,
                  and learn more through our educational guides.
                </p>
              </div>

              <Link
                href="/tools"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5"
              >
                Explore Tools
              </Link>
            </div>
          </section>

          {/* NAVIGATION */}
          <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/tools"
              className="transition hover:text-white"
            >
              Tools
            </Link>

            <Link
              href="/about"
              className="transition hover:text-white"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-white"
            >
              Contact
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function TermsSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-xs font-bold text-violet-300">
          {number}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold sm:text-2xl">
            {title}
          </h2>

          <div className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ListItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/10 text-[10px] font-bold text-violet-300">
        ✓
      </span>

      <span>{children}</span>
    </li>
  );
}