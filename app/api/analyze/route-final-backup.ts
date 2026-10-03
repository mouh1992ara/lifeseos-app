import { NextResponse } from "next/server";

export async function POST(request: Request) {

  try {

    const { url } = await request.json();


    if (!url) {

      return NextResponse.json(
        {
          error: "URL is required",
        },
        {
          status: 400,
        }
      );

    }



    const response = await fetch(url, {

      headers: {

        "User-Agent": "LifeSeos SEO Analyzer",

      },

    });



    const html = await response.text();



    // TITLE

    const titleMatch = html.match(
      /<title>(.*?)<\/title>/i
    );


    const title =
      titleMatch?.[1] || "No title found";



    // META DESCRIPTION

    const descriptionMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      );


    const description =
      descriptionMatch?.[1] || "No description found";




    // H1

    const h1Match =
      html.match(
        /<h1[^>]*>(.*?)<\/h1>/i
      );


    const h1 =
      h1Match?.[1]
        ?.replace(/<[^>]*>/g, "")
        ||
        "No H1 found";




    // IMAGES

    const images =
      html.match(/<img[^>]*>/gi) || [];



    const missingAlt =
      images.filter(
        (img) =>
          !img.match(/alt=["'][^"']*["']/i)
      );





    // CANONICAL

    const canonicalMatch =
      html.match(
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
      );



    const canonical =
      canonicalMatch?.[1] || "Not found";






    // ROBOTS

    const robotsMatch =
      html.match(
        /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i
      );


    const robots =
      robotsMatch?.[1] || "Not found";







    // SOCIAL OG

    const ogTitleMatch =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
      );


    const ogDescriptionMatch =
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
      );



    const ogTitle =
      ogTitleMatch?.[1] || "Not found";


    const ogDescription =
      ogDescriptionMatch?.[1] || "Not found";







    // SEO SCORE SYSTEM


    let score = 100;


    const passed: string[] = [];

    const errors: string[] = [];

    const warnings: string[] = [];





    if (title !== "No title found") {

      passed.push(
        "Page title detected"
      );

    } else {

      score -= 15;

      errors.push(
        "Missing page title"
      );

    }





    if (
      description !== "No description found"
    ) {

      passed.push(
        "Meta description detected"
      );

    } else {

      score -= 15;

      errors.push(
        "Missing meta description"
      );

    }







    if (
      h1 !== "No H1 found"
    ) {

      passed.push(
        "H1 heading detected"
      );

    } else {

      score -= 15;

      errors.push(
        "Missing H1 heading"
      );

    }








    if (
      canonical !== "Not found"
    ) {

      passed.push(
        "Canonical URL detected"
      );

    } else {

      score -= 10;

      warnings.push(
        "Missing canonical URL"
      );

    }







    if (
      images.length > 0 &&
      missingAlt.length === 0
    ) {

      passed.push(
        "Images ALT attributes detected"
      );

    } else if(images.length > 0) {


      score -= 10;

      warnings.push(
        "Some images missing ALT attributes"
      );

    }







    if (
      ogTitle !== "Not found"
    ) {

      passed.push(
        "Social OG title detected"
      );

    } else {

      score -= 5;

      warnings.push(
        "Missing social metadata"
      );

    }







    score = Math.max(score,0);





    let grade = "F";


    if(score >= 90) grade="A";

    else if(score >=75) grade="B";

    else if(score >=60) grade="C";

    else if(score >=40) grade="D";







    const recommendations = [

      ...errors,

      ...warnings,

    ];






    return NextResponse.json({

      url,

      score,

      grade,


      status:
        score >= 80
          ? "Excellent"
          : score >= 60
          ? "Good"
          : "Needs Improvement",



      title,

      description,

      h1,



      images:{

        total: images.length,

        missingAlt: missingAlt.length,

      },



      canonical,

      robots,



      social:{

        ogTitle,

        ogDescription,

      },



      passed,

      errors,

      warnings,

      recommendations,


    });





  } catch(error) {


    return NextResponse.json(

      {

        error:
          "Unable to analyze website",

      },

      {

        status:500,

      }

    );


  }

}
