import type { Metadata } from "next";
import Script from "next/script";

import BlogClient from "./blog-client";


export const metadata: Metadata = {
  title: "SEO Blog & Guides",

  description:
    "Read practical SEO guides, technical tutorials and website optimization strategies from LifeSeos.",

  alternates: {
    canonical: "/blog",
  },

  openGraph: {
    title: "SEO Blog & Guides | LifeSeos",

    description:
      "Practical SEO guides, technical tutorials and website optimization strategies from LifeSeos.",

    url: "/blog",

    type: "website",

    siteName: "LifeSeos",

    images: [
      {
        url: "/social/blog.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos SEO Blog and Guides",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "SEO Blog & Guides | LifeSeos",

    description:
      "Practical SEO guides, technical tutorials and website optimization strategies.",

    images: [
      "/social/blog.png",
    ],
  },
};



const blogJsonLd = {
  "@context": "https://schema.org",

  "@type": "Blog",

  name:
    "LifeSeos SEO Blog",

  url:
    "https://www.lifeseos.com/blog",

  description:
    "Practical SEO guides, technical tutorials and website optimization strategies.",

  publisher: {

    "@type":
      "Organization",

    name:
      "LifeSeos",

    url:
      "https://www.lifeseos.com",

  },
};



export default function BlogPage() {

  return (

    <>

      <Script

        id="blog-jsonld"

        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(blogJsonLd),
        }}

      />


      <BlogClient />

    </>

  );
}