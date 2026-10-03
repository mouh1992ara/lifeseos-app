import Link from "next/link";

export const metadata = {
  title: "Terms of Service | LifeSeos",
  description:
    "Read the terms and conditions that govern the use of LifeSeos SEO tools and services.",
};

export default function TermsPage() {
  return (
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
            These Terms of Service explain the rules and conditions
            that apply when you access or use LifeSeos and its SEO tools.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Last updated: October 3, 2026
          </p>

        </section>


        {/* CONTENT */}

        <div className="mt-14 space-y-6">

          <TermsSection
            number="01"
            title="Acceptance of Terms"
          >
            <p>
              By accessing or using LifeSeos, you agree to these Terms
              of Service and to comply with applicable laws and regulations.
            </p>

            <p className="mt-4">
              If you do not agree with these terms, you should not use
              LifeSeos or its services.
            </p>
          </TermsSection>


          <TermsSection
            number="02"
            title="About LifeSeos"
          >
            <p>
              LifeSeos provides SEO-related tools designed to help users
              analyze websites, generate SEO resources, identify technical
              issues, and improve website optimization.
            </p>

            <p className="mt-4">
              Features may include website analysis, SEO scoring,
              recommendations, metadata tools, sitemap tools, robots.txt
              generation, keyword analysis, and related services.
            </p>
          </TermsSection>


          <TermsSection
            number="03"
            title="User Accounts"
          >
            <p>
              Some LifeSeos features may require you to create and use
              an account.
            </p>

            <ul className="mt-4 space-y-3">

              <ListItem>
                You are responsible for providing accurate account information.
              </ListItem>

              <ListItem>
                You are responsible for maintaining the security of your account.
              </ListItem>

              <ListItem>
                You should not share access to your account with unauthorized users.
              </ListItem>

              <ListItem>
                You are responsible for activity performed through your account.
              </ListItem>

            </ul>
          </TermsSection>


          <TermsSection
            number="04"
            title="Use of the Service"
          >
            <p>
              You may use LifeSeos only for lawful purposes and in a manner
              that does not interfere with the operation, security, or
              availability of the service.
            </p>

            <p className="mt-4">
              You agree not to misuse LifeSeos, attempt unauthorized access,
              interfere with other users, or use the service in a way that
              could damage or disrupt our infrastructure.
            </p>
          </TermsSection>


          <TermsSection
            number="05"
            title="Website Analysis"
          >
            <p>
              LifeSeos allows users to submit website URLs for SEO analysis.
            </p>

            <p className="mt-4">
              You should only submit websites that you are legally permitted
              to analyze or publicly accessible websites where such analysis
              is appropriate.
            </p>

            <p className="mt-4">
              LifeSeos may retrieve publicly available webpage information
              to generate SEO scores, warnings, recommendations, and reports.
            </p>
          </TermsSection>


          <TermsSection
            number="06"
            title="SEO Results and Recommendations"
          >
            <p>
              SEO scores, recommendations, reports, and other information
              provided by LifeSeos are intended for informational and
              educational purposes.
            </p>

            <p className="mt-4">
              Search engine algorithms and ranking factors can change over
              time, and LifeSeos does not guarantee that following any
              recommendation will result in higher rankings, increased
              traffic, revenue, or other specific outcomes.
            </p>
          </TermsSection>


          <TermsSection
            number="07"
            title="Saved Reports"
          >
            <p>
              If you are signed in, LifeSeos may allow SEO reports to be
              saved to your account.
            </p>

            <p className="mt-4">
              Saved reports may include website URLs, SEO scores, grades,
              statuses, recommendations, and related analysis data.
            </p>

            <p className="mt-4">
              LifeSeos may modify, improve, or discontinue report-related
              features as the service evolves.
            </p>
          </TermsSection>


          <TermsSection
            number="08"
            title="Prohibited Activities"
          >
            <p>
              You may not use LifeSeos to engage in activities that are
              unlawful, abusive, harmful, or intended to disrupt the service.
            </p>

            <ul className="mt-4 space-y-3">

              <ListItem>
                Attempting to bypass security protections or access controls.
              </ListItem>

              <ListItem>
                Introducing malware, malicious code, or harmful automated traffic.
              </ListItem>

              <ListItem>
                Using the service to violate the rights of another person or organization.
              </ListItem>

              <ListItem>
                Attempting to overload, scrape excessively, or disrupt LifeSeos systems.
              </ListItem>

              <ListItem>
                Using LifeSeos for fraudulent, deceptive, or unlawful purposes.
              </ListItem>

            </ul>
          </TermsSection>


          <TermsSection
            number="09"
            title="Intellectual Property"
          >
            <p>
              The LifeSeos name, branding, website design, software,
              interfaces, and original content are protected by applicable
              intellectual property laws.
            </p>

            <p className="mt-4">
              These Terms do not grant you ownership of LifeSeos or any
              intellectual property associated with the service.
            </p>
          </TermsSection>


          <TermsSection
            number="10"
            title="Third-Party Services"
          >
            <p>
              LifeSeos may rely on third-party providers for services such
              as hosting, authentication, databases, infrastructure, or
              other technical functions.
            </p>

            <p className="mt-4">
              LifeSeos is not responsible for the availability, security,
              content, or policies of third-party websites or services that
              are outside our control.
            </p>
          </TermsSection>


          <TermsSection
            number="11"
            title="Service Availability"
          >
            <p>
              We aim to keep LifeSeos available and reliable, but we do not
              guarantee uninterrupted or error-free operation.
            </p>

            <p className="mt-4">
              The service may occasionally be unavailable due to maintenance,
              technical problems, updates, infrastructure issues, or events
              outside our control.
            </p>
          </TermsSection>


          <TermsSection
            number="12"
            title="Changes to the Service"
          >
            <p>
              LifeSeos may add, modify, replace, or discontinue features
              at any time as the product develops.
            </p>

            <p className="mt-4">
              We may also update these Terms of Service when necessary to
              reflect changes in the service, legal requirements, or business
              practices.
            </p>
          </TermsSection>


          <TermsSection
            number="13"
            title="Disclaimer"
          >
            <p>
              LifeSeos is provided on an "as is" and "as available" basis.
            </p>

            <p className="mt-4">
              To the extent permitted by law, we make no guarantees regarding
              the accuracy, completeness, reliability, availability, or
              effectiveness of SEO analysis results or recommendations.
            </p>

            <p className="mt-4">
              You are responsible for reviewing and evaluating recommendations
              before making changes to your website.
            </p>
          </TermsSection>


          <TermsSection
            number="14"
            title="Limitation of Liability"
          >
            <p>
              To the extent permitted by applicable law, LifeSeos and its
              operators will not be liable for indirect, incidental,
              consequential, special, or similar damages arising from your
              use of or inability to use the service.
            </p>

            <p className="mt-4">
              This includes losses related to website performance, rankings,
              traffic, revenue, data, business opportunities, or other outcomes.
            </p>
          </TermsSection>


          <TermsSection
            number="15"
            title="Account Suspension or Termination"
          >
            <p>
              We may restrict, suspend, or terminate access to LifeSeos where
              reasonably necessary to protect the service, other users, or
              our systems.
            </p>

            <p className="mt-4">
              This may include cases involving misuse, abuse, security threats,
              unlawful activity, or serious violations of these Terms.
            </p>
          </TermsSection>


          <TermsSection
            number="16"
            title="Privacy"
          >
            <p>
              Your use of LifeSeos is also subject to our Privacy Policy,
              which explains how information is collected, used, and stored.
            </p>

            <Link
              href="/privacy"
              className="mt-4 inline-flex items-center gap-2 font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              Read our Privacy Policy
              <span>→</span>
            </Link>
          </TermsSection>


          <TermsSection
            number="17"
            title="Changes to These Terms"
          >
            <p>
              We may update these Terms from time to time.
            </p>

            <p className="mt-4">
              Updated Terms will be posted on this page with a revised
              effective date. Continued use of LifeSeos after changes become
              effective may constitute acceptance of the updated Terms.
            </p>
          </TermsSection>


          <TermsSection
            number="18"
            title="Contact"
          >
            <p>
              If you have questions regarding these Terms of Service, you may
              contact us through the contact options provided on the LifeSeos
              website.
            </p>
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
                SEO tools built for smarter growth
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Analyze websites, identify SEO opportunities, and manage
                your reports from one simple workspace.
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
            href="/privacy"
            className="transition hover:text-white"
          >
            Privacy
          </Link>

          <Link
            href="/dashboard"
            className="transition hover:text-white"
          >
            Dashboard
          </Link>

        </div>

      </div>
    </main>
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

      <span>
        {children}
      </span>

    </li>
  );
}
