import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",

  description:
    "Learn how LifeSeos collects, uses, stores, protects and handles information when you use our SEO tools, accounts and services.",

  alternates: {
    canonical: "/privacy",
  },

  openGraph: {
    title: "Privacy Policy | LifeSeos",
    description:
      "Learn how LifeSeos collects, uses, stores and protects information when you use our SEO tools and services.",
    url: "/privacy",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/privacy.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Privacy Policy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | LifeSeos",
    description:
      "Learn how LifeSeos collects, uses, stores and protects information when you use our SEO tools and services.",
    images: ["/social/privacy.png"],
  },
};

const privacyJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "LifeSeos Privacy Policy",
  url: "https://www.lifeseos.com/privacy",
  description:
    "Learn how LifeSeos collects, uses, stores and protects information when you use our SEO tools and services.",
  dateModified: "2026-10-03",
  publisher: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacyJsonLd),
        }}
      />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          {/* HERO */}
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <span>🔒</span>
              <span>Privacy & Data Protection</span>
            </div>

            <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Your privacy matters to us. This policy explains what
              information LifeSeos collects, how we use it, and the
              choices you have when using our services.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Last updated: October 3, 2026
            </p>
          </section>

          {/* CONTENT */}
          <div className="mt-14 space-y-6">
            <PrivacySection
              number="01"
              title="Information We Collect"
            >
              <p>
                When you use LifeSeos, we may collect information that
                you provide directly to us, as well as information
                generated while using our SEO tools.
              </p>

              <ul className="mt-4 space-y-3">
                <ListItem>
                  Account information, such as your email address when
                  you create or sign in to an account.
                </ListItem>

                <ListItem>
                  Website URLs that you submit to our SEO analysis tools.
                </ListItem>

                <ListItem>
                  SEO analysis results, scores, recommendations, and
                  related report data associated with your account.
                </ListItem>

                <ListItem>
                  Basic technical information required to operate,
                  secure, and improve the service.
                </ListItem>
              </ul>
            </PrivacySection>

            <PrivacySection
              number="02"
              title="How We Use Your Information"
            >
              <p>
                We use the information collected through LifeSeos to
                provide and improve our SEO tools and account features.
              </p>

              <ul className="mt-4 space-y-3">
                <ListItem>
                  To authenticate users and maintain secure account
                  sessions.
                </ListItem>

                <ListItem>
                  To analyze websites when you request an SEO audit.
                </ListItem>

                <ListItem>
                  To save SEO reports to your account so you can access
                  them later from your dashboard.
                </ListItem>

                <ListItem>
                  To improve the reliability, security, and performance
                  of LifeSeos.
                </ListItem>

                <ListItem>
                  To diagnose errors, prevent abuse, and protect the
                  service.
                </ListItem>
              </ul>
            </PrivacySection>

            <PrivacySection
              number="03"
              title="SEO Analysis Data"
            >
              <p>
                When you submit a website URL to an SEO analysis tool,
                LifeSeos may access publicly available information from
                that website in order to perform the requested analysis.
              </p>

              <p className="mt-4">
                This may include page titles, meta descriptions,
                headings, canonical information, image attributes,
                robots metadata, social metadata, and other publicly
                accessible SEO-related information.
              </p>

              <p className="mt-4">
                If you are signed in, analysis results may be saved to
                your LifeSeos account so that they can be displayed in
                your dashboard and report history.
              </p>
            </PrivacySection>

            <PrivacySection
              number="04"
              title="Account and Authentication Data"
            >
              <p>
                LifeSeos uses authentication services to allow users to
                create accounts, sign in, sign out, and securely access
                account-specific features.
              </p>

              <p className="mt-4">
                Account information is used only as necessary to provide
                these features and associate saved reports with the
                correct user account.
              </p>
            </PrivacySection>

            <PrivacySection
              number="05"
              title="Data Storage"
            >
              <p>
                LifeSeos uses Supabase infrastructure for authentication
                and database services.
              </p>

              <p className="mt-4">
                Saved SEO reports may include the analyzed URL, SEO
                score, grade, status, report details, creation date, and
                the account identifier associated with the report.
              </p>

              <p className="mt-4">
                Access controls are used so that authenticated users can
                access reports associated with their own accounts.
              </p>
            </PrivacySection>

            <PrivacySection
              number="06"
              title="Cookies and Sessions"
            >
              <p>
                LifeSeos may use cookies or similar technologies that
                are necessary for authentication, session management,
                security, and essential website functionality.
              </p>

              <p className="mt-4">
                These technologies help keep you signed in and allow
                account-related features to function correctly.
              </p>
            </PrivacySection>

            <PrivacySection
              number="07"
              title="Sharing of Information"
            >
              <p>
                We do not sell your personal information.
              </p>

              <p className="mt-4">
                Information may be processed by service providers that
                help us operate LifeSeos, such as hosting,
                authentication, database, security, or infrastructure
                providers.
              </p>

              <p className="mt-4">
                We may also disclose information when reasonably
                necessary to comply with applicable legal obligations,
                protect the service, investigate abuse, or protect the
                rights and safety of users.
              </p>
            </PrivacySection>

            <PrivacySection
              number="08"
              title="Data Security"
            >
              <p>
                We use reasonable technical and organizational measures
                designed to protect information handled by LifeSeos.
              </p>

              <p className="mt-4">
                However, no online service or data transmission method
                can guarantee absolute security.
              </p>
            </PrivacySection>

            <PrivacySection
              number="09"
              title="Your Choices"
            >
              <p>
                You may choose not to create an account and may still
                use certain publicly available LifeSeos tools where
                account access is not required.
              </p>

              <p className="mt-4">
                When signed in, your account may provide access to
                features such as saved SEO reports and analysis history.
              </p>

              <p className="mt-4">
                You may contact us regarding questions about your
                account information or stored data.
              </p>
            </PrivacySection>

            <PrivacySection
              number="10"
              title="Third-Party Websites"
            >
              <p>
                LifeSeos allows users to analyze website URLs and may
                contain links to third-party websites.
              </p>

              <p className="mt-4">
                We are not responsible for the privacy practices,
                security, availability, or content of websites that are
                not operated by LifeSeos.
              </p>
            </PrivacySection>

            <PrivacySection
              number="11"
              title="Children's Privacy"
            >
              <p>
                LifeSeos is not designed to knowingly collect personal
                information from children where parental consent or
                another legal basis would be required.
              </p>

              <p className="mt-4">
                If you believe that personal information has been
                submitted to LifeSeos inappropriately, please contact
                us so the matter can be reviewed.
              </p>
            </PrivacySection>

            <PrivacySection
              number="12"
              title="Changes to This Privacy Policy"
            >
              <p>
                We may update this Privacy Policy as LifeSeos evolves,
                new features are introduced, or our data practices
                change.
              </p>

              <p className="mt-4">
                When changes are made, the updated version will be
                published on this page with a revised effective date.
              </p>
            </PrivacySection>

            <PrivacySection
              number="13"
              title="Contact"
            >
              <p>
                If you have questions about this Privacy Policy or how
                LifeSeos handles information, you can contact us through
                the contact options provided on the LifeSeos website.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex font-semibold text-emerald-300 transition hover:text-emerald-200"
              >
                Contact LifeSeos →
              </Link>
            </PrivacySection>
          </div>

          {/* BOTTOM CTA */}
          <section className="mt-12 rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10 p-7 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  LifeSeos
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Privacy-friendly SEO tools
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Analyze websites, save your reports, and manage your
                  SEO workflow from one place.
                </p>
              </div>

              <Link
                href="/tools"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
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
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function PrivacySection({
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
      <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[10px] font-bold text-emerald-300">
        ✓
      </span>

      <span>{children}</span>
    </li>
  );
}