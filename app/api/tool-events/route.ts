import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Tool analytics are optional. `lib/supabase/admin.ts` throws during import
 * when the service-role key is missing, so it is imported lazily and a missing
 * key simply means the event is dropped instead of failing in the console.
 */
async function getAdmin() {
  if (!process.env.SUPABASE_SECRET_KEY) return null;
  try {
    const mod = await import("@/lib/supabase/admin");
    return mod.supabaseAdmin;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const toolName =
      typeof body.tool_name === "string"
        ? body.tool_name.trim()
        : "";

    if (!toolName) {
      return NextResponse.json(
        {
          error: "Tool name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (toolName.length > 100) {
      return NextResponse.json(
        {
          error: "Tool name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const supabaseAdmin = await getAdmin();
    if (!supabaseAdmin) {
      return new NextResponse(null, { status: 204 });
    }

    const { error } = await supabaseAdmin
      .from("tool_events")
      .insert({
        tool_name: toolName,
        user_id: user?.id ?? null,
      });

    if (error) {
      /* Server-side log only: an unstored analytics event is not something the
         visitor should ever see surface as a console error. */
      console.error("Tool event insert error:", error.message);

      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }
}
