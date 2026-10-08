import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import LivePresence from "@/components/live-presence";

import "./globals.css";


const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.lifeseos.com";



export const metadata: Metadata = {

  metadataBase:
    new URL(siteUrl),


  title: {

    default:
      "LifeSeos - Free SEO Tools for Smarter Growth",

    template:
      "%s | LifeSeos",

  },


  description:
    "Free SEO tools for website analysis, technical SEO, on-page optimization, content analysis, page speed, metadata, sitemaps and smarter search growth.",


  applicationName:
    "LifeSeos",


  creator:
    "LifeSeos",


  publisher:
    "LifeSeos",


  keywords: [

    "SEO tools",
    "free SEO tools",
    "SEO analyzer",
    "website SEO checker",
    "technical SEO",
    "on-page SEO",
    "XML sitemap generator",
    "robots.txt generator",
    "page speed analyzer",
    "content analyzer",

  ],


  alternates: {

    canonical:
      "/",

  },


  openGraph: {

    type:
      "website",

    locale:
      "en_US",

    url:
      siteUrl,

    siteName:
      "LifeSeos",


    title:
      "LifeSeos - Free SEO Tools for Smarter Growth",


    description:
      "Analyze websites, discover SEO issues and optimize your website with free LifeSeos SEO tools.",


    images: [

      {

        url:
          "/social/home.png",

        width:
          1200,

        height:
          630,

        alt:
          "LifeSeos SEO Tools",

      },

    ],

  },


  twitter: {

    card:
      "summary_large_image",

    title:
      "LifeSeos - Free SEO Tools for Smarter Growth",

    description:
      "Free SEO tools for website analysis and optimization.",


    images:

      [
        "/social/home.png",
      ],

  },


  robots: {

    index:
      true,

    follow:
      true,

    googleBot: {

      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,

    },

  },


  verification: {

    other: {

      "baidu-site-verification": [

        "codeva-GvjC1X0P41",

        "codeva-qOIDHgcBnq",

      ],

    },

  },


};



const websiteJsonLd = {

  "@context":
    "https://schema.org",

  "@type":
    "WebSite",

  name:
    "LifeSeos",

  url:
    "https://www.lifeseos.com",

  description:
    "Free SEO tools for website analysis and optimization.",

};



const organizationJsonLd = {

  "@context":
    "https://schema.org",

  "@type":
    "Organization",

  name:
    "LifeSeos",

  url:
    "https://www.lifeseos.com",

  logo:
    "https://www.lifeseos.com/icon.png",

};




export default function RootLayout({

  children,

}: Readonly<{

  children:
    React.ReactNode;

}>) {


  return (

    <html
      lang="en"
      suppressHydrationWarning
    >


      <body

        className="
          min-h-screen
          bg-slate-950
          text-white
          antialiased
        "

      >


        <script

          id="website-schema"

          type="application/ld+json"

          dangerouslySetInnerHTML={{

            __html:
              JSON.stringify(
                websiteJsonLd
              ),

          }}

        />



        <script

          id="organization-schema"

          type="application/ld+json"

          dangerouslySetInnerHTML={{

            __html:
              JSON.stringify(
                organizationJsonLd
              ),

          }}

        />



        <ThemeProvider

          attribute="class"

          defaultTheme="dark"

          enableSystem={false}

          disableTransitionOnChange

        >


          <div className="flex min-h-screen flex-col">


            <SiteHeader />


            <LivePresence />


            <main className="flex-1">

              {children}

            </main>


            <SiteFooter />


          </div>


        </ThemeProvider>


      </body>


    </html>

  );

}