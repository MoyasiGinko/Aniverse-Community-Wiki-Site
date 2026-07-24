"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/src/lib/apiClient";
import { useAuth } from "@/src/context/AuthContext";
import { useProtectedAuth } from "@/src/hooks/useProtectedAuth";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";
import {
  FiUser,
  FiShield,
  FiBookmark,
  FiAward,
  FiEdit3,
  FiLogOut,
  FiCpu,
  FiMessageSquare,
  FiExternalLink,
  FiCheckCircle,
  FiKey,
  FiGlobe,
  FiLayers,
  FiZap,
} from "react-icons/fi";
import { FaGoogle, FaGithub, FaDiscord } from "react-icons/fa";
import "@/src/styles/auth.css";

type ProfilePayload = {
  id: string;
  email: string;
  username: string;
  role: "user" | "mod" | "admin";
  bio: string;
  avatarUrl: string;
  provider?: string;
  joinedAt?: string;
};

type WatchlistItem = {
  animeId: string;
  title: string;
};

type StatsPayload = {
  watchlistCount: number;
  wikiCount: number;
  threadCount: number;
  commentCount: number;
  badges: string[];
};

type ProfileTab = "overview" | "watchlist" | "badges" | "security";

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    user,
    checking: authChecking,
    accessBlocked,
    requestSignIn,
    handleUnauthorized,
  } = useProtectedAuth();

  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    const [me, list, statsPayload] = await Promise.all([
      apiRequest<{ profile: ProfilePayload }>("/api/profile", {
        suppressAuthPrompt: true,
      }),
      apiRequest<{ items: WatchlistItem[] }>("/api/watchlist", {
        suppressAuthPrompt: true,
      }),
      apiRequest<{ stats: StatsPayload }>("/api/stats", {
        suppressAuthPrompt: true,
      }),
    ]);

    setProfile(me.profile);
    setWatchlist(list.items || []);
    setStats(statsPayload.stats);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (authChecking) {
        return;
      }

      if (accessBlocked || !user) {
        setDataLoading(false);
        return;
      }

      if (!profile) {
        setDataLoading(true);
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
        setDataLoading(false);
      }
    };

    load();
  }, [accessBlocked, authChecking, handleUnauthorized, loadProfileData, user, profile]);

  const onLogout = async () => {
    try {
      await logout();
      router.push("/auth");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const securityScore = useMemo(() => {
    let score = 100;
    if (!user?.email) score -= 20;
    if (user?.provider === "local") score -= 10;
    return score;
  }, [user?.email, user?.provider]);

  if ((authChecking || dataLoading) && !profile) {
    return (
      <ProtectedPageSkeleton
        title="Verifying profile access"
        detail="Loading profile identity, watchlist collections, and achievement badges."
      />
    );
  }

  if (accessBlocked && !dataLoading) {
    return (
      <main className="feature-page relative overflow-hidden">
        <div className="bg-glow-1"></div>
        <section className="section-block auth-lock-panel relative z-10">
          <h1>Profile access required</h1>
          <p>Sign in to view your profile, watchlist collections, and account settings.</p>
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

  const activeUser = profile || user;

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Profile Banner */}
      <section className="profile-hero-card relative z-10">
        <div className="profile-hero-top">
          <div className="profile-identity-group">
            <div className="profile-avatar-xl">
              {activeUser?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeUser.avatarUrl} alt={activeUser.username} />
              ) : (
                (activeUser?.username[0] || "U").toUpperCase()
              )}
            </div>
            <div className="profile-name-details">
              <h1>{activeUser?.username || "Member"}</h1>
              <div className="profile-handle-row">
                <span className="profile-handle">@{activeUser?.username?.toLowerCase()}</span>
                <span className="auth-badge">
                  <FiCheckCircle style={{ marginRight: "4px", color: "#10b981" }} />
                  {(activeUser?.role || "user").toUpperCase()}
                </span>
                {activeUser?.provider ? (
                  <span className="auth-badge">
                    {activeUser.provider === "google" ? <FaGoogle style={{ color: "#ea4335" }} /> : <FaGithub />}
                    {activeUser.provider}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="inline-actions">
            <Link href="/settings?tab=profile" className="action-button">
              <FiEdit3 style={{ marginRight: "6px" }} /> Edit Profile
            </Link>
            <Link href="/dashboard" className="action-button ghost">
              <FiCpu style={{ marginRight: "6px" }} /> Dashboard
            </Link>
            <button type="button" onClick={onLogout} className="action-button ghost" style={{ color: "#ef4444" }}>
              <FiLogOut style={{ marginRight: "6px" }} /> Sign Out
            </button>
          </div>
        </div>

        {activeUser?.bio ? (
          <div className="bio-quote-box">
            &ldquo;{activeUser.bio}&rdquo;
          </div>
        ) : (
          <div className="bio-quote-box" style={{ opacity: 0.75 }}>
            No bio quote set yet. Customize your bio in profile settings.
          </div>
        )}
      </section>

      {/* Profile KPI Stats Grid */}
      <section className="profile-stats-grid relative z-10">
        <div className="profile-stat-card">
          <div className="profile-stat-number">
            <FiShield style={{ color: "var(--brand)" }} /> {securityScore}
          </div>
          <span className="profile-stat-label">Security Posture Score</span>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-number">
            <FiBookmark style={{ color: "var(--brand)" }} /> {watchlist.length}
          </div>
          <span className="profile-stat-label">Saved Watchlist Shows</span>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-number">
            <FiMessageSquare style={{ color: "var(--brand)" }} /> {(stats?.threadCount || 0) + (stats?.commentCount || 0)}
          </div>
          <span className="profile-stat-label">Threads & Comments Posted</span>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-number">
            <FiAward style={{ color: "var(--brand)" }} /> {(stats?.badges || []).length || 1}
          </div>
          <span className="profile-stat-label">Earned Recognition Badges</span>
        </div>
      </section>

      {/* Profile Navigation Tabs & Content */}
      <section className="workspace-layout relative z-10">
        <aside className="workspace-sidebar section-block">
          <h3>Profile Sections</h3>
          <button
            type="button"
            className={activeTab === "overview" ? "workspace-link active" : "workspace-link"}
            onClick={() => setActiveTab("overview")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiUser /> Overview & Bio
            </span>
          </button>

          <button
            type="button"
            className={activeTab === "watchlist" ? "workspace-link active" : "workspace-link"}
            onClick={() => setActiveTab("watchlist")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiBookmark /> Watchlist Collections
            </span>
          </button>

          <button
            type="button"
            className={activeTab === "badges" ? "workspace-link active" : "workspace-link"}
            onClick={() => setActiveTab("badges")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiAward /> Badges & Wall
            </span>
          </button>

          <button
            type="button"
            className={activeTab === "security" ? "workspace-link active" : "workspace-link"}
            onClick={() => setActiveTab("security")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiShield /> Security & Metadata
            </span>
          </button>
        </aside>

        <div className="workspace-content">
          {error ? <div className="alert-error" style={{ marginBottom: "1rem" }}>✕ {error}</div> : null}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" ? (
            <section className="settings-card">
              <div className="settings-header-block">
                <div className="settings-header-info">
                  <h2>Member Overview & Details</h2>
                  <p>Account identity summary and public information.</p>
                </div>
                <span className="auth-badge">
                  <FiUser style={{ marginRight: "4px" }} /> Verified Account
                </span>
              </div>

              <div className="security-grid" style={{ marginTop: "1rem" }}>
                <article className="security-kpi">
                  <span>Username</span>
                  <strong>{activeUser?.username}</strong>
                </article>

                <article className="security-kpi">
                  <span>Email Address</span>
                  <strong>{activeUser?.email}</strong>
                </article>

                <article className="security-kpi">
                  <span>Role Permission</span>
                  <strong className="capitalize">{activeUser?.role}</strong>
                </article>

                <article className="security-kpi">
                  <span>Member Since</span>
                  <strong>{activeUser?.joinedAt ? new Date(activeUser.joinedAt).toLocaleDateString() : "Recent"}</strong>
                </article>
              </div>

              <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
                <Link href="/settings?tab=profile" className="action-button">
                  <FiEdit3 style={{ marginRight: "6px" }} /> Update Public Profile
                </Link>
                <Link href="/community" className="action-button ghost">
                  <FiGlobe style={{ marginRight: "6px" }} /> Explore Community Feeds
                </Link>
              </div>
            </section>
          ) : null}

          {/* WATCHLIST TAB */}
          {activeTab === "watchlist" ? (
            <section className="settings-card">
              <div className="settings-header-block">
                <div className="settings-header-info">
                  <h2>Saved Watchlist Collections</h2>
                  <p>Anime series and show titles bookmarked on your account.</p>
                </div>
                <span className="auth-badge">
                  <FiBookmark style={{ marginRight: "4px" }} /> {watchlist.length} Saved Shows
                </span>
              </div>

              {watchlist.length ? (
                <div className="security-grid">
                  {watchlist.map((item) => (
                    <div key={item.animeId} className="session-item-row" style={{ justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiBookmark style={{ color: "var(--brand)" }} />
                        <strong style={{ fontSize: "0.9rem", color: "var(--text)" }}>{item.title}</strong>
                      </div>
                      <Link href={`/animes/${item.animeId}`} className="action-button ghost small">
                        <FiExternalLink style={{ marginRight: "4px" }} /> View Show
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="settings-input-helper">No anime titles added to your watchlist yet.</p>
              )}
            </section>
          ) : null}

          {/* BADGES TAB */}
          {activeTab === "badges" ? (
            <section className="settings-card">
              <div className="settings-header-block">
                <div className="settings-header-info">
                  <h2>Badges & Recognition Wall</h2>
                  <p>Achievements and milestones earned across the Aniverse ecosystem.</p>
                </div>
                <span className="auth-badge">
                  <FiAward style={{ marginRight: "4px" }} /> Honors & Milestones
                </span>
              </div>

              <div className="badge-card-grid" style={{ marginTop: "1rem" }}>
                <div className="badge-achievement-card">
                  <div className="badge-achievement-icon">
                    <FiCheckCircle />
                  </div>
                  <div className="badge-achievement-info">
                    <strong>Verified Member</strong>
                    <span>Authenticated account identity</span>
                  </div>
                </div>

                <div className="badge-achievement-card">
                  <div className="badge-achievement-icon">
                    <FiShield />
                  </div>
                  <div className="badge-achievement-info">
                    <strong>Security First</strong>
                    <span>High protection score posture</span>
                  </div>
                </div>

                <div className="badge-achievement-card">
                  <div className="badge-achievement-icon">
                    <FiZap />
                  </div>
                  <div className="badge-achievement-info">
                    <strong>Anime Enthusiast</strong>
                    <span>Active watchlist collections</span>
                  </div>
                </div>

                {(stats?.badges || []).map((badge) => (
                  <div key={badge} className="badge-achievement-card">
                    <div className="badge-achievement-icon">
                      <FiAward />
                    </div>
                    <div className="badge-achievement-info">
                      <strong>{badge}</strong>
                      <span>Community milestone badge</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* SECURITY & METADATA TAB */}
          {activeTab === "security" ? (
            <section className="settings-card">
              <div className="settings-header-block">
                <div className="settings-header-info">
                  <h2>Security & Account Metadata</h2>
                  <p>Authentication metadata, session status, and security score.</p>
                </div>
                <span className="auth-badge">
                  <FiShield style={{ marginRight: "4px" }} /> Protected
                </span>
              </div>

              <div className="security-grid" style={{ marginTop: "1rem" }}>
                <article className="security-kpi">
                  <span>Identity Provider</span>
                  <strong className="capitalize">{activeUser?.provider || "Local"}</strong>
                </article>

                <article className="security-kpi">
                  <span>Security Score</span>
                  <strong>{securityScore} / 100</strong>
                </article>

                <article className="security-kpi">
                  <span>Wiki Contributions</span>
                  <strong>{stats?.wikiCount || 0} Articles</strong>
                </article>

                <article className="security-kpi">
                  <span>Community Threads</span>
                  <strong>{stats?.threadCount || 0} Threads</strong>
                </article>
              </div>

              <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
                <Link href="/settings?tab=security" className="action-button">
                  <FiKey style={{ marginRight: "6px" }} /> Open Security Controls
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
