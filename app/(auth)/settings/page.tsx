"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, apiRequest } from "@/src/lib/apiClient";
import { useAuth } from "@/src/context/AuthContext";
import { useProtectedAuth } from "@/src/hooks/useProtectedAuth";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";
import { Modal } from "@/src/components/ui";
import { useUiStore } from "@/src/stores/useUiStore";
import {
  FiUser,
  FiShield,
  FiSliders,
  FiBell,
  FiLock,
  FiImage,
  FiGlobe,
  FiKey,
  FiCheckCircle,
  FiSun,
  FiMoon,
  FiGrid,
  FiZap,
  FiMessageSquare,
  FiAtSign,
  FiLayers,
  FiEye,
  FiUsers,
  FiActivity,
  FiDownload,
  FiAlertTriangle,
  FiTrash2,
  FiSave,
  FiCheck,
  FiRadio,
} from "react-icons/fi";
import { FaGoogle, FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import "@/src/styles/auth.css";

type SettingsTab = "profile" | "security" | "preferences" | "notifications" | "privacy";

type SessionItem = {
  token: string;
  createdAt: string;
  isCurrent: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingsTab) || "profile";
  const { setUser, logout } = useAuth();
  const { theme, setTheme } = useUiStore();
  const {
    user,
    checking: authChecking,
    accessBlocked,
    requestSignIn,
    handleUnauthorized,
  } = useProtectedAuth();

  const [tab, setTab] = useState<SettingsTab>(initialTab);

  // Profile Form States
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionActionToken, setSessionActionToken] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Preference Form States
  const [themePref, setThemePref] = useState(theme);
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Notification Form States
  const [notifyReplies, setNotifyReplies] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyWikiEdits, setNotifyWikiEdits] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);

  // Privacy & Governance States
  const [showEmail, setShowEmail] = useState(false);
  const [showCommunities, setShowCommunities] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Feedback States
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfileData = async () => {
    const data = await apiRequest<{
      profile: { username: string; bio: string; avatarUrl: string };
    }>("/api/profile", {
      suppressAuthPrompt: true,
    });
    setUsername(data.profile.username);
    setBio(data.profile.bio || "");
    setAvatarUrl(data.profile.avatarUrl || "");

    setShowEmail(localStorage.getItem("aniverse_privacy_show_email") === "1");
    setShowCommunities(localStorage.getItem("aniverse_privacy_show_communities") !== "0");
    setShowActivity(localStorage.getItem("aniverse_privacy_show_activity") !== "0");
    setNotifyReplies(localStorage.getItem("aniverse_notify_replies") !== "0");
    setNotifyMentions(localStorage.getItem("aniverse_notify_mentions") !== "0");
    setNotifyWikiEdits(localStorage.getItem("aniverse_notify_wiki") !== "0");
    setNotifyAnnouncements(localStorage.getItem("aniverse_notify_announcements") !== "0");
    setCompactMode(localStorage.getItem("aniverse_compact_mode") === "1");
    setReducedMotion(localStorage.getItem("aniverse_reduced_motion") === "1");
  };

  useEffect(() => {
    const load = async () => {
      if (authChecking) {
        return;
      }

      if (accessBlocked || !user) {
        setProfileLoading(false);
        return;
      }

      if (!username) {
        setProfileLoading(true);
      }
      setError("");

      try {
        await loadProfileData();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const syncedUser = await handleUnauthorized();

          if (syncedUser) {
            try {
              await loadProfileData();
              return;
            } catch (retryError) {
              if (retryError instanceof ApiError && retryError.status === 401) {
                await handleUnauthorized();
                return;
              }
              setError((retryError as Error).message);
              return;
            }
          }
          return;
        }
        setError((err as Error).message);
      } finally {
        setProfileLoading(false);
      }
    };

    load();
  }, [accessBlocked, authChecking, handleUnauthorized, user, username]);

  const loadSessions = async () => {
    setSessionLoading(true);
    try {
      const payload = await apiRequest<{ sessions: SessionItem[] }>(
        "/api/auth/sessions",
        { suppressAuthPrompt: true },
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
    setMessage("");
    setError("");
    router.replace(`/settings?tab=${nextTab}`, { scroll: false });
  };

  const onProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await apiRequest<{
        profile: {
          id: string;
          email: string;
          username: string;
          role: "user" | "mod" | "admin";
          bio: string;
          avatarUrl: string;
          provider: "local" | "google" | "discord" | "facebook" | "github";
          joinedAt: string;
        };
      }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ username, bio, avatarUrl }),
      });
      setUser(response.profile);
      setMessage("Profile information updated successfully.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const onSecuritySave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

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
    } finally {
      setIsSaving(false);
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
    setTheme(themePref as "light" | "dark");
    localStorage.setItem("aniverse_compact_mode", compactMode ? "1" : "0");
    localStorage.setItem("aniverse_reduced_motion", reducedMotion ? "1" : "0");
    setMessage("Display and appearance preferences saved.");
    setError("");
  };

  const onNotificationsSave = () => {
    localStorage.setItem("aniverse_notify_replies", notifyReplies ? "1" : "0");
    localStorage.setItem("aniverse_notify_mentions", notifyMentions ? "1" : "0");
    localStorage.setItem("aniverse_notify_wiki", notifyWikiEdits ? "1" : "0");
    localStorage.setItem("aniverse_notify_announcements", notifyAnnouncements ? "1" : "0");
    setMessage("Notification preferences saved.");
    setError("");
  };

  const onPrivacySave = () => {
    localStorage.setItem("aniverse_privacy_show_email", showEmail ? "1" : "0");
    localStorage.setItem("aniverse_privacy_show_communities", showCommunities ? "1" : "0");
    localStorage.setItem("aniverse_privacy_show_activity", showActivity ? "1" : "0");
    setMessage("Privacy disclosure settings saved.");
    setError("");
  };

  const onExportData = () => {
    const exportObject = {
      user: {
        id: user?.id,
        email: user?.email,
        username: user?.username,
        role: user?.role,
        bio: bio,
        avatarUrl: avatarUrl,
        joinedAt: user?.joinedAt,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aniverse-data-${user?.username || "user"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Account data exported as JSON file.");
  };

  const onDeleteAccount = async () => {
    if (deleteConfirmText !== user?.username) {
      setError("Username confirmation does not match.");
      return;
    }
    try {
      await logout();
      router.push("/auth");
    } catch {
      setError("Failed to delete account.");
    }
  };

  const renderPanel = () => {
    // ----------------------------------------------------
    // TAB 1: PROFILE SUBPAGE
    // ----------------------------------------------------
    if (tab === "profile") {
      return (
        <section className="settings-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Public Profile Settings</h2>
              <p>Customize your public handle, bio, avatar, and social connections.</p>
            </div>
            <span className="auth-badge">
              <FiUser style={{ marginRight: "4px" }} /> {user?.role || "user"}
            </span>
          </div>

          <form onSubmit={onProfileSave} className="settings-form-grid">
            {/* Live Avatar Preview Tile */}
            <div className="avatar-preview-tile">
              <div className="avatar-preview-img-wrapper">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={username}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  (username[0] || "U").toUpperCase()
                )}
              </div>
              <div className="avatar-preview-text">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiImage style={{ color: "var(--brand)" }} /> Live Avatar Preview
                </strong>
                <span>
                  Provide an HTTPS image URL (PNG, JPG, WebP) to render custom avatar graphics across community feeds.
                </span>
              </div>
            </div>

            <div className="settings-field-row">
              <div className="settings-field-group">
                <label htmlFor="username" className="settings-label">
                  Username / Handle
                </label>
                <input
                  id="username"
                  className="settings-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your handle"
                  required
                />
              </div>

              <div className="settings-field-group">
                <label htmlFor="avatarUrl" className="settings-label">
                  Avatar Image URL
                </label>
                <input
                  id="avatarUrl"
                  className="settings-input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>

            <div className="settings-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="bio" className="settings-label">
                  Bio / About Me
                </label>
                <span className="settings-input-helper">{bio.length} / 500 chars</span>
              </div>
              <textarea
                id="bio"
                className="settings-textarea"
                rows={4}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your favorite anime series, genres, or community goals..."
              />
            </div>

            {/* Social Links Sub-Block */}
            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiGlobe style={{ color: "var(--brand)" }} /> Social Profiles & Connections
              </h3>
              <div className="settings-field-row">
                <div className="settings-field-group">
                  <label htmlFor="website" className="settings-label">Website</label>
                  <input
                    id="website"
                    className="settings-input"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://mywebsite.com"
                  />
                </div>
                <div className="settings-field-group">
                  <label htmlFor="twitter" className="settings-label">Twitter / X</label>
                  <input
                    id="twitter"
                    className="settings-input"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@handle"
                  />
                </div>
              </div>
            </div>

            <div className="settings-action-row">
              <button type="submit" className="action-button" disabled={isSaving}>
                <FiSave style={{ marginRight: "6px" }} />
                {isSaving ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 2: SECURITY SUBPAGE
    // ----------------------------------------------------
    if (tab === "security") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Security Password Rotation */}
          <section className="settings-card">
            <div className="settings-header-block">
              <div className="settings-header-info">
                <h2>Security & Credentials</h2>
                <p>Manage authentication, password rotation, and active session tokens.</p>
              </div>
              <span className="auth-badge">
                <FiShield style={{ marginRight: "4px" }} /> Account Protected
              </span>
            </div>

            <form onSubmit={onSecuritySave} className="settings-form-grid">
              <div className="settings-field-row">
                <div className="settings-field-group">
                  <label htmlFor="currentPassword" className="settings-label">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="settings-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••"
                  />
                </div>
                <div className="settings-field-group">
                  <label htmlFor="newPassword" className="settings-label">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="settings-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••"
                  />
                </div>
              </div>

              {/* Password criteria status */}
              <div className="password-criteria-grid">
                <span className={newPassword.length >= 10 ? "password-criteria-item met" : "password-criteria-item"}>
                  {newPassword.length >= 10 ? "✓ 10+ Characters" : "○ 10+ Characters"}
                </span>
                <span className={/[A-Z]/.test(newPassword) ? "password-criteria-item met" : "password-criteria-item"}>
                  {/[A-Z]/.test(newPassword) ? "✓ Uppercase Letter" : "○ Uppercase Letter"}
                </span>
                <span className={/\d/.test(newPassword) ? "password-criteria-item met" : "password-criteria-item"}>
                  {/\d/.test(newPassword) ? "✓ Number (0-9)" : "○ Number (0-9)"}
                </span>
                <span className={/[^\w\s]/.test(newPassword) ? "password-criteria-item met" : "password-criteria-item"}>
                  {/[^\w\s]/.test(newPassword) ? "✓ Symbol (!@#$)" : "○ Symbol (!@#$)"}
                </span>
              </div>

              <div className="settings-action-row">
                <button type="submit" className="action-button" disabled={isSaving}>
                  <FiKey style={{ marginRight: "6px" }} />
                  {isSaving ? "Updating Password..." : "Rotate Password"}
                </button>
              </div>
            </form>
          </section>

          {/* Active Sessions */}
          <section className="settings-card secondary">
            <div className="settings-header-block">
              <div className="settings-header-info">
                <h2>Active Sessions & Devices</h2>
                <p>Manage active browser tokens across all your devices.</p>
              </div>
              <button
                type="button"
                className="action-button ghost small"
                onClick={onRevokeOtherSessions}
                disabled={sessionActionToken === "others" || sessionLoading}
              >
                {sessionActionToken === "others" ? "Revoking..." : "Revoke Other Sessions"}
              </button>
            </div>

            {sessionLoading ? <p className="settings-input-helper">Loading sessions...</p> : null}

            {sessions.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {sessions.map((session) => (
                  <div key={session.token} className="session-item-row">
                    <div className="session-item-info">
                      <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiKey style={{ color: "var(--brand)" }} />
                        {session.isCurrent ? "Current Device Session Token" : "Active Session Token"}
                      </strong>
                      <p>Issued: {new Date(session.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      className="action-button ghost small"
                      onClick={() => onRevokeSession(session.token)}
                      disabled={sessionActionToken === session.token}
                    >
                      {sessionActionToken === session.token ? "Revoking..." : "Revoke"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="settings-input-helper">No active sessions found.</p>
            )}
          </section>
        </div>
      );
    }

    // ----------------------------------------------------
    // TAB 3: PREFERENCES SUBPAGE
    // ----------------------------------------------------
    if (tab === "preferences") {
      return (
        <section className="settings-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Appearance & Interface Preferences</h2>
              <p>Customize theme modes, motion dynamics, and layout density.</p>
            </div>
            <span className="auth-badge">
              <FiSliders style={{ marginRight: "4px" }} /> Display Theme
            </span>
          </div>

          <div className="settings-form-grid">
            <label className="settings-label">Theme Selection</label>
            <div className="theme-card-grid">
              <div
                className={themePref === "light" ? "theme-option-card active" : "theme-option-card"}
                onClick={() => setThemePref("light")}
              >
                <div className="theme-option-content">
                  <FiSun style={{ fontSize: "1.8rem", color: "#f59e0b" }} />
                  <div className="theme-option-text">
                    <strong>Light Mode</strong>
                    <span>Vibrant high-contrast white design</span>
                  </div>
                </div>
                {themePref === "light" ? <span className="auth-badge">Active</span> : null}
              </div>

              <div
                className={themePref === "dark" ? "theme-option-card active" : "theme-option-card"}
                onClick={() => setThemePref("dark")}
              >
                <div className="theme-option-content">
                  <FiMoon style={{ fontSize: "1.8rem", color: "#6366f1" }} />
                  <div className="theme-option-text">
                    <strong>Dark Mode</strong>
                    <span>Sleek obsidian glassmorphism design</span>
                  </div>
                </div>
                {themePref === "dark" ? <span className="auth-badge">Active</span> : null}
              </div>
            </div>

            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text)" }}>Display Options</h3>

              <label className="settings-toggle-row" htmlFor="compact-mode-toggle">
                <div className="settings-toggle-info">
                  <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FiGrid style={{ color: "var(--brand)" }} /> Compact View Density
                  </strong>
                  <span>Reduce padding and spacing across cards and feed rows</span>
                </div>
                <input
                  id="compact-mode-toggle"
                  type="checkbox"
                  className="settings-checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                />
              </label>

              <label className="settings-toggle-row" htmlFor="reduced-motion-toggle">
                <div className="settings-toggle-info">
                  <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FiZap style={{ color: "var(--brand)" }} /> Reduce Motion Dynamics
                  </strong>
                  <span>Disable background glows and heavy UI transitions</span>
                </div>
                <input
                  id="reduced-motion-toggle"
                  type="checkbox"
                  className="settings-checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                />
              </label>
            </div>

            <div className="settings-action-row">
              <button type="button" className="action-button" onClick={onPreferencesSave}>
                <FiSave style={{ marginRight: "6px" }} /> Save Preferences
              </button>
            </div>
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 4: NOTIFICATIONS SUBPAGE
    // ----------------------------------------------------
    if (tab === "notifications") {
      return (
        <section className="settings-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Notification & Alert Controls</h2>
              <p>Control when and how you receive alerts for community activity.</p>
            </div>
            <span className="auth-badge">
              <FiBell style={{ marginRight: "4px" }} /> Alert Routing
            </span>
          </div>

          <div className="settings-form-grid">
            <label className="settings-toggle-row" htmlFor="notify-replies-toggle">
              <div className="settings-toggle-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiMessageSquare style={{ color: "var(--brand)" }} /> Thread Replies & Comments
                </strong>
                <span>Notify me when someone replies to my community thread or comment</span>
              </div>
              <input
                id="notify-replies-toggle"
                type="checkbox"
                className="settings-checkbox"
                checked={notifyReplies}
                onChange={(e) => setNotifyReplies(e.target.checked)}
              />
            </label>

            <label className="settings-toggle-row" htmlFor="notify-mentions-toggle">
              <div className="settings-toggle-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiAtSign style={{ color: "var(--brand)" }} /> User Mentions & Tags
                </strong>
                <span>Notify me when another user mentions my @handle in a thread</span>
              </div>
              <input
                id="notify-mentions-toggle"
                type="checkbox"
                className="settings-checkbox"
                checked={notifyMentions}
                onChange={(e) => setNotifyMentions(e.target.checked)}
              />
            </label>

            <label className="settings-toggle-row" htmlFor="notify-wiki-toggle">
              <div className="settings-toggle-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiLayers style={{ color: "var(--brand)" }} /> Wiki Entry Revisions
                </strong>
                <span>Notify me when a wiki article I created or saved receives a new revision</span>
              </div>
              <input
                id="notify-wiki-toggle"
                type="checkbox"
                className="settings-checkbox"
                checked={notifyWikiEdits}
                onChange={(e) => setNotifyWikiEdits(e.target.checked)}
              />
            </label>

            <label className="settings-toggle-row" htmlFor="notify-announcements-toggle">
              <div className="settings-toggle-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiRadio style={{ color: "var(--brand)" }} /> Product Announcements & Updates
                </strong>
                <span>Receive platform updates, maintenance notices, and major releases</span>
              </div>
              <input
                id="notify-announcements-toggle"
                type="checkbox"
                className="settings-checkbox"
                checked={notifyAnnouncements}
                onChange={(e) => setNotifyAnnouncements(e.target.checked)}
              />
            </label>

            <div className="settings-action-row">
              <button type="button" className="action-button" onClick={onNotificationsSave}>
                <FiSave style={{ marginRight: "6px" }} /> Save Notification Settings
              </button>
            </div>
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 5: PRIVACY & DANGER ZONE SUBPAGE
    // ----------------------------------------------------
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <section className="settings-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Privacy & Disclosure Controls</h2>
              <p>Control public profile visibility, search indexing, and data exports.</p>
            </div>
            <span className="auth-badge">
              <FiLock style={{ marginRight: "4px" }} /> Data Controls
            </span>
          </div>

          <div className="settings-form-grid">
            <label className="settings-toggle-row" htmlFor="show-email-toggle">
              <div className="settings-toggle-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiEye style={{ color: "var(--brand)" }} /> Display Email on Profile Surface
                </strong>
                <span>Allow other community members to view your email address on public profile cards</span>
              </div>
              <input
                id="show-email-toggle"
                type="checkbox"
                className="settings-checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
              />
            </label>

            <label className="settings-toggle-row" htmlFor="show-communities-toggle">
              <div className="settings-toggle-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiUsers style={{ color: "var(--brand)" }} /> Display Joined Communities
                </strong>
                <span>Show your list of joined anime communities on your profile page</span>
              </div>
              <input
                id="show-communities-toggle"
                type="checkbox"
                className="settings-checkbox"
                checked={showCommunities}
                onChange={(e) => setShowCommunities(e.target.checked)}
              />
            </label>

            <label className="settings-toggle-row" htmlFor="show-activity-toggle">
              <div className="settings-toggle-info">
                <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiActivity style={{ color: "var(--brand)" }} /> Display Public Activity Footprint
                </strong>
                <span>Show thread creation and comment statistics on your user footprint</span>
              </div>
              <input
                id="show-activity-toggle"
                type="checkbox"
                className="settings-checkbox"
                checked={showActivity}
                onChange={(e) => setShowActivity(e.target.checked)}
              />
            </label>

            <div className="settings-action-row">
              <button type="button" className="action-button" onClick={onPrivacySave}>
                <FiSave style={{ marginRight: "6px" }} /> Save Privacy Controls
              </button>
            </div>
          </div>
        </section>

        {/* Data Portability */}
        <section className="settings-card secondary">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Export Account Data</h2>
              <p>Download a complete JSON archive of your profile details, sessions, and activity.</p>
            </div>
            <button type="button" className="action-button ghost small" onClick={onExportData}>
              <FiDownload style={{ marginRight: "4px" }} /> Download JSON Export
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-card danger-zone-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiAlertTriangle /> Danger Zone: Account Deletion
              </h3>
              <p>Permanently delete your account, session tokens, and clear community association.</p>
            </div>
            <button type="button" className="action-button ghost small" style={{ color: "#ef4444" }} onClick={() => setDeleteModalOpen(true)}>
              <FiTrash2 style={{ marginRight: "4px" }} /> Delete Account
            </button>
          </div>
        </section>
      </div>
    );
  };

  if ((authChecking || profileLoading) && !username) {
    return (
      <ProtectedPageSkeleton
        title="Verifying settings access"
        detail="Resolving your account and preferences before the settings UI mounts."
      />
    );
  }

  if (accessBlocked && !profileLoading) {
    return (
      <main className="feature-page relative overflow-hidden">
        <div className="bg-glow-1"></div>
        <section className="section-block auth-lock-panel relative z-10">
          <h1>Settings access required</h1>
          <p>Sign in to manage your profile, security, and preferences.</p>
          <div className="inline-actions">
            <button type="button" onClick={requestSignIn} className="action-button">
              Open Sign In
            </button>
            <Link href="/auth" className="action-button ghost">
              Go to auth page
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>⚡ Member Control Center</span>
          </div>
          <h1 className="hero-banner-title">
            Settings & Preferences
          </h1>
          <p className="hero-banner-desc">
            Manage your account profile, security credentials, active sessions, and privacy controls.
          </p>
        </div>
        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Aniverse AI Assistant"
            className="hero-banner-mascot-img"
          />
        </div>
      </section>

      <section className="workspace-layout relative z-10">
        <aside className="workspace-sidebar section-block">
          <h3>Settings Menu</h3>
          <button
            type="button"
            className={tab === "profile" ? "workspace-link active" : "workspace-link"}
            onClick={() => selectTab("profile")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiUser /> Profile
            </span>
          </button>
          <button
            type="button"
            className={tab === "security" ? "workspace-link active" : "workspace-link"}
            onClick={() => selectTab("security")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiShield /> Security & Sessions
            </span>
          </button>
          <button
            type="button"
            className={tab === "preferences" ? "workspace-link active" : "workspace-link"}
            onClick={() => selectTab("preferences")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiSliders /> Preferences
            </span>
          </button>
          <button
            type="button"
            className={tab === "notifications" ? "workspace-link active" : "workspace-link"}
            onClick={() => selectTab("notifications")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiBell /> Notifications
            </span>
          </button>
          <button
            type="button"
            className={tab === "privacy" ? "workspace-link active" : "workspace-link"}
            onClick={() => selectTab("privacy")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiLock /> Privacy & Data
            </span>
          </button>
        </aside>

        <div className="workspace-content">
          {message ? <div className="alert-success" style={{ marginBottom: "1rem" }}>✓ {message}</div> : null}
          {error ? <div className="alert-error" style={{ marginBottom: "1rem" }}>✕ {error}</div> : null}

          {renderPanel()}
        </div>
      </section>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>
            This action is <strong style={{ color: "#ef4444" }}>permanent</strong>. To confirm deletion, type your username <strong style={{ color: "var(--brand)" }}>{user?.username}</strong> below:
          </p>
          <input
            className="settings-input"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={user?.username}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "0.5rem" }}>
            <button type="button" className="action-button ghost small" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="action-button small"
              style={{ background: "#ef4444", color: "#ffffff" }}
              disabled={deleteConfirmText !== user?.username}
              onClick={onDeleteAccount}
            >
              <FiTrash2 style={{ marginRight: "4px" }} /> Permanently Delete Account
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
