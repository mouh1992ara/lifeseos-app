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
    <header className="
      border-b 
      border-white/10 
      bg-slate-950/80 
      backdrop-blur-xl
    ">

      <div className="
        mx-auto
        flex
        max-w-7xl
        items-center
        justify-between
        px-6
        py-5
      ">


        <Logo />


        <nav className="
          flex
          items-center
          gap-4
        ">


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



          {
            user ? (

              <form action={logout}>

                <button
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
                    shadow-lg
                    shadow-purple-500/20
                    transition
                    hover:scale-105
                  "
                >
                  Get started
                </Link>


              </>

            )
          }


        </nav>


      </div>


    </header>
  );
}



function HeaderFallback() {

  return (

    <header className="
      border-b
      border-white/10
      bg-slate-950
      px-6
      py-5
    ">

      <Logo />

    </header>

  );

}