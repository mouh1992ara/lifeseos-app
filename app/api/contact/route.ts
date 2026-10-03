import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { contactRatelimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    const { success } = await contactRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error:
            "Too many contact requests. Please wait a few minutes and try again.",
        },
        {
          status: 429,
        }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          error: "Please complete all fields.",
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

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
        user_id: user?.id ?? null,
      });

    if (error) {
      console.error(
        "Contact message save error:",
        error
      );

      return NextResponse.json(
        {
          error: "Unable to send your message.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error(
      "Contact API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}
