"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";

type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  bannerUrl: string;
};

type Thread = {
  id: string;
  communityId: string;
  wikiReferenceId: string | null;
  title: string;
  body: string;
  imageUrls: string[];
  createdAt?: string;
};

export default function CommunitySlugPage() {
  const params = useParams<{ slug: string }>();

  const [community, setCommunity] = useState<Community | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);

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
      // Find the community by slug first
      const data = await apiRequest<{ communities: Community[] }>(
        "/api/communities",
      );
      const target = data.communities.find((c) => c.slug === params.slug);

      if (!target) {
        throw new Error("Community not found (404)");
      }
      setCommunity(target);

      // Fetch threads for this community ID
      const tData = await apiRequest<{ threads: Thread[] }>(
        `/api/community/threads?communityId=${target.id}`,
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
        `/api/community/threads?communityId=${community.id}`,
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

      <ul
        style={{
          display: "grid",
          gap: "1rem",
          listStyle: "none",
          paddingLeft: 0,
        }}
      >
        {threads.length ? (
          threads.map((thread) => (
            <li
              key={thread.id}
              className="wiki-meta-panel fade-in-up"
              style={{ gap: "0.5rem", padding: "1rem 1.5rem" }}
            >
              <h3>{thread.title}</h3>
              <span
                className="wiki-meta-subtitle"
                style={{ marginBottom: "0.5rem" }}
              >
                Posted •{" "}
                {(thread.createdAt || "").slice(0, 16).replace("T", " ")}
                {thread.wikiReferenceId ? ` (Wired from Wiki)` : ""}
              </span>
              <p>
                {thread.body.slice(0, 300)}
                {thread.body.length > 300 ? "..." : ""}
              </p>
              {thread.imageUrls?.length ? (
                <div className="community-attachment-grid">
                  {thread.imageUrls.slice(0, 3).map((url) => (
                    <img
                      key={`${thread.id}-${url}`}
                      src={url}
                      alt="Thread attachment preview"
                      className="community-attachment-thumb"
                    />
                  ))}
                </div>
              ) : null}
              <Link
                href={`/community/thread/${thread.id}`}
                className="workspace-link"
              >
                Open thread page
              </Link>
            </li>
          ))
        ) : (
          <li className="meta-line fade-in-up">
            This community feels empty. Be the first to post a thread!
          </li>
        )}
      </ul>
    </main>
  );
}
