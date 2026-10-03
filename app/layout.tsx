import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

import "./globals.css";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";


export const metadata: Metadata = {

  metadataBase: new URL(defaultUrl),

  title: {
    default: "LifeSeos - Free SEO Tools",
    template: "%s | LifeSeos",
  },

  description:
    "Free SEO tools for website analysis, technical SEO, content optimization and smarter search growth.",

};



const geistSans = Geist({

  variable: "--font-geist-sans",

  display: "swap",

  subsets: ["latin"],

});



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {


  return (

    <html
      lang="en"
      suppressHydrationWarning
    >


      <body

        suppressHydrationWarning

        className={`
          ${geistSans.variable}
          min-h-screen
          bg-slate-950
          text-white
          antialiased
        `}

      >


        <ThemeProvider

          attribute="class"

          defaultTheme="dark"

          enableSystem={false}

          disableTransitionOnChange

        >


          <div className="flex min-h-screen flex-col">


            <SiteHeader />


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