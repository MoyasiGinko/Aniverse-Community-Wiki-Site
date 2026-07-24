"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiFilm,
  FiTv,
  FiMusic,
  FiBookOpen,
  FiSearch,
  FiTrendingUp,
  FiZap,
  FiGlobe,
  FiStar,
  FiArrowRight,
  FiCompass,
  FiShield,
  FiActivity,
  FiMessageSquare,
  FiUsers,
  FiChevronRight,
  FiCpu,
  FiCheckCircle,
  FiBookmark,
  FiClock,
  FiUser,
} from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import "@/src/styles/auth.css";

type LiveFeedItem = {
  id: string;
  title: string;
  category: "Animes" | "Games" | "Movies & Series" | "Musics" | "Manga & Books" | "Tech & Culture";
  source: string;
  imageUrl: string;
  link: string;
  scoreOrRank: string;
  excerpt: string;
};

const MAIN_DOMAINS = [
  {
    id: "animes",
    title: "Animes Portal",
    subtitle: "Seasonal, Movies & Studios",
    desc: "Explore upcoming seasonal series, theatrical anime movies, studio release schedules, and MyAnimeList/AniList global top charts.",
    icon: <FiFilm style={{ color: "#f06a11", fontSize: "1.6rem" }} />,
    link: "/animes",
    badge: "Jikan, AniList & Kitsu APIs",
    image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    tags: ["Seasonal Airing", "Movies & OVAs", "Studio Production"],
  },
  {
    id: "games",
    title: "Games & Real Sports",
    subtitle: "AAA, Esports & Athletics",
    desc: "Discover AAA video games, esports tournaments, gacha expansions, and real-world international sports leagues.",
    icon: <FaGamepad style={{ color: "#3b82f6", fontSize: "1.6rem" }} />,
    link: "/games",
    badge: "FreeToGame & TheSportsDB",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    tags: ["Real Sports", "Esports", "RPG & Console"],
  },
  {
    id: "movies",
    title: "Movies & Series",
    subtitle: "Cinema, Adapts & Streaming",
    desc: "Track live-action adaptations, Hollywood blockbusters, international TV series, and flagship streaming originals.",
    icon: <FiTv style={{ color: "#a855f7", fontSize: "1.6rem" }} />,
    link: "/movies-series",
    badge: "TVmaze Open Cinema API",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    tags: ["Live Action", "Hollywood", "Streaming"],
  },
  {
    id: "musics",
    title: "Musics & Billboard",
    subtitle: "Billboard 100 & J-Pop",
    desc: "Listen to live Billboard Hot 100 chart leaders, J-Pop/K-Pop hit singles, anime OSTs, and world tour announcements.",
    icon: <FiMusic style={{ color: "#ec4899", fontSize: "1.6rem" }} />,
    link: "/musics",
    badge: "Billboard Hot 100 RSS API",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    tags: ["Billboard Hot 100", "J-Pop & K-Pop", "Anime OSTs"],
  },
  {
    id: "books",
    title: "Manga & Books",
    subtitle: "Shonen Jump & Novels",
    desc: "Read Shonen Jump chapter updates, Light Novels, Webtoons, and international fantasy fiction literature.",
    icon: <FiBookOpen style={{ color: "#10b981", fontSize: "1.6rem" }} />,
    link: "/books",
    badge: "Open Library & Jikan Manga",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    tags: ["Shonen Jump", "Light Novels", "Webtoons"],
  },
];

const INITIAL_TRENDS: LiveFeedItem[] = [
  {
    id: "home-feed-1",
    title: "Chainsaw Man Movie: Reze Arc Official Theatrical Visual Teaser",
    category: "Animes",
    source: "MyAnimeList / MAPPA",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    link: "/animes",
    scoreOrRank: "★ 8.95",
    excerpt: "MAPPA Studio officially confirms the theatrical movie adaptation of Denji and Reze's high-octane Tokyo battle arc.",
  },
  {
    id: "home-feed-2",
    title: "UEFA Champions League Final: Dramatic Extra-Time Stoppage Victory",
    category: "Games",
    source: "TheSportsDB API",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
    link: "/games",
    scoreOrRank: "★ 9.80",
    excerpt: "Europe's premier football club championship delivers a breathtaking 94th-minute winning comeback at the Allianz Arena.",
  },
  {
    id: "home-feed-3",
    title: "#1 Billboard Hot 100 Single: Global Smash Hit Shatters Streaming Record",
    category: "Musics",
    source: "Billboard RSS API",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    link: "/musics",
    scoreOrRank: "#1 Billboard",
    excerpt: "Official chart update confirms the latest global pop collaboration single has broken weekly streaming records in 34 countries.",
  },
  {
    id: "home-feed-4",
    title: "One Piece Live Action Season 2 Wraps Principal Photography",
    category: "Movies & Series",
    source: "TVmaze / Netflix",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    link: "/movies-series",
    scoreOrRank: "★ 8.90",
    excerpt: "Netflix confirms Season 2 completion covering Loguetown, Reverse Mountain, Whiskey Peak, and introducing Tony Tony Chopper.",
  },
];

const WIKI_SPOTLIGHTS = [
  {
    id: "wiki-1",
    title: "The Void Century & Ancient Kingdom Lore",
    category: "One Piece Franchise",
    edits: 1420,
    author: "GrandLine Scholar",
    desc: "Complete chronological timeline analyzing Joy Boy, Ancient Weapons (Pluton, Poseidon, Uranus), and the 800-year void.",
  },
  {
    id: "wiki-2",
    title: "Hashira Breathing Styles & Sun Breathing Lineage",
    category: "Demon Slayer Wiki",
    edits: 980,
    author: "Flame Tsuguko",
    desc: "Comprehensive breakdown of Hinokami Kagura, Flame, Water, Mist, Stone, and Wind breathing forms.",
  },
  {
    id: "wiki-3",
    title: "Night City Corporate Timeline & Relic Tech",
    category: "Cyberpunk Lore",
    edits: 750,
    author: "Netrunner_V",
    desc: "Deep analysis of Arasaka Corporation, Militech wars, Johnny Silverhand's engram, and the Blackwall.",
  },
];

export default function HomePage() {
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>(INITIAL_TRENDS);

  useEffect(() => {
    const fetchHomeFeeds = async () => {
      try {
        const [jikanRes, tvRes, gamesRes, billboardRes] = await Promise.allSettled([
          fetch("https://api.jikan.moe/v4/top/anime?limit=6"),
          fetch("https://api.tvmaze.com/shows?page=1"),
          fetch("https://www.freetogame.com/api/games"),
          fetch("https://itunes.apple.com/us/rss/topsongs/limit=10/json"),
        ]);

        const fetched: LiveFeedItem[] = [];

        if (jikanRes.status === "fulfilled" && jikanRes.value.ok) {
          const data = await jikanRes.value.json();
          if (data.data && Array.isArray(data.data)) {
            data.data.slice(0, 3).forEach((a: any) => {
              fetched.push({
                id: `home-jikan-${a.mal_id}`,
                title: a.title_english || a.title,
                category: "Animes",
                source: "MyAnimeList API",
                imageUrl: a.images?.jpg?.large_image_url || INITIAL_TRENDS[0].imageUrl,
                link: "/animes",
                scoreOrRank: `★ ${a.score || 8.5}`,
                excerpt: a.synopsis ? `${a.synopsis.slice(0, 140)}...` : "Premier anime series featuring high-tier animation.",
              });
            });
          }
        }

        if (tvRes.status === "fulfilled" && tvRes.value.ok) {
          const shows = await tvRes.value.json();
          if (Array.isArray(shows)) {
            shows.slice(0, 3).forEach((s: any) => {
              const cleanSummary = s.summary ? s.summary.replace(/<[^>]+>/g, "") : "";
              fetched.push({
                id: `home-tv-${s.id}`,
                title: s.name,
                category: "Movies & Series",
                source: "TVmaze Cinema API",
                imageUrl: s.image?.original || s.image?.medium || INITIAL_TRENDS[3].imageUrl,
                link: "/movies-series",
                scoreOrRank: `★ ${s.rating?.average || 8.2}`,
                excerpt: cleanSummary ? `${cleanSummary.slice(0, 140)}...` : "International cinema and television series broadcast.",
              });
            });
          }
        }

        if (billboardRes.status === "fulfilled" && billboardRes.value.ok) {
          const data = await billboardRes.value.json();
          const entries = data?.feed?.entry || [];
          entries.slice(0, 2).forEach((song: any, idx: number) => {
            const title = song["im:name"]?.label || "Billboard Single";
            const artist = song["im:artist"]?.label || "Global Artist";
            fetched.push({
              id: `home-bb-${idx}`,
              title: `"#${idx + 1} Billboard Single: ${title}"`,
              category: "Musics",
              source: "Billboard Hot 100 API",
              imageUrl: song["im:image"]?.[2]?.label || INITIAL_TRENDS[2].imageUrl,
              link: "/musics",
              scoreOrRank: `#${idx + 1} Billboard`,
              excerpt: `Global smash hit "${title}" performed by ${artist} leads worldwide charts.`,
            });
          });
        }

        if (fetched.length) {
          setFeedItems((prev) => {
            const existing = new Set(prev.map((f) => f.id));
            const unique = fetched.filter((f) => !existing.has(f.id));
            return [...prev, ...unique];
          });
        }
      } catch {
        // Fallback
      }
    };

    fetchHomeFeeds();
  }, []);

  const filteredFeedItems = feedItems.filter((item) => {
    const passesTab = activeTab === "All" || item.category === activeTab;
    const passesSearch =
      item.title.toLowerCase().includes(globalSearch.trim().toLowerCase()) ||
      item.excerpt.toLowerCase().includes(globalSearch.trim().toLowerCase()) ||
      item.category.toLowerCase().includes(globalSearch.trim().toLowerCase());
    return passesTab && passesSearch;
  });

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* STUNNING HERO SECTION */}
      <section className="workspace-hero-banner relative z-10" style={{ padding: "3.5rem 2.5rem" }}>
        <div className="hero-banner-content" style={{ maxWidth: "750px" }}>
          <div className="auth-badge">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <FiZap style={{ color: "var(--brand)" }} /> Global Entertainment News & Community Wiki Platform
            </span>
          </div>

          <h1 className="hero-banner-title" style={{ fontSize: "2.85rem", lineHeight: 1.15, margin: "1rem 0" }}>
            The Ultimate Hub for <span style={{ color: "var(--brand)" }}>Anime, Games & Pop Culture</span>
          </h1>

          <p className="hero-banner-desc" style={{ fontSize: "1.08rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            Explore real-time worldwide breaking news, community wikis, and multi-source open database feeds across <strong>Animes</strong>, <strong>Games & Real Sports</strong>, <strong>Movies & Series</strong>, <strong>Musics & Billboard</strong>, and <strong>Manga & Books</strong>.
          </p>

          {/* Interactive Global Search Input */}
          <div className="settings-card" style={{ padding: "0.75rem 1rem", marginBottom: "1.75rem", borderRadius: "16px", background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(16px)" }}>
            <div className="settings-field-group" style={{ position: "relative" }}>
              <input
                className="settings-input"
                style={{ paddingLeft: "2.6rem", fontSize: "0.95rem", borderRadius: "12px" }}
                placeholder="Search across all 5 main portals, wikis, and live news feeds..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--brand)", fontSize: "1.1rem" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/news" className="action-button primary" style={{ padding: "0.85rem 1.65rem", fontSize: "0.95rem" }}>
              <FiCompass style={{ marginRight: "6px" }} /> Open News Aggregator
            </Link>
            <Link href="/wiki" className="action-button ghost" style={{ padding: "0.85rem 1.65rem", fontSize: "0.95rem" }}>
              <FiBookOpen style={{ marginRight: "6px" }} /> Launch Wiki Knowledge Vault
            </Link>
          </div>
        </div>

        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Aniverse Ecosystem Assistant"
            className="hero-banner-mascot-img"
            style={{ width: "270px", height: "auto" }}
          />
        </div>
      </section>

      {/* ECOSYSTEM STATS METRIC BAR */}
      <section className="section-block relative z-10" style={{ marginBottom: "2rem" }}>
        <div className="settings-card" style={{ padding: "1.5rem 2rem", borderRadius: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
            <div>
              <span style={{ fontSize: "1.85rem", fontWeight: 900, color: "var(--brand)", display: "block" }}>8+ Live APIs</span>
              <span className="settings-input-helper" style={{ fontSize: "0.82rem" }}>Worldwide Open Public Sources</span>
            </div>
            <div>
              <span style={{ fontSize: "1.85rem", fontWeight: 900, color: "var(--text)", display: "block" }}>5 Dedicated</span>
              <span className="settings-input-helper" style={{ fontSize: "0.82rem" }}>Interactive Domain Portals</span>
            </div>
            <div>
              <span style={{ fontSize: "1.85rem", fontWeight: 900, color: "#fbbf24", display: "block" }}>Billboard & Sports</span>
              <span className="settings-input-helper" style={{ fontSize: "0.82rem" }}>Real-Time Chart & Athletics Feeds</span>
            </div>
            <div>
              <span style={{ fontSize: "1.85rem", fontWeight: 900, color: "#10b981", display: "block" }}>125,000+</span>
              <span className="settings-input-helper" style={{ fontSize: "0.82rem" }}>Community Wiki Contributors</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 MAIN MEDIA DOMAIN HUBS GRID */}
      <section className="section-block relative z-10" style={{ marginBottom: "2.75rem" }}>
        <div className="settings-card" style={{ padding: "1.25rem 1.75rem", borderRadius: "22px", marginBottom: "1.5rem" }}>
          <div className="settings-header-info">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span className="auth-badge" style={{ fontSize: "0.76rem" }}>
                <FiCompass style={{ marginRight: "4px" }} /> Media Domains
              </span>
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text)" }}>
              Dedicated Main Media Domain Portals
            </h2>
            <p className="settings-input-helper" style={{ fontSize: "0.86rem", marginTop: "0.2rem" }}>
              Select any dedicated domain portal to access live APIs, sub-category filters, and detail inspectors.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {MAIN_DOMAINS.map((domain) => (
            <Link
              key={domain.id}
              href={domain.link}
              className="settings-card fade-in-up"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.35rem",
                borderRadius: "22px",
                textDecoration: "none",
                transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <div>
                <div style={{ width: "100%", height: "165px", borderRadius: "16px", overflow: "hidden", marginBottom: "1.1rem", position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={domain.image} alt={domain.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span
                    style={{
                      position: "absolute",
                      top: "0.6rem",
                      right: "0.6rem",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "0.3rem 0.65rem",
                      borderRadius: "8px",
                      background: "rgba(15, 23, 42, 0.85)",
                      backdropFilter: "blur(12px)",
                      color: "var(--brand)",
                      border: "1px solid rgba(240, 106, 17, 0.3)",
                    }}
                  >
                    {domain.badge}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                  {domain.icon}
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>
                      {domain.title}
                    </h3>
                    <span className="settings-input-helper" style={{ fontSize: "0.76rem" }}>{domain.subtitle}</span>
                  </div>
                </div>

                <p className="settings-input-helper" style={{ fontSize: "0.86rem", lineHeight: 1.5, marginBottom: "1.1rem" }}>
                  {domain.desc}
                </p>

                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
                  {domain.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.5rem",
                        borderRadius: "6px",
                        background: "var(--surface-soft)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.85rem", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--brand)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  Launch {domain.title} <FiArrowRight />
                </span>
                <span className="settings-input-helper" style={{ fontSize: "0.76rem" }}>Live Feed Active</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LIVE BREAKING NEWS FEED TICKER */}
      <section className="section-block relative z-10" style={{ marginBottom: "2.75rem" }}>
        <div className="settings-card" style={{ padding: "1.5rem 1.75rem", borderRadius: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiTrendingUp style={{ color: "var(--brand)" }} /> Worldwide Hot News Feed Ticker
              </h3>
              <p className="settings-input-helper" style={{ margin: "0.2rem 0 0", fontSize: "0.82rem" }}>
                Real-time breaking updates aggregated across 8 international API providers.
              </p>
            </div>

            <div className="badge-pill-list" style={{ gap: "0.4rem", margin: 0 }}>
              {["All", "Animes", "Games", "Movies & Series", "Musics"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={activeTab === tab ? "workspace-link-nested active" : "workspace-link-nested"}
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {filteredFeedItems.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={item.link}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1rem",
                  borderRadius: "16px",
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div>
                  <div style={{ width: "100%", height: "145px", borderRadius: "12px", overflow: "hidden", marginBottom: "0.85rem", position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        left: "0.5rem",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "0.25rem 0.55rem",
                        borderRadius: "6px",
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(10px)",
                        color: "var(--brand)",
                      }}
                    >
                      {item.category}
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "0.25rem 0.55rem",
                        borderRadius: "6px",
                        background: "rgba(0, 0, 0, 0.8)",
                        color: "#fbbf24",
                      }}
                    >
                      {item.scoreOrRank}
                    </span>
                  </div>

                  <strong style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.35, marginBottom: "0.4rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.7em" }}>
                    {item.title}
                  </strong>

                  <p className="settings-input-helper" style={{ fontSize: "0.82rem", lineHeight: 1.45, marginBottom: "0.85rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.6em" }}>
                    {item.excerpt}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.6rem", borderTop: "1px solid var(--border)" }}>
                  <span className="settings-input-helper" style={{ fontSize: "0.76rem" }}>
                    Via {item.source}
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand)", display: "flex", alignItems: "center" }}>
                    Read Story <FiChevronRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY WIKI SPOTLIGHT */}
      <section className="section-block relative z-10" style={{ marginBottom: "2.75rem" }}>
        <div className="settings-card" style={{ padding: "1.25rem 1.75rem", borderRadius: "22px", marginBottom: "1.5rem" }}>
          <div className="settings-header-info">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span className="auth-badge" style={{ fontSize: "0.76rem" }}>
                <FiBookOpen style={{ marginRight: "4px" }} /> Knowledge Vault
              </span>
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text)" }}>
              Community Wiki Knowledge Vault
            </h2>
            <p className="settings-input-helper" style={{ fontSize: "0.86rem", marginTop: "0.2rem" }}>
              Collaborative lore articles, character stats, and franchise timelines curated by Otaku editors.
            </p>
          </div>
          <Link href="/wiki" className="action-button ghost small" style={{ padding: "0.55rem 1.1rem", fontSize: "0.86rem" }}>
            Browse All Wiki Entries <FiArrowRight style={{ marginLeft: "4px" }} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "1.5rem" }}>
          {WIKI_SPOTLIGHTS.map((wiki) => (
            <div
              key={wiki.id}
              className="settings-card fade-in-up"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "22px",
                padding: "1.6rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "0.25rem 0.65rem",
                      borderRadius: "8px",
                      background: "rgba(240, 106, 17, 0.12)",
                      color: "var(--brand)",
                      border: "1px solid rgba(240, 106, 17, 0.25)",
                    }}
                  >
                    {wiki.category}
                  </span>
                  <span className="settings-input-helper" style={{ fontSize: "0.76rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <FiClock /> {wiki.edits} Edits
                  </span>
                </div>

                <h3 style={{ fontSize: "1.18rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.35, marginBottom: "0.6rem" }}>
                  {wiki.title}
                </h3>
                <p className="settings-input-helper" style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                  {wiki.desc}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.85rem", borderTop: "1px solid var(--border)" }}>
                <span className="settings-input-helper" style={{ fontSize: "0.78rem" }}>
                  By <strong>{wiki.author}</strong>
                </span>
                <Link
                  href="/wiki"
                  className="action-button ghost small"
                  style={{ fontSize: "0.82rem", padding: "0.45rem 0.95rem", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                >
                  Read Entry <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACCESS VAULT & DASHBOARD TEASER */}
      <section className="section-block relative z-10" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {/* Card 1: Community */}
          <div
            className="settings-card fade-in-up"
            style={{
              borderRadius: "22px",
              padding: "1.85rem 1.6rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(240, 106, 17, 0.12)",
                  border: "1px solid rgba(240, 106, 17, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand)",
                  fontSize: "1.4rem",
                  marginBottom: "1.1rem",
                }}
              >
                <FiMessageSquare />
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>
                Community Lounge & Threads
              </h3>
              <p className="settings-input-helper" style={{ marginBottom: "1.5rem", fontSize: "0.88rem", lineHeight: 1.6 }}>
                Engage in episode discussions, franchise tier lists, and fan theories with fellow Otaku members.
              </p>
            </div>

            <Link
              href="/community"
              className="action-button primary"
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.25rem",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              Enter Community Lounge <FiArrowRight />
            </Link>
          </div>

          {/* Card 2: News Aggregator */}
          <div
            className="settings-card fade-in-up"
            style={{
              borderRadius: "22px",
              padding: "1.85rem 1.6rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3b82f6",
                  fontSize: "1.4rem",
                  marginBottom: "1.1rem",
                }}
              >
                <FiGlobe />
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>
                Worldwide News Aggregator
              </h3>
              <p className="settings-input-helper" style={{ marginBottom: "1.5rem", fontSize: "0.88rem", lineHeight: 1.6 }}>
                Access 8+ international open public API news feeds across all 6 main entertainment categories.
              </p>
            </div>

            <Link
              href="/news"
              className="action-button primary"
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.25rem",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                border: "none",
              }}
            >
              Launch News Portal <FiArrowRight />
            </Link>
          </div>

          {/* Card 3: Dashboard */}
          <div
            className="settings-card fade-in-up"
            style={{
              borderRadius: "22px",
              padding: "1.85rem 1.6rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10b981",
                  fontSize: "1.4rem",
                  marginBottom: "1.1rem",
                }}
              >
                <FiShield />
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>
                Otaku Member Dashboard
              </h3>
              <p className="settings-input-helper" style={{ marginBottom: "1.5rem", fontSize: "0.88rem", lineHeight: 1.6 }}>
                Manage your personal watchlist, bookmark lists, account security, and active sessions.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="action-button primary"
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.25rem",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
              }}
            >
              Go to Dashboard <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
