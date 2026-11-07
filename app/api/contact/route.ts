import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getContactRatelimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    // Rate limiting is skipped when Redis is not configured.
    const limiter = getContactRatelimit();
    if (limiter) {
      const { success } = await limiter.limit(ip);

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

    /* Read the session with the cookie-scoped client so `user_id` comes from the
       verified session, never from the request body. */
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    /* Write with the service-role client. `contact_messages` has all privileges
       revoked from anon and authenticated on purpose — it is an inbox, not a
       user-owned table — so a user-scoped insert fails with 42501 and the message
       is lost. The insert stays server-side and takes only validated fields; the
       caller cannot name a different table, role or user. */
    const { error } = await supabaseAdmin
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
