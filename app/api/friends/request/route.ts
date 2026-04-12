import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username is required." },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    const { data: targetProfile, error: targetError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (targetError) throw targetError;

    if (!targetProfile) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    if (targetProfile.id === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot add yourself." },
        { status: 400 }
      );
    }

    const { data: existingDirect } = await supabase
      .from("friendships")
      .select("id, status")
      .eq("requester_id", user.id)
      .eq("addressee_id", targetProfile.id)
      .maybeSingle();

    const { data: existingReverse } = await supabase
      .from("friendships")
      .select("id, status")
      .eq("requester_id", targetProfile.id)
      .eq("addressee_id", user.id)
      .maybeSingle();

    if (existingDirect || existingReverse) {
      return NextResponse.json(
        { success: false, error: "Friend request already exists." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: targetProfile.id,
      status: "pending",
    });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Friend request error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}