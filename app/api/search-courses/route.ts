import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCourseCode } from "@/lib/normalizeCourseCode";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ courses: [] });
    }

    const supabase = await createClient();
    const normalizedQuery = normalizeCourseCode(query);

    const { data, error } = await supabase
      .from("courses")
      .select("id, code, title")
      .eq("school", "GRCC")
      .ilike("code", `%${normalizedQuery}%`)
      .order("code", { ascending: true })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ courses: data || [] });
  } catch (error: any) {
    console.error("Search courses error:", error);
    return NextResponse.json(
      { courses: [], error: error.message || "Server error" },
      { status: 500 }
    );
  }
}