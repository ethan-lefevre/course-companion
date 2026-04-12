"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  currentAvatar?: string | null;
};

export default function AvatarUpload({ userId, currentAvatar }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size is 2MB.");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setPreview(publicUrl);
      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="stack" style={{ marginBottom: 20 }}>
      <div className="avatar-upload-row">
        <div className="avatar-upload-preview">
          {preview ? (
            <img src={preview} alt="Profile avatar" />
          ) : (
            <span>?</span>
          )}
        </div>

        <div className="stack" style={{ gap: 10 }}>
          <label className="button" style={{ width: "fit-content", cursor: "pointer" }}>
            Choose Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>

          <p className="muted" style={{ margin: 0 }}>
            Square images work best.
          </p>

          {uploading && <p className="muted" style={{ margin: 0 }}>Uploading...</p>}
        </div>
      </div>
    </div>
  );
}