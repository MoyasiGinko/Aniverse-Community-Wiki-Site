"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const HomePage = () => {
  const [upcomingAnime, setUpcomingAnime] = useState([]);

  useEffect(() => {
    const fetchUpcomingAnime = async () => {
      try {
        const response = await fetch(
          "https://api.jikan.moe/v4/seasons/upcoming",
        );
        const data = await response.json();
        const upcomingAnimeData = data.data;
        setUpcomingAnime(upcomingAnimeData);
      } catch (error) {
        console.error(
          "An error occurred while fetching upcoming anime:",
          error,
        );
      }
    };

    fetchUpcomingAnime();
  }, []);

  return (
    <main className="home-page">
      <section className="hero-panel">
        <p className="eyebrow">Curated Anime Intelligence</p>
        <h1>
          Track releases, build your watchlist, and contribute to the living
          anime wiki.
        </h1>
        <p>
          Aniverse blends discovery, community, and editorial depth into one
          modern hub for anime enthusiasts.
        </p>
        <div className="hero-actions">
          <Link href="/anime" className="action-button">
            Browse Anime
          </Link>
          <Link href="/wiki" className="action-button ghost">
            Open Wiki
          </Link>
        </div>
      </section>

      <section className="quick-grid">
        <Link href="/genres" className="quick-card">
          <h3>Genre Atlas</h3>
          <p>Explore anime by thematic clusters.</p>
        </Link>
        <Link href="/search" className="quick-card">
          <h3>Deep Search</h3>
          <p>Find titles instantly with responsive search.</p>
        </Link>
        <Link href="/community" className="quick-card">
          <h3>Community Lounge</h3>
          <p>Threads, comments, and moderation tools.</p>
        </Link>
        <Link href="/stats" className="quick-card">
          <h3>Progress & Badges</h3>
          <p>Track your contribution profile and milestones.</p>
        </Link>
      </section>

      <section className="section-block">
        <div className="section-header">
          <h2>Upcoming Radar</h2>
          <Link href="/anime">See all anime</Link>
        </div>
        {upcomingAnime.length > 0 ? (
          <ul className="media-grid">
            {upcomingAnime.slice(0, 12).map((anime, index) => (
              <li className="media-card" key={`${anime.mal_id}-${index}`}>
                <Link href={`/anime/${anime.mal_id}`}>
                  <Image
                    src={anime.images?.jpg?.image_url || ""}
                    alt={anime.title}
                    width={240}
                    height={330}
                  />
                  <h3>{anime.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading upcoming anime...</p>
        )}
      </section>
    </main>
  );
};

export default HomePage;
