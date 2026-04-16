"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";
import { useAuth } from "@/src/context/AuthContext";

type SettingsTab = "profile" | "security" | "preferences";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
      } catch {
        router.push("/auth");
      }
    };

    load();
  }, [refreshUser, router]);

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
        <form className="feature-form auth-form-grid" onSubmit={onSecuritySave}>
          <h2>Security</h2>
          <p className="meta-line">
            Provider: {user?.provider}. Local accounts can update password here.
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
          <button type="submit">Update Password</button>
        </form>
      );
    }

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
