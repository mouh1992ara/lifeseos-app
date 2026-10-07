import Link from "next/link";

import type { BlogArticle } from "../articles";


type RelatedArticle = Pick<
  BlogArticle,
  "slug" | "title" | "description" | "category" | "readTime"
>;


export default function ArticleView({
  article,
  relatedArticles,
}: {
  article: BlogArticle;
  relatedArticles: RelatedArticle[];
}) {

  return (

    <main className="min-h-screen bg-slate-950 text-white">


      {/* HERO */}

      <section className="border-b border-white/10">

        <div className="mx-auto max-w-6xl px-6 py-20">


          <Link
            href="/blog"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Blog
          </Link>



          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">


            <div>

              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                {article.category}
              </span>



              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
                {article.title}
              </h1>



              <p className="mt-6 text-lg leading-8 text-slate-300">
                {article.description}
              </p>



              <div className="mt-8 text-sm text-slate-400">

                Written by{" "}

                <span className="font-semibold text-white">
                  {article.author}
                </span>

              </div>



              <div className="mt-2 text-sm text-slate-500">

                Updated {article.updatedAt}

              </div>


            </div>




            <div className="overflow-hidden rounded-3xl border border-white/10">

              <img

                src={article.featuredImage}

                alt={article.imageAlt}

                className="h-full w-full object-cover"

                loading="eager"

              />

            </div>



          </div>


        </div>


      </section>





      {/* ARTICLE CONTENT */}


      <section className="mx-auto max-w-4xl px-6 py-16">


        {article.sections.map((section, sectionIndex) => {


          const sectionImage =
            article.images?.[sectionIndex];



          return (

            <article
              key={section.id}
              className="mb-16"
            >



              {sectionImage && (

                <figure className="mb-10 overflow-hidden rounded-3xl border border-white/10">

                  <img

                    src={sectionImage.src}

                    alt={sectionImage.alt}

                    className="w-full object-cover"

                    loading="lazy"

                  />


                  <figcaption className="px-5 py-3 text-sm text-slate-400">

                    {sectionImage.alt}

                  </figcaption>


                </figure>

              )}





              <h2 className="mb-5 text-3xl font-bold">

                {section.title}

              </h2>





              {section.paragraphs.map(
                (paragraph, paragraphIndex) => (

                  <p

                    key={paragraphIndex}

                    className="mb-5 text-lg leading-8 text-slate-300"

                  >

                    {paragraph}

                  </p>

                )

              )}






              {section.bullets && (

                <ul className="mt-6 space-y-3">


                  {section.bullets.map((bullet) => (

                    <li

                      key={bullet}

                      className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300"

                    >

                      ✓ {bullet}

                    </li>


                  ))}


                </ul>


              )}







              {section.tip && (

                <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">


                  <strong>

                    Practical tip:

                  </strong>



                  <p className="mt-2 text-slate-200">

                    {section.tip}

                  </p>


                </div>


              )}





            </article>


          );


        })}





        {/* TOOL CTA */}



        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8">


          <h2 className="text-2xl font-bold">

            Try {article.toolName}

          </h2>



          <p className="mt-3 text-slate-300">

            Apply this guide directly using LifeSeos tools.

          </p>



          <Link

            href={article.toolUrl}

            className="mt-6 inline-flex rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"

          >

            Open Tool →

          </Link>



        </div>



      </section>






      {/* RELATED ARTICLES */}



      {relatedArticles.length > 0 && (


        <section className="border-t border-white/10 bg-slate-900/30">


          <div className="mx-auto max-w-6xl px-6 py-16">


            <h2 className="text-3xl font-bold">

              Related Guides

            </h2>




            <div className="mt-8 grid gap-6 md:grid-cols-3">



              {relatedArticles.map((item) => (


                <Link

                  key={item.slug}

                  href={`/blog/${item.slug}`}

                  className="rounded-2xl border border-white/10 bg-white/5 p-6"

                >


                  <p className="text-sm text-cyan-300">

                    {item.category}

                  </p>



                  <h3 className="mt-3 text-xl font-bold">

                    {item.title}

                  </h3>



                  <p className="mt-3 text-sm text-slate-400">

                    {item.description}

                  </p>



                </Link>


              ))}


            </div>


          </div>


        </section>


      )}



    </main>


  );

}