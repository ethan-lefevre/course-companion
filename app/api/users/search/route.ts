import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", users: [] },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase() || "";

    if (q.length < 2) {
      return NextResponse.json({ success: true, users: [] });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, major, year, interests, avatar_url")
      .neq("id", user.id)
      .or(
        `username.ilike.%${q}%,full_name.ilike.%${q}%,major.ilike.%${q}%,interests.ilike.%${q}%`
      )
      .order("username", { ascending: true })
      .limit(12);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      users: data || [],
    });
  } catch (error: any) {
    console.error("User search error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error", users: [] },
      { status: 500 }
    );
  }
}