"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiRequest } from "@/src/lib/apiClient";
import { useProtectedAuth } from "@/src/hooks/useProtectedAuth";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";
import { createClient } from "@/src/lib/supabaseClient";
import {
  FiCpu,
  FiShield,
  FiActivity,
  FiLayers,
  FiBookmark,
  FiGlobe,
  FiKey,
  FiUsers,
  FiCheckCircle,
  FiLock,
  FiUser,
  FiEdit3,
  FiTrash2,
  FiExternalLink,
  FiAward,
  FiMessageSquare,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { FaGoogle, FaDiscord, FaFacebook, FaGithub } from "react-icons/fa";
import "@/src/styles/auth.css";

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

type ThreadRecord = {
  id: string;
  slug: string;
  communityId: string | null;
  communitySlug: string | null;
  title: string;
  body: string;
  imageUrls: string[];
  authorId: string;
  createdAt: string;
};

type CommentRecord = {
  id: string;
  threadId: string;
  parentCommentId: string | null;
  body: string;
  threadTitle: string;
  threadSlug: string;
  communitySlug: string | null;
  createdAt: string;
};

type WikiRecord = {
  id: string;
  title: string;
  status: string;
  authorId: string;
  updatedAt: string;
};

type SavedThreadRecord = {
  id: string;
  threadId: string;
  threadTitle: string;
  threadSlug: string;
  communitySlug: string | null;
  createdAt: string;
};

type ManagedReplyRecord = {
  id: string;
  threadId: string;
  threadTitle: string;
  threadSlug: string;
  communitySlug: string | null;
  authorName: string;
  body: string;
  createdAt: string;
};

type CommunityRecord = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  joined?: boolean;
};

type SessionItem = {
  token: string;
  createdAt: string;
  isCurrent: boolean;
};

type Panel =
  | "command"
  | "security"
  | "activity"
  | "manage"
  | "watchlist"
  | "connections";

type ActivityView = "all" | "threads" | "replies" | "comments" | "wiki" | "saved";
type ManageView = "threads" | "replies" | "wiki";

function threadHref(
  threadId: string,
  threadSlug: string,
  communitySlug: string | null,
) {
  if (communitySlug) {
    return `/community/${communitySlug}/${threadSlug}`;
  }
  return `/community/thread/${threadId}`;
}

export default function DashboardPage() {
  const {
    user,
    checking: authChecking,
    accessBlocked,
    requestSignIn,
    handleUnauthorized,
  } = useProtectedAuth();
  const [panel, setPanel] = useState<Panel>("command");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [threads, setThreads] = useState<ThreadRecord[]>([]);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [wiki, setWiki] = useState<WikiRecord[]>([]);
  const [savedThreads, setSavedThreads] = useState<SavedThreadRecord[]>([]);
  const [managedReplies, setManagedReplies] = useState<ManagedReplyRecord[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<CommunityRecord[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activityView, setActivityView] = useState<ActivityView>("all");
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [manageView, setManageView] = useState<ManageView>("threads");
  const [manageExpanded, setManageExpanded] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [editingThreadId, setEditingThreadId] = useState("");
  const [editingThreadTitle, setEditingThreadTitle] = useState("");
  const [editingThreadBody, setEditingThreadBody] = useState("");
  const [editingThreadImageUrls, setEditingThreadImageUrls] = useState("");
  const [editingReplyId, setEditingReplyId] = useState("");
  const [editingReplyBody, setEditingReplyBody] = useState("");
  const [error, setError] = useState("");
  const [identities, setIdentities] = useState<any[]>([]);

  useEffect(() => {
    const fetchIdentities = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIdentities(user.identities || []);
      }
    };
    if (user) {
      fetchIdentities();
    }
  }, [user]);

  const handleLinkIdentity = async (provider: string) => {
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.linkIdentity({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const loadDashboardData = async () => {
    const [
      list,
      statsPayload,
      activityPayload,
      communitiesPayload,
      sessionsPayload,
    ] = await Promise.all([
      apiRequest<{ items: WatchlistItem[] }>("/api/watchlist", {
        suppressAuthPrompt: true,
      }),
      apiRequest<{ stats: StatsPayload }>("/api/stats", {
        suppressAuthPrompt: true,
      }),
      apiRequest<{
        activity: {
          threads: ThreadRecord[];
          comments: CommentRecord[];
          wiki: WikiRecord[];
          savedThreads: SavedThreadRecord[];
          managedReplies: ManagedReplyRecord[];
        };
      }>("/api/community/my-activity", {
        suppressAuthPrompt: true,
      }),
      apiRequest<{ communities: CommunityRecord[] }>("/api/communities", {
        suppressAuthPrompt: true,
      }),
      apiRequest<{ sessions: SessionItem[] }>("/api/auth/sessions", {
        suppressAuthPrompt: true,
      }),
    ]);

    setWatchlist(list.items);
    setStats(statsPayload.stats);
    setThreads(activityPayload.activity.threads);
    setComments(activityPayload.activity.comments);
    setWiki(activityPayload.activity.wiki);
    setSavedThreads(activityPayload.activity.savedThreads || []);
    setManagedReplies(activityPayload.activity.managedReplies || []);
    setJoinedCommunities(
      (communitiesPayload.communities || []).filter((community) =>
        Boolean(community.joined),
      ),
    );
    setSessions(sessionsPayload.sessions || []);
  };

  useEffect(() => {
    const load = async () => {
      if (authChecking) {
        return;
      }

      if (accessBlocked || !user) {
        setDataLoading(false);
        return;
      }

      if (!stats) {
        setDataLoading(true);
      }
      setError("");

      try {
        await loadDashboardData();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const syncedUser = await handleUnauthorized();

          if (syncedUser) {
            try {
              await loadDashboardData();
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
  }, [accessBlocked, authChecking, handleUnauthorized, user, stats]);

  const refreshActivity = async () => {
    const activityPayload = await apiRequest<{
      activity: {
        threads: ThreadRecord[];
        comments: CommentRecord[];
        wiki: WikiRecord[];
        savedThreads: SavedThreadRecord[];
        managedReplies: ManagedReplyRecord[];
      };
    }>("/api/community/my-activity");

    setThreads(activityPayload.activity.threads);
    setComments(activityPayload.activity.comments);
    setWiki(activityPayload.activity.wiki);
    setSavedThreads(activityPayload.activity.savedThreads || []);
    setManagedReplies(activityPayload.activity.managedReplies || []);
  };

  const onDeleteWiki = async (wikiId: string) => {
    setProcessingId(`wiki:${wikiId}`);
    setError("");
    try {
      await apiRequest(`/api/wiki/${wikiId}`, { method: "DELETE" });
      await refreshActivity();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessingId("");
    }
  };

  const onDeleteThread = async (threadId: string) => {
    setProcessingId(`thread:${threadId}`);
    setError("");
    try {
      await apiRequest(`/api/community/threads/${threadId}`, {
        method: "DELETE",
      });
      await refreshActivity();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessingId("");
    }
  };

  const onStartThreadEdit = (thread: ThreadRecord) => {
    setEditingThreadId(thread.id);
    setEditingThreadTitle(thread.title);
    setEditingThreadBody(thread.body);
    setEditingThreadImageUrls((thread.imageUrls || []).join("\n"));
  };

  const onSaveThreadEdit = async () => {
    if (!editingThreadId) {
      return;
    }
    setProcessingId(`thread-edit:${editingThreadId}`);
    setError("");
    try {
      const parsedImageUrls = editingThreadImageUrls
        .split(/[\n,]+/)
        .map((url) => url.trim())
        .filter(Boolean);

      await apiRequest(`/api/community/threads/${editingThreadId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingThreadTitle,
          body: editingThreadBody,
          imageUrls: parsedImageUrls,
        }),
      });

      setEditingThreadId("");
      setEditingThreadTitle("");
      setEditingThreadBody("");
      setEditingThreadImageUrls("");
      await refreshActivity();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessingId("");
    }
  };

  const onDeleteReply = async (threadId: string, commentId: string) => {
    setProcessingId(`reply:${commentId}`);
    setError("");
    try {
      await apiRequest(
        `/api/community/threads/${threadId}/comments/${commentId}`,
        {
          method: "DELETE",
        },
      );
      await refreshActivity();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessingId("");
    }
  };

  const onSaveReplyEdit = async (threadId: string, commentId: string) => {
    if (!editingReplyBody.trim()) {
      return;
    }
    setProcessingId(`reply-edit:${commentId}`);
    setError("");
    try {
      await apiRequest(
        `/api/community/threads/${threadId}/comments/${commentId}`,
        {
          method: "PUT",
          body: JSON.stringify({ body: editingReplyBody }),
        },
      );
      setEditingReplyId("");
      setEditingReplyBody("");
      await refreshActivity();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessingId("");
    }
  };

  const removeFromWatchlist = async (animeId: string) => {
    setProcessingId(`watchlist:${animeId}`);
    setError("");
    try {
      await apiRequest("/api/watchlist", {
        method: "DELETE",
        body: JSON.stringify({ animeId }),
      });
      setWatchlist((prev) => prev.filter((item) => item.animeId !== animeId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessingId("");
    }
  };

  const securityInsights = useMemo(() => {
    const messages: string[] = [];
    let score = 100;

    if (!user?.email) {
      messages.push("Verify your email to enhance account protection.");
      score -= 20;
    }

    if (sessions.length > 3) {
      messages.push(
        "You have several active sessions. Consider revoking unused tokens in Security Settings.",
      );
      score -= 15;
    }

    if (user?.provider === "local") {
      messages.push(
        "Rotate your local password periodically for stronger resilience.",
      );
      score -= 10;
    }

    if (!messages.length) {
      messages.push("Your security posture is robust with zero pending flags.");
    }

    return {
      score: Math.max(score, 35),
      messages,
      level: score >= 85 ? "Strong" : score >= 60 ? "Moderate" : "Needs Review",
    };
  }, [sessions.length, user?.email, user?.provider]);

  const activityItems = useMemo(() => {
    const items = [
      ...threads.map((thread) => ({
        id: `thread:${thread.id}`,
        kind: "threads" as const,
        createdAt: thread.createdAt,
        title: `Thread: ${thread.title}`,
        description: thread.body.slice(0, 140),
        href: threadHref(thread.id, thread.slug, thread.communitySlug),
      })),
      ...comments.map((comment) => ({
        id: `comment:${comment.id}`,
        kind: "comments" as const,
        createdAt: comment.createdAt,
        title: `Comment on ${comment.threadTitle}`,
        description: comment.body.slice(0, 140),
        href: threadHref(comment.threadId, comment.threadSlug, comment.communitySlug),
      })),
      ...wiki.map((entry) => ({
        id: `wiki:${entry.id}`,
        kind: "wiki" as const,
        createdAt: entry.updatedAt,
        title: `Wiki: ${entry.title}`,
        description: `Status: ${entry.status}`,
        href: `/wiki/${entry.id}`,
      })),
      ...savedThreads.map((saved) => ({
        id: `saved:${saved.id}`,
        kind: "saved" as const,
        createdAt: saved.createdAt,
        title: `Saved: ${saved.threadTitle}`,
        description: "Saved community thread",
        href: threadHref(saved.threadId, saved.threadSlug, saved.communitySlug),
      })),
      ...managedReplies.map((reply) => ({
        id: `reply:${reply.id}`,
        kind: "replies" as const,
        createdAt: reply.createdAt,
        title: `${reply.authorName} replied on ${reply.threadTitle}`,
        description: reply.body.slice(0, 140),
        href: threadHref(reply.threadId, reply.threadSlug, reply.communitySlug),
      })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (activityView === "all") {
      return items;
    }

    return items.filter((item) => item.kind === activityView);
  }, [activityView, comments, managedReplies, savedThreads, threads, wiki]);

  if ((authChecking || dataLoading) && !stats) {
    return (
      <ProtectedPageSkeleton
        title="Verifying dashboard access"
        detail="Loading your account, permissions, sessions, and activity panels."
      />
    );
  }

  if (accessBlocked && !dataLoading) {
    return (
      <main className="feature-page relative overflow-hidden">
        <div className="bg-glow-1"></div>
        <section className="section-block auth-lock-panel relative z-10">
          <h1>Dashboard access required</h1>
          <p>
            Sign in to manage your activity, watchlist, sessions, and content
            permissions.
          </p>
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

  const renderPanel = () => {
    // ----------------------------------------------------
    // TAB 1: COMMAND CENTER
    // ----------------------------------------------------
    if (panel === "command") {
      return (
        <section className="section-block dashboard-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Command Center</h2>
              <p>Unified visibility across identity, security score, and workspace metrics.</p>
            </div>
            <span className="auth-badge">
              <FiCpu style={{ marginRight: "4px" }} /> System Active
            </span>
          </div>

          <ul className="metric-list">
            <li>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <FiShield style={{ color: "var(--brand)", fontSize: "1.2rem" }} />
                <strong>{securityInsights.score}</strong>
              </div>
              <span>Security Posture Score</span>
            </li>
            <li>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <FiKey style={{ color: "var(--brand)", fontSize: "1.2rem" }} />
                <strong>{sessions.length}</strong>
              </div>
              <span>Active Sessions</span>
            </li>
            <li>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <FiUsers style={{ color: "var(--brand)", fontSize: "1.2rem" }} />
                <strong>{joinedCommunities.length}</strong>
              </div>
              <span>Joined Communities</span>
            </li>
            <li>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <FiBookmark style={{ color: "var(--brand)", fontSize: "1.2rem" }} />
                <strong>{watchlist.length}</strong>
              </div>
              <span>Watchlist Items</span>
            </li>
          </ul>

          <div className="security-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiLock style={{ color: "var(--brand)" }} />
              <strong>Security posture: {securityInsights.level}</strong>
            </div>
            <p>{securityInsights.messages[0]}</p>
          </div>

          <div className="inline-actions">
            <Link href="/settings?tab=security" className="action-button">
              <FiShield style={{ marginRight: "6px" }} /> Security Controls
            </Link>
            <Link href="/profile" className="action-button ghost">
              <FiUser style={{ marginRight: "6px" }} /> Review Profile
            </Link>
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 2: SECURITY INTELLIGENCE
    // ----------------------------------------------------
    if (panel === "security") {
      return (
        <section className="section-block dashboard-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Security Intelligence</h2>
              <p>Account identity provider metrics, token sessions, and protection flags.</p>
            </div>
            <span className="auth-badge">
              <FiShield style={{ marginRight: "4px" }} /> Guard Enabled
            </span>
          </div>

          <div className="security-grid">
            <article className="security-kpi">
              <span>Identity Provider</span>
              <strong className="capitalize" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {user?.provider === "google" ? <FaGoogle style={{ color: "#ea4335" }} /> : <FaGithub />}
                {user?.provider || "Local"}
              </strong>
            </article>
            <article className="security-kpi">
              <span>Access Role</span>
              <strong className="capitalize" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FiUser style={{ color: "var(--brand)" }} />
                {user?.role || "user"}
              </strong>
            </article>
            <article className="security-kpi">
              <span>Session Count</span>
              <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FiKey style={{ color: "var(--brand)" }} />
                {sessions.length} Devices
              </strong>
            </article>
            <article className="security-kpi">
              <span>Posture Status</span>
              <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FiCheckCircle style={{ color: "#10b981" }} />
                {securityInsights.level}
              </strong>
            </article>
          </div>

          <h3 className="dashboard-subheading">Security Recommendations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {securityInsights.messages.map((message) => (
              <div key={message} className="settings-toggle-row" style={{ cursor: "default" }}>
                <div className="settings-toggle-info">
                  <span style={{ color: "var(--text)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FiCheckCircle style={{ color: "#10b981" }} /> {message}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="dashboard-subheading">Recent Active Devices</h3>
          {sessions.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {sessions.slice(0, 5).map((session) => (
                <div key={session.token} className="session-item-row">
                  <div className="session-item-info">
                    <strong>
                      <FiKey style={{ marginRight: "6px", color: "var(--brand)" }} />
                      {session.isCurrent ? "Current Active Device Token" : "Active Device Session"}
                    </strong>
                    <p>Issued: {new Date(session.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="settings-input-helper">No active session tokens found.</p>
          )}

          <div className="inline-actions" style={{ marginTop: "1rem" }}>
            <Link href="/settings?tab=security" className="action-button">
              <FiShield style={{ marginRight: "6px" }} /> Manage Security & Sessions
            </Link>
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 3: ACTIVITY FEED
    // ----------------------------------------------------
    if (panel === "activity") {
      return (
        <section className="section-block dashboard-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Community Activity Feed</h2>
              <p>Real-time feed of your community discussions, comments, and saved entries.</p>
            </div>
            <span className="auth-badge">
              <FiActivity style={{ marginRight: "4px" }} /> {activityItems.length} Events
            </span>
          </div>

          {/* Subview Filter Bar */}
          <div className="badge-pill-list mb-4">
            {(["all", "threads", "replies", "comments", "wiki", "saved"] as const).map((view) => (
              <button
                key={view}
                type="button"
                className={activityView === view ? "workspace-link-nested active" : "workspace-link-nested"}
                onClick={() => setActivityView(view)}
                style={{ textTransform: "capitalize", padding: "0.5rem 0.9rem" }}
              >
                {view}
              </button>
            ))}
          </div>

          {activityItems.length ? (
            <div>
              {activityItems.map((item) => (
                <Link key={item.id} href={item.href} className="activity-link-item">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong>{item.title}</strong>
                    <FiExternalLink style={{ color: "var(--brand)", fontSize: "0.9rem" }} />
                  </div>
                  <p>{item.description}</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </Link>
              ))}
            </div>
          ) : (
            <p className="settings-input-helper">No activity recorded for this filter view.</p>
          )}
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 4: MANAGE CONTENT
    // ----------------------------------------------------
    if (panel === "manage") {
      return (
        <section className="section-block dashboard-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Content Management Center</h2>
              <p>Edit or remove community threads, comment replies, and wiki articles.</p>
            </div>
            <span className="auth-badge">
              <FiLayers style={{ marginRight: "4px" }} /> Management Portal
            </span>
          </div>

          {/* Manage Sub-tab Switcher */}
          <div className="badge-pill-list mb-4">
            {(["threads", "replies", "wiki"] as const).map((sub) => (
              <button
                key={sub}
                type="button"
                className={manageView === sub ? "workspace-link-nested active" : "workspace-link-nested"}
                onClick={() => setManageView(sub)}
                style={{ textTransform: "capitalize", padding: "0.5rem 0.9rem" }}
              >
                Manage {sub}
              </button>
            ))}
          </div>

          {manageView === "threads" ? (
            <div>
              {threads.length ? (
                threads.map((thread) => (
                  <div key={thread.id} className="session-item-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem", marginBottom: "1rem" }}>
                    {editingThreadId === thread.id ? (
                      <div className="settings-form-grid">
                        <input
                          className="settings-input"
                          value={editingThreadTitle}
                          onChange={(e) => setEditingThreadTitle(e.target.value)}
                          placeholder="Thread title"
                        />
                        <textarea
                          className="settings-textarea"
                          rows={4}
                          value={editingThreadBody}
                          onChange={(e) => setEditingThreadBody(e.target.value)}
                        />
                        <div className="inline-actions">
                          <button type="button" className="action-button small" onClick={onSaveThreadEdit} disabled={processingId === `thread-edit:${thread.id}`}>
                            Save Changes
                          </button>
                          <button type="button" className="action-button ghost small" onClick={() => setEditingThreadId("")}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "1rem", color: "var(--text)" }}>{thread.title}</strong>
                          <span className="settings-input-helper">{new Date(thread.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="settings-input-helper">{thread.body.slice(0, 180)}...</p>
                        <div className="inline-actions">
                          <Link href={threadHref(thread.id, thread.slug, thread.communitySlug)} className="action-button ghost small">
                            <FiExternalLink style={{ marginRight: "4px" }} /> View
                          </Link>
                          <button type="button" className="action-button ghost small" onClick={() => onStartThreadEdit(thread)}>
                            <FiEdit3 style={{ marginRight: "4px" }} /> Edit
                          </button>
                          <button type="button" className="action-button ghost small" style={{ color: "#ef4444" }} onClick={() => onDeleteThread(thread.id)} disabled={processingId === `thread:${thread.id}`}>
                            <FiTrash2 style={{ marginRight: "4px" }} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="settings-input-helper">No community threads created yet.</p>
              )}
            </div>
          ) : null}

          {manageView === "replies" ? (
            <div>
              {managedReplies.length ? (
                managedReplies.slice(0, 40).map((reply) => (
                  <div key={reply.id} className="session-item-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div>
                      <strong style={{ color: "var(--text)" }}>{reply.authorName}</strong> on <em>{reply.threadTitle}</em>
                      <p className="settings-input-helper" style={{ marginTop: "0.25rem" }}>{reply.body}</p>
                    </div>

                    {editingReplyId === reply.id ? (
                      <div className="settings-form-grid">
                        <textarea
                          className="settings-textarea"
                          rows={3}
                          value={editingReplyBody}
                          onChange={(e) => setEditingReplyBody(e.target.value)}
                        />
                        <div className="inline-actions">
                          <button type="button" className="action-button small" onClick={() => onSaveReplyEdit(reply.threadId, reply.id)} disabled={processingId === `reply-edit:${reply.id}`}>
                            Save Reply
                          </button>
                          <button type="button" className="action-button ghost small" onClick={() => setEditingReplyId("")}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="inline-actions">
                        <Link href={threadHref(reply.threadId, reply.threadSlug, reply.communitySlug)} className="action-button ghost small">
                          <FiExternalLink style={{ marginRight: "4px" }} /> Open Thread
                        </Link>
                        <button type="button" className="action-button ghost small" onClick={() => { setEditingReplyId(reply.id); setEditingReplyBody(reply.body); }}>
                          <FiEdit3 style={{ marginRight: "4px" }} /> Edit
                        </button>
                        <button type="button" className="action-button ghost small" style={{ color: "#ef4444" }} onClick={() => onDeleteReply(reply.threadId, reply.id)} disabled={processingId === `reply:${reply.id}`}>
                          <FiTrash2 style={{ marginRight: "4px" }} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="settings-input-helper">No replies on your threads yet.</p>
              )}
            </div>
          ) : null}

          {manageView === "wiki" ? (
            <div>
              {wiki.length ? (
                wiki.map((entry) => (
                  <div key={entry.id} className="session-item-row" style={{ marginBottom: "1rem" }}>
                    <div>
                      <strong style={{ color: "var(--text)" }}>{entry.title}</strong>
                      <p className="settings-input-helper">Status: {entry.status} · Updated {new Date(entry.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="inline-actions">
                      <Link href={`/wiki/${entry.id}`} className="action-button ghost small">
                        <FiExternalLink style={{ marginRight: "4px" }} /> View
                      </Link>
                      <Link href={`/wiki/${entry.id}/edit`} className="action-button ghost small">
                        <FiEdit3 style={{ marginRight: "4px" }} /> Edit
                      </Link>
                      <button type="button" className="action-button ghost small" style={{ color: "#ef4444" }} onClick={() => onDeleteWiki(entry.id)} disabled={processingId === `wiki:${entry.id}`}>
                        <FiTrash2 style={{ marginRight: "4px" }} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="settings-input-helper">No wiki articles created yet.</p>
              )}
            </div>
          ) : null}
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 5: WATCHLIST
    // ----------------------------------------------------
    if (panel === "watchlist") {
      return (
        <section className="section-block dashboard-card">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>My Watchlist Collections</h2>
              <p>Your saved anime series and show bookmarks.</p>
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
                  <button
                    type="button"
                    className="action-button ghost small"
                    style={{ color: "#ef4444" }}
                    onClick={() => removeFromWatchlist(item.animeId)}
                    disabled={processingId === `watchlist:${item.animeId}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="settings-input-helper">No shows added to your watchlist yet.</p>
          )}
        </section>
      );
    }

    // ----------------------------------------------------
    // TAB 6: IDENTITY CONNECTIONS & FOOTPRINT
    // ----------------------------------------------------
    return (
      <section className="section-block dashboard-card">
        <div className="settings-header-block">
          <div className="settings-header-info">
            <h2>Identity Connections & Footprint</h2>
            <p>Link multiple social accounts and review your community footprint badges.</p>
          </div>
          <span className="auth-badge">
            <FiGlobe style={{ marginRight: "4px" }} /> Identity Gateway
          </span>
        </div>

        <div className="connection-provider-list">
          {[
            { id: "google", name: "Google Account", icon: FaGoogle, color: "#ea4335" },
            { id: "discord", name: "Discord Profile", icon: FaDiscord, color: "#5865f2" },
            { id: "facebook", name: "Facebook Login", icon: FaFacebook, color: "#1877f2" },
            { id: "github", name: "GitHub Developer", icon: FaGithub, color: "#ffffff" },
          ].map((p) => {
            const ProviderIcon = p.icon;
            const isLinked = identities.some((id) => id.provider === p.id);
            return (
              <div key={p.id} className="connection-item-card">
                <div className="connection-item-left">
                  <ProviderIcon style={{ color: p.color, fontSize: "1.4rem" }} />
                  <span className="connection-item-name">{p.name}</span>
                </div>
                <div>
                  {isLinked ? (
                    <span className="auth-badge" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)" }}>
                      <FiCheckCircle style={{ marginRight: "4px" }} /> Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLinkIdentity(p.id)}
                      className="action-button small"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="dashboard-subheading">Community Footprint</h3>
        {joinedCommunities.length ? (
          <div>
            {joinedCommunities.slice(0, 10).map((community) => (
              <Link
                key={community.id}
                href={`/community/${community.slug}`}
                className="community-item-card"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiUsers style={{ color: "var(--brand)" }} /> {community.name}
                </span>
                <span className="settings-input-helper">{community.memberCount} members</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="settings-input-helper">You have not joined a community yet.</p>
        )}

        <h3 className="dashboard-subheading">Badges and Recognition</h3>
        <div className="badge-pill-list">
          {(stats?.badges || []).length ? (
            (stats?.badges || []).map((badge) => (
              <span className="badge-pill-item" key={badge}>
                <FiAward style={{ marginRight: "4px" }} /> {badge}
              </span>
            ))
          ) : (
            <p className="settings-input-helper">No badges earned yet.</p>
          )}
        </div>

        <h3 className="dashboard-subheading">Core Activity Counters</h3>
        <div className="security-grid">
          <article className="security-kpi">
            <span>Threads Created</span>
            <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FiMessageSquare style={{ color: "var(--brand)" }} />
              {stats?.threadCount || 0}
            </strong>
          </article>
          <article className="security-kpi">
            <span>Comments Posted</span>
            <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FiEdit3 style={{ color: "var(--brand)" }} />
              {stats?.commentCount || 0}
            </strong>
          </article>
          <article className="security-kpi">
            <span>Wiki Edits</span>
            <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FiLayers style={{ color: "var(--brand)" }} />
              {stats?.wikiCount || 0}
            </strong>
          </article>
          <article className="security-kpi">
            <span>Saved Threads</span>
            <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FiBookmark style={{ color: "var(--brand)" }} />
              {savedThreads.length}
            </strong>
          </article>
        </div>

        <div className="inline-actions" style={{ marginTop: "1rem" }}>
          <Link href="/community" className="action-button">
            <FiUsers style={{ marginRight: "6px" }} /> Explore Communities
          </Link>
          <Link href="/settings" className="action-button ghost">
            <FiUser style={{ marginRight: "6px" }} /> Account Settings
          </Link>
        </div>
      </section>
    );
  };

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>⚡ Member Workspace</span>
          </div>
          <h1 className="hero-banner-title">
            Welcome back, <span style={{ color: "var(--brand)" }}>{user?.username || "Member"}</span>
          </h1>
          <p className="hero-banner-desc">
            Manage security, governance, community activity, and account controls from your unified workspace.
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
          <h3>Workspace Sections</h3>
          <button
            type="button"
            className={panel === "command" ? "workspace-link active" : "workspace-link"}
            onClick={() => setPanel("command")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiCpu /> Command Center
            </span>
          </button>
          <button
            type="button"
            className={panel === "security" ? "workspace-link active" : "workspace-link"}
            onClick={() => setPanel("security")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiShield /> Security
            </span>
          </button>
          <button
            type="button"
            className={panel === "activity" ? "workspace-link active" : "workspace-link"}
            aria-expanded={activityExpanded}
            onClick={() => {
              setPanel("activity");
              setActivityExpanded((prev) => !prev);
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiActivity /> Activity Feed
            </span>
            <span className="workspace-chevron" aria-hidden="true">
              {activityExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </span>
          </button>

          {activityExpanded ? (
            <div className="workspace-nested-links">
              {(["all", "threads", "replies", "comments", "wiki", "saved"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  className={
                    panel === "activity" && activityView === view
                      ? "workspace-link workspace-link-nested active"
                      : "workspace-link workspace-link-nested"
                  }
                  onClick={() => {
                    setPanel("activity");
                    setActivityView(view);
                  }}
                  style={{ textTransform: "capitalize" }}
                >
                  {view}
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className={panel === "manage" ? "workspace-link active" : "workspace-link"}
            aria-expanded={manageExpanded}
            onClick={() => {
              setPanel("manage");
              setManageExpanded((prev) => !prev);
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiLayers /> Manage Content
            </span>
            <span className="workspace-chevron" aria-hidden="true">
              {manageExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </span>
          </button>

          {manageExpanded ? (
            <div className="workspace-nested-links">
              {(["threads", "replies", "wiki"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  className={
                    panel === "manage" && manageView === view
                      ? "workspace-link workspace-link-nested active"
                      : "workspace-link workspace-link-nested"
                  }
                  onClick={() => {
                    setPanel("manage");
                    setManageView(view);
                  }}
                  style={{ textTransform: "capitalize" }}
                >
                  {view}
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className={panel === "watchlist" ? "workspace-link active" : "workspace-link"}
            onClick={() => setPanel("watchlist")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiBookmark /> Watchlist
            </span>
          </button>

          <button
            type="button"
            className={panel === "connections" ? "workspace-link active" : "workspace-link"}
            onClick={() => setPanel("connections")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiGlobe /> Connections
            </span>
          </button>
        </aside>

        <div className="workspace-content">
          {error ? <div className="alert-error" style={{ marginBottom: "1rem" }}>✕ {error}</div> : null}
          {renderPanel()}
        </div>
      </section>
    </main>
  );
}
