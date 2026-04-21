import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserProfileActions from "./../../components/UserProfileActions";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const normalizedUsername = username.trim().toLowerCase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error) {
    console.error(error);
    return <main className="page">Error loading profile.</main>;
  }

  if (!profile) {
    return (
      <main className="page">
        <h1 className="section-title">User not found</h1>
        <Link href="/dashboard" className="link-button">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      semester,
      courses (
        code
      )
    `)
    .eq("user_id", profile.id);

  const isOwnProfile = user?.id === profile.id;

  return (
    <main className="page">
      <div className="spacer-lg">
        <Link href="/dashboard" className="link-button">
          Back to Dashboard
        </Link>
      </div>

      <div className="card spacer-xl">
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div className="avatar-lg">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.username} avatar`}
                className="avatar-lg-image"
              />
            ) : (
              <span>
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0 }}>
              {profile.full_name || profile.username}
            </h1>
            <p className="muted">@{profile.username}</p>

            {profile.major && <p>Major: {profile.major}</p>}
            {profile.year && <p>Year: {profile.year}</p>}
            {profile.interests && <p>Interests: {profile.interests}</p>}
            {profile.bio && <p>{profile.bio}</p>}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <UserProfileActions
            profileUserId={profile.id}
            username={profile.username}
            isOwnProfile={isOwnProfile}
            viewerUserId={user?.id || null}
          />
        </div>
      </div>

      <div>
        <h2 className="section-title">Classes</h2>

        {!enrollments?.length ? (
          <div className="empty-state">
            <p>No classes added yet.</p>
          </div>
        ) : (
          <div className="list">
            {enrollments.map((e: any) => {
              const course = Array.isArray(e.courses)
                ? e.courses[0]
                : e.courses;

              if (!course) return null;

              return (
                <Link
                  key={e.id}
                  href={`/course/${encodeURIComponent(course.code)}`}
                  className="class-card"
                >
                  <h3 className="class-code">{course.code}</h3>
                  <p className="muted">{e.semester}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}