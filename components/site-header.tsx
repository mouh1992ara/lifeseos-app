import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

import Logo from "@/components/logo";


export default function SiteHeader() {

  return (
    <Suspense fallback={<HeaderFallback />}>
      <SiteHeaderContent />
    </Suspense>
  );

}



async function SiteHeaderContent() {


  const supabase = await createClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();



  async function logout() {

    "use server";


    const supabase = await createClient();


    await supabase.auth.signOut();


    redirect("/");

  }



  return (

    <header
      className="
        border-b
        border-white/10
        bg-slate-950
      "
    >


      {/* ================= MOBILE HEADER ================= */}

      <div
        className="
          flex
          flex-col
          items-center
          gap-3
          px-4
          py-4
          md:hidden
        "
      >


        <Logo />



        <div
          className="
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-3
            py-2
          "
        >


          <Link
            href="/tools"
            className="
              text-xs
              text-slate-300
              hover:text-white
            "
          >
            Tools
          </Link>



          <Link
            href="/blog"
            className="
              text-xs
              text-slate-300
              hover:text-white
            "
          >
            Blog
          </Link>



          <Link
            href="/auth/login"
            className="
              text-xs
              text-slate-300
              hover:text-white
            "
          >
            Sign In
          </Link>



          <Link
            href="/auth/sign-up"
            className="
              rounded-lg
              bg-gradient-to-r
              from-blue-500
              to-purple-600
              px-3
              py-1.5
              text-xs
              font-semibold
              text-white
            "
          >
            Get Started
          </Link>


        </div>


      </div>






      {/* ================= DESKTOP HEADER ================= */}


      <div
        className="
          mx-auto
          hidden
          w-full
          max-w-7xl
          items-center
          justify-between
          px-6
          py-5
          md:flex
        "
      >


        <Logo />



        <nav
          className="
            flex
            items-center
            gap-3
          "
        >


          <Link
            href="/tools"
            className="
              rounded-lg
              px-4
              py-2
              text-sm
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            Tools
          </Link>



          <Link
            href="/blog"
            className="
              rounded-lg
              px-4
              py-2
              text-sm
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            Blog
          </Link>




          {user ? (

            <>


              <Link
                href="/dashboard"
                className="
                  rounded-lg
                  px-4
                  py-2
                  text-sm
                  text-slate-300
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                Dashboard
              </Link>



              <form action={logout}>

                <button
                  type="submit"
                  className="
                    rounded-lg
                    border
                    border-white/20
                    px-4
                    py-2
                    text-sm
                    text-white
                    transition
                    hover:bg-white/10
                  "
                >
                  Sign out
                </button>


              </form>


            </>


          ) : (

            <>


              <Link
                href="/auth/login"
                className="
                  rounded-lg
                  px-4
                  py-2
                  text-sm
                  text-slate-300
                  transition
                  hover:text-white
                "
              >
                Sign in
              </Link>



              <Link
                href="/auth/sign-up"
                className="
                  rounded-lg
                  bg-gradient-to-r
                  from-blue-500
                  to-purple-600
                  px-5
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                "
              >
                Get started
              </Link>


            </>

          )}



        </nav>


      </div>


    </header>

  );

}





function HeaderFallback() {


  return (

    <header
      className="
        border-b
        border-white/10
        bg-slate-950
      "
    >

      <div
        className="
          px-6
          py-5
        "
      >

        <Logo />

      </div>


    </header>

  );

}