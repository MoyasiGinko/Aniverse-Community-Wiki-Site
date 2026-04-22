"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TrendingThreads({ limit = 6 }) {
  const [threads, setThreads] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/community/threads?mode=trending&limit=${limit}`,
        );
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        if (mounted) setThreads(data.threads || []);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  if (error) {
    return (
      <aside className="trending-card" aria-live="polite">
        <h3 className="trending-title">Trending threads</h3>
        <div className="trending-error">Failed to load</div>
      </aside>
    );
  }

  return (
    <aside className="trending-card">
      <h3 className="trending-title">Trending threads</h3>
      {!threads ? (
        <div className="trending-loading">Loading…</div>
      ) : (
        <ul className="trending-list">
          {threads.map((t) => (
            <li key={t.id} className="trending-item">
              <div>
                <Link
                  href={`/community/thread/${t.id}`}
                  className="trending-item-link"
                >
                  <div className="trending-item-title">{t.title}</div>
                </Link>
                <div className="trending-item-meta">
                  {t.author?.username || "unknown"} · {t.stats?.comments || 0}{" "}
                  replies
                </div>
              </div>
              <div>
                {t.imageUrls && t.imageUrls[0] ? (
                  <img src={t.imageUrls[0]} alt="" className="trending-thumb" />
                ) : (
                  <div
                    className="trending-thumb trending-thumb-fallback"
                    aria-hidden
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
