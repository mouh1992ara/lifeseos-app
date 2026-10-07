import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

import ArticleView from "./article-view";

import {
  articles,
  getArticleBySlug,
  getRelatedArticles,
} from "../articles";


type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};


export const dynamicParams = false;


export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}



export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {

  const { slug } = await params;

  const article = getArticleBySlug(slug);


  if (!article) {
    return {
      title: "Article Not Found",
    };
  }


  return {

    title: article.title,


    description:
      article.description,


    alternates: {
      canonical:
        `/blog/${article.slug}`,
    },


    openGraph: {

      title:
        `${article.title} | LifeSeos`,


      description:
        article.description,


      type: "article",


      url:
        `https://www.lifeseos.com/blog/${article.slug}`,


      siteName:
        "LifeSeos",


      images: [
        {
          url:
            article.featuredImage,

          width: 1200,

          height: 630,

          alt:
            article.imageAlt,
        },
      ],
    },


    twitter: {

      card:
        "summary_large_image",


      title:
        `${article.title} | LifeSeos`,


      description:
        article.description,


      images: [
        article.featuredImage,
      ],
    },
  };
}




export default async function BlogArticlePage({
  params,
}: PageProps) {


  const { slug } = await params;


  const article =
    getArticleBySlug(slug);



  if (!article) {
    notFound();
  }



  const relatedArticles =
    getRelatedArticles(article.slug)
      .map((related) => ({

        slug:
          related.slug,

        title:
          related.title,

        description:
          related.description,

        category:
          related.category,

        readTime:
          related.readTime,

      }));




  const articleUrl =
    `https://www.lifeseos.com/blog/${article.slug}`;



  const jsonLd = {

    "@context":
      "https://schema.org",


    "@type":
      "BlogPosting",



    headline:
      article.title,



    description:
      article.description,



    image: [
      `https://www.lifeseos.com${article.featuredImage}`,
    ],



    datePublished:
      article.publishedAt,



    dateModified:
      article.updatedAt,



    author: {

      "@type":
        "Organization",


      name:
        article.author,


      url:
        "https://www.lifeseos.com",

    },



    publisher: {

      "@type":
        "Organization",


      name:
        "LifeSeos",


      url:
        "https://www.lifeseos.com",

    },



    mainEntityOfPage: {

      "@type":
        "WebPage",


      "@id":
        articleUrl,

    },



    articleSection:
      article.category,

  };




  return (

    <>

      <Script

        id="article-jsonld"

        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(jsonLd),
        }}

      />



      <ArticleView

        article={article}

        relatedArticles={
          relatedArticles
        }

      />


    </>

  );
}