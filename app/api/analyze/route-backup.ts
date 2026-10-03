import { NextResponse } from "next/server";


export async function POST(request: Request) {

  try {

    const { url } = await request.json();


    if (!url) {
      return NextResponse.json(
        {
          error: "URL is required"
        },
        {
          status:400
        }
      );
    }


    const response = await fetch(url, {
      headers:{
        "User-Agent":"LifeSeos SEO Analyzer"
      }
    });


    const html = await response.text();



    // TITLE
    const titleMatch = html.match(
      /<title>(.*?)<\/title>/i
    );

    const title =
      titleMatch?.[1] || "No title found";



    // DESCRIPTION

    const descriptionMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["']/i
      );


    const description =
      descriptionMatch?.[1] || "No description found";



    // H1

    const h1Match =
      html.match(
        /<h1[^>]*>(.*?)<\/h1>/i
      );


    const h1 =
      h1Match?.[1] || "No H1 found";



    // IMAGES

    const images =
      html.match(/<img[^>]*>/gi) || [];


    const missingAlt =
      images.filter(
        img => !img.includes("alt=")
      );



    // CANONICAL

    const canonicalMatch =
      html.match(
        /<link[^>]+rel=["']canonical["'][^>]+href=["'](.*?)["']/i
      );


    const canonical =
      canonicalMatch?.[1] || "Not found";



    // ROBOTS

    const robotsMatch =
      html.match(
        /<meta[^>]+name=["']robots["'][^>]+content=["'](.*?)["']/i
      );


    const robots =
      robotsMatch?.[1] || "Not found";



    // OG TITLE

    const ogTitleMatch =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["'](.*?)["']/i
      );


    const ogTitle =
      ogTitleMatch?.[1] || "Not found";



    // OG DESCRIPTION

    const ogDescriptionMatch =
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["'](.*?)["']/i
      );


    const ogDescription =
      ogDescriptionMatch?.[1] || "Not found";




    // SCORE

    let score = 100;


    if(title === "No title found")
      score -=20;


    if(description === "No description found")
      score -=20;


    if(h1 === "No H1 found")
      score -=15;


    if(missingAlt.length > 0)
      score -=10;



    if(canonical === "Not found")
      score -=10;



    if(score < 0)
      score = 0;




    const recommendations:string[] = [];



    if(title === "No title found")
      recommendations.push(
        "Add a clear SEO title tag"
      );


    if(description === "No description found")
      recommendations.push(
        "Add a meta description"
      );


    if(h1 === "No H1 found")
      recommendations.push(
        "Add a main H1 heading"
      );


    if(missingAlt.length > 0)
      recommendations.push(
        "Add alt attributes to images"
      );


    if(canonical === "Not found")
      recommendations.push(
        "Add canonical URL"
      );



    if(recommendations.length === 0){
      recommendations.push(
        "SEO structure looks good"
      );
    }


return NextResponse.json({
  url,
  score,

  status:
    score >= 80
      ? "Excellent"
      : score >= 60
      ? "Good"
      : "Needs Improvement",

  title,
  description,
  h1,

  images: {
    total: images.length,
    missingAlt: missingAlt.length,
  },

  canonical,
  robots,

  social: {
    ogTitle,
    ogDescription,
  },

recommendations,
});


  } catch(error){


    return NextResponse.json(
      {
        error:"Unable to analyze website"
      },
      {
        status:500,
      }
    );

  }

}
