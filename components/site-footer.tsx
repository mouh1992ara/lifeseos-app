export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <p>© 2026 LifeSeos. Built for better SEO workflows.</p>

        <div className="flex gap-5">
          <a href="/tools" className="hover:text-white">
            Tools
          </a>

          <a href="/privacy" className="hover:text-white">
            Privacy
          </a>

          <a href="/terms" className="hover:text-white">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}