"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '../../src/lib/apiClient';

type StatsPayload = {
  watchlistCount: number;
  wikiCount: number;
  threadCount: number;
  commentCount: number;
  badges: string[];
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ stats: StatsPayload }>('/api/stats')
      .then((data) => setStats(data.stats))
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Stats and Badges</h1>
        <p>Your activity footprint and progression status.</p>
      </section>
      {stats ? (
        <>
          <ul className="metric-list section-block">
            <li>Watchlist items: {stats.watchlistCount}</li>
            <li>Wiki entries: {stats.wikiCount}</li>
            <li>Threads: {stats.threadCount}</li>
            <li>Comments: {stats.commentCount}</li>
          </ul>
          <h2>Badges</h2>
          <div className="badge-row">
            {stats.badges.length ? stats.badges.map((badge) => (
              <span key={badge} className="badge-pill">{badge}</span>
            )) : <span className="badge-pill">No badges yet</span>}
          </div>
        </>
      ) : (
        <p>Loading stats...</p>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
