"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";
import ThreadRepliesPanel from "@/app/(community)/community/_components/ThreadRepliesPanel";

type Thread = {
  id: string;
  slug: string;
  authorId: string;
  title: string;
  body: string;
  imageUrls: string[];
  createdAt: string;
  communityId: string | null;
  wikiReferenceId: string | null;
  stats?: {
    upvotes: number;
    downvotes: number;
    saves: number;
    shares: number;
    views: number;
    comments: number;
  };
  author?: {
    id: string;
    username: string;
    avatarUrl: string;
  } | null;
  userVote?: 1 | -1 | 0;
  savedByMe?: boolean;
  sharedByMe?: boolean;
};

type Viewer = {
  id: string;
  username: string;
  role: "user" | "mod" | "admin";
};

type Community = {
  id: string;
  slug: string;
  name: string;
  iconUrl?: string;
};

const SHARE_COUNT_MODE = "event";

function StatIcon({
  kind,
}: {
  kind: "up" | "down" | "comment" | "view" | "save" | "share";
}) {
  if (kind === "up") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path d="M12 5l6.5 8h-4.2V19H9.7v-6H5.5L12 5z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "down") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path d="M12 19l-6.5-8h4.2V5h4.6v6h4.2L12 19z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "comment") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path
          d="M4 5h16v10H8l-4 4V5zm2 2v7.2L7.2 13H18V7H6z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (kind === "save") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path
          d="M6 4h10l2 2v14l-6-3-6 3V4zm2 2v10.8l4-2 4 2V6H8z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (kind === "share") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path
          d="M14 5l5 5-5 5v-3H9a4 4 0 00-4 4H3a6 6 0 016-6h5V5z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="community-stat-icon">
      <path
        d="M12 6c4.6 0 8.4 2.3 10 6-1.6 3.7-5.4 6-10 6S3.6 15.7 2 12c1.6-3.7 5.4-6 10-6zm0 2C8.6 8 5.6 9.6 4.2 12c1.4 2.4 4.4 4 7.8 4s6.4-1.6 7.8-4C18.4 9.6 15.4 8 12 8zm0 1.8a2.2 2.2 0 110 4.4 2.2 2.2 0 010-4.4z"
        fill="currentColor"
      />
    </svg>
  );
}

function formatTimeAgo(value: string) {
  const date = new Date(value);
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export default function CommunityThreadPage() {
  const params = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [trendingThreads, setTrendingThreads] = useState<Thread[]>([]);
  const [communityById, setCommunityById] = useState<Map<string, Community>>(
    new Map(),
  );
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [threadData, trendingData, communitiesData, meData] =
          await Promise.all([
            apiRequest<{ thread: Thread }>(
              `/api/community/threads/${params.threadId}`,
            ),
            apiRequest<{ threads: Thread[] }>(
              "/api/community/threads?mode=trending&limit=10",
            ),
            apiRequest<{ communities: Community[] }>("/api/communities"),
            apiRequest<{ user: Viewer }>("/api/auth/me").catch(() => ({
              user: null as unknown as Viewer,
            })),
          ]);

        setThread(threadData.thread);
        setTrendingThreads(
          trendingData.threads.filter(
            (item) => item.id !== threadData.thread.id,
          ),
        );
        setCommunityById(
          new Map(
            communitiesData.communities.map((entry) => [entry.id, entry]),
          ),
        );

        if (threadData.thread.communityId) {
          const mapped = communitiesData.communities.find(
            (item) => item.id === threadData.thread.communityId,
          );
          setCommunity(mapped || null);
        } else {
          setCommunity(null);
        }
        setViewer(meData.user || null);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    loadData();
  }, [params.threadId]);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const shareThread = async () => {
    if (!thread) return;

    const threadPath = community
      ? `/community/${community.slug}/${thread.slug}`
      : `/community/thread/${thread.id}`;
    const url = `${window.location.origin}${threadPath}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: thread.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }

      setThread((current) => {
        if (!current || current.sharedByMe || !current.stats) return current;
        return {
          ...current,
          sharedByMe: true,
          stats: { ...current.stats, shares: current.stats.shares + 1 },
        };
      });

      try {
        await apiRequest(
          `/api/community/threads/${thread.id}/share?mode=${SHARE_COUNT_MODE}`,
          { method: "POST" },
        );
      } catch {
        // Ignore tracking failure if share itself succeeded.
      }

      setInfo("Thread link copied/shared.");
      setError("");
    } catch {
      // User cancelled native share dialog.
    }
  };

  const toggleSaveThread = async () => {
    if (!thread || !thread.stats) return;

    const nextSaved = !thread.savedByMe;
    const previous = thread;

    setThread((current) =>
      current && current.stats
        ? {
            ...current,
            savedByMe: nextSaved,
            stats: {
              ...current.stats,
              saves: Math.max(0, current.stats.saves + (nextSaved ? 1 : -1)),
            },
          }
        : current,
    );

    try {
      await apiRequest(`/api/community/threads/${thread.id}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });
    } catch (err) {
      setThread(previous);
      setError((err as Error).message);
    }
  };

  const toggleVote = async (value: 1 | -1) => {
    if (!thread || !thread.stats) return;

    const previous = thread;
    const previousVote = thread.userVote || 0;
    const nextVote = previousVote === value ? 0 : value;

    const upDelta = (nextVote === 1 ? 1 : 0) - (previousVote === 1 ? 1 : 0);
    const downDelta = (nextVote === -1 ? 1 : 0) - (previousVote === -1 ? 1 : 0);

    setThread((current) =>
      current && current.stats
        ? {
            ...current,
            userVote: nextVote,
            stats: {
              ...current.stats,
              upvotes: Math.max(0, current.stats.upvotes + upDelta),
              downvotes: Math.max(0, current.stats.downvotes + downDelta),
            },
          }
        : current,
    );

    try {
      if (nextVote === 0) {
        await apiRequest(`/api/community/threads/${thread.id}/vote`, {
          method: "DELETE",
        });
      } else {
        await apiRequest(`/api/community/threads/${thread.id}/vote`, {
          method: "POST",
          body: JSON.stringify({ value: nextVote }),
        });
      }
    } catch (err) {
      setThread(previous);
      setError((err as Error).message);
    }
  };

  const jumpToReplies = () => {
    document.getElementById("thread-replies")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const canEditThread =
    !!viewer &&
    !!thread &&
    (viewer.id === thread.authorId ||
      viewer.role === "admin" ||
      viewer.role === "mod");

  const reportThread = async () => {
    if (!thread) return;
    const reason =
      window.prompt("Report reason", "Inappropriate content") || "";
    if (!reason.trim()) return;

    try {
      await apiRequest("/api/community/reports", {
        method: "POST",
        body: JSON.stringify({
          type: "thread",
          targetId: thread.id,
          reason: reason.trim(),
        }),
      });
      setInfo("Thread reported.");
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMenuOpen(false);
    }
  };

  const editThread = async () => {
    if (!thread || !canEditThread) return;

    const nextTitle = window.prompt("Edit thread title", thread.title);
    if (nextTitle === null) return;
    const nextBody = window.prompt("Edit thread body", thread.body);
    if (nextBody === null) return;

    try {
      const updated = await apiRequest<{
        thread: { id: string; slug: string; title: string; body: string };
      }>(`/api/community/threads/${thread.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: nextTitle, body: nextBody }),
      });

      setThread((current) =>
        current
          ? {
              ...current,
              title: updated.thread.title,
              body: updated.thread.body,
              slug: updated.thread.slug,
            }
          : current,
      );

      setInfo("Thread updated.");
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMenuOpen(false);
    }
  };

  if (error && !thread) {
    return (
      <main className="feature-page wiki-fandom-page">
        <p className="error-text">{error}</p>
      </main>
    );
  }

  if (!thread) {
    return (
      <main className="feature-page wiki-fandom-page">
        <div className="wiki-skeleton" style={{ height: "260px" }}></div>
      </main>
    );
  }

  const threadAge = formatTimeAgo(thread.createdAt || new Date().toISOString());
  const guildName = community?.name || "Community thread";
  const guildIconUrl = community?.iconUrl || "";
  const authorName = thread.author?.username || "Member";

  return (
    <main className="feature-page wiki-fandom-page">
      {error ? <p className="error-text">{error}</p> : null}
      <section className="community-hub-grid fade-in-up">
        <section className="thread-detail-main-column">
          <section
            className="wiki-meta-panel fade-in-up thread-post-card"
            style={{ padding: "1.25rem" }}
          >
            <header className="thread-detail-header">
              <div className="thread-detail-top-row">
                <div className="thread-detail-meta-row thread-detail-origin-row">
                  <div className="thread-detail-guild-identity">
                    {guildIconUrl ? (
                      <img
                        src={guildIconUrl}
                        alt={guildName}
                        className="thread-detail-guild-icon"
                      />
                    ) : (
                      <span className="thread-detail-guild-icon thread-detail-guild-icon-fallback">
                        {guildName[0]?.toUpperCase() || "C"}
                      </span>
                    )}

                    <div className="thread-detail-guild-text">
                      {community ? (
                        <Link
                          href={`/community/${community.slug}`}
                          className="thread-detail-guild-name"
                        >
                          {guildName}
                        </Link>
                      ) : (
                        <span className="thread-detail-guild-name">
                          {guildName}
                        </span>
                      )}
                      <p className="thread-detail-byline">by {authorName}</p>
                    </div>
                  </div>
                </div>

                <div className="thread-detail-meta-actions">
                  <span className="thread-detail-time-chip">{threadAge}</span>
                  <div
                    className="community-thread-menu-wrap"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="community-thread-menu-button"
                      aria-label="Thread options"
                      onClick={() => setMenuOpen((open) => !open)}
                    >
                      <span
                        className="community-thread-menu-dots"
                        aria-hidden="true"
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </button>
                    {menuOpen ? (
                      <div
                        className="community-thread-menu-dropdown"
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={editThread}
                          disabled={!canEditThread}
                          aria-disabled={!canEditThread}
                          title={
                            canEditThread
                              ? "Edit thread"
                              : "Only author/mod/admin can edit"
                          }
                        >
                          Edit
                        </button>
                        <button type="button" onClick={reportThread}>
                          Report
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <h1>{thread.title}</h1>
            </header>

            <article className="thread-detail-body">{thread.body}</article>

            {thread.imageUrls?.length ? (
              <section className="thread-detail-attachments">
                <h3>Attachments</h3>
                <div className="community-attachment-grid thread-detail-attachment-grid">
                  {thread.imageUrls.map((url) => (
                    <a
                      key={`${thread.id}-${url}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={url}
                        alt="Thread attachment"
                        className="community-attachment-thumb"
                      />
                    </a>
                  ))}
                </div>
              </section>
            ) : (
              <p className="meta-line thread-detail-no-attachments">
                No image attachments.
              </p>
            )}

            <section className="thread-detail-metrics-wrap">
              <div className="thread-detail-metrics">
                <button
                  type="button"
                  className={`community-thread-stat ${thread.userVote === 1 ? "is-active" : ""}`}
                  aria-label={`Upvote thread (${thread.stats?.upvotes || 0} upvotes)`}
                  onClick={() => toggleVote(1)}
                >
                  <StatIcon kind="up" /> {thread.stats?.upvotes || 0}
                </button>
                <button
                  type="button"
                  className={`community-thread-stat ${thread.userVote === -1 ? "is-active" : ""}`}
                  aria-label={`Downvote thread (${thread.stats?.downvotes || 0} downvotes)`}
                  onClick={() => toggleVote(-1)}
                >
                  <StatIcon kind="down" /> {thread.stats?.downvotes || 0}
                </button>
                <button
                  type="button"
                  className="community-thread-stat"
                  aria-label={`Jump to replies (${thread.stats?.comments || 0} replies)`}
                  onClick={jumpToReplies}
                >
                  <StatIcon kind="comment" /> {thread.stats?.comments || 0}
                </button>
                <button
                  type="button"
                  className={`community-thread-save ${thread.savedByMe ? "is-active" : ""}`}
                  aria-label={`Save thread (${thread.stats?.saves || 0} saves)`}
                  onClick={toggleSaveThread}
                >
                  <StatIcon kind="save" /> {thread.stats?.saves || 0}
                </button>
                <button
                  type="button"
                  className="community-thread-share"
                  aria-label={`Share thread (${thread.stats?.shares || 0} shares)`}
                  onClick={shareThread}
                >
                  <StatIcon kind="share" /> {thread.stats?.shares || 0}
                </button>
                <span className="community-thread-stat community-thread-views">
                  <StatIcon kind="view" /> {thread.stats?.views || 0}
                </span>
              </div>
              {info ? <p className="meta-line">{info}</p> : null}
            </section>
          </section>

          <ThreadRepliesPanel threadId={thread.id} />
        </section>

        <aside className="section-block portal-card community-top-sidebar">
          <h2 style={{ marginBottom: "0.75rem" }}>Top Trending Threads</h2>
          {trendingThreads.length ? (
            <ul className="community-sidebar-list">
              {trendingThreads.map((item, index) => {
                const itemCommunity = item.communityId
                  ? communityById.get(item.communityId)
                  : null;
                const href = itemCommunity
                  ? `/community/${itemCommunity.slug}/${item.slug}`
                  : `/community/thread/${item.id}`;
                return (
                  <li key={item.id} className="community-sidebar-item">
                    <Link href={href} className="community-sidebar-link">
                      <div className="community-sidebar-title-row">
                        <strong>
                          #{index + 1} {item.title}
                        </strong>
                      </div>
                      <small className="community-sidebar-meta">
                        {itemCommunity ? itemCommunity.name : "Global"} •{" "}
                        {(item.stats?.upvotes || 0) -
                          (item.stats?.downvotes || 0)}{" "}
                        score • {item.stats?.comments || 0} comments
                      </small>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="meta-line">No trending threads yet.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
