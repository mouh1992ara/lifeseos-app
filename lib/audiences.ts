export type AudienceSlug = "youtubers" | "bloggers" | "agencies";

export type Audience = {
  slug: AudienceSlug;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  painPoints: { title: string; text: string }[];
  tools: string[];
  steps: { title: string; text: string }[];
  guides: string[];
  closing: { title: string; text: string };
};

export const toolCatalog: Record<string, { title: string; description: string }> = {
  "seo-analyzer": {
    title: "SEO Analyzer",
    description: "Audit a website for technical, on-page and content issues.",
  },
  "seo-page-analyzer": {
    title: "SEO Page Analyzer",
    description: "Review the structure, metadata and key signals of a single page.",
  },
  "page-speed": {
    title: "Page Speed Analyzer",
    description: "Check performance signals that affect speed and user experience.",
  },
  "content-analyzer": {
    title: "Content Analyzer",
    description: "Analyze content length, readability, keywords and basic SEO quality signals.",
  },
  "http-status-checker": {
    title: "HTTP Status Checker",
    description: "Check status codes and redirects for any URL.",
  },
  "xml-sitemap-generator": {
    title: "XML Sitemap Generator",
    description: "Generate an XML sitemap that helps search engines find your pages.",
  },
  "robots-txt-generator": {
    title: "Robots.txt Generator",
    description: "Create a robots.txt file that controls crawling safely.",
  },
  "meta-tag-generator": {
    title: "Meta Tag Generator",
    description: "Write title and description tags that are ready to copy.",
  },
  "serp-snippet-preview": {
    title: "SERP Snippet Preview",
    description: "Preview how your page can appear in search results.",
  },
  "keyword-density-checker": {
    title: "Keyword Density Checker",
    description: "Review keyword frequency and keep your wording natural.",
  },
  "article-rewriter": {
    title: "SEO Article Rewriter",
    description: "Refine and rewrite article text with SEO in mind.",
  },
  "schema-markup-generator": {
    title: "Schema Markup Generator",
    description: "Generate structured data (JSON-LD) for your pages.",
  },
  "youtube-keyword-ideas": {
    title: "YouTube Keyword Ideas",
    description: "Find keyword ideas and topics worth making videos about.",
  },
  "youtube-title-generator": {
    title: "YouTube Title Generator",
    description: "Generate title options for your next video.",
  },
  "youtube-title-analyzer": {
    title: "YouTube Title Analyzer",
    description: "Check how strong a video title is before you publish.",
  },
  "youtube-description-generator": {
    title: "YouTube Description Generator",
    description: "Create structured YouTube descriptions with keyword support and calls to action.",
  },
  "youtube-script-writer": {
    title: "YouTube Script Writer",
    description: "Build structured video scripts with hooks, main points, transitions and CTAs.",
  },
};

export const guideCatalog: Record<string, string> = {
  "complete-seo-audit-guide": "Complete SEO Audit Guide",
  "seo-meta-tags-guide": "SEO Meta Tags Guide",
  "page-speed-seo-guide": "Page Speed SEO Guide",
  "technical-seo-guide": "Technical SEO Guide",
  "xml-sitemap-guide": "XML Sitemap Guide",
  "robots-txt-guide": "Robots.txt Guide",
  "http-status-codes-seo-guide": "HTTP Status Codes for SEO",
  "keyword-density-guide": "Keyword Density for SEO",
  "content-analysis-seo-guide": "Content Analysis SEO Guide",
  "on-page-seo-checklist": "On-Page SEO Checklist",
};

export const audiences: Record<AudienceSlug, Audience> = {
  youtubers: {
    slug: "youtubers",
    metaTitle: "SEO Tools for YouTubers and Creators",
    metaDescription:
      "Free SEO tools for YouTubers and creators with a website: find keywords, generate titles, descriptions and scripts, and keep your site search-ready.",
    eyebrow: "For YouTubers and creators",
    headline: "SEO tools for",
    headlineAccent: "YouTubers and creators with a website",
    subheadline:
      "Find keywords, write titles, descriptions and scripts, and keep your site search-ready, all from one free toolkit.",
    primaryCta: {
      label: "Try the YouTube Title Generator",
      href: "/tools/youtube-title-generator",
    },
    painPoints: [
      {
        title: "Titles and descriptions take guesswork",
        text: "Generate and check title options, and build structured descriptions with keywords and calls to action.",
      },
      {
        title: "Scripts start from a blank page",
        text: "Draft hooks, main points, transitions and CTAs before you record.",
      },
      {
        title: "Your website and channel grow separately",
        text: "Keep your site's metadata, speed and indexing healthy so your videos and pages can support each other.",
      },
    ],
    tools: [
      "youtube-keyword-ideas",
      "youtube-title-generator",
      "youtube-title-analyzer",
      "youtube-description-generator",
      "youtube-script-writer",
      "meta-tag-generator",
      "seo-analyzer",
    ],
    steps: [
      {
        title: "Research keywords",
        text: "Start with YouTube Keyword Ideas to find topics worth making.",
      },
      {
        title: "Write the video package",
        text: "Generate and check titles, then build the description and script.",
      },
      {
        title: "Check your website",
        text: "Run the SEO Analyzer on the site or blog that supports your channel.",
      },
    ],
    guides: ["on-page-seo-checklist", "seo-meta-tags-guide", "keyword-density-guide"],
    closing: {
      title: "Start with your next video",
      text: "Pick a tool and run it in seconds. The tools are free to use.",
    },
  },

  bloggers: {
    slug: "bloggers",
    metaTitle: "SEO Tools for Bloggers",
    metaDescription:
      "Free SEO tools for bloggers: analyze content, check keyword density, preview search snippets and generate schema markup before you publish.",
    eyebrow: "For bloggers and writers",
    headline: "SEO tools for",
    headlineAccent: "bloggers who want to rank",
    subheadline:
      "Check your content, balance keyword usage, preview your search snippet and add structured data before you publish.",
    primaryCta: {
      label: "Analyze a blog post",
      href: "/tools/content-analyzer",
    },
    painPoints: [
      {
        title: "Is this post really optimized?",
        text: "Analyze content length, readability, keywords and basic SEO quality signals in one pass.",
      },
      {
        title: "Keyword stuffing worries",
        text: "Review keyword frequency and keep your writing natural while staying on topic.",
      },
      {
        title: "Snippets and structured data are fiddly",
        text: "Preview how your page can look in search and generate JSON-LD markup you can paste in.",
      },
    ],
    tools: [
      "content-analyzer",
      "keyword-density-checker",
      "meta-tag-generator",
      "serp-snippet-preview",
      "schema-markup-generator",
      "article-rewriter",
      "page-speed",
    ],
    steps: [
      {
        title: "Write and analyze",
        text: "Run the Content Analyzer and Keyword Density Checker on your draft.",
      },
      {
        title: "Polish the snippet",
        text: "Write your title and description, then preview them in the SERP Snippet Preview.",
      },
      {
        title: "Add markup and check speed",
        text: "Generate schema markup and test page speed before you hit publish.",
      },
    ],
    guides: [
      "content-analysis-seo-guide",
      "keyword-density-guide",
      "on-page-seo-checklist",
      "seo-meta-tags-guide",
    ],
    closing: {
      title: "Publish with more confidence",
      text: "Run your next post through the tools. They are free to use.",
    },
  },

  agencies: {
    slug: "agencies",
    metaTitle: "SEO Audit Tools for Agencies and Freelancers",
    metaDescription:
      "Free SEO audit tools for agencies and freelancers: audit client sites, check status codes, sitemaps and robots files, and save reports to your dashboard.",
    eyebrow: "For agencies and freelancers",
    headline: "SEO audit tools for",
    headlineAccent: "agencies and freelancers",
    subheadline:
      "Audit client sites, check status codes, sitemaps and robots files, and save reports to your dashboard, without a heavy paid suite.",
    primaryCta: {
      label: "Run a website audit",
      href: "/tools/seo-analyzer",
    },
    painPoints: [
      {
        title: "Audits eat billable hours",
        text: "Run a website audit in one step and get clear recommendations to act on.",
      },
      {
        title: "Technical checks are spread across tools",
        text: "Status codes, sitemaps, robots files and schema markup, all in one toolkit.",
      },
      {
        title: "Clients want something to look at",
        text: "Create a free account to save reports to your dashboard and come back to them.",
      },
    ],
    tools: [
      "seo-analyzer",
      "seo-page-analyzer",
      "http-status-checker",
      "xml-sitemap-generator",
      "robots-txt-generator",
      "page-speed",
      "schema-markup-generator",
    ],
    steps: [
      {
        title: "Audit the site",
        text: "Start with the SEO Analyzer to see technical, on-page and content signals.",
      },
      {
        title: "Dig into the issues",
        text: "Check status codes, sitemaps and robots files for crawling and indexing problems.",
      },
      {
        title: "Fix and document",
        text: "Use the generators for fixes, and save your reports to the dashboard.",
      },
    ],
    guides: [
      "complete-seo-audit-guide",
      "technical-seo-guide",
      "http-status-codes-seo-guide",
      "xml-sitemap-guide",
      "robots-txt-guide",
    ],
    closing: {
      title: "Audit your next client site",
      text: "Run your first audit in seconds. The tools are free to use.",
    },
  },
};
