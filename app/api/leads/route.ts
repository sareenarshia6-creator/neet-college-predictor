
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        { error: "Server configuration is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      name,
      phone,
      score,
      category,
      homeState,
      predictedRank,
      utm_source,
      utm_medium,
      utm_campaign,
      is_test = false,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof phone !== "string" ||
      !/^[6-9]\d{9}$/.test(phone) ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > 720 ||
      !["UR", "EWS", "OBC", "SC", "ST"].includes(category) ||
      typeof homeState !== "string" ||
      !homeState.trim() ||
      !Number.isInteger(predictedRank) ||
      predictedRank < 1
    ) {
      return NextResponse.json(
        { error: "Please provide valid lead details." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error } = await supabase.from("leads").insert({
      name: name.trim(),
      phone,
      score,
      category,
      home_state: homeState.trim(),
      predicted_rank: predictedRank,
      utm_source: typeof utm_source === "string" ? utm_source : null,
      utm_medium: typeof utm_medium === "string" ? utm_medium : null,
      utm_campaign:
        typeof utm_campaign === "string" ? utm_campaign : null,
      is_test: process.env.LEAD_TEST_MODE === "true",
      });

    if (error) {
      console.error("Lead insert failed:", error.message);
      return NextResponse.json(
        { error: "Unable to save your details. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
