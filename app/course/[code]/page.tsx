import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { normalizeCourseCode } from "@/lib/normalizeCourseCode";
import StudentCard from "../../components/StudentCard";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const supabase = await createClient();

  const rawCode = decodeURIComponent(code || "");
  const normalizedCode = normalizeCourseCode(rawCode);

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("code", normalizedCode)
    .eq("school", "GRCC")
    .maybeSingle();

  if (courseError) {
    console.error("Course query error:", courseError);

    return (
      <main className="page">
        <h1 className="section-title">Error loading course</h1>
        <p className="error">{courseError.message}</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="page">
        <h1 className="section-title">Course not found</h1>
        <p className="subtitle">
          We could not find a class page for {normalizedCode}.
        </p>
        <p className="subtitle">Try adding the class from your dashboard first.</p>
        <Link href="/dashboard" className="link-button">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(`
      id,
      semester,
      profiles (
        username,
        full_name,
        major,
        year,
        interests
      )
    `)
    .eq("course_id", course.id)
    .order("created_at", { ascending: true });

  if (enrollmentsError) {
    console.error("Enrollments query error:", enrollmentsError);

    return (
      <main className="page">
        <h1 className="section-title">Error loading students</h1>
        <p className="error">{enrollmentsError.message}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="spacer-lg">
        <Link href="/dashboard" className="link-button">
          Back to Dashboard
        </Link>
      </div>

      <h1 className="title" style={{ fontSize: 42, marginBottom: 8 }}>
        {course.code}
      </h1>

      <p className="subtitle">
        {course.school} • {enrollments?.length || 0} student
        {(enrollments?.length || 0) === 1 ? "" : "s"}
      </p>

      <div className="card spacer-xl">
        <h2 className="section-title">About this class page</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          This page shows students who have added {course.code} to their profile.
        </p>
      </div>

      <h2 className="section-title">Students in this class</h2>

      {!enrollments || enrollments.length === 0 ? (
        <div className="card">
          <p>No students have added this class yet.</p>
        </div>
      ) : (
        <div className="list">
          {enrollments.map((enrollment: any) => {
            const profile = Array.isArray(enrollment.profiles)
              ? enrollment.profiles[0]
              : enrollment.profiles;

            if (!profile) return null;

            return (
              <StudentCard
                key={enrollment.id}
                username={profile.username}
                fullName={profile.full_name}
                major={profile.major}
                year={profile.year}
                interests={profile.interests}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}