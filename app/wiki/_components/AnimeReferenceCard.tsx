"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../src/lib/apiClient';
import ProgressiveImage from '../../../src/components/ProgressiveImage';

type MalAnimeDetails = {
  malId: number;
  title: string;
  titleEnglish: string;
  synopsis: string;
  imageUrl: string;
  bannerUrl: string;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  episodes: number | null;
  status: string;
  rating: string;
  season: string;
  year: number | null;
  type: string;
  genres: string[];
  studios: string[];
};

export default function AnimeReferenceCard({ malAnimeId }: { malAnimeId: number }) {
  const [anime, setAnime] = useState<MalAnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const mal = await apiRequest<{ anime: MalAnimeDetails }>(`/api/mal/anime/${malAnimeId}`);
        if (active) {
          setAnime(mal.anime);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchAnime();
    return () => {
      active = false;
    };
  }, [malAnimeId]);

  if (loading) {
    return (
      <aside className="wiki-detail-right section-block fade-in-up">
        <h3>Referenced Anime</h3>
        <div className="wiki-skeleton" style={{ height: '180px', marginBottom: '1rem' }} />
        <div className="wiki-skeleton" style={{ height: '24px', width: '80%', marginBottom: '0.5rem' }} />
        <div className="wiki-skeleton" style={{ height: '16px', width: '60%', marginBottom: '1rem' }} />
        <div className="wiki-skeleton" style={{ height: '140px' }} />
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="wiki-detail-right section-block fade-in-up">
        <h3>Referenced Anime</h3>
        <p className="error-text">Failed to load anime metadata: {error}</p>
      </aside>
    );
  }

  if (!anime) {
    return null;
  }

  return (
    <aside className="wiki-detail-right section-block fade-in-up">
      <h3>Referenced Anime</h3>
      {anime.bannerUrl ? (
        <ProgressiveImage src={anime.bannerUrl} alt={anime.title} className="wiki-anime-banner" />
      ) : null}

      <h4>{anime.title}</h4>
      {anime.titleEnglish ? <p className="meta-line">{anime.titleEnglish}</p> : null}
      <ul className="metric-list wiki-anime-metrics">
        <li><strong>{anime.score ?? 'N/A'}</strong><span> Score</span></li>
        <li><strong>{anime.rank ?? 'N/A'}</strong><span> Rank</span></li>
        <li><strong>{anime.popularity ?? 'N/A'}</strong><span> Popularity</span></li>
        <li><strong>{anime.members ?? 'N/A'}</strong><span> Members</span></li>
        <li><strong>{anime.favorites ?? 'N/A'}</strong><span> Favorites</span></li>
        <li><strong>{anime.episodes ?? 'N/A'}</strong><span> Episodes</span></li>
      </ul>

      <p className="meta-line">{anime.type} | {anime.status} {anime.year ? `| ${anime.year}` : ''}</p>
      {anime.genres?.length ? (
        <div className="pill-list">
          {anime.genres.slice(0, 12).map((genre) => <span className="badge-pill" key={genre}>{genre}</span>)}
        </div>
      ) : null}
      {anime.studios?.length ? <p className="meta-line">Studios: {anime.studios.join(', ')}</p> : null}
      {anime.synopsis ? <p className="wiki-full-synopsis">{anime.synopsis}</p> : null}
    </aside>
  );
}
