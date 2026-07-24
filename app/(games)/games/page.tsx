"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiSearch,
  FiStar,
  FiBookmark,
  FiExternalLink,
  FiX,
  FiFilter,
  FiGlobe,
  FiTrendingUp,
  FiZap,
  FiActivity,
  FiMonitor,
} from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import "@/src/styles/auth.css";

type GameItem = {
  id: string;
  title: string;
  synopsis: string;
  subCategory: string;
  score: number;
  platform: string;
  genre: string;
  publisher: string;
  imageUrl: string;
  externalUrl?: string;
  source: string;
  isSports?: boolean;
};

const GAMES_SUB_CATEGORIES = [
  "All Games & Sports",
  "Real Sports & Athletics",
  "Esports & Tournaments",
  "RPG & Gacha",
  "Console & PC",
];

const SEED_GAMES: GameItem[] = [
  {
    id: "game-seed-1",
    title: "UEFA Champions League Final 2026",
    synopsis: "Europe's premier football club championship featuring thrilling extra-time stoppage winner.",
    subCategory: "Real Sports & Athletics",
    score: 9.8,
    platform: "Global Athletics",
    genre: "Football / Soccer",
    publisher: "UEFA Official",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.uefa.com/championsleague/",
    source: "TheSportsDB Global API",
    isSports: true,
  },
  {
    id: "game-seed-2",
    title: "Formula 1 Italian Grand Prix Monza",
    synopsis: "High-speed wheel-to-wheel thriller at 350 km/h on Monza's legendary Temple of Speed circuit.",
    subCategory: "Real Sports & Athletics",
    score: 9.6,
    platform: "Motorsport",
    genre: "F1 Racing",
    publisher: "Formula 1 World Championship",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.formula1.com",
    source: "TheSportsDB Global API",
    isSports: true,
  },
  {
    id: "game-seed-3",
    title: "Genshin Impact: Natlan Region Expansion",
    synopsis: "Travelers enter Natlan, the Nation of Pyro, featuring new saurian companion mechanics and Pyro Archon quests.",
    subCategory: "RPG & Gacha",
    score: 9.1,
    platform: "PC, iOS, Android, PS5",
    genre: "Open World Action RPG",
    publisher: "HoYoverse",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://genshin.hoyoverse.com",
    source: "HoYoverse Official",
  },
  {
    id: "game-seed-4",
    title: "Valorant Champions World Final",
    synopsis: "The world's top tactical shooter teams battle in the grand finals in Seoul for the international trophy.",
    subCategory: "Esports & Tournaments",
    score: 9.3,
    platform: "PC Esports",
    genre: "Tactical FPS",
    publisher: "Riot Games",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://valorantesports.com",
    source: "Riot Esports Wire",
  },
];

export default function GamesPage() {
  const [gamesList, setGamesList] = useState<GameItem[]>(SEED_GAMES);
  const [activeSub, setActiveSub] = useState("All Games & Sports");
  const [search, setSearch] = useState("");
  const [feedFilter, setFeedFilter] = useState<"all" | "top" | "sports">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const [freeGamesRes, sportsRes] = await Promise.allSettled([
          fetch("https://www.freetogame.com/api/games"),
          fetch("https://www.thesportsdb.com/api/v1/json/3/all_sports.php"),
        ]);

        const fetched: GameItem[] = [];

        if (freeGamesRes.status === "fulfilled" && freeGamesRes.value.ok) {
          const gamesData = await freeGamesRes.value.json();
          if (Array.isArray(gamesData)) {
            gamesData.slice(0, 15).forEach((g: any, idx: number) => {
              fetched.push({
                id: `freegame-${g.id}`,
                title: g.title,
                synopsis: g.short_description || "High-tier video game release with global online multiplayer.",
                subCategory: g.genre === "MMORPG" || g.genre === "ARPG" ? "RPG & Gacha" : "Console & PC",
                score: 8.5 + (idx % 10) * 0.1,
                platform: g.platform || "PC / Web",
                genre: g.genre || "Action",
                publisher: g.publisher || "Global Developer",
                imageUrl: g.thumbnail || SEED_GAMES[2].imageUrl,
                externalUrl: g.freetogame_profile_url || g.game_url,
                source: "FreeToGame Global API",
              });
            });
          }
        }

        if (sportsRes.status === "fulfilled" && sportsRes.value.ok) {
          const sportsData = await sportsRes.value.json();
          const sports = sportsData?.sports || [];
          sports.slice(0, 8).forEach((sp: any, idx: number) => {
            fetched.push({
              id: `sports-${sp.idSport || idx}`,
              title: `${sp.strSport} Championship League`,
              synopsis: sp.strSportDescription
                ? `${sp.strSportDescription.slice(0, 180)}...`
                : "World athletic championship coverage across premier global leagues.",
              subCategory: "Real Sports & Athletics",
              score: 9.0 + (idx % 8) * 0.1,
              platform: "Global Athletics",
              genre: sp.strSport || "Real Sports",
              publisher: "World Athletics Federation",
              imageUrl: sp.strSportThumb || SEED_GAMES[0].imageUrl,
              externalUrl: "https://www.thesportsdb.com",
              source: "TheSportsDB Global API",
              isSports: true,
            });
          });
        }

        if (fetched.length) {
          setGamesList((prev) => {
            const existing = new Set(prev.map((g) => g.id));
            const unique = fetched.filter((f) => !existing.has(f.id));
            return [...prev, ...unique];
          });
        }
      } catch {
        // Fallback
      }
    };

    fetchGamesData();
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  let filtered = gamesList.filter((item) => {
    const passesSub =
      activeSub.startsWith("All") ||
      item.subCategory.toLowerCase() === activeSub.toLowerCase();
    const passesSearch =
      item.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.synopsis.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.genre.toLowerCase().includes(search.trim().toLowerCase());
    return passesSub && passesSearch;
  });

  if (feedFilter === "top") {
    filtered = [...filtered].sort((a, b) => b.score - a.score);
  } else if (feedFilter === "sports") {
    filtered = filtered.filter((i) => i.isSports || i.subCategory.includes("Sports"));
  }

  const topTrending = gamesList
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
            <span>🎮 Video Games & Real Sports Hub</span>
          </div>
          <h1 className="hero-banner-title">
            Aniverse <span style={{ color: "var(--brand)" }}>Games & Sports Portal</span>
          </h1>
          <p className="hero-banner-desc">
            Discover AAA video games, esports tournaments, gacha titles, and real-world international sports events powered by FreeToGame & TheSportsDB.
          </p>
        </div>
        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Games Portal Assistant"
            className="hero-banner-mascot-img"
          />
        </div>
      </section>

      {/* 2-COLUMN PORTAL LAYOUT */}
      <section className="workspace-layout relative z-10">
        {/* LEFT COLUMN: Sub-Category Sidebar */}
        <aside className="workspace-sidebar section-block">
          <h3>
            <FiFilter style={{ color: "var(--brand)" }} /> Games & Sports Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
            {GAMES_SUB_CATEGORIES.map((sub) => (
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
              <FiGlobe style={{ marginRight: "4px" }} /> Open Gaming Feeds:
            </span>
            <p className="settings-input-helper" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
              FreeToGame & TheSportsDB Global APIs.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="workspace-content">
          {/* AI Hot Filter Bar */}
          <div className="settings-card" style={{ marginBottom: "1rem", padding: "0.85rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <span className="auth-badge" style={{ fontSize: "0.78rem" }}>
                <FiZap style={{ marginRight: "4px" }} /> AI Gaming & Sports Curator
              </span>
              <div className="badge-pill-list" style={{ gap: "0.5rem", margin: 0 }}>
                <button
                  type="button"
                  className={feedFilter === "all" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("all")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  All Feeds
                </button>
                <button
                  type="button"
                  className={feedFilter === "top" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("top")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  ★ Highest Rated
                </button>
                <button
                  type="button"
                  className={feedFilter === "sports" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("sports")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  🏆 Real World Sports
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
                placeholder={`Search games, sports leagues, platforms under ${activeSub}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
          </div>

          {/* Top 5 Trending Bar */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiTrendingUp style={{ color: "var(--brand)" }} /> Top 5 Trending Games & Matches
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {topTrending.map((item, idx) => (
                <div
                  key={item.id}
                  className="session-item-row"
                  style={{ gap: "0.6rem", alignItems: "center", cursor: "pointer", padding: "0.6rem 0.8rem", borderRadius: "12px", background: "var(--surface-soft)" }}
                  onClick={() => setSelectedGame(item)}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--brand)", minWidth: "24px" }}>
                    0{idx + 1}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <strong style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.2, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </strong>
                    <span className="settings-input-helper" style={{ fontSize: "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                      ★ {item.score} · {item.genre} · {item.platform}
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
              <p>Click any card for full gameplay specs, developer info, and official download links.</p>
            </div>
          </div>

          {/* Grid of Game Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
            {filtered.map((game) => (
              <article
                key={game.id}
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
                onClick={() => setSelectedGame(game)}
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
                      src={game.imageUrl}
                      alt={game.title}
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
                      {game.subCategory}
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
                      <FiStar /> {game.score}
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
                    {game.title}
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
                    {game.synopsis}
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
                      <FiMonitor style={{ marginRight: "3px" }} /> {game.genre}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="action-button ghost small"
                        onClick={(e) => toggleBookmark(game.id, e)}
                        style={{ padding: "0.4rem 0.6rem" }}
                      >
                        <FiBookmark style={{ color: bookmarkedIds.includes(game.id) ? "var(--brand)" : "inherit" }} />
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
              <p className="settings-input-helper">No games or sports found matching &quot;{search}&quot;.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Modal Inspector */}
      {selectedGame ? (
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
          onClick={() => setSelectedGame(null)}
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
                <FaGamepad style={{ marginRight: "4px" }} /> {selectedGame.subCategory} Overview
              </span>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setSelectedGame(null)}
                style={{ borderRadius: "50%", padding: "0.4rem" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ width: "100%", height: "250px", borderRadius: "18px", overflow: "hidden", marginBottom: "1.25rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedGame.imageUrl} alt={selectedGame.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.75rem" }}>
              {selectedGame.title}
            </h1>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span className="settings-input-helper">Genre: <strong>{selectedGame.genre}</strong></span>
              <span className="settings-input-helper">Platform: <strong>{selectedGame.platform}</strong></span>
              <span className="settings-input-helper">Rating: <strong style={{ color: "#fbbf24" }}>★ {selectedGame.score}</strong></span>
              <span className="settings-input-helper">Publisher: <strong>{selectedGame.publisher}</strong></span>
            </div>

            <p style={{ lineHeight: 1.6, color: "var(--text)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              {selectedGame.synopsis}
            </p>

            {selectedGame.externalUrl ? (
              <a
                href={selectedGame.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FiExternalLink /> Visit Official Portal ({selectedGame.source})
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
