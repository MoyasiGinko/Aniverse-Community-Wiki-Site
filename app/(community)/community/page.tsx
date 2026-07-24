"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import TrendingThreads from "@/src/components/TrendingThreads";
import {
  FiArrowUp,
  FiArrowDown,
  FiMessageSquare,
  FiBookmark,
  FiShare2,
  FiEye,
  FiPlus,
  FiSearch,
  FiUsers,
  FiTrendingUp,
  FiMoreVertical,
  FiCheckCircle,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiGlobe,
  FiImage,
  FiShield,
} from "react-icons/fi";
import "@/src/styles/auth.css";

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

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "Recently";
  const date = new Date(isoString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommunitiesIndexPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [openThreadMenuId, setOpenThreadMenuId] = useState<string | null>(null);

  // Multi-step Create Wizard state
  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState<number>(1);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Action & Shonen"]);
  const [category, setCategory] = useState("Action & Shonen");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [iconUrl, setIconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(catId)
        ? prev.filter((c) => c !== catId)
        : [...prev, catId];
      const joined = next.length ? next.join(", ") : "General";
      setCategory(joined);
      return next;
    });
  };

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [communitiesData, threadsData] = await Promise.all([
        apiRequest<{ communities: Community[] }>("/api/communities"),
        apiRequest<{ threads: Thread[] }>("/api/community/threads"),
      ]);
      setCommunities(communitiesData.communities || []);
      setThreads(threadsData.threads || []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinToggle = async (community: Community) => {
    try {
      await apiRequest(`/api/communities/${community.slug}/join`, {
        method: "POST",
      });
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id
            ? {
                ...c,
                joined: !c.joined,
                memberCount: c.joined ? c.memberCount - 1 : c.memberCount + 1,
              }
            : c,
        ),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCreateCommunity = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const payload = {
        slug: slug.trim().toLowerCase(),
        name,
        description,
        category,
        iconUrl,
        bannerUrl,
      };
      await apiRequest("/api/communities", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setInfo("Community established successfully!");
      setShowCreate(false);
      setSlug("");
      setName("");
      setDescription("");
      setCategory("");
      setIconUrl("");
      setBannerUrl("");
      loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleVote = async (thread: Thread, direction: 1 | -1) => {
    const nextVote = thread.userVote === direction ? 0 : direction;
    try {
      const res = await apiRequest<{
        stats: Thread["stats"];
        userVote: 1 | -1 | 0;
      }>(`/api/community/threads/${thread.id}/vote`, {
        method: "POST",
        body: JSON.stringify({ vote: nextVote }),
      });
      setThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id
            ? { ...t, stats: res.stats, userVote: res.userVote }
            : t,
        ),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleSaveThread = async (thread: Thread) => {
    try {
      const res = await apiRequest<{ saved: boolean; stats: Thread["stats"] }>(
        `/api/community/threads/${thread.id}/save`,
        { method: "POST" },
      );
      setThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id
            ? { ...t, savedByMe: res.saved, stats: res.stats }
            : t,
        ),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const shareThread = async (thread: Thread) => {
    const threadHref = thread.communityId
      ? `/community/${communityById.get(thread.communityId)?.slug}/${thread.slug}`
      : `/community/thread/${thread.id}`;
    const fullUrl = `${window.location.origin}${threadHref}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullUrl);
      setInfo("Thread URL copied to clipboard!");
    }

    try {
      const res = await apiRequest<{ shared: boolean; stats: Thread["stats"] }>(
        `/api/community/threads/${thread.id}/share`,
        { method: "POST" },
      );
      setThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id
            ? { ...t, sharedByMe: res.shared, stats: res.stats }
            : t,
        ),
      );
    } catch {
      // Ignore
    }
  };

  const communityById = new Map<string, Community>();
  communities.forEach((c) => communityById.set(c.id, c));

  const filteredCommunities = communities.filter((c) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  });

  const topCommunities = [...communities]
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 5);

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Workspace Banner */}
      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>⚡ Otaku Community Hub</span>
          </div>
          <h1 className="hero-banner-title">
            Explore Anime <span style={{ color: "var(--brand)" }}>Guilds & Feeds</span>
          </h1>
          <p className="hero-banner-desc">
            Engage in community discussions, share series theories, vote on top threads, and join specialized anime fan guilds.
          </p>

          <div className="inline-actions" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="action-button"
              onClick={() => setShowCreate((prev) => !prev)}
            >
              <FiPlus style={{ marginRight: "6px" }} /> Establish New Guild
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

      {info ? <div className="alert-success relative z-10" style={{ marginBottom: "1rem" }}>✓ {info}</div> : null}
      {error ? <div className="alert-error relative z-10" style={{ marginBottom: "1rem" }}>✕ {error}</div> : null}

      {/* Search & Filter Bar */}
      <section className="section-block relative z-10" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <input
              type="text"
              className="settings-input"
              placeholder="Search anime guilds, categories, or discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              style={{ paddingLeft: "2.5rem" }}
            />
            <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          </div>
        </div>

        {showSearchResults && search.trim() ? (
          <div className="settings-card" style={{ marginTop: "0.75rem", padding: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "0.5rem" }}>Guild Search Results</h3>
            {filteredCommunities.length ? (
              <div className="security-grid">
                {filteredCommunities.map((community) => (
                  <Link key={community.id} href={`/community/${community.slug}`} className="community-item-card">
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <FiUsers style={{ color: "var(--brand)" }} /> {community.name}
                    </span>
                    <span className="settings-input-helper">{community.memberCount} members</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="settings-input-helper">No communities matching &quot;{search}&quot;</p>
            )}
          </div>
        ) : null}
      </section>

      {/* Creation 5-Step Wizard Modal Form */}
      {showCreate ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.68)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="settings-card fade-in-up"
            style={{
              width: "100%",
              maxWidth: "640px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
              padding: "1.75rem",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--border)",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 900,
                    color: "var(--text)",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiPlus style={{ color: "var(--brand)" }} /> Establish Anime Guild
                </h2>
                <p className="settings-input-helper" style={{ margin: "0.25rem 0 0" }}>
                  Step {createStep} of 5 · Customize your anime community space
                </p>
              </div>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => {
                  setShowCreate(false);
                  setCreateStep(1);
                }}
                style={{ padding: "0.4rem", borderRadius: "50%", minWidth: "32px" }}
              >
                <FiX />
              </button>
            </div>

            {/* Progress Bar Header */}
            <div style={{ width: "100%", height: "6px", background: "var(--border)", borderRadius: "10px", marginBottom: "1.5rem", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(createStep / 5) * 100}%`,
                  background: "linear-gradient(90deg, var(--brand), #f97316)",
                  borderRadius: "10px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <form onSubmit={handleCreateCommunity} className="settings-form-grid">
              {/* STEP 1: CATEGORY SELECTION */}
              {createStep === 1 ? (
                <div className="fade-in-up">
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    1. Choose Guild Category
                  </h3>
                  <p className="settings-input-helper" style={{ marginBottom: "1rem" }}>
                    Select the primary anime genre or lore topic for your guild.
                  </p>

                  <div className="security-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
                    {[
                      { id: "Action & Shonen", label: "⚔️ Action & Shonen" },
                      { id: "Fantasy & Magic", label: "🔮 Fantasy & Magic" },
                      { id: "Slice of Life & Romance", label: "🌸 Romance & Drama" },
                      { id: "Lore & Theories", label: "🧠 Lore & Theories" },
                      { id: "Mecha & Sci-Fi", label: "🤖 Mecha & Sci-Fi" },
                      { id: "Isekai & Reincarnation", label: "🌀 Isekai & Reincarnation" },
                      { id: "Supernatural & Horror", label: "👻 Supernatural & Horror" },
                      { id: "Sports & Competition", label: "⚽ Sports & Competition" },
                      { id: "Mystery & Psychological", label: "🕵️ Mystery & Psychological" },
                      { id: "Music & Idol", label: "🎵 Music & Idol" },
                      { id: "Gaming & Esports", label: "🎮 Gaming & Esports" },
                      { id: "Historical & Samurai", label: "⏳ Historical & Samurai" },
                      { id: "Comedy & Parody", label: "😂 Comedy & Parody" },
                      { id: "Manga & Light Novels", label: "🎨 Manga & Light Novels" },
                    ].map((item) => {
                      const isSelected = selectedCategories.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleCategory(item.id)}
                          style={{
                            padding: "0.85rem",
                            borderRadius: "14px",
                            border: isSelected ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                            background: isSelected ? "rgba(240, 106, 17, 0.12)" : "color-mix(in srgb, var(--surface) 92%, var(--surface-soft))",
                            color: isSelected ? "var(--brand)" : "var(--text)",
                            fontWeight: 700,
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{item.label}</span>
                          {isSelected ? <FiCheckCircle style={{ color: "var(--brand)", fontSize: "1.1rem" }} /> : null}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <label className="settings-label">Or Custom Category</label>
                    <input
                      className="settings-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Isekai, Cyberpunk, Music..."
                      required
                    />
                  </div>
                </div>
              ) : null}

              {/* STEP 2: NAME & URL SLUG */}
              {createStep === 2 ? (
                <div className="fade-in-up">
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    2. Guild Name & URL Slug
                  </h3>
                  <p className="settings-input-helper" style={{ marginBottom: "1rem" }}>
                    Give your community a memorable name and custom URL address.
                  </p>

                  <div className="settings-field-group" style={{ marginBottom: "1rem" }}>
                    <label className="settings-label">Guild Name</label>
                    <input
                      className="settings-input"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!slug) {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                        }
                      }}
                      placeholder="e.g. Shingeki No Kyojin Fans"
                      required
                    />
                  </div>

                  <div className="settings-field-group">
                    <label className="settings-label">URL Slug</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="settings-input-helper" style={{ fontSize: "0.85rem", fontWeight: 700 }}>/community/</span>
                      <input
                        className="settings-input"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="attack-on-titan"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* STEP 3: PRIVACY & ACCESS */}
              {createStep === 3 ? (
                <div className="fade-in-up">
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    3. Privacy & Access Settings
                  </h3>
                  <p className="settings-input-helper" style={{ marginBottom: "1rem" }}>
                    Choose who can join and view discussions in this guild.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    <button
                      type="button"
                      onClick={() => setPrivacy("public")}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem",
                        borderRadius: "16px",
                        border: privacy === "public" ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                        background: privacy === "public" ? "rgba(240, 106, 17, 0.12)" : "color-mix(in srgb, var(--surface) 92%, var(--surface-soft))",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <FiGlobe style={{ fontSize: "1.3rem", color: "var(--brand)", marginTop: "2px" }} />
                      <div>
                        <strong style={{ fontSize: "0.98rem", color: "var(--text)", display: "block" }}>Public Guild</strong>
                        <p className="settings-input-helper" style={{ margin: "0.2rem 0 0" }}>Anyone on Aniverse can view threads, join the community, and participate.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrivacy("private")}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem",
                        borderRadius: "16px",
                        border: privacy === "private" ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                        background: privacy === "private" ? "rgba(240, 106, 17, 0.12)" : "color-mix(in srgb, var(--surface) 92%, var(--surface-soft))",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <FiLock style={{ fontSize: "1.3rem", color: "var(--brand)", marginTop: "2px" }} />
                      <div>
                        <strong style={{ fontSize: "0.98rem", color: "var(--text)", display: "block" }}>Private Guild</strong>
                        <p className="settings-input-helper" style={{ margin: "0.2rem 0 0" }}>Only approved members can view topics or submit discussion threads.</p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* STEP 4: DESCRIPTION & BIO */}
              {createStep === 4 ? (
                <div className="fade-in-up">
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    4. Guild Purpose & Description
                  </h3>
                  <p className="settings-input-helper" style={{ marginBottom: "1rem" }}>
                    Describe what members can expect in this anime community.
                  </p>

                  <div className="settings-field-group">
                    <label className="settings-label">Guild Description</label>
                    <textarea
                      className="settings-textarea"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Welcome to our anime guild! We discuss episode breakdowns, manga theories, and character lore..."
                      required
                    />
                  </div>
                </div>
              ) : null}

              {/* STEP 5: BRANDING & PREVIEW */}
              {createStep === 5 ? (
                <div className="fade-in-up">
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    5. Guild Branding & Media
                  </h3>
                  <p className="settings-input-helper" style={{ marginBottom: "1rem" }}>
                    Add a custom logo and banner header image.
                  </p>

                  <div className="settings-field-row" style={{ marginBottom: "1rem" }}>
                    <div className="settings-field-group">
                      <label className="settings-label">Logo Image URL</label>
                      <input
                        className="settings-input"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="settings-field-group">
                      <label className="settings-label">Banner Image URL</label>
                      <input
                        className="settings-input"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="https://example.com/banner.png"
                      />
                    </div>
                  </div>

                  {/* Live Guild Badge Card Preview */}
                  <div className="bio-quote-box" style={{ marginTop: "1rem" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--brand)" }}>Live Guild Card Preview:</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                      {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={iconUrl} alt="Logo preview" style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                          {(name || "G").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text)" }}>{name || "Guild Name"}</h4>
                        <p className="settings-input-helper" style={{ margin: "0.1rem 0 0" }}>{category} · {privacy} access</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Wizard Step Navigation Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <button
                  type="button"
                  className="action-button ghost"
                  disabled={createStep === 1}
                  onClick={() => setCreateStep((prev) => Math.max(1, prev - 1))}
                >
                  <FiArrowLeft style={{ marginRight: "4px" }} /> Back
                </button>

                {createStep < 5 ? (
                  <button
                    type="button"
                    className="action-button"
                    disabled={createStep === 2 && (!name.trim() || !slug.trim())}
                    onClick={() => setCreateStep((prev) => Math.min(5, prev + 1))}
                  >
                    Next Step <FiArrowRight style={{ marginLeft: "4px" }} />
                  </button>
                ) : (
                  <button type="submit" className="action-button">
                    <FiCheckCircle style={{ marginRight: "6px" }} /> Establish Anime Guild
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Main Community Hub Grid */}
      <section className="workspace-layout relative z-10">
        <div className="workspace-content">
          {!threads.length ? (
            <div className="settings-card">
              <p className="settings-input-helper">No community threads published yet. Be the first to start a conversation!</p>
            </div>
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
                            // eslint-disable-next-line @next/next/no-img-element
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
                                General Discussion
                              </span>
                            )}
                            <span className="community-thread-author-name">
                              by @{thread.author?.username || "member"}
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
                            <FiMoreVertical />
                          </button>
                          {openThreadMenuId === thread.id ? (
                            <div className="community-thread-menu-dropdown">
                              <Link href={threadHref}>Open Thread</Link>
                              <button
                                type="button"
                                onClick={() => {
                                  shareThread(thread);
                                  setOpenThreadMenuId(null);
                                }}
                              >
                                Share Link
                              </button>
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={`${thread.id}-${url}`}
                            src={url}
                            alt="Thread attachment preview"
                            className="community-thread-preview-image"
                          />
                        ))}
                      </div>
                    ) : null}

                    {/* Stats Action Row */}
                    <div className="community-thread-stats-row">
                      <button
                        type="button"
                        className={`community-thread-stat ${thread.userVote === 1 ? "is-active" : ""}`}
                        onClick={() => toggleVote(thread, 1)}
                      >
                        <FiArrowUp /> {thread.stats.upvotes}
                      </button>

                      <button
                        type="button"
                        className={`community-thread-stat ${thread.userVote === -1 ? "is-active" : ""}`}
                        onClick={() => toggleVote(thread, -1)}
                      >
                        <FiArrowDown /> {thread.stats.downvotes}
                      </button>

                      <span className="community-thread-stat">
                        <FiMessageSquare /> {thread.stats.comments}
                      </span>

                      <button
                        type="button"
                        className={`community-thread-save ${thread.savedByMe ? "is-active" : ""}`}
                        onClick={() => toggleSaveThread(thread)}
                      >
                        <FiBookmark /> {thread.stats.saves}
                      </button>

                      <button
                        type="button"
                        className="community-thread-share"
                        onClick={() => shareThread(thread)}
                      >
                        <FiShare2 /> {thread.stats.shares}
                      </button>

                      <span className="community-thread-stat community-thread-views">
                        <FiEye /> {thread.stats.views}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Top Guilds Sidebar */}
        <aside className="workspace-sidebar section-block">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FiTrendingUp style={{ color: "var(--brand)" }} /> Top Anime Guilds
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
            {topCommunities.map((community) => (
              <div key={community.id} className="session-item-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link href={`/community/${community.slug}`} style={{ textDecoration: "none", fontWeight: 800, color: "var(--text)" }}>
                    {community.name}
                  </Link>
                  <button
                    type="button"
                    className="action-button ghost small"
                    onClick={() => handleJoinToggle(community)}
                  >
                    {community.joined ? "Joined" : "Join"}
                  </button>
                </div>
                <p className="settings-input-helper">{community.description.slice(0, 80)}...</p>
                <small className="settings-input-helper">{community.memberCount} members · {community.category}</small>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <TrendingThreads />
          </div>
        </aside>
      </section>
    </main>
  );
}
