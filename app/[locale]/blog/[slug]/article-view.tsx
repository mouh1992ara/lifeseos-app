import { Link } from "@/i18n/navigation";
import { ArticleToc, ReadingProgress } from "@/components/blog/reading-progress";
import type { BlogArticle } from "@/lib/blog";

type Labels = {
  contents: string;
  relatedTool: string;
  backToBlog: string;
  moreGuides: string;
  tip: string;
  published: string;
  updated: string;
  byAuthor: string;
  readGuide: string;
  ctaTitle: string;
  ctaBody: string;
  toolLabel: string;
  readingProgress: string;
};

type RelatedArticle = Pick<
  BlogArticle,
  "slug" | "title" | "description" | "category" | "readTime"
>;

export default function ArticleView({
  article,
  relatedArticles,
  labels,
}: {
  article: BlogArticle;
  relatedArticles: RelatedArticle[];
  labels: Labels;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <ReadingProgress label={labels.readingProgress} />

      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <span aria-hidden="true" className="rtl:rotate-180">
              ←
            </span>
            {labels.backToBlog}
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                {article.category}
              </span>

              <h1 className="text-balance mt-6 text-3xl font-black leading-tight sm:text-5xl">
                {article.title}
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                {article.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                <span>{labels.byAuthor}</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span>{labels.published}</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span>{article.readTime}</span>
              </div>

              <p className="mt-1 text-xs text-slate-500">{labels.updated}</p>
            </div>

            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featuredImage}
                alt={article.imageAlt}
                className="aspect-[16/10] w-full rounded-[26px] border border-white/10 object-cover shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <article data-article-body className="min-w-0 space-y-10">
            {article.sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="flex items-start gap-3 text-2xl font-bold leading-snug sm:text-3xl">
                  <span
                    aria-hidden="true"
                    className="mt-1 font-mono text-sm font-normal text-emerald-400"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{section.title}</span>
                </h2>

                <div className="mt-5 space-y-4 text-base leading-8 text-slate-300">
                  {section.paragraphs?.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {section.bullets?.length ? (
                  <ul className="mt-5 space-y-3 text-base leading-7 text-slate-300">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[10px] font-bold text-emerald-300"
                        >
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.tip ? (
                  <aside className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      {labels.tip}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-emerald-100/80">
                      {section.tip}
                    </p>
                  </aside>
                ) : null}

                {section.links?.length ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:text-emerald-300"
                      >
                        {link.label}
                        <span aria-hidden="true" className="rtl:rotate-180">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}

            {/* TOOL CTA */}
            <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/[0.06] p-7">
              <h2 className="text-2xl font-bold">{labels.ctaTitle}</h2>
              <p className="mt-3 leading-7 text-slate-300">{labels.ctaBody}</p>

              <Link
                href={article.toolUrl}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                {labels.toolLabel}
                <span aria-hidden="true" className="rtl:rotate-180">
                  →
                </span>
              </Link>
            </section>
          </article>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-[calc(var(--header-h,76px)+1rem)]">
            <ArticleToc
              label={labels.contents}
              sections={article.sections.map((section) => ({
                id: section.id,
                title: section.title,
              }))}
            />
          </aside>
        </div>
      </section>

      {/* RELATED */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">{labels.moreGuides}</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-white/[0.045]"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
                  {related.category}
                </p>

                <h3 className="mt-3 text-lg font-semibold leading-snug">
                  {related.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                  {related.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300">
                  {labels.readGuide}
                  <span
                    aria-hidden="true"
                    className="transition group-hover:translate-x-0.5 rtl:rotate-180"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}