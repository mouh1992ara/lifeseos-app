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

  const userEmail = user?.email ?? "";

  const userInitial =
    userEmail.length > 0
      ? userEmail.charAt(0).toUpperCase()
      : "U";

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
          gap-3
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

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="
                  hidden
                  rounded-lg
                  px-4
                  py-2
                  text-sm
                  text-slate-300
                  transition
                  hover:bg-white/10
                  hover:text-white
                  sm:inline-flex
                "
              >
                Dashboard
              </Link>

              <div className="
                hidden
                items-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-3
                py-2
                md:flex
              ">
                <div className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-blue-500
                  via-violet-500
                  to-fuchsia-500
                  text-xs
                  font-bold
                  text-white
                  shadow-lg
                  shadow-violet-950/30
                ">
                  {userInitial}
                </div>

                <div className="
                  max-w-[220px]
                  truncate
                  text-sm
                  font-medium
                  text-slate-200
                ">
                  {userEmail}
                </div>
              </div>

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
                  shadow-lg
                  shadow-purple-500/20
                  transition
                  hover:scale-105
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
    <header className="
      border-b
      border-white/10
      bg-slate-950
      px-6
      py-5
    ">
      <div className="
        mx-auto
        flex
        max-w-7xl
        items-center
        justify-between
      ">
        <Logo />
      </div>
    </header>
  );
}