"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";

type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  bannerUrl: string;
  memberCount: number;
  joined: boolean;
};

type Thread = {
  id: string;
  slug: string;
  title: string;
  body: string;
  imageUrls: string[];
  createdAt?: string;
  communityId: string | null;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  } | null;
  stats: {
    upvotes: number;
    downvotes: number;
    saves: number;
    shares: number;
    views: number;
    comments: number;
  };
  savedByMe: boolean;
  sharedByMe: boolean;
  userVote: 1 | -1 | 0;
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

export default function CommunitiesIndexPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [openThreadMenuId, setOpenThreadMenuId] = useState<string | null>(null);

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [communitiesData, threadsData] = await Promise.all([
        apiRequest<{ communities: Community[] }>("/api/communities"),
        apiRequest<{ threads: Thread[] }>(
          `/api/community/threads?shareMode=${SHARE_COUNT_MODE}`,
        ),
      ]);
      setCommunities(communitiesData.communities);
      setThreads(threadsData.threads);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const shareThread = async (thread: Thread) => {
    const threadPath = thread.communityId
      ? `/community/${communities.find((entry) => entry.id === thread.communityId)?.slug || "community"}/${thread.slug}`
      : `/community/thread/${thread.id}`;
    const url = getThreadUrl(threadPath);
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
                  stats: {
                    ...item.stats,
                    shares: item.stats.shares + 1,
                  },
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
        // Ignore tracking failure: sharing already succeeded.
      }

      setInfo("Thread link copied/shared.");
      setError("");
    } catch {
      // User might cancel native share; no error toast needed.
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
              stats: {
                ...item.stats,
                saves: Math.max(0, item.stats.saves + (nextSaved ? 1 : -1)),
              },
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
                stats: {
                  ...item.stats,
                  saves: thread.stats.saves,
                },
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
        if (item.id !== thread.id) return item;

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
                stats: {
                  ...item.stats,
                  upvotes: thread.stats.upvotes,
                  downvotes: thread.stats.downvotes,
                },
              }
            : item,
        ),
      );
      setError((err as Error).message);
    }
  };

  const createCommunity = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await apiRequest("/api/communities", {
        method: "POST",
        body: JSON.stringify({
          slug,
          name,
          description,
          category,
          iconUrl,
          bannerUrl,
        }),
      });
      setSlug("");
      setName("");
      setDescription("");
      setCategory("");
      setIconUrl("");
      setBannerUrl("");
      setShowCreate(false);
      setInfo("Community perfectly created!");
      await loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.slug.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.category.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const searchResults = search.trim() ? filteredCommunities.slice(0, 8) : [];
  const topCommunities = communities.slice(0, 10);
  const communityById = new Map(communities.map((c) => [c.id, c]));

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="section-header fade-in-up">
        <h1>Community Hub</h1>
        <p>
          Follow communities, track joined threads feed, and discover top spaces
          across every interest.
        </p>
      </section>

      <div className="portal-toolbar fade-in-up community-search-toolbar">
        <input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          onBlur={() => {
            setTimeout(() => setShowSearchResults(false), 120);
          }}
          style={{ width: "100%", maxWidth: "400px" }}
        />
        {showSearchResults && searchResults.length ? (
          <div
            className="section-block community-search-dropdown"
            onMouseDown={(e) => {
              // Keep focus from leaving the input before link click is processed.
              e.preventDefault();
            }}
          >
            {searchResults.map((community) => (
              <Link
                key={community.id}
                href={`/community/${community.slug}`}
                className="nav-link"
                onClick={() => setShowSearchResults(false)}
                style={{ display: "block", borderRadius: "10px" }}
              >
                <strong>{community.name}</strong>
                <small
                  style={{
                    display: "block",
                    marginTop: "0.15rem",
                    color: "var(--muted)",
                  }}
                >
                  {community.category} • {community.memberCount} members
                </small>
              </Link>
            ))}
          </div>
        ) : null}
        {!showCreate ? (
          <button
            type="button"
            className="action-button ghost"
            onClick={() => setShowCreate(true)}
          >
            Create Community
          </button>
        ) : null}
      </div>

      {info ? (
        <p
          className="success-text fade-in-up"
          style={{ color: "var(--brand)", marginBottom: "1rem" }}
        >
          {info}
        </p>
      ) : null}
      {error ? <p className="error-text fade-in-up">{error}</p> : null}

      {showCreate ? (
        <form
          className="feature-form auth-form-grid fade-in-up"
          onSubmit={createCommunity}
          style={{ marginBottom: "2rem" }}
        >
          <h2>Form a New Guild</h2>

          <label htmlFor="name">Community Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Elden Ring Fans"
          />

          <label htmlFor="slug">URL Slug (/community/slug)</label>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="elden-ring"
          />

          <label htmlFor="category">Category</label>
          <input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Gaming"
          />

          <label htmlFor="desc">Description</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            placeholder="What is this community about?"
          />

          <label htmlFor="icon-url">Community Logo URL</label>
          <input
            id="icon-url"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />

          <label htmlFor="banner-url">Community Cover URL</label>
          <input
            id="banner-url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />

          <div className="inline-actions">
            <button type="submit">Establish Community</button>
            <button
              type="button"
              className="action-button ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <section className="fade-in-up community-hub-grid">
        <div className="section-block portal-card list-panel">
          {!threads.length ? (
            <p className="meta-line">
              No threads yet from communities you joined/follow.
            </p>
          ) : (
            <ul className="community-feed-list">
              {threads.map((thread) => {
                const community = thread.communityId
                  ? communityById.get(thread.communityId)
                  : null;
                const threadHref = community
                  ? `/community/${community.slug}/${thread.slug}`
                  : `/community/thread/${thread.id}`;
                return (
                  <li key={thread.id} className="community-thread-card">
                    <div className="community-thread-topline">
                      <div className="community-thread-meta">
                        <div className="community-thread-identity">
                          {community?.iconUrl ? (
                            <img
                              src={community.iconUrl}
                              alt={`${community.name} logo`}
                              className="community-thread-guild-logo"
                            />
                          ) : (
                            <div className="community-thread-guild-logo community-thread-guild-logo-fallback">
                              {(community?.name || "G").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="community-thread-identity-text">
                            {community ? (
                              <Link
                                className="community-thread-community"
                                href={`/community/${community.slug}`}
                              >
                                {community.name}
                              </Link>
                            ) : (
                              <span className="community-thread-community">
                                General
                              </span>
                            )}
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
                                  shareThread(thread);
                                  setOpenThreadMenuId(null);
                                }}
                              >
                                Share
                              </button>
                              <button type="button">Report</button>
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
                        aria-label={`Upvote thread (${thread.stats.upvotes} upvotes)`}
                        onClick={() => toggleVote(thread, 1)}
                      >
                        <StatIcon kind="up" /> {thread.stats.upvotes}
                      </button>
                      <button
                        type="button"
                        className={`community-thread-stat ${thread.userVote === -1 ? "is-active" : ""}`}
                        aria-label={`Downvote thread (${thread.stats.downvotes} downvotes)`}
                        onClick={() => toggleVote(thread, -1)}
                      >
                        <StatIcon kind="down" /> {thread.stats.downvotes}
                      </button>
                      <span className="community-thread-stat">
                        <StatIcon kind="comment" /> {thread.stats.comments}
                      </span>
                      <button
                        type="button"
                        className={`community-thread-save ${thread.savedByMe ? "is-active" : ""}`}
                        aria-label={`Save thread (${thread.stats.saves} saves)`}
                        onClick={() => toggleSaveThread(thread)}
                      >
                        <StatIcon kind="save" /> {thread.stats.saves}
                      </button>
                      <button
                        type="button"
                        className="community-thread-share"
                        aria-label={`Share thread (${thread.stats.shares} shares)`}
                        onClick={() => shareThread(thread)}
                      >
                        <StatIcon kind="share" /> {thread.stats.shares}
                      </button>
                      <span className="community-thread-stat community-thread-views">
                        <StatIcon kind="view" /> {thread.stats.views}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="section-block portal-card community-top-sidebar">
          <h2 style={{ marginBottom: "0.75rem" }}>Top Communities</h2>
          <ul className="community-sidebar-list">
            {topCommunities.map((community) => (
              <li key={community.id} className="community-sidebar-item">
                <Link
                  href={`/community/${community.slug}`}
                  className="community-sidebar-link"
                >
                  <div className="community-sidebar-title-row">
                    {community.iconUrl ? (
                      <img
                        src={community.iconUrl}
                        alt={`${community.name} logo`}
                        className="community-sidebar-logo"
                      />
                    ) : (
                      <div className="community-sidebar-logo community-sidebar-logo-fallback">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <strong>{community.name}</strong>
                  </div>
                  <small className="community-sidebar-meta">
                    {community.category} • {community.memberCount} members
                  </small>
                  <p className="community-sidebar-description">
                    {community.description.length > 90
                      ? `${community.description.slice(0, 90)}...`
                      : community.description || "No description yet."}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
