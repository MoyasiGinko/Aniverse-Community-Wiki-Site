"use client";

import { FormEvent, useEffect, useState } from "react";
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

  const [passRules, setPassRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    setPassRules({
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^\w\s]/.test(password),
    });
  }, [password]);

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

    const allRulesMet = Object.values(passRules).every(Boolean);
    if (!allRulesMet) {
      setError("Password does not meet all required security strength criteria.");
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

      setMessage("Password updated successfully! Redirecting you to your workspace...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
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

      <div className="auth-wrapper" style={{ maxWidth: "560px", gridTemplateColumns: "1fr" }}>
        <div className="auth-card">
          <div className="auth-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
            <div className="auth-badge">
              <span>🔒 Account Security Portal</span>
            </div>
            <h2 className="auth-info-title" style={{ fontSize: "1.8rem", margin: 0 }}>
              Set New <span style={{ color: "var(--brand)" }}>Password</span>
            </h2>
            <p className="auth-info-desc" style={{ fontSize: "0.85rem", margin: 0 }}>
              Choose a strong, unique password to safeguard your Aniverse account.
            </p>
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
                placeholder="••••••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
                placeholder="••••••••••••"
              />
            </div>

            {/* Password security strength grid */}
            <div className="password-rules">
              <p>Password Security Requirements:</p>
              <div className="rules-grid">
                <span className={`rule-item ${passRules.length ? "met" : "unmet"}`}>
                  {passRules.length ? "✓" : "✗"} 10+ characters
                </span>
                <span className={`rule-item ${passRules.uppercase ? "met" : "unmet"}`}>
                  {passRules.uppercase ? "✓" : "✗"} Uppercase [A-Z]
                </span>
                <span className={`rule-item ${passRules.lowercase ? "met" : "unmet"}`}>
                  {passRules.lowercase ? "✓" : "✗"} Lowercase [a-z]
                </span>
                <span className={`rule-item ${passRules.number ? "met" : "unmet"}`}>
                  {passRules.number ? "✓" : "✗"} Numeric digit [0-9]
                </span>
                <span className={`rule-item ${passRules.symbol ? "met" : "unmet"}`}>
                  {passRules.symbol ? "✓" : "✗"} Symbol [!@#$... ]
                </span>
              </div>
            </div>

            <button type="submit" disabled={busy} className="auth-submit-btn">
              {busy ? "Updating Credentials..." : "Update & Secure Account"}
            </button>
          </form>

          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
        </div>
      </div>
    </main>
  );
}
