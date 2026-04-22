"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";
import { useAuth } from "@/src/context/AuthContext";

type SettingsTab = "profile" | "security" | "preferences" | "privacy";

type SessionItem = {
  token: string;
  createdAt: string;
  isCurrent: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingsTab) || "profile";
  const { user, setUser, refreshUser, loading } = useAuth();

  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [themePref, setThemePref] = useState("system");
  const [showEmail, setShowEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionActionToken, setSessionActionToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const me = await refreshUser();
      if (!me) {
        router.push("/auth");
        return;
      }

      try {
        const data = await apiRequest<{
          profile: { username: string; bio: string; avatarUrl: string };
        }>("/api/profile");
        setUsername(data.profile.username);
        setBio(data.profile.bio || "");
        setAvatarUrl(data.profile.avatarUrl || "");
        setThemePref(localStorage.getItem("aniverse_theme_pref") || "system");
        setShowEmail(
          localStorage.getItem("aniverse_privacy_show_email") === "1",
        );
      } catch {
        router.push("/auth");
      }
    };

    load();
  }, [refreshUser, router]);

  const loadSessions = async () => {
    setSessionLoading(true);
    try {
      const payload = await apiRequest<{ sessions: SessionItem[] }>(
        "/api/auth/sessions",
      );
      setSessions(payload.sessions || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "security" && user) {
      loadSessions();
    }
  }, [tab, user]);

  const selectTab = (nextTab: SettingsTab) => {
    setTab(nextTab);
    router.replace(`/settings?tab=${nextTab}`);
    setMessage("");
    setError("");
  };

  const onProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await apiRequest<{
        profile: {
          username: string;
          email: string;
          role: string;
          bio: string;
          avatarUrl: string;
          id: string;
          provider: string;
          joinedAt: string;
        };
      }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ username, bio, avatarUrl }),
      });
      setUser(response.profile);
      setMessage("Profile settings saved.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onSecuritySave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated successfully.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onRevokeSession = async (token: string) => {
    setSessionActionToken(token);
    setError("");
    setMessage("");
    try {
      await apiRequest<{ ok: boolean; sessions: SessionItem[] }>(
        "/api/auth/sessions",
        {
          method: "DELETE",
          body: JSON.stringify({ scope: "single", token }),
        },
      );
      setMessage("Session revoked.");
      await loadSessions();
      if (sessions.find((session) => session.token === token)?.isCurrent) {
        router.push("/auth");
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSessionActionToken("");
    }
  };

  const onRevokeOtherSessions = async () => {
    setSessionActionToken("others");
    setError("");
    setMessage("");
    try {
      await apiRequest<{ ok: boolean; sessions: SessionItem[] }>(
        "/api/auth/sessions",
        {
          method: "DELETE",
          body: JSON.stringify({ scope: "others" }),
        },
      );
      setMessage("All other sessions were revoked.");
      await loadSessions();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSessionActionToken("");
    }
  };

  const onPreferencesSave = () => {
    localStorage.setItem("aniverse_theme_pref", themePref);
    const effectiveTheme = themePref === "system" ? "light" : themePref;
    localStorage.setItem("aniverse_theme", effectiveTheme);
    document.body.dataset.theme = effectiveTheme;
    setMessage("Preferences saved for this browser.");
    setError("");
  };

  const onPrivacySave = () => {
    localStorage.setItem("aniverse_privacy_show_email", showEmail ? "1" : "0");
    setMessage("Privacy controls updated.");
    setError("");
  };

  const renderPanel = () => {
    if (tab === "profile") {
      return (
        <form className="feature-form auth-form-grid" onSubmit={onProfileSave}>
          <h2>Profile Settings</h2>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="avatar">Avatar URL</label>
          <input
            id="avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <button type="submit">Save Profile</button>
        </form>
      );
    }

    if (tab === "security") {
      return (
        <section className="workspace-content">
          <form
            className="feature-form auth-form-grid"
            onSubmit={onSecuritySave}
          >
            <h2>Security Controls</h2>
            <p className="meta-line">
              Provider: {user?.provider}. Local accounts can rotate credentials
              here.
            </p>
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="meta-line">
              Use at least 10 characters with uppercase, lowercase, number, and
              symbol.
            </p>
            <button type="submit">Rotate Password</button>
          </form>

          <section className="section-block dashboard-card list-panel">
            <div className="thread-row">
              <h3>Active Sessions</h3>
              <button
                type="button"
                className="action-button ghost"
                onClick={onRevokeOtherSessions}
                disabled={sessionActionToken === "others" || sessionLoading}
              >
                Revoke Other Sessions
              </button>
            </div>
            {sessionLoading ? <p>Loading sessions...</p> : null}
            {sessions.length ? (
              <ul>
                {sessions.map((session) => (
                  <li key={session.token} className="session-row">
                    <div>
                      <strong>
                        {session.isCurrent
                          ? "Current Session"
                          : "Active Session"}
                      </strong>
                      <p>{new Date(session.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      className="action-button ghost small"
                      onClick={() => onRevokeSession(session.token)}
                      disabled={sessionActionToken === session.token}
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active sessions found.</p>
            )}
          </section>
        </section>
      );
    }

    if (tab === "preferences") {
      return (
        <section className="section-block dashboard-card">
          <h2>Preferences</h2>
          <p className="meta-line">Session-level user preferences.</p>
          <label htmlFor="theme-pref">Theme mode</label>
          <select
            id="theme-pref"
            value={themePref}
            onChange={(e) => setThemePref(e.target.value)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <p>
            Preferred mode: <strong>{themePref}</strong>
          </p>
          <button type="button" onClick={onPreferencesSave}>
            Save Preferences
          </button>
        </section>
      );
    }

    return (
      <section className="section-block dashboard-card">
        <h2>Privacy</h2>
        <p className="meta-line">
          Control profile disclosure and privacy defaults for your browser
          session.
        </p>
        <label className="switch-line" htmlFor="show-email-toggle">
          <input
            id="show-email-toggle"
            type="checkbox"
            checked={showEmail}
            onChange={(e) => setShowEmail(e.target.checked)}
          />
          Allow showing my email on internal profile surfaces
        </label>
        <button type="button" onClick={onPrivacySave}>
          Save Privacy Controls
        </button>
      </section>
    );
  };

  if (loading && !user) {
    return (
      <main className="feature-page">
        <p>Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Settings</h1>
        <p>
          Manage profile, security, and preferences from a unified control
          center.
        </p>
      </section>

      <section className="workspace-layout">
        <aside className="workspace-sidebar section-block">
          <h3>Settings Menu</h3>
          <button
            type="button"
            className={
              tab === "profile" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => selectTab("profile")}
          >
            Profile
          </button>
          <button
            type="button"
            className={
              tab === "security" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => selectTab("security")}
          >
            Security
          </button>
          <button
            type="button"
            className={
              tab === "preferences" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => selectTab("preferences")}
          >
            Preferences
          </button>
          <button
            type="button"
            className={
              tab === "privacy" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => selectTab("privacy")}
          >
            Privacy
          </button>
        </aside>

        <div className="workspace-content">
          {renderPanel()}
          {message ? <p>{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
