import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteClassButton from "./DeleteClassButton";

type Props = {
  userId: string;
};

export default async function ClassList({ userId }: Props) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      semester,
      courses (
        id,
        code,
        title,
        school
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ClassList error:", error);
    return <p className="error">Failed to load classes.</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ margin: 0 }}>No classes added yet.</p>
      </div>
    );
  }

  return (
    <div className="list">
      {data.map((enrollment: any) => {
        const course = Array.isArray(enrollment.courses)
          ? enrollment.courses[0]
          : enrollment.courses;

        if (!course) return null;

        return (
          <div key={enrollment.id} className="class-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
              }}
            >
              <Link
                href={`/course/${encodeURIComponent(course.code)}`}
                style={{ flex: 1 }}
              >
                <h3 className="class-code">{course.code}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {enrollment.semester}
                </p>
              </Link>

              <DeleteClassButton enrollmentId={enrollment.id} />
            </div>
          </div>
        );
      })}
    </div>
  );
}