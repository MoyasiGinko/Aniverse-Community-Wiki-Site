"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/src/lib/apiClient";
import ProgressiveImage from "@/src/components/ProgressiveImage";
import WikiComments from "../_components/WikiComments";
import WikiThreads from "../_components/WikiThreads";
import AnimeReferenceCard from "../_components/AnimeReferenceCard";
import {
  FiBookOpen,
  FiMessageSquare,
  FiImage,
  FiClock,
  FiShield,
  FiEdit3,
  FiTag,
  FiCheckCircle,
  FiArrowLeft,
  FiExternalLink,
  FiLayers,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import "@/src/styles/auth.css";

type Entry = {
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

type MainArticleTab = "content" | "discussions" | "media" | "revisions" | "governance";
type DiscussionSubTab = "comments" | "threads";
type RevisionSubTab = "log" | "diff";

export default function WikiEntryPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Level 1 Main Tabs
  const [mainTab, setMainTab] = useState<MainArticleTab>("content");

  // Level 2 Nested Tabs
  const [discussionTab, setDiscussionTab] = useState<DiscussionSubTab>("comments");
  const [discussionTreeExpanded, setDiscussionTreeExpanded] = useState(true);

  const [revisionTab, setRevisionTab] = useState<RevisionSubTab>("log");
  const [revisionTreeExpanded, setRevisionTreeExpanded] = useState(true);

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const entryData = await apiRequest<{ entry: Entry }>(`/api/wiki/${params.id}`);
      setEntry(entryData.entry);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntryData();
  }, [params.id]);

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Banner */}
      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>⚡ Article Detail View</span>
          </div>
          <h1 className="hero-banner-title">
            {entry?.title || "Wiki Article"}
          </h1>
          <p className="hero-banner-desc">
            {entry?.malAnimeTitle ? `Referenced Anime: ${entry.malAnimeTitle} · ` : ""}
            Read structured encyclopedia entries, participate in nested discussions, and track revision logs.
          </p>

          <div className="inline-actions" style={{ marginTop: "1rem" }}>
            <Link href="/wiki" className="action-button ghost">
              <FiArrowLeft style={{ marginRight: "6px" }} /> Back to Index
            </Link>
            {entry ? (
              <Link href={`/wiki/${entry.id}/edit`} className="action-button">
                <FiEdit3 style={{ marginRight: "6px" }} /> Edit Article
              </Link>
            ) : null}
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

      {loading ? (
        <section className="workspace-layout relative z-10">
          <div className="wiki-skeleton" style={{ minHeight: "400px" }} />
        </section>
      ) : error ? (
        <section className="settings-card error-block relative z-10">
          <h3>Failed to Load Entry</h3>
          <p className="settings-input-helper">{error}</p>
          <button type="button" className="action-button small" onClick={loadEntryData} style={{ marginTop: "0.75rem" }}>
            Retry Loading
          </button>
        </section>
      ) : entry ? (
        <section className="workspace-layout relative z-10">
          {/* Nested Navigation Sidebar */}
          <aside className="workspace-sidebar section-block">
            <h3>Article Navigation</h3>

            {/* Level 1: Article Content */}
            <button
              type="button"
              className={mainTab === "content" ? "workspace-link active" : "workspace-link"}
              onClick={() => setMainTab("content")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiBookOpen /> Article Content
              </span>
            </button>

            {/* Level 1: Discussions & Community (with Nested Level 2 tree) */}
            <button
              type="button"
              className={mainTab === "discussions" ? "workspace-link active" : "workspace-link"}
              onClick={() => {
                setMainTab("discussions");
                setDiscussionTreeExpanded((prev) => !prev);
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiMessageSquare /> Discussions & Feeds
              </span>
              <span className="workspace-chevron">
                {discussionTreeExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            </button>

            {discussionTreeExpanded ? (
              <div className="workspace-nested-links">
                <button
                  type="button"
                  className={
                    mainTab === "discussions" && discussionTab === "comments"
                      ? "workspace-link workspace-link-nested active"
                      : "workspace-link workspace-link-nested"
                  }
                  onClick={() => {
                    setMainTab("discussions");
                    setDiscussionTab("comments");
                  }}
                >
                  <FiMessageSquare style={{ marginRight: "4px" }} /> Comments
                </button>
                <button
                  type="button"
                  className={
                    mainTab === "discussions" && discussionTab === "threads"
                      ? "workspace-link workspace-link-nested active"
                      : "workspace-link workspace-link-nested"
                  }
                  onClick={() => {
                    setMainTab("discussions");
                    setDiscussionTab("threads");
                  }}
                >
                  <FiLayers style={{ marginRight: "4px" }} /> Linked Threads
                </button>
              </div>
            ) : null}

            {/* Level 1: Media & Gallery */}
            <button
              type="button"
              className={mainTab === "media" ? "workspace-link active" : "workspace-link"}
              onClick={() => setMainTab("media")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiImage /> Media & Attachments
              </span>
            </button>

            {/* Level 1: Revisions (with Nested Level 2 tree) */}
            <button
              type="button"
              className={mainTab === "revisions" ? "workspace-link active" : "workspace-link"}
              onClick={() => {
                setMainTab("revisions");
                setRevisionTreeExpanded((prev) => !prev);
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiClock /> Revisions & History
              </span>
              <span className="workspace-chevron">
                {revisionTreeExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            </button>

            {revisionTreeExpanded ? (
              <div className="workspace-nested-links">
                <button
                  type="button"
                  className={
                    mainTab === "revisions" && revisionTab === "log"
                      ? "workspace-link workspace-link-nested active"
                      : "workspace-link workspace-link-nested"
                  }
                  onClick={() => {
                    setMainTab("revisions");
                    setRevisionTab("log");
                  }}
                >
                  <FiClock style={{ marginRight: "4px" }} /> Audit Log
                </button>
                <button
                  type="button"
                  className={
                    mainTab === "revisions" && revisionTab === "diff"
                      ? "workspace-link workspace-link-nested active"
                      : "workspace-link workspace-link-nested"
                  }
                  onClick={() => {
                    setMainTab("revisions");
                    setRevisionTab("diff");
                  }}
                >
                  <FiEdit3 style={{ marginRight: "4px" }} /> Revision Diff
                </button>
              </div>
            ) : null}

            {/* Level 1: Governance */}
            <button
              type="button"
              className={mainTab === "governance" ? "workspace-link active" : "workspace-link"}
              onClick={() => setMainTab("governance")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiShield /> Governance & Metadata
              </span>
            </button>

            <h3 style={{ marginTop: "1rem" }}>Article Metadata</h3>
            <div className="security-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="security-kpi">
                <span>Status</span>
                <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#10b981" }}>
                  <FiCheckCircle /> {entry.status.toUpperCase()}
                </strong>
              </div>
              <div className="security-kpi">
                <span>Revision Token</span>
                <strong>v{entry.revision}</strong>
              </div>
              <div className="security-kpi">
                <span>Updated Date</span>
                <strong>{(entry.updatedAt || "").slice(0, 10) || "N/A"}</strong>
              </div>
            </div>

            {entry.tags?.length ? (
              <div style={{ marginTop: "1rem" }}>
                <h3>Article Tags</h3>
                <div className="badge-pill-list">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="badge-pill-item">
                      <FiTag style={{ marginRight: "4px" }} /> #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>

          {/* Main Content Area based on Nested Tabs */}
          <div className="workspace-content">
            {/* TAB 1: ARTICLE CONTENT */}
            {mainTab === "content" ? (
              <section className="settings-card">
                <div className="settings-header-block">
                  <div className="settings-header-info">
                    <h2>{entry.title}</h2>
                    <p>Published article body and documentation.</p>
                  </div>
                  <span className="auth-badge">
                    <FiCheckCircle style={{ marginRight: "4px", color: "#10b981" }} /> Published Entry
                  </span>
                </div>

                {entry.coverImageUrl ? (
                  <div style={{ width: "100%", maxHeight: "360px", borderRadius: "18px", overflow: "hidden", margin: "1rem 0" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.coverImageUrl} alt={entry.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : null}

                <article style={{ fontSize: "0.98rem", color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {entry.body}
                </article>
              </section>
            ) : null}

            {/* TAB 2: DISCUSSIONS (Nested Subtabs: Comments vs Threads) */}
            {mainTab === "discussions" ? (
              <section className="settings-card">
                <div className="settings-header-block">
                  <div className="settings-header-info">
                    <h2>Community Discussions & Comments</h2>
                    <p>Engage with other members on this article or read linked community threads.</p>
                  </div>
                </div>

                {/* Level 2 Subtab Switcher */}
                <div className="badge-pill-list mb-4">
                  <button
                    type="button"
                    className={discussionTab === "comments" ? "workspace-link-nested active" : "workspace-link-nested"}
                    onClick={() => setDiscussionTab("comments")}
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    <FiMessageSquare style={{ marginRight: "4px" }} /> Article Comments
                  </button>
                  <button
                    type="button"
                    className={discussionTab === "threads" ? "workspace-link-nested active" : "workspace-link-nested"}
                    onClick={() => setDiscussionTab("threads")}
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    <FiLayers style={{ marginRight: "4px" }} /> Linked Community Threads
                  </button>
                </div>

                {discussionTab === "comments" ? (
                  <WikiComments entryId={entry.id} />
                ) : (
                  <WikiThreads entryId={entry.id} />
                )}
              </section>
            ) : null}

            {/* TAB 3: MEDIA & ATTACHMENTS */}
            {mainTab === "media" ? (
              <section className="settings-card">
                <div className="settings-header-block">
                  <div className="settings-header-info">
                    <h2>Media Attachments & Image Gallery</h2>
                    <p>Visual assets and extra media attached to this article.</p>
                  </div>
                  <span className="auth-badge">
                    <FiImage style={{ marginRight: "4px" }} /> {(entry.extraImageUrls || []).length} Attachments
                  </span>
                </div>

                {entry.extraImageUrls?.length ? (
                  <div className="security-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", marginTop: "1rem" }}>
                    {entry.extraImageUrls.map((url) => (
                      <div key={url} style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border)", height: "160px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Wiki attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="settings-input-helper" style={{ marginTop: "1rem" }}>No media attachments uploaded for this article.</p>
                )}
              </section>
            ) : null}

            {/* TAB 4: REVISIONS & HISTORY */}
            {mainTab === "revisions" ? (
              <section className="settings-card">
                <div className="settings-header-block">
                  <div className="settings-header-info">
                    <h2>Revision History & Audit Log</h2>
                    <p>Track revision edits, version history, and update logs for version v{entry.revision}.</p>
                  </div>
                  <span className="auth-badge">
                    <FiClock style={{ marginRight: "4px" }} /> Revision v{entry.revision}
                  </span>
                </div>

                {revisionTab === "log" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                    <div className="session-item-row">
                      <div className="session-item-info">
                        <strong>Revision v{entry.revision} (Current Published Version)</strong>
                        <p>Updated on {(entry.updatedAt || "").slice(0, 10) || "N/A"}</p>
                      </div>
                      <span className="auth-badge" style={{ color: "#10b981" }}>Active</span>
                    </div>

                    {entry.revision > 1 ? (
                      <div className="session-item-row" style={{ opacity: 0.7 }}>
                        <div className="session-item-info">
                          <strong>Revision v{entry.revision - 1} (Previous Draft)</strong>
                          <p>Archived revision state</p>
                        </div>
                        <span className="settings-input-helper">Archived</span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div style={{ marginTop: "1rem" }}>
                    <p className="settings-input-helper">Comparing current revision v{entry.revision} against initial entry draft.</p>
                    <div className="bio-quote-box" style={{ marginTop: "0.75rem", fontFamily: "monospace" }}>
                      + Current Status: {entry.status}
                      <br />
                      + Total Chars: {entry.body.length}
                    </div>
                  </div>
                )}
              </section>
            ) : null}

            {/* TAB 5: GOVERNANCE & METADATA */}
            {mainTab === "governance" ? (
              <section className="settings-card">
                <div className="settings-header-block">
                  <div className="settings-header-info">
                    <h2>Article Governance & Anime Reference</h2>
                    <p>Referenced anime series data and editorial control options.</p>
                  </div>
                  <span className="auth-badge">
                    <FiShield style={{ marginRight: "4px" }} /> Editorial Controls
                  </span>
                </div>

                {entry.malAnimeId ? (
                  <div style={{ marginTop: "1rem" }}>
                    <AnimeReferenceCard malAnimeId={entry.malAnimeId} />
                  </div>
                ) : (
                  <p className="settings-input-helper" style={{ marginTop: "1rem" }}>No external anime series referenced for this article.</p>
                )}

                <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
                  <Link href={`/wiki/${entry.id}/edit`} className="action-button">
                    <FiEdit3 style={{ marginRight: "6px" }} /> Edit Article Data
                  </Link>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
