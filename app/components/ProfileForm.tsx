"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  mode: "setup" | "edit";
  initialValues: {
    username: string;
    fullName: string;
    major: string;
    year: string;
    interests: string;
    bio: string;
  };
};

const YEAR_OPTIONS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
  "Other",
];

export default function ProfileForm({
  mode,
  initialValues,
}: ProfileFormProps) {
  const router = useRouter();

  const [username, setUsername] = useState(initialValues.username);
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [major, setMajor] = useState(initialValues.major);
  const [year, setYear] = useState(initialValues.year);
  const [interests, setInterests] = useState(initialValues.interests);
  const [bio, setBio] = useState(initialValues.bio);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim().toLowerCase(),
        fullName: fullName.trim(),
        major: major.trim(),
        year,
        interests: interests.trim(),
        bio: bio.trim(),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setMessage(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="stack">
      <input
        className="input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        className="input"
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        className="input"
        type="text"
        placeholder="Major"
        value={major}
        onChange={(e) => setMajor(e.target.value)}
        required
      />

      <select
        className="input"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        required
      >
        <option value="">Select your year</option>
        {YEAR_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <textarea
        className="input"
        placeholder="Interests (ex: web dev, AI, tennis, startups)"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        rows={4}
      />

      <textarea
        className="input"
        placeholder="Bio (optional)"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
      />

      <button className="button" type="submit" disabled={loading}>
        {loading
          ? "Saving..."
          : mode === "setup"
          ? "Complete profile"
          : "Save changes"}
      </button>

      {message && <p className="error">{message}</p>}
    </form>
  );
}