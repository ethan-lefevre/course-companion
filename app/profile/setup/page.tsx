import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "../../components/ProfileForm";

export default async function ProfileSetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="page-narrow">
      <h1 className="section-title">Set up your profile</h1>
      <p className="subtitle">
        Add a few details so other students know who you are.
      </p>

      <ProfileForm
        mode="setup"
        initialValues={{
          username: profile?.username || "",
          fullName: profile?.full_name || "",
          major: profile?.major || "",
          year: profile?.year || "",
          interests: profile?.interests || "",
          bio: profile?.bio || "",
        }}
      />
    </main>
  );
}