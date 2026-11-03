"use client";

import { useState } from "react";

type SEOResult = {
  url: string;
  score: number;
  status: string;
  title: string;
  description: string;
  h1: string;
  images: {
    total: number;
    missingAlt: number;
  };
  canonical: string;
  robots?: string;
  social: {
    ogTitle: string;
    ogDescription: string;
  };
  recommendations?: string[];
};

export default function SEOAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<SEOResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyzeWebsite() {
    if (!url) return;

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  }

  function ProgressBar({
    title,
    value,
  }: {
    title: string;
    value: number;
  }) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-300">
          <span>{title}</span>
          <span>{value}%</span>
        </div>

        <div className="h-2 bg-slate-800 rounded-full">
          <div
            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{
              width: `${value}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white px-6 py-12">

      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold">
            Analyze Your Website
            <span className="block text-purple-400">
              SEO Performance
            </span>
          </h1>

          <p className="mt-4 text-slate-400">
            Discover SEO issues, technical problems and optimization opportunities instantly.
          </p>

        </div>


        <div className="flex gap-3 bg-slate-900 p-4 rounded-2xl">

          <input
            className="flex-1 bg-slate-800 rounded-xl px-5 py-4 outline-none"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />


          <button
            onClick={analyzeWebsite}
            className="px-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

        </div>



        {result && (

          <div className="mt-12 space-y-8">


            <section className="bg-slate-900 rounded-3xl p-10 text-center">

              <p className="text-slate-400">
                SEO SCORE
              </p>

              <h2
                className={`text-7xl font-bold mt-4 ${getScoreColor(result.score)}`}
              >
                {result.score}
              </h2>

              <p className="mt-4 text-slate-300">
                {result.status}
              </p>

            </section>



            <section className="grid md:grid-cols-2 gap-6">


              <div className="bg-slate-900 rounded-2xl p-6">
                <h3 className="text-blue-400 font-bold">
                  Technical SEO
                </h3>

                <div className="mt-5 space-y-4">

                  <ProgressBar
                    title="Canonical"
                    value={result.canonical !== "Not found" ? 100 : 0}
                  />

                  <ProgressBar
                    title="H1 Structure"
                    value={result.h1 !== "No H1 found" ? 100 : 30}
                  />

                  <ProgressBar
                    title="Meta Description"
                    value={
                      result.description !== "No description found"
                        ? 100
                        : 20
                    }
                  />

                </div>

              </div>



              <div className="bg-slate-900 rounded-2xl p-6">

                <h3 className="text-purple-400 font-bold">
                  Image SEO
                </h3>


                <div className="mt-5 space-y-3 text-slate-300">

                  <p>
                    Total Images:
                    <span className="ml-2 text-white">
                      {result.images.total}
                    </span>
                  </p>


                  <p>
                    Missing ALT:
                    <span className="ml-2 text-white">
                      {result.images.missingAlt}
                    </span>
                  </p>


                </div>

              </div>



              <div className="bg-slate-900 rounded-2xl p-6">

                <h3 className="text-green-400 font-bold">
                  Content SEO
                </h3>


                <p className="mt-4 text-slate-300">
                  Title:
                </p>

                <p>
                  {result.title}
                </p>


                <p className="mt-4 text-slate-300">
                  H1:
                </p>

                <p>
                  {result.h1}
                </p>

              </div>



              <div className="bg-slate-900 rounded-2xl p-6">

                <h3 className="text-pink-400 font-bold">
                  Social SEO
                </h3>


                <p className="mt-4">
                  OG Title:
                </p>

                <p className="text-slate-300">
                  {result.social.ogTitle}
                </p>


                <p className="mt-4">
                  OG Description:
                </p>

                <p className="text-slate-300">
                  {result.social.ogDescription}
                </p>

              </div>


            </section>




            <section className="bg-slate-900 rounded-3xl p-8">

              <h2 className="text-2xl font-bold mb-6">
                Recommendations
              </h2>


              <div className="space-y-4">


                {(result.recommendations || []).map(
                  (item, index) => (

                    <div
                      key={index}
                      className="bg-slate-800 rounded-xl p-5"
                    >

                      ⚠️ {item}

                    </div>

                  )
                )}


              </div>


            </section>



            <button
              className="bg-green-500 text-black px-8 py-4 rounded-xl font-bold"
            >
              Download PDF
            </button>



          </div>

        )}


      </div>

    </main>
  );
}