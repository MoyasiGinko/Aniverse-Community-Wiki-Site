"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";
import { useAuth } from "@/src/context/AuthContext";

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
  title: string;
  body: string;
  createdAt: string;
};

type CommentRecord = {
  id: string;
  threadId: string;
  body: string;
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

type Panel = "overview" | "stats" | "activity" | "watchlist" | "account";

export default function DashboardPage() {
  const router = useRouter();
  const { user, refreshUser, loading } = useAuth();
  const [panel, setPanel] = useState<Panel>("overview");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [threads, setThreads] = useState<ThreadRecord[]>([]);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [wiki, setWiki] = useState<WikiRecord[]>([]);
  const [savedThreads, setSavedThreads] = useState<SavedThreadRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const me = await refreshUser();
      if (!me) {
        router.push("/auth");
        return;
      }

      try {
        const [list, statsPayload, activityPayload] = await Promise.all([
          apiRequest<{ items: WatchlistItem[] }>("/api/watchlist"),
          apiRequest<{ stats: StatsPayload }>("/api/stats"),
          apiRequest<{
            activity: {
              threads: ThreadRecord[];
              comments: CommentRecord[];
              wiki: WikiRecord[];
              savedThreads: SavedThreadRecord[];
            };
          }>("/api/community/my-activity"),
        ]);

        setWatchlist(list.items);
        setStats(statsPayload.stats);
        setThreads(activityPayload.activity.threads);
        setComments(activityPayload.activity.comments);
        setWiki(activityPayload.activity.wiki);
        setSavedThreads(activityPayload.activity.savedThreads || []);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    load();
  }, [router, refreshUser]);

  if (loading && !user) {
    return (
      <main className="feature-page">
        <p>Loading your dashboard...</p>
      </main>
    );
  }

  const renderPanel = () => {
    if (panel === "overview") {
      return (
        <section className="section-block dashboard-card">
          <h2>Overview</h2>
          <p>One place for your platform footprint and account intelligence.</p>
          <ul className="metric-list">
            <li>
              <strong>{watchlist.length}</strong>
              <span> Watchlist Items</span>
            </li>
            <li>
              <strong>{stats?.threadCount || 0}</strong>
              <span> Community Threads</span>
            </li>
            <li>
              <strong>{stats?.commentCount || 0}</strong>
              <span> Community Comments</span>
            </li>
            <li>
              <strong>{stats?.wikiCount || 0}</strong>
              <span> Wiki Contributions</span>
            </li>
          </ul>
          <div className="inline-actions">
            <Link href="/profile" className="action-button">
              Open Profile
            </Link>
            <Link href="/settings" className="action-button ghost">
              Open Settings
            </Link>
          </div>
        </section>
      );
    }

    if (panel === "stats") {
      return (
        <section className="section-block dashboard-card">
          <h2>Personal Stats</h2>
          <div className="stats-grid">
            <div>
              <span>Watchlist</span>
              <strong>{stats?.watchlistCount || 0}</strong>
            </div>
            <div>
              <span>Threads</span>
              <strong>{stats?.threadCount || 0}</strong>
            </div>
            <div>
              <span>Comments</span>
              <strong>{stats?.commentCount || 0}</strong>
            </div>
            <div>
              <span>Wiki Entries</span>
              <strong>{stats?.wikiCount || 0}</strong>
            </div>
            <div>
              <span>Badges</span>
              <strong>{stats?.badges.length || 0}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{user?.role}</strong>
            </div>
          </div>
          <div className="pill-list">
            {(stats?.badges || []).map((badge) => (
              <span className="badge-pill" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </section>
      );
    }

    if (panel === "activity") {
      return (
        <section className="section-block dashboard-card list-panel">
          <h2>Community Activity</h2>
          <h3>Threads</h3>
          {threads.length ? (
            <ul>
              {threads.slice(0, 8).map((thread) => (
                <li key={thread.id}>
                  <strong>{thread.title}</strong>
                  <p>{thread.body.slice(0, 140)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No threads created yet.</p>
          )}
          <h3>Comments</h3>
          {comments.length ? (
            <ul>
              {comments.slice(0, 8).map((comment) => (
                <li key={comment.id}>{comment.body}</li>
              ))}
            </ul>
          ) : (
            <p>No comments posted yet.</p>
          )}
          <h3>Wiki Contributions</h3>
          {wiki.length ? (
            <ul>
              {wiki.slice(0, 8).map((entry) => (
                <li key={entry.id}>
                  {entry.title} ({entry.status})
                </li>
              ))}
            </ul>
          ) : (
            <p>No wiki entries yet.</p>
          )}
          <h3>Saved Threads</h3>
          {savedThreads.length ? (
            <ul>
              {savedThreads.slice(0, 8).map((thread) => (
                <li key={thread.id}>
                  <Link
                    href={
                      thread.communitySlug
                        ? `/community/${thread.communitySlug}/${thread.slug}`
                        : `/community/thread/${thread.id}`
                    }
                  >
                    {thread.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No saved threads yet.</p>
          )}
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
      <section className="section-block dashboard-card">
        <h2>Account Center</h2>
        <p>
          <strong>{user?.username}</strong>
        </p>
        <p>{user?.email}</p>
        <p>Provider: {user?.provider}</p>
        <p>Role: {user?.role}</p>
        <div className="inline-actions">
          <Link href="/profile" className="action-button">
            Profile
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
          Welcome back, {user?.username || "Member"}. Everything about your
          account and community impact lives here.
        </p>
      </section>

      <section className="workspace-layout">
        <aside className="workspace-sidebar section-block">
          <h3>Sections</h3>
          <button
            type="button"
            className={
              panel === "overview" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => setPanel("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={
              panel === "stats" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => setPanel("stats")}
          >
            Stats
          </button>
          <button
            type="button"
            className={
              panel === "activity" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => setPanel("activity")}
          >
            Community Activity
          </button>
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
              panel === "account" ? "workspace-link active" : "workspace-link"
            }
            onClick={() => setPanel("account")}
          >
            Account
          </button>
        </aside>

        <div className="workspace-content">{renderPanel()}</div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
