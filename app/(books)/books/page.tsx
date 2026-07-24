"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiSearch,
  FiStar,
  FiBookmark,
  FiExternalLink,
  FiX,
  FiFilter,
  FiGlobe,
  FiTrendingUp,
  FiZap,
  FiFeather,
} from "react-icons/fi";
import "@/src/styles/auth.css";

type BookItem = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  subCategory: string;
  score: number;
  chapters: string;
  status: string;
  publisher: string;
  imageUrl: string;
  externalUrl?: string;
  source: string;
};

const BOOKS_SUB_CATEGORIES = [
  "All Manga & Books",
  "Shonen & Seinen",
  "Light Novels",
  "Webtoons & Comics",
  "Fantasy Fiction",
];

const SEED_BOOKS: BookItem[] = [
  {
    id: "book-seed-1",
    title: "One Piece: Void Century Saga",
    author: "Eiichiro Oda",
    synopsis: "Weekly Shonen Jump reveals unprecedented lore drops detailing Joy Boy, Ancient Weapons, and the Poneglyphs.",
    subCategory: "Shonen & Seinen",
    score: 9.6,
    chapters: "1120+ Chapters",
    status: "Weekly Serialization",
    publisher: "Shueisha",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://shonenjump.viz.com",
    source: "Shonen Jump Official",
  },
  {
    id: "book-seed-2",
    title: "Berserk: Studio Gaga Arc Continuation",
    author: "Kentaro Miura / Kouji Mori",
    synopsis: "Guts and the party navigate the aftermath of Elfhelm's collapse under the artistic direction of Studio Gaga.",
    subCategory: "Shonen & Seinen",
    score: 9.5,
    chapters: "375+ Chapters",
    status: "Monthly Serialization",
    publisher: "Hakusensha",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.hakusensha.co.jp",
    source: "Young Animal",
  },
  {
    id: "book-seed-3",
    title: "Solo Leveling Manhwa (Full Color Edition)",
    author: "Chugong / DUBU",
    synopsis: "Sung Jinwoo's iconic journey from E-rank hunter to Shadow Monarch in deluxe physical hardcover format.",
    subCategory: "Webtoons & Comics",
    score: 9.3,
    chapters: "200 Chapters",
    status: "Completed Main Story",
    publisher: "D&C Media / Yen Press",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://yenpress.com",
    source: "Yen Press Global",
  },
];

export default function BooksPage() {
  const [booksList, setBooksList] = useState<BookItem[]>(SEED_BOOKS);
  const [activeSub, setActiveSub] = useState("All Manga & Books");
  const [search, setSearch] = useState("");
  const [feedFilter, setFeedFilter] = useState<"all" | "top" | "manga">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  useEffect(() => {
    const fetchBooksFeeds = async () => {
      try {
        const [jikanMangaRes, openLibRes] = await Promise.allSettled([
          fetch("https://api.jikan.moe/v4/top/manga?limit=15"),
          fetch("https://openlibrary.org/subjects/fantasy.json?limit=12"),
        ]);

        const fetched: BookItem[] = [];

        if (jikanMangaRes.status === "fulfilled" && jikanMangaRes.value.ok) {
          const mangaData = await jikanMangaRes.value.json();
          if (mangaData.data && Array.isArray(mangaData.data)) {
            mangaData.data.forEach((manga: any, idx: number) => {
              fetched.push({
                id: `jikan-manga-page-${manga.mal_id}`,
                title: manga.title,
                author: manga.authors?.[0]?.name || "Renowned Mangaka",
                synopsis: manga.synopsis
                  ? `${manga.synopsis.slice(0, 180)}...`
                  : "Top-rated manga series featuring gripping chapters and character art.",
                subCategory: idx % 2 === 0 ? "Shonen & Seinen" : "Light Novels",
                score: manga.score || 8.9,
                chapters: manga.chapters ? `${manga.chapters} Ch.` : "Publishing",
                status: manga.status || "Publishing",
                publisher: "Shueisha / Kodansha",
                imageUrl: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || SEED_BOOKS[0].imageUrl,
                externalUrl: manga.url,
                source: "MyAnimeList Manga API",
              });
            });
          }
        }

        if (openLibRes.status === "fulfilled" && openLibRes.value.ok) {
          const libData = await openLibRes.value.json();
          if (libData.works && Array.isArray(libData.works)) {
            libData.works.forEach((work: any, idx: number) => {
              const coverId = work.cover_id;
              const imgUrl = coverId
                ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                : SEED_BOOKS[2].imageUrl;
              fetched.push({
                id: `openlib-page-${work.key.replace(/\//g, "-")}`,
                title: work.title,
                author: work.authors?.[0]?.name || "Global Novelist",
                synopsis: `International fantasy fiction masterpiece "${work.title}". Available across global book distributions.`,
                subCategory: "Fantasy Fiction",
                score: 8.7 + (idx % 5) * 0.1,
                chapters: "Novel / Volume",
                status: "Published",
                publisher: "Global Publishing",
                imageUrl: imgUrl,
                externalUrl: `https://openlibrary.org${work.key}`,
                source: "Open Library Global API",
              });
            });
          }
        }

        if (fetched.length) {
          setBooksList((prev) => {
            const existing = new Set(prev.map((b) => b.id));
            const unique = fetched.filter((f) => !existing.has(f.id));
            return [...prev, ...unique];
          });
        }
      } catch {
        // Fallback
      }
    };

    fetchBooksFeeds();
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  let filtered = booksList.filter((item) => {
    const passesSub =
      activeSub.startsWith("All") ||
      item.subCategory.toLowerCase() === activeSub.toLowerCase();
    const passesSearch =
      item.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.author.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.synopsis.toLowerCase().includes(search.trim().toLowerCase());
    return passesSub && passesSearch;
  });

  if (feedFilter === "top") {
    filtered = [...filtered].sort((a, b) => b.score - a.score);
  } else if (feedFilter === "manga") {
    filtered = filtered.filter((i) => i.subCategory.includes("Shonen") || i.subCategory.includes("Webtoons"));
  }

  const topTrending = booksList
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
            <span>📚 Manga, Light Novels & Global Books Hub</span>
          </div>
          <h1 className="hero-banner-title">
            Aniverse <span style={{ color: "var(--brand)" }}>Manga & Books Portal</span>
          </h1>
          <p className="hero-banner-desc">
            Discover Shonen Jump chapter releases, Light Novel adaptations, Webtoons, and international fantasy literature powered by Jikan & Open Library APIs.
          </p>
        </div>
        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Books Portal Assistant"
            className="hero-banner-mascot-img"
          />
        </div>
      </section>

      {/* 2-COLUMN PORTAL LAYOUT */}
      <section className="workspace-layout relative z-10">
        {/* LEFT COLUMN: Sub-Category Sidebar */}
        <aside className="workspace-sidebar section-block">
          <h3>
            <FiFilter style={{ color: "var(--brand)" }} /> Literature Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
            {BOOKS_SUB_CATEGORIES.map((sub) => (
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
              <FiGlobe style={{ marginRight: "4px" }} /> Open Book Feeds:
            </span>
            <p className="settings-input-helper" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
              MyAnimeList Manga & Open Library APIs.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="workspace-content">
          {/* AI Hot Filter Bar */}
          <div className="settings-card" style={{ marginBottom: "1rem", padding: "0.85rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <span className="auth-badge" style={{ fontSize: "0.78rem" }}>
                <FiZap style={{ marginRight: "4px" }} /> AI Manga Curator
              </span>
              <div className="badge-pill-list" style={{ gap: "0.5rem", margin: 0 }}>
                <button
                  type="button"
                  className={feedFilter === "all" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("all")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  All Publications
                </button>
                <button
                  type="button"
                  className={feedFilter === "top" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("top")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  ★ Bestselling Score
                </button>
                <button
                  type="button"
                  className={feedFilter === "manga" ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setFeedFilter("manga")}
                  style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
                >
                  📖 Shonen & Webtoons
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
                placeholder={`Search manga titles, authors, or volumes under ${activeSub}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
          </div>

          {/* Top 5 Trending Bar */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiTrendingUp style={{ color: "var(--brand)" }} /> Top 5 Bestselling Manga & Novels
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {topTrending.map((item, idx) => (
                <div
                  key={item.id}
                  className="session-item-row"
                  style={{ gap: "0.6rem", alignItems: "center", cursor: "pointer", padding: "0.6rem 0.8rem", borderRadius: "12px", background: "var(--surface-soft)" }}
                  onClick={() => setSelectedBook(item)}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--brand)", minWidth: "24px" }}>
                    0{idx + 1}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <strong style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.2, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </strong>
                    <span className="settings-input-helper" style={{ fontSize: "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                      ★ {item.score} · Author: {item.author} · {item.chapters}
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
              <p>Click any title for chapter synopsis, author details, and reader preview links.</p>
            </div>
          </div>

          {/* Grid of Book Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
            {filtered.map((book) => (
              <article
                key={book.id}
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
                onClick={() => setSelectedBook(book)}
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
                      src={book.imageUrl}
                      alt={book.title}
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
                      {book.subCategory}
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
                      <FiStar /> {book.score}
                    </span>
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
                    {book.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      color: "var(--brand)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    By {book.author}
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
                    {book.synopsis}
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
                      <FiBookOpen style={{ marginRight: "3px" }} /> {book.chapters}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="action-button ghost small"
                        onClick={(e) => toggleBookmark(book.id, e)}
                        style={{ padding: "0.4rem 0.6rem" }}
                      >
                        <FiBookmark style={{ color: bookmarkedIds.includes(book.id) ? "var(--brand)" : "inherit" }} />
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
              <p className="settings-input-helper">No manga or books found matching &quot;{search}&quot;.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Modal Inspector */}
      {selectedBook ? (
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
          onClick={() => setSelectedBook(null)}
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
                <FiFeather style={{ marginRight: "4px" }} /> {selectedBook.subCategory} Overview
              </span>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setSelectedBook(null)}
                style={{ borderRadius: "50%", padding: "0.4rem" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ width: "100%", height: "250px", borderRadius: "18px", overflow: "hidden", marginBottom: "1.25rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedBook.imageUrl} alt={selectedBook.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", marginBottom: "0.25rem" }}>
              {selectedBook.title}
            </h1>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brand)", marginBottom: "0.75rem" }}>
              Author: {selectedBook.author}
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span className="settings-input-helper">Chapters: <strong>{selectedBook.chapters}</strong></span>
              <span className="settings-input-helper">Status: <strong>{selectedBook.status}</strong></span>
              <span className="settings-input-helper">Score: <strong style={{ color: "#fbbf24" }}>★ {selectedBook.score}</strong></span>
              <span className="settings-input-helper">Publisher: <strong>{selectedBook.publisher}</strong></span>
            </div>

            <p style={{ lineHeight: 1.6, color: "var(--text)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              {selectedBook.synopsis}
            </p>

            {selectedBook.externalUrl ? (
              <a
                href={selectedBook.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FiExternalLink /> Read Official Release ({selectedBook.source})
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
