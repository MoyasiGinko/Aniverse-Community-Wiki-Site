"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";

type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  bannerUrl: string;
  ownerId: string;
};

type Thread = {
  id: string;
  slug: string;
  isHighlighted: boolean;
  communityId: string;
  wikiReferenceId: string | null;
  title: string;
  body: string;
  imageUrls: string[];
  createdAt?: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  } | null;
  stats?: {
    upvotes: number;
    downvotes: number;
    saves: number;
    shares: number;
    views: number;
    comments: number;
  };
  savedByMe?: boolean;
  sharedByMe?: boolean;
  userVote?: 1 | -1 | 0;
};

type CurrentUser = {
  id: string;
  role: string;
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

export default function CommunitySlugPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [community, setCommunity] = useState<Community | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [openThreadMenuId, setOpenThreadMenuId] = useState<string | null>(null);

  const [showCreateThread, setShowCreateThread] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState("");

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, meResponse] = await Promise.all([
        apiRequest<{ communities: Community[] }>("/api/communities"),
        fetch("/api/auth/me", { credentials: "same-origin" }),
      ]);

      if (meResponse.ok) {
        const meData = (await meResponse.json()) as {
          user?: CurrentUser | null;
        };
        setCurrentUser(meData.user || null);
      } else {
        setCurrentUser(null);
      }

      const target = data.communities.find((c) => c.slug === params.slug);

      if (!target) {
        throw new Error("Community not found (404)");
      }
      setCommunity(target);

      // Fetch threads for this community ID
      const tData = await apiRequest<{ threads: Thread[] }>(
        `/api/community/threads?communityId=${target.id}&shareMode=${SHARE_COUNT_MODE}`,
      );
      setThreads(tData.threads);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.slug]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".community-thread-menu-wrap")) {
        return;
      }
      setOpenThreadMenuId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const formatTimeAgo = (value?: string) => {
    if (!value) return "just now";
    const date = new Date(value).getTime();
    if (Number.isNaN(date)) return "just now";

    const seconds = Math.max(1, Math.floor((Date.now() - date) / 1000));
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
  };

  const getThreadUrl = (threadPath: string) =>
    `${window.location.origin}${threadPath}`;

  const shareThread = async (thread: Thread, threadHref: string) => {
    const url = getThreadUrl(threadHref);
    try {
      if (navigator.share) {
        await navigator.share({ title: thread.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }

      if (!thread.sharedByMe) {
        setThreads((current) =>
          current.map((item) =>
            item.id === thread.id
              ? {
                  ...item,
                  sharedByMe: true,
                  stats: item.stats
                    ? { ...item.stats, shares: item.stats.shares + 1 }
                    : item.stats,
                }
              : item,
          ),
        );
      }

      try {
        await apiRequest(
          `/api/community/threads/${thread.id}/share?mode=${SHARE_COUNT_MODE}`,
          {
            method: "POST",
          },
        );
      } catch {
        // Ignore tracking failure if share/copy succeeded.
      }

      setInfo("Thread link copied/shared.");
      setError("");
    } catch {
      // User canceled native share.
    }
  };

  const toggleSaveThread = async (thread: Thread) => {
    const nextSaved = !thread.savedByMe;

    setThreads((current) =>
      current.map((item) =>
        item.id === thread.id
          ? {
              ...item,
              savedByMe: nextSaved,
              stats: item.stats
                ? {
                    ...item.stats,
                    saves: Math.max(0, item.stats.saves + (nextSaved ? 1 : -1)),
                  }
                : item.stats,
            }
          : item,
      ),
    );

    try {
      await apiRequest(`/api/community/threads/${thread.id}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });
    } catch (err) {
      setThreads((current) =>
        current.map((item) =>
          item.id === thread.id
            ? {
                ...item,
                savedByMe: thread.savedByMe,
                stats: thread.stats,
              }
            : item,
        ),
      );
      setError((err as Error).message);
    }
  };

  const toggleVote = async (thread: Thread, value: 1 | -1) => {
    const previousVote = thread.userVote || 0;
    const nextVote = previousVote === value ? 0 : value;

    setThreads((current) =>
      current.map((item) => {
        if (item.id !== thread.id || !item.stats) return item;

        const upDelta = (nextVote === 1 ? 1 : 0) - (previousVote === 1 ? 1 : 0);
        const downDelta =
          (nextVote === -1 ? 1 : 0) - (previousVote === -1 ? 1 : 0);

        return {
          ...item,
          userVote: nextVote,
          stats: {
            ...item.stats,
            upvotes: Math.max(0, item.stats.upvotes + upDelta),
            downvotes: Math.max(0, item.stats.downvotes + downDelta),
          },
        };
      }),
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
      setThreads((current) =>
        current.map((item) =>
          item.id === thread.id
            ? {
                ...item,
                userVote: previousVote,
                stats: thread.stats,
              }
            : item,
        ),
      );
      setError((err as Error).message);
    }
  };

  const toggleThreadHighlight = async (thread: Thread) => {
    const nextHighlighted = !thread.isHighlighted;
    setError("");

    setThreads((current) =>
      current.map((item) =>
        item.id === thread.id
          ? { ...item, isHighlighted: nextHighlighted }
          : item,
      ),
    );

    try {
      await apiRequest(`/api/community/threads/${thread.id}/highlight`, {
        method: nextHighlighted ? "POST" : "DELETE",
      });
      setInfo(
        nextHighlighted
          ? `Highlighted "${thread.title}".`
          : `Removed "${thread.title}" from highlighted threads.`,
      );
    } catch (err) {
      setThreads((current) =>
        current.map((item) =>
          item.id === thread.id
            ? { ...item, isHighlighted: thread.isHighlighted }
            : item,
        ),
      );
      setError((err as Error).message);
    }
  };

  const joinCommunity = async () => {
    try {
      await apiRequest(`/api/communities/${params.slug}/join`, {
        method: "POST",
      });
      setInfo(`Successfully joined community/${params.slug}!`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const leaveCommunity = async () => {
    try {
      await apiRequest(`/api/communities/${params.slug}/join`, {
        method: "DELETE",
      });
      setInfo(`Left community/${params.slug}.`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const createThread = async (e: FormEvent) => {
    e.preventDefault();
    if (!community) return;

    setError("");
    setInfo("");
    try {
      await apiRequest("/api/community/threads", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          communityId: community.id,
          imageUrls: attachmentUrls
            .split("\n")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });
      setTitle("");
      setBody("");
      setAttachmentUrls("");
      setShowCreateThread(false);
      setInfo("Thread published.");
      const tData = await apiRequest<{ threads: Thread[] }>(
        `/api/community/threads?communityId=${community.id}&shareMode=${SHARE_COUNT_MODE}`,
      );
      setThreads(tData.threads);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <main className="feature-page wiki-fandom-page">
        <div
          className="wiki-skeleton"
          style={{ height: "240px", marginBottom: "2rem" }}
        ></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="feature-page wiki-fandom-page">
        <p className="error-text fade-in-up">
          Error loading community: {error}
        </p>
      </main>
    );
  }

  if (!community) return null;

  const canManageHighlights = Boolean(
    currentUser &&
    (currentUser.role === "admin" || currentUser.id === community.ownerId),
  );

  const highlightedThreads = threads
    .filter((thread) => thread.isHighlighted)
    .sort((a, b) => {
      const scoreA =
        (a.stats?.upvotes || 0) * 3 +
        (a.stats?.comments || 0) * 2 +
        (a.stats?.shares || 0) * 2 +
        (a.stats?.saves || 0) +
        (a.stats?.views || 0) * 0.2;
      const scoreB =
        (b.stats?.upvotes || 0) * 3 +
        (b.stats?.comments || 0) * 2 +
        (b.stats?.shares || 0) * 2 +
        (b.stats?.saves || 0) +
        (b.stats?.views || 0) * 0.2;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    })
    .slice(0, 10);

  return (
    <main className="feature-page wiki-fandom-page">
      <section
        className="wiki-meta-panel fade-in-up"
        style={{ marginBottom: "2rem" }}
      >
        {community.bannerUrl ? (
          <div
            className="community-cover"
            style={{ backgroundImage: `url(${community.bannerUrl})` }}
          />
        ) : null}
        <div className="wiki-meta-header" style={{ alignItems: "flex-start" }}>
          {community.iconUrl ? (
            <img
              src={community.iconUrl}
              alt={`${community.name} logo`}
              className="community-logo"
            />
          ) : (
            <div
              className="wiki-meta-icon"
              style={{ width: 80, height: 80, fontSize: "2.5rem" }}
            >
              {community.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "0.2rem" }}>
              c/{community.slug}
            </h1>
            <p className="wiki-stat-label">
              {community.name} • {community.category}
            </p>
            <p style={{ marginTop: "0.8rem", color: "var(--text)" }}>
              {community.description}
            </p>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <button className="action-button" onClick={joinCommunity}>
              Join
            </button>
            <button className="action-button ghost" onClick={leaveCommunity}>
              Leave
            </button>
          </div>
        </div>
      </section>

      {info ? (
        <p
          className="success-text fade-in-up"
          style={{ color: "var(--brand)", marginBottom: "1rem" }}
        >
          {info}
        </p>
      ) : null}

      <div
        className="portal-toolbar fade-in-up"
        style={{ marginBottom: "1rem" }}
      >
        <h2>Community Threads</h2>
        {!showCreateThread ? (
          <button
            type="button"
            className="action-button ghost"
            onClick={() => setShowCreateThread(true)}
          >
            Publish Thread
          </button>
        ) : null}
      </div>

      {showCreateThread ? (
        <form
          className="feature-form auth-form-grid fade-in-up"
          onSubmit={createThread}
          style={{ marginBottom: "1.5rem" }}
        >
          <label htmlFor="title">Thread Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label htmlFor="body">Content</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            required
          />
          <label htmlFor="attachments">
            Image Attachment URLs (one per line)
          </label>
          <textarea
            id="attachments"
            value={attachmentUrls}
            onChange={(e) => setAttachmentUrls(e.target.value)}
            rows={3}
            placeholder="https://example.com/thread-image-1.jpg"
          />
          <div className="inline-actions">
            <button type="submit">Post to c/{community.slug}</button>
            <button
              type="button"
              className="action-button ghost"
              onClick={() => setShowCreateThread(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <section className="community-hub-grid fade-in-up">
        <div className="section-block portal-card list-panel">
          <ul
            style={{
              display: "grid",
              gap: "1rem",
              listStyle: "none",
              paddingLeft: 0,
            }}
          >
            {threads.length ? (
              threads.map((thread) => {
                const threadHref = `/community/${community.slug}/${thread.slug}`;
                return (
                  <li
                    key={thread.id}
                    className="community-thread-card"
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (
                        target.closest(
                          "a, button, input, textarea, select, label",
                        )
                      ) {
                        return;
                      }
                      router.push(threadHref);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="community-thread-topline">
                      <div className="community-thread-meta">
                        <div className="community-thread-identity">
                          {community.iconUrl ? (
                            <img
                              src={community.iconUrl}
                              alt={`${community.name} logo`}
                              className="community-thread-guild-logo"
                            />
                          ) : (
                            <div className="community-thread-guild-logo community-thread-guild-logo-fallback">
                              {community.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="community-thread-identity-text">
                            <Link
                              className="community-thread-community"
                              href={`/community/${community.slug}`}
                            >
                              {community.name}
                            </Link>
                            <span className="community-thread-author-name">
                              by {thread.author?.username || "Unknown user"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="community-thread-actions">
                        <span className="community-thread-time">
                          {formatTimeAgo(thread.createdAt)}
                        </span>
                        <div className="community-thread-menu-wrap">
                          <button
                            type="button"
                            className="community-thread-menu-button"
                            aria-label="Thread options"
                            onClick={() =>
                              setOpenThreadMenuId((current) =>
                                current === thread.id ? null : thread.id,
                              )
                            }
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
                          {openThreadMenuId === thread.id ? (
                            <div className="community-thread-menu-dropdown">
                              <Link href={threadHref}>Open</Link>
                              <button
                                type="button"
                                onClick={() => {
                                  shareThread(thread, threadHref);
                                  setOpenThreadMenuId(null);
                                }}
                              >
                                Share
                              </button>
                              {canManageHighlights ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleThreadHighlight(thread);
                                    setOpenThreadMenuId(null);
                                  }}
                                >
                                  {thread.isHighlighted
                                    ? "Remove Highlight"
                                    : "Highlight"}
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <Link href={threadHref} className="community-thread-title">
                      {thread.title}
                    </Link>

                    <p className="community-thread-excerpt">
                      {thread.body.length > 180
                        ? `${thread.body.slice(0, 180)}...`
                        : thread.body}
                    </p>

                    {thread.imageUrls?.length ? (
                      <div className="community-thread-preview-grid">
                        {thread.imageUrls.slice(0, 3).map((url) => (
                          <img
                            key={`${thread.id}-${url}`}
                            src={url}
                            alt="Thread attachment preview"
                            className="community-thread-preview-image"
                          />
                        ))}
                      </div>
                    ) : null}

                    {thread.imageUrls?.length ? (
                      <small className="community-thread-attachments">
                        {thread.imageUrls.length} attachment
                        {thread.imageUrls.length > 1 ? "s" : ""}
                      </small>
                    ) : null}

                    <div className="community-thread-stats-row">
                      <button
                        type="button"
                        className={`community-thread-stat ${thread.userVote === 1 ? "is-active" : ""}`}
                        onClick={() => toggleVote(thread, 1)}
                      >
                        <StatIcon kind="up" /> {thread.stats?.upvotes || 0}
                      </button>
                      <button
                        type="button"
                        className={`community-thread-stat ${thread.userVote === -1 ? "is-active" : ""}`}
                        onClick={() => toggleVote(thread, -1)}
                      >
                        <StatIcon kind="down" /> {thread.stats?.downvotes || 0}
                      </button>
                      <span className="community-thread-stat">
                        <StatIcon kind="comment" />{" "}
                        {thread.stats?.comments || 0}
                      </span>
                      <button
                        type="button"
                        className={`community-thread-save ${thread.savedByMe ? "is-active" : ""}`}
                        onClick={() => toggleSaveThread(thread)}
                      >
                        <StatIcon kind="save" /> {thread.stats?.saves || 0}
                      </button>
                      <button
                        type="button"
                        className="community-thread-share"
                        onClick={() => shareThread(thread, threadHref)}
                      >
                        <StatIcon kind="share" /> {thread.stats?.shares || 0}
                      </button>
                      <span className="community-thread-stat community-thread-views">
                        <StatIcon kind="view" /> {thread.stats?.views || 0}
                      </span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="meta-line fade-in-up">
                This community feels empty. Be the first to post a thread!
              </li>
            )}
          </ul>
        </div>

        <aside className="section-block portal-card community-top-sidebar">
          <h2 style={{ marginBottom: "0.75rem" }}>Highlighted Threads</h2>
          {highlightedThreads.length ? (
            <ul className="community-sidebar-list">
              {highlightedThreads.map((thread, index) => (
                <li key={thread.id} className="community-sidebar-item">
                  <Link
                    href={`/community/${community.slug}/${thread.slug}`}
                    className="community-sidebar-link"
                  >
                    <div className="community-sidebar-title-row">
                      <strong>
                        #{index + 1} {thread.title}
                      </strong>
                    </div>
                    <small className="community-sidebar-meta">
                      {(thread.stats?.upvotes || 0) -
                        (thread.stats?.downvotes || 0)}{" "}
                      score • {thread.stats?.comments || 0} comments •{" "}
                      {thread.stats?.views || 0} views
                    </small>
                    <p className="community-sidebar-description">
                      {thread.body.length > 84
                        ? `${thread.body.slice(0, 84)}...`
                        : thread.body}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="meta-line">
              {canManageHighlights
                ? "No highlighted threads yet. Use Highlight on any thread to pin it here."
                : "No highlighted threads selected by this community yet."}
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
