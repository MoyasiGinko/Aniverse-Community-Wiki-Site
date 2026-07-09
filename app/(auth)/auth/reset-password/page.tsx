"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabaseClient";
import "@/src/styles/auth.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters long.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Password updated successfully! Redirecting you to your dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <main className="auth-container">
      {/* Background Orbits */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <div className="auth-card" style={{ maxWidth: "460px" }}>
        <div className="auth-header" style={{ border: "none", padding: 0 }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>
              Reset Your Password
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#a3958e", margin: "0.25rem 0 0 0" }}>
              Please enter your new password below.
            </p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">
              New Password
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="New Password (10+ characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Confirm Password"
            />
          </div>

          <button type="submit" disabled={busy} className="auth-submit-btn">
            {busy ? "Updating..." : "Update Password"}
          </button>
        </form>

        {error && <div className="alert-error">{error}</div>}
        {message && <div className="alert-success">{message}</div>}
      </div>
    </main>
  );
}
