import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCourseCode } from "@/lib/normalizeCourseCode";

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

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { success: false, error: "Verify your email first." },
        { status: 403 }
      );
    }

    const { code, semester } = await req.json();

    if (!code || !semester) {
      return NextResponse.json(
        { success: false, error: "Missing code or semester" },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeCourseCode(code);

    let { data: existingCourse, error: findError } = await supabase
      .from("courses")
      .select("*")
      .eq("code", normalizedCode)
      .eq("school", "GRCC")
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingCourse) {
      const { data: newCourse, error: createCourseError } = await supabase
        .from("courses")
        .insert({
          code: normalizedCode,
          school: "GRCC",
        })
        .select()
        .single();

      if (createCourseError) {
        throw createCourseError;
      }

      existingCourse = newCourse;
    }

    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: existingCourse.id,
        semester,
      });

    if (enrollmentError) {
      throw enrollmentError;
    }

    return NextResponse.json({
      success: true,
      course: existingCourse,
    });
  } catch (error: any) {
    console.error("Add class error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}