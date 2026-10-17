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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4870397991437721"
          crossOrigin="anonymous"
        />
      </head>

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

        <PageVisitTracker />

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