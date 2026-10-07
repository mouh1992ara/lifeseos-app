export type ArticleSection = {
  id: string;

  title: string;

  paragraphs: string[];

  bullets?: string[];

  tip?: string;
};



export type BlogArticle = {

  slug: string;

  title: string;

  description: string;

  category: string;

  author: string;

  publishedAt: string;

  updatedAt: string;

  readTime: string;

  featuredImage: string;

  imageAlt: string;

  images?: {
    src: string;
    alt: string;
  }[];

  sections: ArticleSection[];

  toolName: string;

  toolUrl: string;

};