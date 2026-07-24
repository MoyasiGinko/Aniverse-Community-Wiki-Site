"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiMusic,
  FiSearch,
  FiStar,
  FiBookmark,
  FiExternalLink,
  FiX,
  FiFilter,
  FiGlobe,
  FiTrendingUp,
  FiZap,
  FiPlayCircle,
} from "react-icons/fi";
import "@/src/styles/auth.css";

type MusicItem = {
  id: string;
  title: string;
  artist: string;
  album: string;
  synopsis: string;
  subCategory: string;
  rank?: number;
  imageUrl: string;
  externalUrl?: string;
  source: string;
  isBillboard?: boolean;
};

const MUSIC_SUB_CATEGORIES = [
  "All Musics",
  "Billboard Hot 100",
  "Global Top Charts",
  "J-Pop & K-Pop",
  "Anime OSTs",
];

const SEED_MUSICS: MusicItem[] = [
  {
    id: "music-seed-1",
    title: "Global Pop Smash Single: Hot 100 Leader",
    artist: "Global Chart Leader",
    album: "Billboard World Tour Edition",
    synopsis: "Official #1 single on the Billboard Hot 100 and Spotify Global Top 50 charts this week.",
    subCategory: "Billboard Hot 100",
    rank: 1,
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.billboard.com/charts/hot-100/",
    source: "Billboard Hot 100 Official",
    isBillboard: true,
  },
  {
    id: "music-seed-2",
    title: "Idol's Echo (Chainsaw Man Theme)",
    artist: "YOASOBI",
    album: "THE BOOK III",
    synopsis: "YOASOBI's global hit single featuring high-tempo J-Pop synthesizer arrangements and anime opening visuals.",
    subCategory: "J-Pop & K-Pop",
    rank: 2,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.yoasobi-music.jp",
    source: "Sony Music Japan",
  },
  {
    id: "music-seed-3",
    title: "KICK BACK (Live at Tokyo Dome)",
    artist: "Kenshi Yonezu",
    album: "LOST CORNER",
    synopsis: "Explosive live arena recording of Chainsaw Man's legendary opening anthem at Tokyo Dome.",
    subCategory: "Anime OSTs",
    rank: 3,
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://reissuerecords.net",
    source: "Reissue Records",
  },
];

export default function MusicsPage() {
  const [musicsList, setMusicsList] = useState<MusicItem[]>(SEED_MUSICS);
  const [activeSub, setActiveSub] = useState("All Musics");
  const [search, setSearch] = useState("");
  const [feedFilter, setFeedFilter] = useState<"all" | "billboard" | "jpop">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);

  useEffect(() => {
    const fetchMusicFeeds = async () => {
      try {
        const [billboardRes, jpopRes] = await Promise.allSettled([
          fetch("https://itunes.apple.com/us/rss/topsongs/limit=20/json"),
          fetch("https://itunes.apple.com/search?term=anime+ost&entity=song&limit=15"),
        ]);

        const fetched: MusicItem[] = [];

        if (billboardRes.status === "fulfilled" && billboardRes.value.ok) {
          const data = await billboardRes.value.json();
          const entries = data?.feed?.entry || [];
          entries.forEach((song: any, idx: number) => {
            const title = song["im:name"]?.label || "Billboard Hit";
            const artist = song["im:artist"]?.label || "Global Artist";
            const img = song["im:image"]?.[2]?.label || SEED_MUSICS[0].imageUrl;
            fetched.push({
              id: `billboard-page-${idx}`,
              title: title,
              artist: artist,
              album: song["im:collection"]?.["im:name"]?.label || "Billboard Hot 100 Single",
              synopsis: `"#1 Billboard Single: "${title}" by ${artist} leads global streaming charts."`,
              subCategory: "Billboard Hot 100",
              rank: idx + 1,
              imageUrl: img,
              externalUrl: song.link?.[0]?.attributes?.href || "https://www.billboard.com/charts/hot-100/",
              source: "Billboard Hot 100 RSS",
              isBillboard: true,
            });
          });
        }

        if (jpopRes.status === "fulfilled" && jpopRes.value.ok) {
          const jpopData = await jpopRes.value.json();
          if (jpopData.results && Array.isArray(jpopData.results)) {
            jpopData.results.forEach((song: any, idx: number) => {
              fetched.push({
                id: `itunes-page-${song.trackId}`,
                title: song.trackName,
                artist: song.artistName,
                album: song.collectionName || "Single Release",
                synopsis: `Official music track "${song.trackName}" by ${song.artistName} available across streaming platforms.`,
                subCategory: "Anime OSTs",
                rank: idx + 15,
                imageUrl: song.artworkUrl100 ? song.artworkUrl100.replace("100x100bb", "600x600bb") : SEED_MUSICS[1].imageUrl,
                externalUrl: song.trackViewUrl,
                source: "iTunes Music API",
              });
            });
          }
        }

        if (fetched.length) {
          setMusicsList((prev) => {
            const existing = new Set(prev.map((m) => m.id));
            const unique = fetched.filter((f) => !existing.has(f.id));
            return [...prev, ...unique];
          });
        }
      } catch {
        // Fallback
      }
    };

    fetchMusicFeeds();
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  let filtered = musicsList.filter((item) => {
    const passesSub =
      activeSub.startsWith("All") ||
      item.subCategory.toLowerCase() === activeSub.toLowerCase();
    const passesSearch =
      item.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.artist.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.album.toLowerCase().includes(search.trim().toLowerCase());
    return passesSub && passesSearch;
  });

  if (feedFilter === "billboard") {
    filtered = filtered.filter((i) => i.isBillboard || i.subCategory === "Billboard Hot 100");
  } else if (feedFilter === "jpop") {
    filtered = filtered.filter((i) => i.subCategory.includes("J-Pop") || i.subCategory.includes("Anime"));
  }

  const topTrending = musicsList.slice(0, 5);

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Workspace Banner */}
      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>🎵 Billboard Hot 100 & Global Music Hub</span>
          </div>
          <h1 className="hero-banner-title">
            Aniverse <span style={{ color: "var(--brand)" }}>Musics Portal</span>
          </h1>
          <p className="hero-banner-desc">
            Listen to global Billboard Hot 100 chart leaders, J-Pop/K-Pop releases, and iconic Anime OSTs powered by Billboard & iTunes RSS APIs.
          </p>
        </div>
        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Musics Portal Assistant"
            className="hero-banner-mascot-img"
          />
        </div>
      </section>

      {/* 2-COLUMN PORTAL LAYOUT */}
      <section className="workspace-layout relative z-10">
        {/* LEFT COLUMN: Sub-Category Sidebar */}
        <aside className="workspace-sidebar section-block">
          <h3>
            <FiFilter style={{ color: "var(--brand)" }} /> Music Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
            {MUSIC_SUB_CATEGORIES.map((sub) => (
              <button
                key={sub}
                type="button"
                className={activeSub === sub ? "workspace-link active" : "workspace-link"}
                onClick={() => setActiveSub(sub)}
              >
                <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{sub}</span>
              </button>
            ))}
          </div>

          <div className="security-banner" style={{ marginTop: "1.5rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand)" }}>
              <FiGlobe style={{ marginRight: "4px" }} /> Open Music Feeds:
            </span>
            <p className="settings-input-helper" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
              Billboard Hot 100 & iTunes Global Store.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="workspace-content">
          {/* AI Hot Filter Bar */}
          <div className="settings-card" style={{ marginBottom: "1rem", padding: "0.85rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <span className="auth-badge" style={{ fontSize: "0.78rem" }}>
                <FiZap style={{ marginRight: "4px" }} /> AI Music Curator
              </span>
              <div className="badge-pill-list" style={{ gap: "0.5rem", margin: 0 }}>
                <button
                  type="button"
                  className={feedFilter === "all" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("all")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  All Music Tracks
                </button>
                <button
                  type="button"
                  className={feedFilter === "billboard" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("billboard")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  🔥 Billboard Hot 100
                </button>
                <button
                  type="button"
                  className={feedFilter === "jpop" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("jpop")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  🌸 J-Pop & Anime OSTs
                </button>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <div className="settings-field-group" style={{ position: "relative" }}>
              <input
                className="settings-input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder={`Search tracks, artists, or albums under ${activeSub}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
          </div>

          {/* Top 5 Trending Bar */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiTrendingUp style={{ color: "var(--brand)" }} /> Top 5 Billboard & Global Chart Singles
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {topTrending.map((item, idx) => (
                <div
                  key={item.id}
                  className="session-item-row"
                  style={{ gap: "0.6rem", alignItems: "center", cursor: "pointer", padding: "0.6rem 0.8rem", borderRadius: "12px", background: "var(--surface-soft)" }}
                  onClick={() => setSelectedMusic(item)}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--brand)", minWidth: "24px" }}>
                    #{item.rank || idx + 1}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <strong style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.2, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </strong>
                    <span className="settings-input-helper" style={{ fontSize: "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                      By {item.artist} · Album: {item.album}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Header Count */}
          <div className="settings-header-block" style={{ marginBottom: "1rem" }}>
            <div className="settings-header-info">
              <h2>{activeSub} ({filtered.length})</h2>
              <p>Click any song for track overview, album art, and streaming purchase links.</p>
            </div>
          </div>

          {/* Grid of Music Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
            {filtered.map((music) => (
              <article
                key={music.id}
                className="settings-card fade-in-up"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  padding: "1.1rem",
                  borderRadius: "18px",
                }}
                onClick={() => setSelectedMusic(music)}
              >
                <div>
                  <div
                    style={{
                      width: "100%",
                      height: "175px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      marginBottom: "1rem",
                      position: "relative",
                      background: "var(--surface-soft)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={music.imageUrl}
                      alt={music.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "0.6rem",
                        left: "0.6rem",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "0.3rem 0.65rem",
                        borderRadius: "8px",
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(12px)",
                        color: "var(--brand)",
                        border: "1px solid rgba(240, 106, 17, 0.3)",
                        zIndex: 2,
                      }}
                    >
                      {music.subCategory}
                    </span>
                    {music.rank ? (
                      <span
                        style={{
                          position: "absolute",
                          top: "0.6rem",
                          right: "0.6rem",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "0.25rem 0.55rem",
                          borderRadius: "8px",
                          background: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(10px)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251, 191, 36, 0.3)",
                          zIndex: 2,
                        }}
                      >
                        #{music.rank} Chart
                      </span>
                    ) : null}
                  </div>

                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      lineHeight: 1.35,
                      marginBottom: "0.3rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.7em",
                    }}
                  >
                    {music.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      color: "var(--brand)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {music.artist}
                  </p>

                  <p
                    className="settings-input-helper"
                    style={{
                      lineHeight: 1.45,
                      marginBottom: "1rem",
                      fontSize: "0.84rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.6em",
                    }}
                  >
                    {music.synopsis}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border)",
                      marginTop: "0.5rem",
                    }}
                  >
                    <span className="settings-input-helper" style={{ fontSize: "0.78rem" }}>
                      <FiMusic style={{ marginRight: "3px" }} /> {music.album.slice(0, 18)}...
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="action-button ghost small"
                        onClick={(e) => toggleBookmark(music.id, e)}
                        style={{ padding: "0.4rem 0.6rem" }}
                      >
                        <FiBookmark style={{ color: bookmarkedIds.includes(music.id) ? "var(--brand)" : "inherit" }} />
                      </button>
                      <button type="button" className="action-button small" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>
                        Track Info
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!filtered.length ? (
            <div className="settings-card">
              <p className="settings-input-helper">No music tracks found matching &quot;{search}&quot;.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Modal Inspector */}
      {selectedMusic ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(14px)",
          }}
          onClick={() => setSelectedMusic(null)}
        >
          <div
            className="settings-card fade-in-up"
            style={{
              width: "100%",
              maxWidth: "680px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "2rem",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span className="auth-badge">
                <FiPlayCircle style={{ marginRight: "4px" }} /> {selectedMusic.subCategory} Single
              </span>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setSelectedMusic(null)}
                style={{ borderRadius: "50%", padding: "0.4rem" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ width: "100%", height: "250px", borderRadius: "18px", overflow: "hidden", marginBottom: "1.25rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedMusic.imageUrl} alt={selectedMusic.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.25rem" }}>
              {selectedMusic.title}
            </h1>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand)", marginBottom: "0.75rem" }}>
              Artist: {selectedMusic.artist}
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span className="settings-input-helper">Album: <strong>{selectedMusic.album}</strong></span>
              {selectedMusic.rank ? (
                <span className="settings-input-helper">Chart Rank: <strong style={{ color: "#fbbf24" }}>#{selectedMusic.rank}</strong></span>
              ) : null}
              <span className="settings-input-helper">Provider: <strong>{selectedMusic.source}</strong></span>
            </div>

            <p style={{ lineHeight: 1.6, color: "var(--text)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              {selectedMusic.synopsis}
            </p>

            {selectedMusic.externalUrl ? (
              <a
                href={selectedMusic.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FiExternalLink /> Listen on Global Store ({selectedMusic.source})
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
