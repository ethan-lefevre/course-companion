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

    const { username, fullName, major, year, interests, bio } = await req.json();

    if (!username || !major || !year) {
      return NextResponse.json(
        { success: false, error: "Username, major, and year are required." },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    const { data: existingUsername } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .neq("id", user.id)
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: "That username is already taken." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: normalizedUsername,
        full_name: fullName || null,
        major,
        year,
        interests: interests || null,
        bio: bio || null,
      })
      .eq("id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}