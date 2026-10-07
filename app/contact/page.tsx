import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact LifeSeos - Support & Feedback",

  description:
    "Contact LifeSeos for questions, technical support, feedback, account assistance or privacy-related requests.",

  alternates: {
    canonical: "/contact",
  },

  openGraph: {
    title: "Contact LifeSeos",
    description:
      "Contact LifeSeos for questions, technical support, feedback, account assistance or privacy-related requests.",
    url: "/contact",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/contact.png",
        width: 1200,
        height: 630,
        alt: "Contact LifeSeos",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Contact LifeSeos",
    description:
      "Contact LifeSeos for support, feedback, questions or privacy-related requests.",
    images: ["/social/contact.png"],
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact LifeSeos",
  url: "https://www.lifeseos.com/contact",
  description:
    "Contact LifeSeos for questions, technical support, feedback, account assistance or privacy-related requests.",
  mainEntity: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactJsonLd),
        }}
      />

      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          {/* HERO */}
          <section className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              <span>✉</span>
              <span>Contact LifeSeos</span>
            </div>

            <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Get in touch
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Have a question, suggestion, technical support request, or
              privacy-related inquiry? We&apos;d be happy to hear from you.
            </p>
          </section>

          {/* CONTACT OPTIONS + FORM */}
          <section className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-5">
              <ContactCard
                icon="💬"
                title="General Questions"
                description="Questions about LifeSeos, features, or how our SEO tools work."
              />

              <ContactCard
                icon="🛠"
                title="Technical Support"
                description="Report a technical problem or let us know if something is not working correctly."
              />

              <ContactCard
                icon="🔒"
                title="Privacy Requests"
                description="Questions about your account, saved reports, or how LifeSeos handles information."
              />

              <ContactCard
                icon="✨"
                title="Feedback"
                description="Share ideas or suggestions that could help us improve LifeSeos."
              />
            </div>

            <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Send a message
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Contact Form
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in the form below and we&apos;ll review your message.
              </p>

              <ContactForm />
            </div>
          </section>

          {/* TOOLS CTA */}
          <section className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  Need help with your website?
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Explore our free SEO tools
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Analyze websites, review technical SEO issues, measure
                  performance, optimize content, and use practical SEO
                  utilities from one place.
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
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy
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

function ContactCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}