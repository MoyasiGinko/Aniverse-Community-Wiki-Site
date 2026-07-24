"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiTv,
  FiSearch,
  FiStar,
  FiBookmark,
  FiExternalLink,
  FiX,
  FiFilter,
  FiGlobe,
  FiTrendingUp,
  FiZap,
  FiFilm,
} from "react-icons/fi";
import "@/src/styles/auth.css";

type MovieItem = {
  id: string;
  title: string;
  synopsis: string;
  subCategory: string;
  rating: number;
  genre: string;
  status: string;
  network: string;
  imageUrl: string;
  externalUrl?: string;
  source: string;
};

const MOVIES_SUB_CATEGORIES = [
  "All Movies",
  "Live Action Adaptations",
  "Hollywood & International",
  "Streaming Releases",
];

const SEED_MOVIES: MovieItem[] = [
  {
    id: "movie-seed-1",
    title: "One Piece Live Action Season 2",
    synopsis: "The Straw Hat Pirates set sail for Arabasta, encountering Chopper, Captain Smoker, and Baroque Works.",
    subCategory: "Live Action Adaptations",
    rating: 8.9,
    genre: "Action Fantasy",
    status: "Wrapped Production",
    network: "Netflix Originals",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.netflix.com",
    source: "Netflix Geeked",
  },
  {
    id: "movie-seed-2",
    title: "Godzilla Minus One: Oscar Edition",
    synopsis: "Takashi Yamazaki's historic Academy Award-winning Godzilla epic detailing postwar Japan's resistance.",
    subCategory: "Hollywood & International",
    rating: 9.4,
    genre: "Sci-Fi Kaiju",
    status: "Theatrical & Streaming",
    network: "Toho Pictures",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://godzilla.com",
    source: "Academy Awards / Toho",
  },
  {
    id: "movie-seed-3",
    title: "Arcane Season 2: League of Legends",
    synopsis: "The final chapter of Vi and Jinx's devastating rift between Piltover and Zaun.",
    subCategory: "Streaming Releases",
    rating: 9.5,
    genre: "Animated Sci-Fi Drama",
    status: "Premiering Worldwide",
    network: "Riot / Netflix",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.arcane.com",
    source: "Riot Games",
  },
];

export default function MoviesPage() {
  const [moviesList, setMoviesList] = useState<MovieItem[]>(SEED_MOVIES);
  const [activeSub, setActiveSub] = useState("All Movies");
  const [search, setSearch] = useState("");
  const [feedFilter, setFeedFilter] = useState<"all" | "top" | "streaming">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);

  useEffect(() => {
    const fetchMoviesFeeds = async () => {
      try {
        const tvRes = await fetch("https://api.tvmaze.com/shows?page=1");
        if (tvRes.ok) {
          const shows = await tvRes.json();
          if (Array.isArray(shows)) {
            const fetched: MovieItem[] = [];
            shows.slice(0, 18).forEach((show: any, idx: number) => {
              const cleanSummary = show.summary ? show.summary.replace(/<[^>]+>/g, "") : "";
              fetched.push({
                id: `tvmaze-${show.id}`,
                title: show.name,
                synopsis: cleanSummary ? `${cleanSummary.slice(0, 180)}...` : "International cinema and TV series production.",
                subCategory: idx % 2 === 0 ? "Streaming Releases" : "Hollywood & International",
                rating: show.rating?.average || 8.2,
                genre: show.genres?.[0] || "Drama",
                status: show.status || "Running",
                network: show.network?.name || show.webChannel?.name || "Global Stream",
                imageUrl: show.image?.original || show.image?.medium || SEED_MOVIES[0].imageUrl,
                externalUrl: show.url,
                source: "TVmaze Open API",
              });
            });

            if (fetched.length) {
              setMoviesList((prev) => {
                const existing = new Set(prev.map((m) => m.id));
                const unique = fetched.filter((f) => !existing.has(f.id));
                return [...prev, ...unique];
              });
            }
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchMoviesFeeds();
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  let filtered = moviesList.filter((item) => {
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
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  } else if (feedFilter === "streaming") {
    filtered = filtered.filter((i) => i.subCategory === "Streaming Releases");
  }

  const topTrending = moviesList
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Workspace Banner */}
      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>🍿 Cinema & Streaming Series Hub</span>
          </div>
          <h1 className="hero-banner-title">
            Aniverse <span style={{ color: "var(--brand)" }}>Movies & Series Portal</span>
          </h1>
          <p className="hero-banner-desc">
            Explore live action adaptations, Hollywood blockbusters, international TV series, and flagship streaming releases powered by TVmaze Open API.
          </p>
        </div>
        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Movies Portal Assistant"
            className="hero-banner-mascot-img"
          />
        </div>
      </section>

      {/* 2-COLUMN PORTAL LAYOUT */}
      <section className="workspace-layout relative z-10">
        {/* LEFT COLUMN: Sub-Category Sidebar */}
        <aside className="workspace-sidebar section-block">
          <h3>
            <FiFilter style={{ color: "var(--brand)" }} /> Cinema Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
            {MOVIES_SUB_CATEGORIES.map((sub) => (
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
              <FiGlobe style={{ marginRight: "4px" }} /> Open TV & Cinema Feeds:
            </span>
            <p className="settings-input-helper" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
              TVmaze International Cinema API.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="workspace-content">
          {/* AI Hot Filter Bar */}
          <div className="settings-card" style={{ marginBottom: "1rem", padding: "0.85rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <span className="auth-badge" style={{ fontSize: "0.78rem" }}>
                <FiZap style={{ marginRight: "4px" }} /> AI Cinema Curator
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
                  ★ Top Box Office / Rated
                </button>
                <button
                  type="button"
                  className={feedFilter === "streaming" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("streaming")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  🎬 Streaming Originals
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
                placeholder={`Search movies, series, directors under ${activeSub}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
          </div>

          {/* Top 5 Trending Bar */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiTrendingUp style={{ color: "var(--brand)" }} /> Top 5 Trending Movies & Series
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {topTrending.map((item, idx) => (
                <div
                  key={item.id}
                  className="session-item-row"
                  style={{ gap: "0.6rem", alignItems: "center", cursor: "pointer", padding: "0.6rem 0.8rem", borderRadius: "12px", background: "var(--surface-soft)" }}
                  onClick={() => setSelectedMovie(item)}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--brand)", minWidth: "24px" }}>
                    0{idx + 1}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <strong style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.2, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </strong>
                    <span className="settings-input-helper" style={{ fontSize: "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                      ★ {item.rating} · {item.genre} · {item.network}
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
              <p>Click any title for synopsis, network details, and streaming links.</p>
            </div>
          </div>

          {/* Grid of Movie Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
            {filtered.map((movie) => (
              <article
                key={movie.id}
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
                onClick={() => setSelectedMovie(movie)}
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
                      src={movie.imageUrl}
                      alt={movie.title}
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
                      {movie.subCategory}
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
                      <FiStar /> {movie.rating}
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
                    {movie.title}
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
                    {movie.synopsis}
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
                      <FiFilm style={{ marginRight: "3px" }} /> {movie.network}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="action-button ghost small"
                        onClick={(e) => toggleBookmark(movie.id, e)}
                        style={{ padding: "0.4rem 0.6rem" }}
                      >
                        <FiBookmark style={{ color: bookmarkedIds.includes(movie.id) ? "var(--brand)" : "inherit" }} />
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
              <p className="settings-input-helper">No movies or series found matching &quot;{search}&quot;.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Modal Inspector */}
      {selectedMovie ? (
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
          onClick={() => setSelectedMovie(null)}
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
                <FiTv style={{ marginRight: "4px" }} /> {selectedMovie.subCategory} Overview
              </span>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setSelectedMovie(null)}
                style={{ borderRadius: "50%", padding: "0.4rem" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ width: "100%", height: "250px", borderRadius: "18px", overflow: "hidden", marginBottom: "1.25rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedMovie.imageUrl} alt={selectedMovie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.75rem" }}>
              {selectedMovie.title}
            </h1>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span className="settings-input-helper">Genre: <strong>{selectedMovie.genre}</strong></span>
              <span className="settings-input-helper">Network: <strong>{selectedMovie.network}</strong></span>
              <span className="settings-input-helper">Rating: <strong style={{ color: "#fbbf24" }}>★ {selectedMovie.rating}</strong></span>
              <span className="settings-input-helper">Status: <strong>{selectedMovie.status}</strong></span>
            </div>

            <p style={{ lineHeight: 1.6, color: "var(--text)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              {selectedMovie.synopsis}
            </p>

            {selectedMovie.externalUrl ? (
              <a
                href={selectedMovie.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FiExternalLink /> Visit Official Cinema Portal ({selectedMovie.source})
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
