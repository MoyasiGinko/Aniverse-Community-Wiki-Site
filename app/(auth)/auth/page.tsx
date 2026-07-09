"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { createClient } from "@/src/lib/supabaseClient";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";
import "@/src/styles/auth.css";

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectNext = searchParams.get("next") || "/dashboard";

  const { user, loading, login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Dynamic password validation rules
  const [passRules, setPassRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectNext);
    }
  }, [loading, router, user, redirectNext]);

  useEffect(() => {
    setPassRules({
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^\w\s]/.test(password),
    });
  }, [password]);

  if (loading) {
    return (
      <ProtectedPageSkeleton
        title="Checking authentication state"
        detail="Securing your current browser session and checking details..."
      />
    );
  }

  if (user) {
    return (
      <main className="auth-container">
        <p className="animate-pulse">Redirecting to your workspace...</p>
      </main>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (mode === "forgot") {
        const supabase = createClient();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (resetError) {
          throw new Error(resetError.message);
        }
        setMessage("Recovery link dispatched to your email address!");
        return;
      }

      if (mode === "register") {
        if (username.trim().length < 3) {
          throw new Error("Username must be at least 3 characters.");
        }
        const allRulesMet = Object.values(passRules).every(Boolean);
        if (!allRulesMet) {
          throw new Error("Password does not meet all required security strength criteria.");
        }
      }

      const res = await fetch("/api/auth/" + mode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication operation failed");
      }

      login(data.user);
      window.location.assign(redirectNext);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (
    provider: "google" | "discord" | "facebook" | "github",
  ) => {
    setError("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectNext)}`,
        },
      });
      if (oauthError) {
        throw new Error(oauthError.message);
      }
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

      <div className="auth-wrapper">
        {/* Left Side: Brand presentation */}
        <section className="auth-info-side">
          <div className="auth-badge">
            <span>✨ Powered by Supabase Enterprise Auth</span>
          </div>
          <h1 className="auth-info-title">
            Explore the infinite realms of <span style={{ color: "var(--brand)" }}>Aniverse</span>
          </h1>
          <p className="auth-info-desc">
            Connect your credentials once to securely sync watchlist tracking, wiki revision credits, and threads across every browser tab.
          </p>
          <div className="auth-info-features">
            <div className="feature-row">
              <span className="feature-icon-wrapper">🛡️</span>
              <div className="feature-text">
                <h3>Cryptographically Encoded</h3>
                <p>JWT sessions synced Edge-wide on Next.js proxy route middleware.</p>
              </div>
            </div>
            <div className="feature-row">
              <span className="feature-icon-wrapper">🔗</span>
              <div className="feature-text">
                <h3>Identity Consolidation</h3>
                <p>Link Google, Discord, Facebook, and GitHub directly into a single unified account.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Interactive Forms */}
        <section className="auth-card">
          <div className="auth-header" style={{ justifyContent: "center" }}>
            {mode !== "forgot" ? (
              <div className="auth-tabs">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setMessage("");
                  }}
                  className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setMessage("");
                  }}
                  className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
                >
                  Register
                </button>
              </div>
            ) : (
              <span className="recovery-title" style={{ fontSize: "1.25rem" }}>Account Recovery</span>
            )}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="form-group">
                <div className="form-group-header">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="anime_fan_99"
                  required
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <div className="form-group-header">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="form-input"
              />
            </div>

            {mode !== "forgot" && (
              <div className="form-group">
                <div className="form-group-header">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="back-link"
                      style={{ color: "var(--brand)", marginTop: 0 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="form-input"
                />
              </div>
            )}

            {/* Registration password helper */}
            {mode === "register" && (
              <div className="password-rules">
                <p>Password Security Strength:</p>
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
            )}

            <button type="submit" disabled={busy} className="auth-submit-btn">
              {busy
                ? "Processing Request..."
                : mode === "login"
                  ? "Sign In Securely"
                  : mode === "register"
                    ? "Create Premium Account"
                    : "Send Recovery Link"}
            </button>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="back-link"
              >
                Back to Sign In
              </button>
            )}
          </form>

          {/* Social Logins */}
          {mode !== "forgot" && (
            <div>
              <div className="social-divider">Or continue with</div>
              <div className="social-grid">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={busy}
                  className="social-btn"
                  aria-label="Continue with Google"
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth("discord")}
                  disabled={busy}
                  className="social-btn"
                  aria-label="Continue with Discord"
                >
                  <svg viewBox="0 0 127.14 96.36" fill="#5865F2">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.8.68,1.63,1.37,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.07,50.8,123,28.06,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                  </svg>
                  <span>Discord</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth("facebook")}
                  disabled={busy}
                  className="social-btn"
                  aria-label="Continue with Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.95c4.56-.93 8-4.96 8-9.95z" />
                  </svg>
                  <span>Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth("github")}
                  disabled={busy}
                  className="social-btn"
                  aria-label="Continue with GitHub"
                >
                  <svg viewBox="0 0 24 24" fill="#F0F6FC">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          )}

          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
        </section>
      </div>
    </main>
  );
}
