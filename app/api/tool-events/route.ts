import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    const { error } = await supabaseAdmin
      .from("tool_events")
      .insert({
        tool_name: toolName,
        user_id: user?.id ?? null,
      });

    if (error) {
      console.error("Tool event insert error:", error);

      return NextResponse.json(
        {
          error: "Failed to record tool usage.",
        },
        {
          status: 500,
        }
      );
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
