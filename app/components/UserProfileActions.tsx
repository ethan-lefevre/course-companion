"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  profileUserId: string;
  username: string;
  isOwnProfile: boolean;
  viewerUserId: string | null;
};

export default function UserProfileActions({
  profileUserId,
  username,
  isOwnProfile,
  viewerUserId,
}: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function sendFriendRequest() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setMessage("Friend request sent.");
    } catch (error) {
      console.error("Friend request failed:", error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!viewerUserId) {
    return (
      <Link href="/login" className="link-button">
        Log in to connect
      </Link>
    );
  }

  if (isOwnProfile) {
    return (
      <div className="row" style={{ flexWrap: "wrap" }}>
        <Link href="/profile/edit" className="link-button">
          Edit Profile
        </Link>

        <button onClick={handleLogout} className="button" type="button">
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      <button className="button" onClick={sendFriendRequest} disabled={loading}>
        {loading ? "Sending..." : "Add Friend"}
      </button>

      {message && (
        <p className={message === "Friend request sent." ? "success" : "error"}>
          {message}
        </p>
      )}
    </div>
  );
}