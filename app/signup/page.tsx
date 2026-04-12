"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isValidGrccEmail } from "@/lib/isValidGrccEmail";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidGrccEmail(normalizedEmail)) {
      setError("You must sign up with your GRCC student email.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess("Account created. Check your GRCC email to verify your account.");
    setEmail("");
    setPassword("");
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-side">
          <Link href="/" className="auth-back-link">
            ← Back to home
          </Link>

          <div className="auth-badge">GRCC students only</div>

          <h1 className="auth-title">Create your CourseCompanion account</h1>

          <p className="auth-text">
            Join the GRCC student network to share classes, connect with friends,
            and discover who’s around you on campus.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">College email verification</div>
            <div className="auth-feature-item">Public student profiles</div>
            <div className="auth-feature-item">Friends and class discovery</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Sign up</h2>
            <p className="auth-card-subtitle">Only @email.grcc.edu addresses are allowed</p>
          </div>

          <form onSubmit={handleSignup} className="stack">
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="button button-primary auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link href="/login" className="auth-inline-link">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}