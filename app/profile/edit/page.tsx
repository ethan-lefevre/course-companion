import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AvatarUpload from "../../components/AvatarUpload";

export default async function EditProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  async function updateProfile(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const full_name = formData.get("full_name") as string;
    const major = formData.get("major") as string;
    const year = formData.get("year") as string;
    const interests = formData.get("interests") as string;
    const bio = formData.get("bio") as string;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        full_name,
        major,
        year,
        interests,
        bio,
      })
      .eq("id", user.id);

    redirect("/dashboard");
  }

  return (
    <main className="page">
      <div className="spacer-lg">
        <Link href="/dashboard" className="link-button">
          Back to Dashboard
        </Link>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <h1 className="section-title">Edit Profile</h1>

        {/* Avatar Upload */}
        <AvatarUpload
          userId={user.id}
          currentAvatar={profile?.avatar_url}
        />

        <form action={updateProfile} className="stack">
          <input
            className="input"
            name="full_name"
            placeholder="Full Name"
            defaultValue={profile?.full_name || ""}
          />

          <input
            className="input"
            name="major"
            placeholder="Major"
            defaultValue={profile?.major || ""}
          />

          <input
            className="input"
            name="year"
            placeholder="Year (Freshman, Sophomore, etc.)"
            defaultValue={profile?.year || ""}
          />

          <input
            className="input"
            name="interests"
            placeholder="Interests (comma separated)"
            defaultValue={profile?.interests || ""}
          />

          <textarea
            className="input"
            name="bio"
            placeholder="Bio"
            defaultValue={profile?.bio || ""}
          />

          <button className="button button-primary" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}