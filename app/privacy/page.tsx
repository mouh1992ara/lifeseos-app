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
  dateModified: "2026-10-17",
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
              information LifeSeos collects, how we use it, and the choices
              you have when using our services.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Last updated: October 17, 2026
            </p>
          </section>

          {/* CONTENT */}
          <div className="mt-14 space-y-6">
            <PrivacySection
              number="01"
              title="Information We Collect"
            >
              <p>
                When you use LifeSeos, we may collect information that you
                provide directly to us, information generated while using our
                SEO tools, and limited technical or usage information required
                to operate and improve the service.
              </p>

              <ul className="mt-4 space-y-3">
                <ListItem>
                  Account information, such as your email address when you
                  create or sign in to an account.
                </ListItem>

                <ListItem>
                  Website URLs that you submit to our SEO analysis tools.
                </ListItem>

                <ListItem>
                  SEO analysis results, scores, recommendations, and related
                  report data associated with your account.
                </ListItem>

                <ListItem>
                  Information you voluntarily provide when contacting
                  LifeSeos, such as your name, email address, and message.
                </ListItem>

                <ListItem>
                  Basic website usage information, such as the page visited,
                  visit time, and approximate country or region.
                </ListItem>

                <ListItem>
                  Technical information that may be processed by hosting,
                  security, authentication, or infrastructure providers to
                  operate and protect the service.
                </ListItem>
              </ul>
            </PrivacySection>

            <PrivacySection
              number="02"
              title="How We Use Your Information"
            >
              <p>
                We use information collected through LifeSeos only for
                legitimate service, security, analytics, communication, and
                website operation purposes.
              </p>

              <ul className="mt-4 space-y-3">
                <ListItem>
                  To authenticate users and maintain secure account sessions.
                </ListItem>

                <ListItem>
                  To analyze websites when you request an SEO audit or use an
                  SEO tool.
                </ListItem>

                <ListItem>
                  To save SEO reports to your account so you can access them
                  later from your dashboard.
                </ListItem>

                <ListItem>
                  To understand general website usage and improve LifeSeos.
                </ListItem>

                <ListItem>
                  To respond to messages and support requests.
                </ListItem>

                <ListItem>
                  To improve the reliability, security, and performance of
                  LifeSeos.
                </ListItem>

                <ListItem>
                  To diagnose errors, prevent abuse, and protect the service.
                </ListItem>
              </ul>
            </PrivacySection>

            <PrivacySection
              number="03"
              title="Website Usage and Analytics"
            >
              <p>
                LifeSeos may collect limited usage information to understand
                how visitors use the website and which pages or tools are most
                useful.
              </p>

              <p className="mt-4">
                This information may include the page or route visited, the
                time of the visit, and an approximate country or region
                associated with the request.
              </p>

              <p className="mt-4">
                This information is used for aggregate website analytics,
                service improvement, performance monitoring, and security. We
                do not use our internal page-visit records to intentionally
                identify individual visitors.
              </p>
            </PrivacySection>

            <PrivacySection
              number="04"
              title="SEO Analysis Data"
            >
              <p>
                When you submit a website URL to an SEO analysis tool,
                LifeSeos may access publicly available information from that
                website in order to perform the requested analysis.
              </p>

              <p className="mt-4">
                This may include page titles, meta descriptions, headings,
                canonical information, image attributes, robots metadata,
                social metadata, and other publicly accessible SEO-related
                information.
              </p>

              <p className="mt-4">
                If you are signed in, analysis results may be saved to your
                LifeSeos account so that they can be displayed in your
                dashboard and report history.
              </p>
            </PrivacySection>

            <PrivacySection
              number="05"
              title="Account and Authentication Data"
            >
              <p>
                LifeSeos uses authentication services to allow users to create
                accounts, sign in, sign out, and securely access
                account-specific features.
              </p>

              <p className="mt-4">
                Account information is used only as necessary to provide these
                features and associate saved reports with the correct user
                account.
              </p>
            </PrivacySection>

            <PrivacySection
              number="06"
              title="Data Storage and Service Providers"
            >
              <p>
                LifeSeos uses third-party infrastructure and service providers
                to operate the website.
              </p>

              <p className="mt-4">
                Supabase is used for authentication and database services.
                Hosting, deployment, networking, and security providers may
                also process technical request information as necessary to
                deliver and protect the website.
              </p>

              <p className="mt-4">
                Saved SEO reports may include the analyzed URL, SEO score,
                grade, status, report details, creation date, and the account
                identifier associated with the report.
              </p>

              <p className="mt-4">
                Access controls are used so that authenticated users can access
                reports associated with their own accounts.
              </p>
            </PrivacySection>

            <PrivacySection
              number="07"
              title="Cookies and Similar Technologies"
            >
              <p>
                LifeSeos may use cookies or similar technologies for
                authentication, session management, security, user
                preferences, analytics, and essential website functionality.
              </p>

              <p className="mt-4">
                These technologies may help keep you signed in, remember
                settings, protect the website, measure website usage, and
                support features provided by third-party services.
              </p>

              <p className="mt-4">
                If advertising services are enabled, advertising providers may
                also use cookies, local storage, web beacons, IP addresses, or
                other identifiers as described below.
              </p>
            </PrivacySection>

            <PrivacySection
              number="08"
              title="Advertising and Google AdSense"
            >
              <p>
                LifeSeos may use Google AdSense or other advertising services
                to display advertisements on the website.
              </p>

              <p className="mt-4">
                If advertising is enabled, third-party vendors, including
                Google, may use cookies or similar technologies to serve,
                measure, personalize, or limit advertisements based on a
                user's visits to LifeSeos and, where applicable, other
                websites.
              </p>

              <p className="mt-4">
                Advertising providers may process information such as cookies,
                web beacons, IP addresses, device or browser information, and
                other identifiers in connection with ad delivery,
                measurement, fraud prevention, and personalization where
                permitted.
              </p>

              <p className="mt-4">
                Google's use of advertising cookies may allow Google and its
                partners to show ads based on visits to LifeSeos and other
                websites, subject to applicable law and the user's consent
                choices.
              </p>

              <p className="mt-4">
                You can learn more about how Google uses information from
                sites and apps that use Google services by visiting{" "}
                <a
                  href="https://www.google.com/policies/privacy/partners/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-300 transition hover:text-emerald-200"
                >
                  Google's information about partner sites and apps
                </a>
                .
              </p>

              <p className="mt-4">
                You may manage personalized advertising preferences through{" "}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-300 transition hover:text-emerald-200"
                >
                  Google Ads Settings
                </a>
                .
              </p>
            </PrivacySection>

            <PrivacySection
              number="09"
              title="Consent and Advertising Choices"
            >
              <p>
                Where required by applicable law, LifeSeos will request consent
                before using non-essential cookies or processing personal data
                for certain advertising or personalization purposes.
              </p>

              <p className="mt-4">
                Visitors in regions with specific consent requirements may be
                shown a consent message that allows them to accept, reject, or
                manage available privacy choices.
              </p>

              <p className="mt-4">
                Consent choices may affect whether advertisements are
                personalized and whether certain analytics or advertising
                technologies are used.
              </p>
            </PrivacySection>

            <PrivacySection
              number="10"
              title="Sharing of Information"
            >
              <p>
                We do not sell your personal information.
              </p>

              <p className="mt-4">
                Information may be processed by service providers that help us
                operate LifeSeos, such as hosting, authentication, database,
                analytics, advertising, security, or infrastructure providers.
              </p>

              <p className="mt-4">
                These providers may process information only as necessary to
                provide their services, subject to their applicable terms and
                privacy practices.
              </p>

              <p className="mt-4">
                We may also disclose information when reasonably necessary to
                comply with applicable legal obligations, protect the service,
                investigate abuse, or protect the rights and safety of users.
              </p>
            </PrivacySection>

            <PrivacySection
              number="11"
              title="Data Security"
            >
              <p>
                We use reasonable technical and organizational measures
                designed to protect information handled by LifeSeos.
              </p>

              <p className="mt-4">
                However, no online service, storage system, or data
                transmission method can guarantee absolute security.
              </p>
            </PrivacySection>

            <PrivacySection
              number="12"
              title="Data Retention"
            >
              <p>
                We retain information for as long as reasonably necessary to
                provide LifeSeos, maintain account features, comply with legal
                obligations, resolve disputes, prevent abuse, and protect the
                service.
              </p>

              <p className="mt-4">
                Retention periods may differ depending on the type of
                information and the purpose for which it is processed.
              </p>
            </PrivacySection>

            <PrivacySection
              number="13"
              title="Your Choices and Privacy Rights"
            >
              <p>
                You may choose not to create an account and may still use
                certain publicly available LifeSeos tools where account access
                is not required.
              </p>

              <p className="mt-4">
                Depending on your location and applicable law, you may have
                rights relating to access, correction, deletion, restriction,
                objection, or other handling of your personal information.
              </p>

              <p className="mt-4">
                You may contact us regarding questions or requests concerning
                your account information or stored data.
              </p>
            </PrivacySection>

            <PrivacySection
              number="14"
              title="Third-Party Websites"
            >
              <p>
                LifeSeos allows users to analyze website URLs and may contain
                links to third-party websites.
              </p>

              <p className="mt-4">
                We are not responsible for the privacy practices, security,
                availability, or content of websites that are not operated by
                LifeSeos.
              </p>
            </PrivacySection>

            <PrivacySection
              number="15"
              title="Children's Privacy"
            >
              <p>
                LifeSeos is not intended to knowingly collect personal
                information from children where parental consent or another
                legal basis would be required.
              </p>

              <p className="mt-4">
                If you believe that personal information has been submitted to
                LifeSeos inappropriately, please contact us so the matter can
                be reviewed.
              </p>
            </PrivacySection>

            <PrivacySection
              number="16"
              title="International Processing"
            >
              <p>
                LifeSeos and its service providers may process information in
                countries other than the country in which you are located.
              </p>

              <p className="mt-4">
                Where required, appropriate safeguards may be used in
                connection with international transfers of personal
                information.
              </p>
            </PrivacySection>

            <PrivacySection
              number="17"
              title="Changes to This Privacy Policy"
            >
              <p>
                We may update this Privacy Policy as LifeSeos evolves, new
                features are introduced, advertising or analytics services
                change, or our data practices change.
              </p>

              <p className="mt-4">
                When changes are made, the updated version will be published
                on this page with a revised effective date.
              </p>
            </PrivacySection>

            <PrivacySection
              number="18"
              title="Contact"
            >
              <p>
                If you have questions about this Privacy Policy, your privacy
                choices, or how LifeSeos handles information, you can contact
                us through the contact options provided on the LifeSeos
                website.
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
                  Analyze websites, save your reports, and manage your SEO
                  workflow from one place.
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