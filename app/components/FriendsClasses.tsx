import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Props = {
  userId: string;
};

export default async function FriendsClasses({ userId }: Props) {
  const supabase = await createClient();

  const { data: outgoingAccepted, error: outgoingError } = await supabase
    .from("friendships")
    .select("addressee_id")
    .eq("requester_id", userId)
    .eq("status", "accepted");

  if (outgoingError) {
    console.error("Outgoing friendships error:", outgoingError);
  }

  const { data: incomingAccepted, error: incomingError } = await supabase
    .from("friendships")
    .select("requester_id")
    .eq("addressee_id", userId)
    .eq("status", "accepted");

  if (incomingError) {
    console.error("Incoming friendships error:", incomingError);
  }

  const friendIds = [
    ...((outgoingAccepted || []).map((f: any) => f.addressee_id)),
    ...((incomingAccepted || []).map((f: any) => f.requester_id)),
  ];

  if (!friendIds.length) {
    return <p className="muted">Your friends’ classes will show here.</p>;
  }

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      semester,
      profiles (
        username,
        full_name
      ),
      courses (
        code,
        school
      )
    `)
    .in("user_id", friendIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Friends classes error:", error);
    return <p className="error">Failed to load friends’ classes.</p>;
  }

  if (!enrollments || !enrollments.length) {
    return <p className="muted">Your friends have not added any classes yet.</p>;
  }

  return (
    <div className="list">
      {enrollments.map((enrollment: any) => {
        const profile = Array.isArray(enrollment.profiles)
          ? enrollment.profiles[0]
          : enrollment.profiles;

        const course = Array.isArray(enrollment.courses)
          ? enrollment.courses[0]
          : enrollment.courses;

        if (!profile || !course) return null;

        return (
          <div key={enrollment.id} className="card">
            <Link
              href={`/u/${profile.username}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                {profile.full_name || profile.username}
              </p>
              <p className="muted" style={{ margin: "4px 0 10px" }}>
                @{profile.username}
              </p>
            </Link>

            <Link
              href={`/course/${encodeURIComponent(course.code)}`}
              className="link-button"
            >
              {course.code}
            </Link>

            <p className="muted" style={{ marginTop: 10 }}>
              {enrollment.semester}
            </p>
          </div>
        );
      })}
    </div>
  );
}