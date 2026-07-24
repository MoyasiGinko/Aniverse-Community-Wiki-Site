"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiFilm,
  FiSearch,
  FiStar,
  FiClock,
  FiTv,
  FiBookmark,
  FiExternalLink,
  FiX,
  FiFilter,
  FiGlobe,
  FiTrendingUp,
  FiHeart,
  FiZap,
} from "react-icons/fi";
import "@/src/styles/auth.css";

type AnimeItem = {
  id: string;
  title: string;
  synopsis: string;
  subCategory: string;
  score: number;
  episodes: string;
  status: string;
  studio: string;
  imageUrl: string;
  externalUrl?: string;
  source: string;
  members: number;
  rank: number;
};

const ANIME_SUB_CATEGORIES = [
  "All Animes",
  "Seasonal Airing",
  "Movies & OVAs",
  "Studio Production",
  "Voice Cast",
];

const SEED_ANIMES: AnimeItem[] = [
  {
    id: "anime-seed-1",
    title: "Chainsaw Man: Reze Arc Movie",
    synopsis: "Denji encounters Reze in a fateful rainy alleyway, leading to high-octane devil battles across Tokyo.",
    subCategory: "Movies & OVAs",
    score: 8.95,
    episodes: "Movie (110 min)",
    status: "Upcoming Theatrical",
    studio: "MAPPA",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    externalUrl: "https://myanimelist.net/anime/56808",
    source: "MyAnimeList / MAPPA",
    members: 485000,
    rank: 1,
  },
  {
    id: "anime-seed-2",
    title: "Demon Slayer: Infinity Castle Arc Trilogy",
    synopsis: "The Demon Slayer Corps plunges into Muzan Kibutsuji's dimensional fortress for the ultimate Hashira confrontation.",
    subCategory: "Movies & OVAs",
    score: 9.12,
    episodes: "3 Feature Films",
    status: "In Production",
    studio: "ufotable",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    externalUrl: "https://myanimelist.net/anime/59196",
    source: "ufotable Official",
    members: 620000,
    rank: 2,
  },
  {
    id: "anime-seed-3",
    title: "Jujutsu Kaisen Season 3: Culling Game",
    synopsis: "Kenjaku initiates the deadliest sorcery battle royale in modern Japan, forcing Yuji Itadori and Yuta Okkotsu into combat.",
    subCategory: "Studio Production",
    score: 8.88,
    episodes: "24 Episodes",
    status: "Production Phase",
    studio: "MAPPA",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    externalUrl: "https://myanimelist.net/anime/40748",
    source: "MAPPA Studio",
    members: 341000,
    rank: 3,
  },
  {
    id: "anime-seed-4",
    title: "Solo Leveling Season 2: Arise from the Shadow",
    synopsis: "Sung Jinwoo leads his newly formed army of shadow monarchs against high-rank S-gate dungeon bosses.",
    subCategory: "Seasonal Airing",
    score: 8.75,
    episodes: "12 Episodes",
    status: "Currently Airing",
    studio: "A-1 Pictures",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1108/139265.jpg",
    externalUrl: "https://myanimelist.net/anime/58564",
    source: "Aniplex Official",
    members: 412000,
    rank: 4,
  },
];

export default function AnimesPage() {
  const [animeList, setAnimeList] = useState<AnimeItem[]>(SEED_ANIMES);
  const [activeSub, setActiveSub] = useState("All Animes");
  const [search, setSearch] = useState("");
  const [feedFilter, setFeedFilter] = useState<"all" | "top" | "airing">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);

  useEffect(() => {
    const fetchAnimeFeeds = async () => {
      try {
        const [jikanRes, kitsuRes] = await Promise.allSettled([
          fetch("https://api.jikan.moe/v4/top/anime?limit=15"),
          fetch("https://kitsu.io/api/edge/trending/anime"),
        ]);

        const fetched: AnimeItem[] = [];

        if (jikanRes.status === "fulfilled" && jikanRes.value.ok) {
          const data = await jikanRes.value.json();
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((anime: any, idx: number) => {
              fetched.push({
                id: `jikan-${anime.mal_id}`,
                title: anime.title_english || anime.title,
                synopsis: anime.synopsis
                  ? `${anime.synopsis.slice(0, 180)}...`
                  : "Premier anime series featuring high-tier animation and storytelling.",
                subCategory: anime.type === "Movie" ? "Movies & OVAs" : "Seasonal Airing",
                score: anime.score || 8.5,
                episodes: anime.episodes ? `${anime.episodes} Ep` : "Airing",
                status: anime.status || "Finished Airing",
                studio: anime.studios?.[0]?.name || "Top Studio",
                imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || SEED_ANIMES[0].imageUrl,
                externalUrl: anime.url,
                source: "MyAnimeList API",
                members: anime.members || 10000,
                rank: anime.rank || idx + 1,
              });
            });
          }
        }

        if (kitsuRes.status === "fulfilled" && kitsuRes.value.ok) {
          const kitsuData = await kitsuRes.value.json();
          if (kitsuData.data && Array.isArray(kitsuData.data)) {
            kitsuData.data.forEach((item: any, idx: number) => {
              const attr = item.attributes || {};
              fetched.push({
                id: `kitsu-${item.id}`,
                title: attr.canonicalTitle || attr.titles?.en || "Global Anime",
                synopsis: attr.synopsis
                  ? `${attr.synopsis.slice(0, 180)}...`
                  : "Trending international anime broadcast.",
                subCategory: attr.subtype === "movie" ? "Movies & OVAs" : "Studio Production",
                score: attr.averageRating ? parseFloat((attr.averageRating / 10).toFixed(2)) : 8.4,
                episodes: attr.episodeCount ? `${attr.episodeCount} Ep` : "Ongoing",
                status: attr.status || "TBA",
                studio: "International Production",
                imageUrl: attr.posterImage?.large || attr.posterImage?.original || SEED_ANIMES[0].imageUrl,
                externalUrl: `https://kitsu.io/anime/${item.id}`,
                source: "Kitsu Global API",
                members: attr.userCount || 5000,
                rank: idx + 10,
              });
            });
          }
        }

        if (fetched.length) {
          setAnimeList((prev) => {
            const existing = new Set(prev.map((a) => a.id));
            const unique = fetched.filter((f) => !existing.has(f.id));
            return [...prev, ...unique];
          });
        }
      } catch {
        // Fallback
      }
    };

    fetchAnimeFeeds();
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  let filtered = animeList.filter((item) => {
    const passesSub =
      activeSub.startsWith("All") ||
      item.subCategory.toLowerCase() === activeSub.toLowerCase();
    const passesSearch =
      item.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.synopsis.toLowerCase().includes(search.trim().toLowerCase());
    return passesSub && passesSearch;
  });

  if (feedFilter === "top") {
    filtered = [...filtered].sort((a, b) => b.score - a.score);
  } else if (feedFilter === "airing") {
    filtered = [...filtered].sort((a, b) => b.members - a.members);
  }

  const topTrending = animeList
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Workspace Banner */}
      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>⚡ Global Anime & Animation Hub</span>
          </div>
          <h1 className="hero-banner-title">
            Aniverse <span style={{ color: "var(--brand)" }}>Anime Portal</span>
          </h1>
          <p className="hero-banner-desc">
            Explore seasonal series, theatrical anime movies, studio releases, and top-rated franchises powered by live MAL & Kitsu APIs.
          </p>
        </div>
        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Anime Portal Assistant"
            className="hero-banner-mascot-img"
          />
        </div>
      </section>

      {/* 2-COLUMN PORTAL LAYOUT */}
      <section className="workspace-layout relative z-10">
        {/* LEFT COLUMN: Sub-Category Sidebar */}
        <aside className="workspace-sidebar section-block">
          <h3>
            <FiFilter style={{ color: "var(--brand)" }} /> Anime Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
            {ANIME_SUB_CATEGORIES.map((sub) => (
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
              <FiGlobe style={{ marginRight: "4px" }} /> Open Anime Feeds:
            </span>
            <p className="settings-input-helper" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
              MyAnimeList (Jikan) & Kitsu International APIs.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="workspace-content">
          {/* AI Hot Filter Bar */}
          <div className="settings-card" style={{ marginBottom: "1rem", padding: "0.85rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <span className="auth-badge" style={{ fontSize: "0.78rem" }}>
                <FiZap style={{ marginRight: "4px" }} /> AI Anime Curator
              </span>
              <div className="badge-pill-list" style={{ gap: "0.5rem", margin: 0 }}>
                <button
                  type="button"
                  className={feedFilter === "all" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("all")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  All Releases
                </button>
                <button
                  type="button"
                  className={feedFilter === "top" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("top")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  ★ Top Score Rated
                </button>
                <button
                  type="button"
                  className={feedFilter === "airing" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("airing")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  🔥 Most Popular
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
                placeholder={`Search anime titles, studios, or synopsis under ${activeSub}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
          </div>

          {/* Top 5 Trending Bar */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiTrendingUp style={{ color: "var(--brand)" }} /> Top 5 Trending Anime
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {topTrending.map((item, idx) => (
                <div
                  key={item.id}
                  className="session-item-row"
                  style={{ gap: "0.6rem", alignItems: "center", cursor: "pointer", padding: "0.6rem 0.8rem", borderRadius: "12px", background: "var(--surface-soft)" }}
                  onClick={() => setSelectedAnime(item)}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--brand)", minWidth: "24px" }}>
                    0{idx + 1}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <strong style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.2, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </strong>
                    <span className="settings-input-helper" style={{ fontSize: "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                      ★ {item.score} · {item.studio} · {item.episodes}
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
              <p>Click any anime card for complete details, studio metadata, and trailer links.</p>
            </div>
          </div>

          {/* Grid of Anime Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
            {filtered.map((anime) => (
              <article
                key={anime.id}
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
                onClick={() => setSelectedAnime(anime)}
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
                      src={anime.imageUrl}
                      alt={anime.title}
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
                      {anime.subCategory}
                    </span>
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
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        zIndex: 2,
                      }}
                    >
                      <FiStar /> {anime.score}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      lineHeight: 1.35,
                      marginBottom: "0.5rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.7em",
                    }}
                  >
                    {anime.title}
                  </h3>

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
                    {anime.synopsis}
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
                      <FiTv style={{ marginRight: "3px" }} /> {anime.studio}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="action-button ghost small"
                        onClick={(e) => toggleBookmark(anime.id, e)}
                        style={{ padding: "0.4rem 0.6rem" }}
                      >
                        <FiBookmark style={{ color: bookmarkedIds.includes(anime.id) ? "var(--brand)" : "inherit" }} />
                      </button>
                      <button type="button" className="action-button small" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>
                        View Info
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!filtered.length ? (
            <div className="settings-card">
              <p className="settings-input-helper">No anime titles found matching &quot;{search}&quot;.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Modal Inspector */}
      {selectedAnime ? (
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
          onClick={() => setSelectedAnime(null)}
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
                <FiFilm style={{ marginRight: "4px" }} /> {selectedAnime.subCategory} Anime Detail
              </span>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setSelectedAnime(null)}
                style={{ borderRadius: "50%", padding: "0.4rem" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ width: "100%", height: "250px", borderRadius: "18px", overflow: "hidden", marginBottom: "1.25rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedAnime.imageUrl} alt={selectedAnime.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.75rem" }}>
              {selectedAnime.title}
            </h1>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span className="settings-input-helper">Studio: <strong>{selectedAnime.studio}</strong></span>
              <span className="settings-input-helper">Score: <strong style={{ color: "#fbbf24" }}>★ {selectedAnime.score}</strong></span>
              <span className="settings-input-helper">Format: <strong>{selectedAnime.episodes}</strong></span>
              <span className="settings-input-helper">Status: <strong>{selectedAnime.status}</strong></span>
            </div>

            <p style={{ lineHeight: 1.6, color: "var(--text)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              {selectedAnime.synopsis}
            </p>

            {selectedAnime.externalUrl ? (
              <a
                href={selectedAnime.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FiExternalLink /> View Official Page ({selectedAnime.source})
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
