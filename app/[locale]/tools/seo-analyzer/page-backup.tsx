"use client";

import { useState } from "react";

type SEOResult = {
  score: number;
  status: string;

  url?: string;

  title?: string;
  description?: string;
  h1?: string;

  images?: {
    total: number;
    missingAlt: number;
  };

  canonical?: string;
  robots?: string;

  social?: {
    ogTitle?: string;
    ogDescription?: string;
  };

  recommendations?: string[];
};


export default function SEOAnalyzerPage() {

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<SEOResult | null>(null);

  const [error, setError] = useState("");


  async function analyzeWebsite() {

    if (!url) {
      setError("Please enter a website URL");
      return;
    }


    setLoading(true);
    setError("");
    setResult(null);


    try {

      const response = await fetch("/api/analyze", {

        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },

        body:JSON.stringify({
          url
        })

      });



      const data = await response.json();



      if(!response.ok){
        throw new Error(data.error || "Analysis failed");
      }



      setResult({

        score:data.score ?? 0,

        status:data.status ?? "Unknown",

        url:data.url,

        title:data.title,

        description:data.description,

        h1:data.h1,

        images:data.images,

        canonical:data.canonical,

        robots:data.robots,

        social:data.social,

        recommendations:data.recommendations ?? [],

      });



    } catch(err:any){

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }



  function scoreColor(score:number){

    if(score >= 80)
      return "text-emerald-400";

    if(score >= 60)
      return "text-yellow-400";

    return "text-red-400";

  }



  return (

    <main className="min-h-screen bg-slate-950 text-white">


      <section className="
      mx-auto
      max-w-6xl
      px-6
      py-20
      ">


        <div className="text-center">


          <div className="
          inline-flex
          rounded-full
          border
          border-blue-400/20
          bg-blue-400/10
          px-5
          py-2
          text-sm
          text-blue-300
          ">

            🔍 LifeSeos SEO Analyzer

          </div>



          <h1 className="
          mt-8
          text-5xl
          font-bold
          md:text-7xl
          ">

            Analyze Your Website

            <span className="
            block
            bg-gradient-to-r
            from-blue-400
            via-purple-400
            to-pink-400
            bg-clip-text
            text-transparent
            ">

              SEO Performance

            </span>

          </h1>



          <p className="
          mx-auto
          mt-6
          max-w-2xl
          text-lg
          text-slate-400
          ">

            Discover SEO issues, technical problems and
            optimization opportunities instantly.

          </p>



          <div className="
          mx-auto
          mt-10
          flex
          max-w-3xl
          gap-3
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-4
          ">


            <input

              value={url}

              onChange={(e)=>setUrl(e.target.value)}

              placeholder="https://example.com"

              className="
              flex-1
              rounded-xl
              bg-slate-900
              px-5
              py-4
              outline-none
              "

            />



            <button

            onClick={analyzeWebsite}

            disabled={loading}

            className="
            rounded-xl
            bg-gradient-to-r
            from-blue-500
            to-purple-600
            px-8
            font-semibold
            transition
            hover:scale-105
            "

            >

              {loading ? "Analyzing..." : "Analyze"}

            </button>


          </div>


        </div>



        {
          error && (

            <div className="
            mt-8
            rounded-xl
            border
            border-red-400/20
            bg-red-400/10
            p-4
            text-red-300
            ">

              {error}

            </div>

          )
        }



        {
          result && (

          <div className="mt-16 space-y-8">


            {/* SCORE */}

            <div className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-8
            text-center
            ">


              <div className="
              text-sm
              text-slate-400
              ">
                SEO SCORE
              </div>


              <div className={`
              mt-4
              text-7xl
              font-bold
              ${scoreColor(result.score)}
              `}>

                {result.score}

              </div>


              <div className="mt-3 text-slate-300">

                {result.status}

              </div>


            </div>




            {/* OVERVIEW */}

            <div className="
            grid
            gap-6
            md:grid-cols-2
            ">


              <Card title="Title">

                {result.title || "Not found"}

              </Card>


              <Card title="H1">

                {result.h1 || "Not found"}

              </Card>



              <Card title="Meta Description">

                {result.description || "Not found"}

              </Card>



              <Card title="Canonical">

                {result.canonical || "Not found"}

              </Card>


            </div>





            {/* IMAGES */}

            <Card title="Images Analysis">

              Total Images:
              {" "}
              {result.images?.total ?? 0}

              <br/>

              Missing ALT:
              {" "}
              {result.images?.missingAlt ?? 0}


            </Card>





            {/* SOCIAL */}

            <Card title="Social SEO">

              OG Title:
              {" "}
              {result.social?.ogTitle}

              <br/>

              OG Description:
              {" "}
              {result.social?.ogDescription}


            </Card>





            {/* RECOMMENDATIONS */}

            <div className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-8
            ">


              <h2 className="
              text-2xl
              font-bold
              ">

                Recommendations

              </h2>



              <div className="
              mt-5
              space-y-3
              ">


              {
                (result.recommendations || []).map(
                  (item,index)=>(

                  <div

                  key={index}

                  className="
                  rounded-xl
                  bg-white/5
                  px-5
                  py-4
                  text-slate-200
                  "

                  >

                    ⚠ {item}

                  </div>


                ))
              }


              </div>


            </div>



          </div>

          )
        }



      </section>


    </main>

  );

}




function Card(
{
 title,
 children
}:
{
 title:string;
 children:React.ReactNode;
}

){

return (

<div className="
rounded-3xl
border
border-white/10
bg-white/5
p-6
">


<h3 className="
mb-3
font-semibold
text-blue-300
">

{title}

</h3>


<p className="
text-slate-300
leading-7
break-words
">

{children}

</p>


</div>

);

}