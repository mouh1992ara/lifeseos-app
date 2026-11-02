export type AudienceNavSlug = "youtubers" | "bloggers" | "agencies";

export type AudienceNavItem = {
  slug: AudienceNavSlug;
  title: string;
  description: string;
};

export const audienceNav: AudienceNavItem[] = [
  {
    slug: "youtubers",
    title: "YouTubers & Creators",
    description: "Keywords, titles, descriptions and scripts for your channel.",
  },
  {
    slug: "bloggers",
    title: "Bloggers & Writers",
    description: "Content checks, snippet previews and schema before you publish.",
  },
  {
    slug: "agencies",
    title: "Agencies & Freelancers",
    description: "Audit client sites, status codes, sitemaps and robots files.",
  },
];
