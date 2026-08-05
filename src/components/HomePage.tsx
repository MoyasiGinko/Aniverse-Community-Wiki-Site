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
  FiGlobe,
  FiArrowRight,
  FiCompass,
  FiMessageSquare,
  FiUsers,
  FiChevronRight,
  FiLayers,
  FiGrid,
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
    subtitle: "Seasonal Airing, Movies & Studio Releases",
    link: "/animes",
    image: "/images/animes_portal.gif",
    featured: true,
  },
  {
    id: "games",
    title: "Games & Sports",
    subtitle: "AAA Consoles, Esports & Athletics",
    link: "/games",
    image: "/images/games_portal.gif",
    featured: false,
  },
  {
    id: "movies",
    title: "Movies & Series",
    subtitle: "Cinema, Live-Action & Streaming",
    link: "/movies-series",
    image: "/images/movies_portal.gif",
    featured: false,
  },
  {
    id: "musics",
    title: "Musics & Billboard",
    subtitle: "Billboard Hot 100, J-Pop & OSTs",
    link: "/musics",
    image: "/images/musics_portal.gif",
    featured: false,
  },
  {
    id: "books",
    title: "Manga & Books",
    subtitle: "Shonen Jump, Light Novels & Webtoons",
    link: "/books",
    image: "/images/books_portal.gif",
    featured: false,
  },
];

const INITIAL_TRENDS: LiveFeedItem[] = [
  {
    id: "home-feed-1",
    title: "Chainsaw Man Movie: Reze Arc Official Teaser",
    category: "Animes",
    source: "MAPPA Studio",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    link: "/animes",
    scoreOrRank: "8.95",
    excerpt: "MAPPA Studio officially confirms the theatrical movie adaptation.",
  },
  {
    id: "home-feed-2",
    title: "UEFA Champions League Final: Extra-Time Victory",
    category: "Games",
    source: "Sports Database",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
    link: "/games",
    scoreOrRank: "9.80",
    excerpt: "Europe's premier football club championship delivers a stoppage comeback.",
  },
  {
    id: "home-feed-3",
    title: "Billboard Hot 100 Single Shatters Global Record",
    category: "Musics",
    source: "Billboard Chart",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    link: "/musics",
    scoreOrRank: "#1 Chart",
    excerpt: "Official chart update confirms global single broken streaming records.",
  },
  {
    id: "home-feed-4",
    title: "One Piece Live Action Season 2 Wraps Production",
    category: "Movies & Series",
    source: "Netflix News",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    link: "/movies-series",
    scoreOrRank: "8.90",
    excerpt: "Netflix confirms Season 2 completion covering Loguetown & Chopper.",
  },
];

const WIKI_SPOTLIGHTS = [
  {
    id: "wiki-1",
    title: "The Void Century & Ancient Kingdom Lore",
    category: "One Piece",
    edits: 1420,
    author: "GrandLine Scholar",
  },
  {
    id: "wiki-2",
    title: "Hashira Breathing Styles & Sun Lineage",
    category: "Demon Slayer",
    edits: 980,
    author: "Flame Tsuguko",
  },
  {
    id: "wiki-3",
    title: "Night City Corporate Timeline & Relic Tech",
    category: "Cyberpunk",
    edits: 750,
    author: "Netrunner_V",
  },
];

const COMMUNITY_THREADS = [
  {
    id: "thread-1",
    title: "Solo Leveling Season 2: Will Arise Arc meet animation standards?",
    category: "Anime Discussions",
    replies: 142,
  },
  {
    id: "thread-2",
    title: "GTA VI Trailer 2 breakdown: Hidden easter eggs & Vice City map scale",
    category: "Gaming Lounge",
    replies: 89,
  },
  {
    id: "thread-3",
    title: "Billboard Hot 100 Tier List: Best Pop & J-Pop releases of the year",
    category: "Music & Charts",
    replies: 64,
  },
];

const FEATURES_LIST = [
  {
    icon: <FiGlobe />,
    title: "Live News Aggregator",
    desc: "Real-time updates pulled dynamically from open sources.",
  },
  {
    icon: <FiBookOpen />,
    title: "Collaborative Community Wiki",
    desc: "Franchise lore, character stats, and guides curated by community editors.",
  },
  {
    icon: <FiMessageSquare />,
    title: "Discussion Threads & Forums",
    desc: "Engage in episode discussions, tier lists, and theory crafting.",
  },
  {
    icon: <FiBookmark />,
    title: "Personal Watchlist & Vault",
    desc: "Bookmark stories, wiki pages, and domain entries to your dashboard.",
  },
  {
    icon: <FiTrendingUp />,
    title: "Billboard & Global Charts",
    desc: "Live Billboard Hot 100 rankings and top anime charts.",
  },
  {
    icon: <FiSearch />,
    title: "Unified Cross-Domain Search",
    desc: "Search across all 5 main portals, wikis, and news feeds.",
  },
];

export default function HomePage() {
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [feedItems, setFeedItems] = useState<LiveFeedItem[]>(INITIAL_TRENDS);

  useEffect(() => {
    const fetchHomeFeeds = async () => {
      try {
        const [jikanRes, tvRes, billboardRes] = await Promise.allSettled([
          fetch("https://api.jikan.moe/v4/top/anime?limit=6"),
          fetch("https://api.tvmaze.com/shows?page=1"),
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
                source: "MyAnimeList",
                imageUrl: a.images?.jpg?.large_image_url || INITIAL_TRENDS[0].imageUrl,
                link: "/animes",
                scoreOrRank: `Rating ${a.score || 8.5}`,
                excerpt: a.synopsis ? `${a.synopsis.slice(0, 100)}...` : "Premier anime series.",
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
                source: "TVmaze Cinema",
                imageUrl: s.image?.original || s.image?.medium || INITIAL_TRENDS[3].imageUrl,
                link: "/movies-series",
                scoreOrRank: `Rating ${s.rating?.average || 8.2}`,
                excerpt: cleanSummary ? `${cleanSummary.slice(0, 100)}...` : "International cinema series.",
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
              title: `"${title}" - Billboard Top Single`,
              category: "Musics",
              source: "Billboard Chart",
              imageUrl: song["im:image"]?.[2]?.label || INITIAL_TRENDS[2].imageUrl,
              link: "/musics",
              scoreOrRank: `#${idx + 1} Billboard`,
              excerpt: `Global single "${title}" performed by ${artist}.`,
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
        // Fallback to initial trends
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
    <main className="hp-wrapper">
      {/* 1. HERO SECTION */}
      <section className="hp-hero">
        <div className="hp-hero-glow-1"></div>

        <div className="hp-hero-content">
          <h1 className="hp-hero-title">
            Explore. Discuss. <br />
            Discover <span className="hp-hero-title-accent">Aniverse</span>.
          </h1>

          <p className="hp-hero-desc">
            Your primary hub for pop culture news, collaborative community wikis, live Billboard charts, and multi-domain media discovery.
          </p>

          <div className="hp-hero-actions">
            <Link href="/wiki" className="hp-btn-primary">
              <FiBookOpen /> Explore Wiki
            </Link>
            <Link href="/community" className="hp-btn-secondary">
              <FiMessageSquare /> Join Community
            </Link>
          </div>
        </div>

        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/eye-blink.gif"
            alt="Aniverse Ecosystem Assistant"
            className="hero-banner-mascot-img"
            style={{ width: "380px", height: "auto", objectFit: "contain" }}
          />
        </div>
      </section>

      {/* 2. ECOSYSTEM STATS BAR */}
      <section className="hp-stats-bar">
        <div className="hp-stat-card">
          <div className="hp-stat-icon">
            <FiGlobe />
          </div>
          <div className="hp-stat-info">
            <span className="hp-stat-number">8+ Live APIs</span>
            <span className="hp-stat-label">Data Feeds</span>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-icon">
            <FiGrid />
          </div>
          <div className="hp-stat-info">
            <span className="hp-stat-number">5 Portals</span>
            <span className="hp-stat-label">Media Domains</span>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-icon">
            <FiBookOpen />
          </div>
          <div className="hp-stat-info">
            <span className="hp-stat-number">10,000+</span>
            <span className="hp-stat-label">Wiki Articles</span>
          </div>
        </div>

        <div className="hp-stat-card">
          <div className="hp-stat-icon">
            <FiUsers />
          </div>
          <div className="hp-stat-info">
            <span className="hp-stat-number">125,000+</span>
            <span className="hp-stat-label">Contributors</span>
          </div>
        </div>
      </section>

      {/* 3. CREATIVE BENTO MEDIA DOMAIN PORTALS */}
      <section>
        <div className="hp-section-header">
          <div className="hp-section-title-group">
            <span className="hp-section-badge">
              <FiCompass /> Core Domains
            </span>
            <h2 className="hp-section-title">Media Portals</h2>
          </div>
        </div>

        <div className="hp-bento-grid">
          {MAIN_DOMAINS.map((domain) => (
            <Link
              key={domain.id}
              href={domain.link}
              className={domain.featured ? "hp-bento-card hp-bento-hero" : "hp-bento-card"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={domain.image} alt={domain.title} className="hp-bento-bg" />
              <div className="hp-bento-overlay"></div>

              <div className="hp-bento-content">
                <h3 className="hp-bento-title">{domain.title}</h3>
                <span className="hp-bento-subtitle">{domain.subtitle}</span>
                <div className="hp-bento-action">
                  <span>Explore Portal</span>
                  <FiArrowRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. LIVE TRENDING NEWS SHOWCASE */}
      <section>
        <div className="hp-section-header">
          <div className="hp-section-title-group">
            <span className="hp-section-badge">
              <FiTrendingUp /> News Feed
            </span>
            <h2 className="hp-section-title">Trending Feed</h2>
          </div>

          <div className="hp-tabs-bar">
            {["All", "Animes", "Games", "Movies & Series", "Musics"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "hp-tab-btn active" : "hp-tab-btn"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredFeedItems.length > 0 && (
          <div className="hp-trending-showcase">
            {/* Lead Hero Card */}
            {filteredFeedItems[0] && (
              <Link href={filteredFeedItems[0].link} className="hp-trending-hero-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={filteredFeedItems[0].imageUrl} alt={filteredFeedItems[0].title} className="hp-trending-hero-bg" />
                <div className="hp-trending-overlay"></div>

                <div className="hp-trending-hero-top">
                  <span className="hp-trending-badge-cat">{filteredFeedItems[0].category}</span>
                  {filteredFeedItems[0].scoreOrRank && (
                    <span className="hp-trending-badge-rank">{filteredFeedItems[0].scoreOrRank}</span>
                  )}
                </div>

                <div className="hp-trending-hero-content">
                  <h3 className="hp-trending-hero-title">{filteredFeedItems[0].title}</h3>

                  <div className="hp-trending-hero-footer">
                    <span>Source: {filteredFeedItems[0].source}</span>
                    <div className="hp-trending-hero-action">
                      <span>Read Story</span>
                      <FiArrowRight />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary Stack Grid */}
            <div className="hp-trending-stack">
              {filteredFeedItems.slice(1, 4).map((item) => (
                <Link key={item.id} href={item.link} className="hp-trending-item">
                  <div className="hp-trending-item-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} className="hp-trending-item-img" />
                  </div>

                  <div className="hp-trending-item-info">
                    <div className="hp-trending-item-top">
                      <span className="hp-trending-item-cat">{item.category}</span>
                    </div>

                    <h4 className="hp-trending-item-title">{item.title}</h4>

                    <span className="hp-trending-item-meta">{item.source}</span>
                  </div>

                  <FiChevronRight style={{ color: "var(--brand)", fontSize: "1.2rem", flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. COMMUNITY WIKI SPOTLIGHT */}
      <section>
        <div className="hp-section-header">
          <div className="hp-section-title-group">
            <span className="hp-section-badge">
              <FiBookOpen /> Knowledge Base
            </span>
            <h2 className="hp-section-title">Wiki Spotlight</h2>
          </div>

          <Link href="/wiki" className="hp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            Browse All <FiArrowRight />
          </Link>
        </div>

        <div className="hp-wiki-grid">
          {WIKI_SPOTLIGHTS.map((wiki) => (
            <Link key={wiki.id} href="/wiki" className="hp-wiki-card">
              <div>
                <div className="hp-wiki-top">
                  <span className="hp-wiki-cat">{wiki.category}</span>
                  <span className="hp-wiki-edits">
                    <FiClock /> {wiki.edits} Edits
                  </span>
                </div>

                <h3 className="hp-wiki-title">{wiki.title}</h3>
              </div>

              <div className="hp-wiki-bottom">
                <span className="hp-wiki-author">Curated by <strong>{wiki.author}</strong></span>
                <div className="hp-wiki-action">
                  <span>Read Lore</span>
                  <FiArrowRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. COMMUNITY LOUNGE PREVIEW SPLIT */}
      <section className="hp-community-container">
        <div>
          <span className="hp-section-badge" style={{ color: "var(--brand)", marginBottom: "0.5rem" }}>
            <FiMessageSquare /> Discussions
          </span>
          <h2 style={{ fontSize: "1.85rem", fontWeight: 800, marginBottom: "1.25rem", lineHeight: 1.25 }}>
            Community Lounge
          </h2>

          <div className="hp-thread-list">
            {COMMUNITY_THREADS.map((thread) => (
              <Link key={thread.id} href="/community" className="hp-thread-card">
                <div className="hp-thread-top">
                  <span className="hp-thread-badge">{thread.category}</span>
                  <div className="hp-thread-meta">
                    <span>{thread.replies} Replies</span>
                  </div>
                </div>
                <span className="hp-thread-title">{thread.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="hp-community-callout">
          <div className="hp-feature-icon">
            <FiUsers />
          </div>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Share Your Insights</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Start a discussion thread or contribute to community wiki articles alongside fellow members.
          </p>
          <Link href="/community" className="hp-btn-primary" style={{ textAlign: "center", justifyContent: "center" }}>
            Join Discussion <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* 7. UNIFIED SEARCH BAR SECTION */}
      <section className="hp-search-section">
        <div className="hp-section-title-group" style={{ alignItems: "center" }}>
          <span className="hp-section-badge">
            <FiSearch /> Finder
          </span>
          <h2 className="hp-section-title">Search Aniverse</h2>
        </div>

        <div className="hp-search-input-box">
          <FiSearch style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--brand)", fontSize: "1.2rem" }} />
          <input
            type="text"
            className="hp-search-input"
            placeholder="Search anime, games, Billboard singles, TV series, wiki lore..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

        <div className="hp-search-tags-box">
          <strong>Popular:</strong>
          {["Jujutsu Kaisen", "Elden Ring", "Billboard Hot 100", "One Piece", "GTA VI"].map((tag) => (
            <button
              key={tag}
              type="button"
              className="hp-pill-tag"
              onClick={() => setGlobalSearch(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* 8. FEATURES GRID */}
      <section>
        <div className="hp-section-header" style={{ justifyContent: "center", textAlign: "center" }}>
          <div className="hp-section-title-group" style={{ alignItems: "center" }}>
            <span className="hp-section-badge">
              <FiLayers /> Features
            </span>
            <h2 className="hp-section-title">Platform Overview</h2>
          </div>
        </div>

        <div className="hp-features-grid">
          {FEATURES_LIST.map((feat) => (
            <div key={feat.title} className="hp-feature-card">
              <div className="hp-feature-icon">{feat.icon}</div>
              <h3 className="hp-feature-title">{feat.title}</h3>
              <p className="hp-feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FOOTER CONVERSION CTA BANNER */}
      <section className="hp-cta-banner">
        <h2>Your Fandom Destination</h2>
        <p>
          Explore seasonal anime, contribute to community wiki lore, and participate in global discussions.
        </p>

        <div className="hp-cta-btns">
          <Link href="/dashboard" className="hp-btn-primary">
            <FiUser /> Get Started
          </Link>
          <Link href="/animes" className="hp-btn-secondary">
            <FiCompass /> Browse Portals
          </Link>
        </div>
      </section>
    </main>
  );
}
