"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiRequest } from "@/src/lib/apiClient";
import { useProtectedAuth } from "@/src/hooks/useProtectedAuth";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";
import { createClient } from "@/src/lib/supabaseClient";

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
  updatedAt: string;
};

type SavedThreadRecord = {
  id: string;
  slug: string;
  title: string;
  body: string;
  savedAt: string;
  communitySlug: string | null;
};

type CommunityRecord = {
  id: string;
  slug: string;
  name: string;
  memberCount: number;
  joined: boolean;
};

type SessionItem = {
  token: string;
  createdAt: string;
  isCurrent: boolean;
};

type Panel =
  | "command"
  | "activity"
  | "manage"
  | "watchlist"
  | "security"
  | "connections";

type ActivityView =
  | "all"
  | "threads"
  | "comments"
  | "wiki"
  | "saved"
  | "replies";

type ManageView = "threads" | "replies" | "wiki";

type ManagedReplyRecord = {
  id: string;
  threadId: string;
  parentCommentId: string | null;
  body: string;
  authorId: string;
  authorName: string;
  threadTitle: string;
  threadSlug: string;
  communitySlug: string | null;
  createdAt: string;
  isMine: boolean;
};

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
  const [managedReplies, setManagedReplies] = useState<ManagedReplyRecord[]>(
    [],
  );
  const [joinedCommunities, setJoinedCommunities] = useState<CommunityRecord[]>(
    [],
  );
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

      setDataLoading(true);
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
  }, [accessBlocked, authChecking, handleUnauthorized, user]);

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
      await apiRequest(`/api/community/threads/${editingThreadId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingThreadTitle,
          body: editingThreadBody,
          imageUrls: editingThreadImageUrls
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean),
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
    setProcessingId(`reply-edit:${commentId}`);
    setError("");
    try {
      await apiRequest(
        `/api/community/threads/${threadId}/comments/${commentId}`,
        {
          method: "PATCH",
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

  const securityInsights = useMemo(() => {
    const messages: string[] = [];
    let score = 100;

    if (!user?.avatarUrl) {
      score -= 8;
      messages.push(
        "Add an avatar to reduce impersonation risk in community flows.",
      );
    }

    if (!user?.bio) {
      score -= 5;
      messages.push(
        "Complete profile bio for better trust and moderator verification.",
      );
    }

    if (user?.provider === "local") {
      messages.push(
        "Local auth active. Rotate password regularly and keep it unique.",
      );
    } else {
      score += 4;
      messages.push(
        "SSO provider enabled. Keep your identity provider secured with MFA.",
      );
    }

    if (sessions.length > 3) {
      score -= 12;
      messages.push(
        "Multiple active sessions detected. Revoke unknown sessions.",
      );
    }

    if ((stats?.threadCount || 0) + (stats?.commentCount || 0) === 0) {
      messages.push(
        "No community interactions yet. Start contributing to build trust signals.",
      );
    }

    if (user?.role === "admin") {
      score = Math.min(score, 90);
      messages.push(
        "Admin account detected. Apply strict session hygiene and regular reviews.",
      );
    }

    const bounded = Math.max(50, Math.min(100, score));
    const level =
      bounded >= 90 ? "Strong" : bounded >= 75 ? "Moderate" : "Needs Attention";

    return { score: bounded, level, messages: messages.slice(0, 4) };
  }, [sessions.length, stats?.commentCount, stats?.threadCount, user]);

  const threadHref = (
    threadId: string,
    threadSlug?: string,
    communitySlug?: string | null,
  ) => {
    if (communitySlug && threadSlug) {
      return `/community/${communitySlug}/${threadSlug}`;
    }
    return `/community/thread/${threadId}`;
  };

  const activityItems = useMemo(() => {
    const items = [
      ...threads.map((thread) => ({
        id: `thread:${thread.id}`,
        kind: "threads" as const,
        createdAt: thread.createdAt,
        title: thread.title,
        description: thread.body.slice(0, 140),
        href: threadHref(thread.id, thread.slug, thread.communitySlug),
      })),
      ...comments.map((comment) => ({
        id: `comment:${comment.id}`,
        kind: "comments" as const,
        createdAt: comment.createdAt,
        title: `Comment on ${comment.threadTitle}`,
        description: comment.body.slice(0, 140),
        href: threadHref(
          comment.threadId,
          comment.threadSlug,
          comment.communitySlug,
        ),
      })),
      ...wiki.map((entry) => ({
        id: `wiki:${entry.id}`,
        kind: "wiki" as const,
        createdAt: entry.updatedAt,
        title: entry.title,
        description: `Wiki status: ${entry.status}`,
        href: `/wiki/${entry.id}`,
      })),
      ...savedThreads.map((thread) => ({
        id: `saved:${thread.id}`,
        kind: "saved" as const,
        createdAt: thread.savedAt,
        title: `Saved: ${thread.title}`,
        description: thread.body.slice(0, 140),
        href: threadHref(thread.id, thread.slug, thread.communitySlug),
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

  if (authChecking || dataLoading) {
    return (
      <ProtectedPageSkeleton
        title="Verifying dashboard access"
        detail="Loading your account, permissions, sessions, and activity panels."
      />
    );
  }

  if (accessBlocked && !dataLoading) {
    return (
      <main className="feature-page">
        <section className="section-block auth-lock-panel">
          <h1>Dashboard access required</h1>
          <p>
            Sign in to manage your activity, watchlist, sessions, and content
            permissions.
          </p>
          <div className="inline-actions">
            <button type="button" onClick={requestSignIn} className="nav-cta">
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
    if (panel === "command") {
      return (
        <section className="section-block dashboard-card">
          <h2>Command Center</h2>
          <p>
            Enterprise-grade visibility across identity, activity, and connected
            assets.
          </p>
          <ul className="metric-list">
            <li>
              <strong>{securityInsights.score}</strong>
              <span> Security Score</span>
            </li>
            <li>
              <strong>{sessions.length}</strong>
              <span> Active Sessions</span>
            </li>
            <li>
              <strong>{joinedCommunities.length}</strong>
              <span> Joined Communities</span>
            </li>
            <li>
              <strong>{watchlist.length}</strong>
              <span> Watchlist Items</span>
            </li>
          </ul>
          <div className="security-banner">
            <strong>Security posture: {securityInsights.level}</strong>
            <p>{securityInsights.messages[0]}</p>
          </div>
          <div className="inline-actions">
            <Link href="/settings?tab=security" className="action-button">
              Open Security Settings
            </Link>
            <Link href="/profile" className="action-button ghost">
              Review Public Profile
            </Link>
          </div>
        </section>
      );
    }

    if (panel === "security") {
      return (
        <section className="section-block dashboard-card list-panel">
          <h2>Security Intelligence</h2>
          <div className="security-grid">
            <article className="security-kpi">
              <span>Identity Provider</span>
              <strong>{user?.provider || "Unknown"}</strong>
            </article>
            <article className="security-kpi">
              <span>Access Role</span>
              <strong>{user?.role || "user"}</strong>
            </article>
            <article className="security-kpi">
              <span>Session Count</span>
              <strong>{sessions.length}</strong>
            </article>
            <article className="security-kpi">
              <span>Posture</span>
              <strong>{securityInsights.level}</strong>
            </article>
          </div>
          <h3>Recommendations</h3>
          <ul>
            {securityInsights.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <h3>Recent Sessions</h3>
          {sessions.length ? (
            <ul>
              {sessions.slice(0, 6).map((session) => (
                <li key={session.token}>
                  {session.isCurrent ? "Current device" : "Active device"} ·{" "}
                  {new Date(session.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No active sessions found.</p>
          )}
          <div className="inline-actions">
            <Link href="/settings?tab=security" className="action-button">
              Manage Sessions
            </Link>
          </div>
        </section>
      );
    }

    if (panel === "activity") {
      return (
        <section className="section-block dashboard-card list-panel">
          <h2>Community Activity</h2>
          <p>Navigation feed only. Click any activity to open its source.</p>
          {activityItems.length ? (
            <ul>
              {activityItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="activity-link-item">
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No activity in this view yet.</p>
          )}
        </section>
      );
    }

    if (panel === "manage") {
      return (
        <section className="section-block dashboard-card list-panel">
          {manageView === "threads" ? (
            <>
              <h2>Manage Threads</h2>
              {threads.length ? (
                <ul>
                  {threads.map((thread) => (
                    <li key={thread.id}>
                      {editingThreadId === thread.id ? (
                        <div className="dashboard-manage-form">
                          <input
                            value={editingThreadTitle}
                            onChange={(event) =>
                              setEditingThreadTitle(event.target.value)
                            }
                            placeholder="Thread title"
                          />
                          <textarea
                            rows={4}
                            value={editingThreadBody}
                            onChange={(event) =>
                              setEditingThreadBody(event.target.value)
                            }
                          />
                          <textarea
                            rows={4}
                            value={editingThreadImageUrls}
                            onChange={(event) =>
                              setEditingThreadImageUrls(event.target.value)
                            }
                            placeholder="Attachment URLs (one per line or comma-separated)"
                          />
                          <div className="inline-actions">
                            <button
                              type="button"
                              className="action-button"
                              onClick={onSaveThreadEdit}
                              disabled={
                                processingId === `thread-edit:${thread.id}`
                              }
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="action-button ghost"
                              onClick={() => {
                                setEditingThreadId("");
                                setEditingThreadTitle("");
                                setEditingThreadBody("");
                                setEditingThreadImageUrls("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <strong>{thread.title}</strong>
                          <p>{thread.body.slice(0, 180)}</p>
                          {thread.imageUrls?.length ? (
                            <small>
                              {thread.imageUrls.length} attachment(s)
                            </small>
                          ) : null}
                          <div className="inline-actions">
                            <Link
                              href={threadHref(
                                thread.id,
                                thread.slug,
                                thread.communitySlug,
                              )}
                              className="action-button ghost small"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              className="action-button ghost small"
                              onClick={() => onStartThreadEdit(thread)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-button ghost small"
                              onClick={() => onDeleteThread(thread.id)}
                              disabled={processingId === `thread:${thread.id}`}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No threads created yet.</p>
              )}
            </>
          ) : null}

          {manageView === "replies" ? (
            <>
              <h2>Manage Replies</h2>
              {managedReplies.length ? (
                <ul>
                  {managedReplies.slice(0, 40).map((reply) => (
                    <li key={reply.id}>
                      <strong>{reply.authorName}</strong> on{" "}
                      <em>{reply.threadTitle}</em>
                      <p>{reply.body}</p>
                      {editingReplyId === reply.id ? (
                        <div className="dashboard-manage-form">
                          <textarea
                            rows={3}
                            value={editingReplyBody}
                            onChange={(event) =>
                              setEditingReplyBody(event.target.value)
                            }
                          />
                          <div className="inline-actions">
                            <button
                              type="button"
                              className="action-button"
                              onClick={() =>
                                onSaveReplyEdit(reply.threadId, reply.id)
                              }
                              disabled={
                                processingId === `reply-edit:${reply.id}`
                              }
                            >
                              Save Reply
                            </button>
                            <button
                              type="button"
                              className="action-button ghost"
                              onClick={() => {
                                setEditingReplyId("");
                                setEditingReplyBody("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-actions">
                          <Link
                            href={threadHref(
                              reply.threadId,
                              reply.threadSlug,
                              reply.communitySlug,
                            )}
                            className="action-button ghost small"
                          >
                            Open Thread
                          </Link>
                          <button
                            type="button"
                            className="action-button ghost small"
                            onClick={() => {
                              setEditingReplyId(reply.id);
                              setEditingReplyBody(reply.body);
                            }}
                          >
                            Edit Reply
                          </button>
                          <button
                            type="button"
                            className="action-button ghost small"
                            onClick={() =>
                              onDeleteReply(reply.threadId, reply.id)
                            }
                            disabled={processingId === `reply:${reply.id}`}
                          >
                            Delete Reply
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No replies on your threads yet.</p>
              )}
            </>
          ) : null}

          {manageView === "wiki" ? (
            <>
              <h2>Manage Wiki Entries</h2>
              {wiki.length ? (
                <ul>
                  {wiki.map((entry) => (
                    <li key={entry.id}>
                      <strong>{entry.title}</strong> ({entry.status})
                      <p>
                        Updated {new Date(entry.updatedAt).toLocaleString()}
                      </p>
                      <div className="inline-actions">
                        <Link
                          href={`/wiki/${entry.id}`}
                          className="action-button ghost small"
                        >
                          View
                        </Link>
                        <Link
                          href={`/wiki/${entry.id}/edit`}
                          className="action-button ghost small"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="action-button ghost small"
                          onClick={() => onDeleteWiki(entry.id)}
                          disabled={processingId === `wiki:${entry.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No wiki entries yet.</p>
              )}
            </>
          ) : null}
        </section>
      );
    }

    if (panel === "watchlist") {
      return (
        <section className="section-block dashboard-card list-panel">
          <h2>Watchlist</h2>
          {watchlist.length ? (
            <ul>
              {watchlist.map((item) => (
                <li key={item.animeId}>{item.title}</li>
              ))}
            </ul>
          ) : (
            <p>No watchlist items yet.</p>
          )}
        </section>
      );
    }

    return (
      <section className="section-block dashboard-card list-panel text-white">
        <h2>Identity Connections</h2>
        <p className="meta-line mb-6">
          Link multiple social logins to sign in to the same account securely.
        </p>
        <div className="connections-provider-list space-y-4 mb-8">
          {[
            { id: "google", name: "Google", icon: "💎" },
            { id: "discord", name: "Discord", icon: "🎮" },
            { id: "facebook", name: "Facebook", icon: "👥" },
            { id: "github", name: "GitHub", icon: "💻" },
          ].map((p) => {
            const isLinked = identities.some((id) => id.provider === p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-semibold text-sm">{p.name}</span>
                </div>
                <div>
                  {isLinked ? (
                    <span className="px-3 py-1 text-xs font-bold text-green-400 bg-green-500/10 rounded-full border border-green-500/20">
                      ✓ Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLinkIdentity(p.id)}
                      className="px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-[var(--brand)] hover:bg-[var(--brand-strong)] transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h2>Community Footprint</h2>
        <h3>Communities</h3>
        {joinedCommunities.length ? (
          <ul>
            {joinedCommunities.slice(0, 10).map((community) => (
              <li key={community.id}>
                <Link href={`/community/${community.slug}`}>
                  {community.name}
                </Link>{" "}
                · {community.memberCount} members
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not joined a community yet.</p>
        )}
        <h3 className="mt-6">Badges and Recognition</h3>
        <div className="pill-list">
          {(stats?.badges || []).length ? (
            (stats?.badges || []).map((badge) => (
              <span className="badge-pill" key={badge}>
                {badge}
              </span>
            ))
          ) : (
            <span className="meta-line">No badges yet.</span>
          )}
        </div>
        <h3 className="mt-6">Core Counters</h3>
        <ul>
          <li>Threads created: {stats?.threadCount || 0}</li>
          <li>Comments posted: {stats?.commentCount || 0}</li>
          <li>Wiki contributions: {stats?.wikiCount || 0}</li>
          <li>Saved threads: {savedThreads.length}</li>
        </ul>
        <div className="inline-actions">
          <Link href="/community" className="action-button">
            Explore Communities
          </Link>
          <Link href="/settings" className="action-button ghost">
            Settings
          </Link>
        </div>
      </section>
    );
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back, {user?.username || "Member"}. Manage security,
          governance, activity, and account controls from one enterprise
          workspace.
        </p>
      </section>

      <section className="workspace-layout">
        <aside className="workspace-sidebar section-block">
          <h3>Sections</h3>
          <button
            type="button"
            className={
              panel === "command" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => setPanel("command")}
          >
            Command Center
          </button>
          <button
            type="button"
            className={
              panel === "security" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => setPanel("security")}
          >
            Security
          </button>
          <button
            type="button"
            className={
              panel === "activity" ? "workspace-link active" : "workspace-link"
            }
            aria-expanded={activityExpanded}
            onClick={() => {
              setPanel("activity");
              setActivityExpanded((prev) => !prev);
            }}
          >
            <span>Activity Feed</span>
            <span className="workspace-chevron" aria-hidden="true">
              {activityExpanded ? "▾" : "▸"}
            </span>
          </button>
          {activityExpanded ? (
            <div className="workspace-nested-links">
              <button
                type="button"
                className={
                  panel === "activity" && activityView === "all"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("activity");
                  setActivityView("all");
                }}
              >
                All Activity
              </button>
              <button
                type="button"
                className={
                  panel === "activity" && activityView === "threads"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("activity");
                  setActivityView("threads");
                }}
              >
                Threads
              </button>
              <button
                type="button"
                className={
                  panel === "activity" && activityView === "replies"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("activity");
                  setActivityView("replies");
                }}
              >
                Replies
              </button>
              <button
                type="button"
                className={
                  panel === "activity" && activityView === "comments"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("activity");
                  setActivityView("comments");
                }}
              >
                My Comments
              </button>
              <button
                type="button"
                className={
                  panel === "activity" && activityView === "wiki"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("activity");
                  setActivityView("wiki");
                }}
              >
                Wiki
              </button>
              <button
                type="button"
                className={
                  panel === "activity" && activityView === "saved"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("activity");
                  setActivityView("saved");
                }}
              >
                Saved Threads
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className={
              panel === "manage" ? "workspace-link active" : "workspace-link"
            }
            aria-expanded={manageExpanded}
            onClick={() => {
              setPanel("manage");
              setManageExpanded((prev) => !prev);
            }}
          >
            <span>Manage Content</span>
            <span className="workspace-chevron" aria-hidden="true">
              {manageExpanded ? "▾" : "▸"}
            </span>
          </button>
          {manageExpanded ? (
            <div className="workspace-nested-links">
              <button
                type="button"
                className={
                  panel === "manage" && manageView === "threads"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("manage");
                  setManageView("threads");
                }}
              >
                Threads
              </button>
              <button
                type="button"
                className={
                  panel === "manage" && manageView === "replies"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("manage");
                  setManageView("replies");
                }}
              >
                Replies
              </button>
              <button
                type="button"
                className={
                  panel === "manage" && manageView === "wiki"
                    ? "workspace-link workspace-link-nested active"
                    : "workspace-link workspace-link-nested"
                }
                onClick={() => {
                  setPanel("manage");
                  setManageView("wiki");
                }}
              >
                Wiki Entries
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className={
              panel === "watchlist" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => setPanel("watchlist")}
          >
            Watchlist
          </button>
          <button
            type="button"
            className={
              panel === "connections"
                ? "workspace-link active"
                : "workspace-link"
            }
            onClick={() => setPanel("connections")}
          >
            Connections
          </button>
        </aside>

        <div className="workspace-content">{renderPanel()}</div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
