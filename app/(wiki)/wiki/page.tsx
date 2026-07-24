"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import WikiBrowsingPanel from "./_components/WikiBrowsingPanel";
import WikiCreateForm from "./_components/WikiCreateForm";
import {
  FiBookOpen,
  FiStar,
  FiClock,
  FiPlus,
  FiTag,
  FiCheckCircle,
  FiEdit3,
  FiAlertCircle,
  FiExternalLink,
  FiGlobe,
} from "react-icons/fi";
import "@/src/styles/auth.css";

export type WikiEntry = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  status: string;
  malAnimeId?: number | null;
  malAnimeTitle?: string;
  coverImageUrl?: string;
  extraImageUrls?: string[];
  revision: number;
  updatedAt?: string;
};

type WikiTab = "index" | "featured" | "recent" | "create";

const palette = ["#204b57", "#4a2f6d", "#6a3f1f", "#234f34", "#3d3d7a", "#6a2f52"];

function colorFromTitle(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function WikiPage() {
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [tab, setTab] = useState<WikiTab>("index");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ entries: WikiEntry[] }>("/api/wiki");
      setEntries(data.entries || []);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusCounts = {
    total: entries.length,
    published: entries.filter((entry) => entry.status === "published").length,
    draft: entries.filter((entry) => entry.status === "draft").length,
    flagged: entries.filter((entry) => entry.status === "flagged").length,
  };

  const featuredArticle =
    entries.find((entry) => entry.status === "published") || entries[0] || null;
  const recentlyUpdated = [...entries]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 8);

  const trendingTags = Array.from(
    entries
      .flatMap((entry) => entry.tags || [])
      .reduce((acc, tag) => {
        const key = tag.toLowerCase();
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const renderRightPanel = () => {
    if (loading) {
      return (
        <div className="section-block list-panel fade-in-up">
          <div className="wiki-skeleton" style={{ minHeight: "500px" }} />
        </div>
      );
    }

    if (tab === "featured") {
      return (
        <section className="settings-card fade-in-up">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Featured Community Article</h2>
              <p>Editorially highlighted anime lore, character guides, or universe breakdown.</p>
            </div>
            <span className="auth-badge">
              <FiStar style={{ marginRight: "4px", color: "#f59e0b" }} /> Featured Choice
            </span>
          </div>

          {featuredArticle ? (
            <article className="wiki-featured-card" style={{ marginTop: "1rem" }}>
              <div
                className="wiki-feature-banner"
                style={{
                  background: colorFromTitle(featuredArticle.title),
                  width: "100%",
                  height: "200px",
                  borderRadius: "18px",
                  overflow: "hidden",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {featuredArticle.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredArticle.coverImageUrl}
                    alt={featuredArticle.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "3rem", fontWeight: 900, color: "#fff" }}>
                    {featuredArticle.title.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text)" }}>
                {featuredArticle.title}
              </h3>
              {featuredArticle.malAnimeTitle ? (
                <p className="settings-input-helper" style={{ margin: "0.25rem 0 0.75rem" }}>
                  Referenced Anime: <strong>{featuredArticle.malAnimeTitle}</strong>
                </p>
              ) : null}
              <p style={{ fontSize: "0.92rem", color: "var(--text)", lineHeight: 1.6 }}>
                {featuredArticle.body.slice(0, 460)}
                {featuredArticle.body.length > 460 ? "..." : ""}
              </p>

              <div className="badge-pill-list" style={{ marginTop: "1rem" }}>
                {(featuredArticle.tags || []).map((tag) => (
                  <span key={tag} className="badge-pill-item">
                    <FiTag style={{ marginRight: "4px" }} /> #{tag}
                  </span>
                ))}
              </div>

              <div className="inline-actions" style={{ marginTop: "1.25rem" }}>
                <Link href={`/wiki/${featuredArticle.id}`} className="action-button">
                  <FiBookOpen style={{ marginRight: "6px" }} /> Read Full Article
                </Link>
                <span className="settings-input-helper">
                  Status: <strong>{featuredArticle.status}</strong> | Revision: <strong>{featuredArticle.revision}</strong>
                </span>
              </div>
            </article>
          ) : (
            <p className="settings-input-helper">No articles available to feature yet.</p>
          )}
        </section>
      );
    }

    if (tab === "recent") {
      return (
        <section className="settings-card fade-in-up">
          <div className="settings-header-block">
            <div className="settings-header-info">
              <h2>Recently Updated Revisions</h2>
              <p>Latest articles modified across the Aniverse wiki database.</p>
            </div>
            <span className="auth-badge">
              <FiClock style={{ marginRight: "4px" }} /> Recent Activity
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            {recentlyUpdated.map((entry) => (
              <div key={entry.id} className="session-item-row" style={{ justifyContent: "space-between" }}>
                <div>
                  <Link
                    href={`/wiki/${entry.id}`}
                    style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text)", textDecoration: "none" }}
                  >
                    {entry.title}
                  </Link>
                  <p className="settings-input-helper" style={{ marginTop: "0.25rem" }}>
                    {entry.body.slice(0, 120)}...
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="auth-badge">rev {entry.revision}</span>
                  <Link href={`/wiki/${entry.id}`} className="action-button ghost small">
                    <FiExternalLink />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (tab === "create") {
      return <WikiCreateForm onCreated={load} />;
    }

    return <WikiBrowsingPanel entries={entries} />;
  };

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Workspace Banner */}
      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>⚡ Anime Encyclopedia & Knowledge Base</span>
          </div>
          <h1 className="hero-banner-title">
            Aniverse Community <span style={{ color: "var(--brand)" }}>Wiki</span>
          </h1>
          <p className="hero-banner-desc">
            Explore crowd-sourced anime lore, character archives, episode guides, and community knowledge articles.
          </p>

          <div className="inline-actions" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="action-button"
              onClick={() => setTab("create")}
            >
              <FiPlus style={{ marginRight: "6px" }} /> Create Wiki Article
            </button>
          </div>
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

      {/* Main Wiki Layout */}
      <section className="workspace-layout relative z-10">
        <aside className="workspace-sidebar section-block">
          <h3>Browse Wiki</h3>
          <button
            type="button"
            className={tab === "index" ? "workspace-link active" : "workspace-link"}
            onClick={() => setTab("index")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiBookOpen /> Article Index
            </span>
          </button>

          <button
            type="button"
            className={tab === "featured" ? "workspace-link active" : "workspace-link"}
            onClick={() => setTab("featured")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiStar /> Featured Article
            </span>
          </button>

          <button
            type="button"
            className={tab === "recent" ? "workspace-link active" : "workspace-link"}
            onClick={() => setTab("recent")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiClock /> Recent Updates
            </span>
          </button>

          <button
            type="button"
            className={tab === "create" ? "workspace-link active" : "workspace-link"}
            onClick={() => setTab("create")}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiPlus /> Create Article
            </span>
          </button>

          <h3>Database Metrics</h3>
          {loading ? (
            <div className="wiki-skeleton" style={{ height: "100px" }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div className="security-kpi">
                <span>Total Articles</span>
                <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FiBookOpen style={{ color: "var(--brand)" }} /> {statusCounts.total}
                </strong>
              </div>
              <div className="security-kpi">
                <span>Published</span>
                <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FiCheckCircle style={{ color: "#10b981" }} /> {statusCounts.published}
                </strong>
              </div>
              <div className="security-kpi">
                <span>Drafts</span>
                <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FiEdit3 style={{ color: "var(--brand)" }} /> {statusCounts.draft}
                </strong>
              </div>

              <h3 style={{ marginTop: "1rem" }}>Popular Tags</h3>
              <div className="badge-pill-list">
                {trendingTags.slice(0, 6).map(([tag]) => (
                  <span key={tag} className="badge-pill-item">
                    <FiTag style={{ marginRight: "4px" }} /> #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="workspace-content">
          {error && !loading ? (
            <div className="alert-error fade-in-up" style={{ marginBottom: "1rem" }}>
              <h3>✕ Oops, error loading wiki entries</h3>
              <p>{error}</p>
              <button type="button" className="action-button small" onClick={load} style={{ marginTop: "0.5rem" }}>
                Retry Loading
              </button>
            </div>
          ) : (
            renderRightPanel()
          )}
        </div>
      </section>
    </main>
  );
}
