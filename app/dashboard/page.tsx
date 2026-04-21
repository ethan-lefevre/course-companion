import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AddClassForm from "./../components/AddClassForm";
import ClassList from "./../components/ClassList";
import FriendsClasses from "./../components/FriendsClasses";
import DashboardSearchBar from "./../components/DashboardSearchBar";

function getUsernameFromEmail(email: string) {
  return email.split("@")[0].toLowerCase();
}

function isProfileComplete(profile: any) {
  return !!profile?.username && !!profile?.major && !!profile?.year;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.email_confirmed_at) {
    redirect("/login?message=verify-email");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    const username = getUsernameFromEmail(user.email || "");

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      username,
      full_name: null,
      school: "GRCC",
    });

    if (insertError) {
      console.error("Profile creation error:", insertError);
    }

    redirect("/profile/setup");
  }

  if (!isProfileComplete(existingProfile)) {
    redirect("/profile/setup");
  }

  const { count: myClassCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: outgoingAccepted } = await supabase
    .from("friendships")
    .select("addressee_id")
    .eq("requester_id", user.id)
    .eq("status", "accepted");

  const { data: incomingAccepted } = await supabase
    .from("friendships")
    .select("requester_id")
    .eq("addressee_id", user.id)
    .eq("status", "accepted");

  const friendCount =
    (outgoingAccepted?.length || 0) + (incomingAccepted?.length || 0);

  const { data: pendingRequests } = await supabase
    .from("friendships")
    .select("id")
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  const pendingCount = pendingRequests?.length || 0;

  return (
    <main className="page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-brand">
            <h1 className="dashboard-title">CourseCompanion</h1>
            <p className="dashboard-subtitle">
              Welcome back{existingProfile?.full_name ? `, ${existingProfile.full_name}` : ""}.
            </p>
          </div>

          <div className="topbar-actions">
            <DashboardSearchBar />
            <Link href={`/u/${existingProfile.username}`} className="link-button">
              View Profile
            </Link>
            <Link href="/friends" className="link-button">
              Friends
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <h2 className="hero-title">Find people in your classes.</h2>
          <p className="hero-text">
            Search for interests, classes, or people to get started.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Your Classes</p>
            <p className="stat-value">{myClassCount || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Friends</p>
            <p className="stat-value">{friendCount}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending Requests</p>
            <p className="stat-value">{pendingCount}</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="sidebar-stack">
            <div className="card">
              <h2 className="section-title">Add a Class</h2>
              <p className="section-subtitle">
                Start typing a course code and pick from classes already in the database.
              </p>
              <AddClassForm />
            </div>

            <div className="card">
              <h2 className="section-title">Quick Links</h2>
              <div className="stack">
                <Link href="/friends" className="link-button">
                  Manage Friends
                </Link>
                <Link href={`/u/${existingProfile.username}`} className="link-button">
                  Open Public Profile
                </Link>
              </div>
            </div>
          </div>

          <div className="main-stack">
            <div className="card">
              <h2 className="section-title">Your Classes</h2>
              <ClassList userId={user.id} />
            </div>

            <div className="card">
              <h2 className="section-title">Friends’ Classes</h2>
              <FriendsClasses userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}