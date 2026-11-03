import type { BlogArticle } from "./types";

export type { BlogArticle } from "./types";


import { seoAuditArticle } from "./data/seo-audit";
import { seoMetaTagsArticle } from "./data/seo-meta-tags";
import { pageSpeedArticle } from "./data/page-speed";
import { technicalSeoArticle } from "./data/technical-seo";
import { xmlSitemapArticle } from "./data/xml-sitemap";
import { robotsTxtArticle } from "./data/robots-txt";
import { httpStatusArticle } from "./data/http-status";
import { keywordDensityArticle } from "./data/keyword-density";
import { contentAnalysisArticle } from "./data/content-analysis";
import { onPageSeoArticle } from "./data/on-page-seo";


export const articles: BlogArticle[] = [

  seoAuditArticle,

  seoMetaTagsArticle,

  pageSpeedArticle,

  technicalSeoArticle,

  xmlSitemapArticle,

  robotsTxtArticle,

  httpStatusArticle,

  keywordDensityArticle,

  contentAnalysisArticle,

  onPageSeoArticle

];



export function getArticleBySlug(
  slug: string
) {

  return articles.find(
    (article) =>
      article.slug === slug
  );

}



export function getRelatedArticles(
  currentSlug: string
) {

  return articles
    .filter(
      (article) =>
        article.slug !== currentSlug
    )
    .slice(0, 3);

}