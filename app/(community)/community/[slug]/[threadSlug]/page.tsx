"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";
import ThreadRepliesPanel from "@/app/(community)/community/_components/ThreadRepliesPanel";

type Thread = {
  id: string;
  slug: string;
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

type Community = {
  id: string;
  slug: string;
  name: string;
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

export default function CommunityThreadSlugPage() {
  const params = useParams<{ slug: string; threadSlug: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [trendingThreads, setTrendingThreads] = useState<Thread[]>([]);
  const [communityById, setCommunityById] = useState<Map<string, Community>>(
    new Map(),
  );
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, trendingData, communitiesData] = await Promise.all([
          apiRequest<{ thread: Thread; community: Community }>(
            `/api/community/threads/by-slug?communitySlug=${params.slug}&threadSlug=${params.threadSlug}`,
          ),
          apiRequest<{ threads: Thread[] }>(
            "/api/community/threads?mode=trending&limit=10",
          ),
          apiRequest<{ communities: Community[] }>("/api/communities"),
        ]);
        setThread(data.thread);
        setCommunity(data.community);
        setTrendingThreads(
          trendingData.threads.filter((item) => item.id !== data.thread.id),
        );
        setCommunityById(
          new Map(
            communitiesData.communities.map((entry) => [entry.id, entry]),
          ),
        );
      } catch (err) {
        setError((err as Error).message);
      }
    };

    loadData();
  }, [params.slug, params.threadSlug]);

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

  const threadDate = (thread.createdAt || "").slice(0, 16).replace("T", " ");

  return (
    <main className="feature-page wiki-fandom-page">
      {error ? <p className="error-text">{error}</p> : null}
      <section className="community-hub-grid fade-in-up">
        <section
          className="wiki-meta-panel fade-in-up"
          style={{ padding: "1.25rem" }}
        >
          <header className="thread-detail-header">
            <h1>{thread.title}</h1>
            <p className="wiki-meta-subtitle thread-detail-meta">
              {community ? (
                <>
                  In{" "}
                  <Link
                    href={`/community/${community.slug}`}
                    className="workspace-link"
                  >
                    {community.name}
                  </Link>
                </>
              ) : (
                "Community thread"
              )}
              {" • "}
              {threadDate}
              {thread.author ? ` • by ${thread.author.username}` : ""}
            </p>
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
            <h3>Thread Metrics</h3>
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
              <span className="community-thread-stat">
                <StatIcon kind="comment" /> {thread.stats?.comments || 0}
              </span>
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
              <span className="community-thread-stat">
                <StatIcon kind="view" /> {thread.stats?.views || 0}
              </span>
            </div>
            {info ? <p className="meta-line">{info}</p> : null}
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
                      <p className="community-sidebar-description">
                        {item.body.length > 90
                          ? `${item.body.slice(0, 90)}...`
                          : item.body}
                      </p>
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
