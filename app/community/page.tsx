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
  memberCount: number;
  joined: boolean;
};

type Thread = {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  communityId: string | null;
};

export default function CommunitiesIndexPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [communitiesData, threadsData] = await Promise.all([
        apiRequest<{ communities: Community[] }>("/api/communities"),
        apiRequest<{ threads: Thread[] }>("/api/community/threads"),
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

  const createCommunity = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await apiRequest("/api/communities", {
        method: "POST",
        body: JSON.stringify({ slug, name, description, category }),
      });
      setSlug("");
      setName("");
      setDescription("");
      setCategory("");
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
          <div className="portal-toolbar" style={{ marginBottom: "0.85rem" }}>
            <h2>Threads From Joined/Following Communities</h2>
          </div>

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
                return (
                  <li key={thread.id} className="wiki-comment-row">
                    <div
                      className="inline-actions"
                      style={{ justifyContent: "space-between" }}
                    >
                      <strong>{thread.title}</strong>
                      {community ? (
                        <Link
                          className="workspace-link"
                          href={`/community/${community.slug}`}
                        >
                          {community.name}
                        </Link>
                      ) : null}
                    </div>
                    <p style={{ marginTop: "0.35rem" }}>
                      {thread.body.length > 180
                        ? `${thread.body.slice(0, 180)}...`
                        : thread.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="section-block portal-card community-top-sidebar">
          <h2 style={{ marginBottom: "0.75rem" }}>Top Communities</h2>
          <ul className="community-sidebar-list">
            {topCommunities.map((community, index) => (
              <li key={community.id} className="community-sidebar-item">
                <Link
                  href={`/community/${community.slug}`}
                  className="community-sidebar-link"
                >
                  <strong>
                    {index + 1}. {community.name}
                  </strong>
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
