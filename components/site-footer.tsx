import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-base font-semibold text-white">
              LifeSeos
            </p>

            <p className="mt-2 text-sm text-slate-300">
              SEO tools for smarter website growth.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
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
              href="/blog"
              className="transition hover:text-white"
            >
              Blog
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

            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-200">
            © 2026 LifeSeos. All rights reserved.
          </p>

          <p className="text-slate-200">
            Built for better SEO workflows.
          </p>
        </div>
      </div>
    </footer>
  );
}