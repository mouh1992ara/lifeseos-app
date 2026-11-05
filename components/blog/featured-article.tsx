import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { BlogArticle } from "@/lib/blog";

/**
 * The cinematic featured card: one wide editorial panel, image on the inline-end
 * so the copy still reads first in RTL. The gradient hairline is drawn with a
 * mask (no extra element on top of the image), and the image zoom is a
 * transform on an already-sized wrapper, so nothing reflows on hover.
 */
export default function FeaturedArticle({
  article,
  badge,
  cta,
  eyebrow,
}: {
  article: BlogArticle;
  badge: string;
  cta: string;
  eyebrow: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 sm:pt-16">
      <div className="mb-6 flex items-end justify-between gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {eyebrow}
        </p>
      </div>

      <Link
        href={`/blog/${article.slug}`}
        className="blog-featured group grid overflow-hidden rounded-[28px] border border-white/[0.08] lg:grid-cols-[1.05fr_.95fr]"
        data-blog-featured
      >
        <span aria-hidden="true" className="blog-featured-ring" />

        <div className="blog-featured-copy relative order-2 flex flex-col justify-center gap-4 p-6 sm:p-9 lg:order-1 lg:p-11">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="blog-tag blog-tag--accent">{badge}</span>
            <span className="blog-tag">{article.category}</span>
          </div>

          <h2 className="text-balance mt-1 text-2xl font-bold leading-[1.15] tracking-tight sm:text-3xl lg:text-[2.35rem]">
            {article.title}
          </h2>

          <p className="max-w-xl text-pretty text-[14.5px] leading-7 text-slate-400">
            {article.description}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
            <time dateTime={article.publishedAt}>{article.publishedAt}</time>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>{article.readTime}</span>
          </div>

          <span className="blog-featured-cta mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
            {cta}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>

        <div className="relative order-1 min-h-[220px] overflow-hidden lg:order-2 lg:min-h-[340px]">
          {/* Slow bloom behind the artwork, revealed with the image. */}
          <span aria-hidden="true" className="blog-featured-glow" />

          <Image
            src={article.featuredImage}
            alt={article.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="blog-featured-img object-cover"
          />

          {/* Keeps the copy side visually connected to the image. */}
          <span aria-hidden="true" className="blog-featured-scrim" />
        </div>
      </Link>
    </section>
  );
}
