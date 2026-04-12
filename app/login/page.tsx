"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isValidGrccEmail } from "@/lib/isValidGrccEmail";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyMessage =
    searchParams.get("message") === "verify-email"
      ? "Verify your GRCC email before accessing the dashboard."
      : "";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidGrccEmail(normalizedEmail)) {
      setError("Use your GRCC student email.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-side">
          <Link href="/" className="auth-back-link">
            ← Back to home
          </Link>

          <div className="auth-badge">Welcome back</div>

          <h1 className="auth-title">Log in to CourseCompanion</h1>

          <p className="auth-text">
            Jump back into your classes, friends, and student network at GRCC.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">See who’s in your classes</div>
            <div className="auth-feature-item">Check your friends’ schedules</div>
            <div className="auth-feature-item">Explore student profiles</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Log in</h2>
            <p className="auth-card-subtitle">Use your GRCC student email</p>
          </div>

          <form onSubmit={handleLogin} className="stack">
            <div className="stack" style={{ gap: 8 }}>
              <label className="auth-label">GRCC Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@email.grcc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="stack" style={{ gap: 8 }}>
              <label className="auth-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="button button-primary auth-submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>

            {verifyMessage && <p className="error">{verifyMessage}</p>}
            {error && <p className="error">{error}</p>}
          </form>

          <div className="auth-footer">
            Need an account?{" "}
            <Link href="/signup" className="auth-inline-link">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}