"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "@/src/lib/apiClient";
import { useProtectedAuth } from "@/src/hooks/useProtectedAuth";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";

type StatsPayload = {
  watchlistCount: number;
  wikiCount: number;
  threadCount: number;
  commentCount: number;
  badges: string[];
};

export default function StatsPage() {
  const {
    user,
    checking: authChecking,
    accessBlocked,
    requestSignIn,
    handleUnauthorized,
  } = useProtectedAuth();
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (authChecking) {
        return;
      }

      if (accessBlocked || !user) {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      setError("");
      try {
        const data = await apiRequest<{ stats: StatsPayload }>("/api/stats", {
          suppressAuthPrompt: true,
        });
        setStats(data.stats);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const syncedUser = await handleUnauthorized();

          if (syncedUser) {
            try {
              const retryData = await apiRequest<{ stats: StatsPayload }>(
                "/api/stats",
                { suppressAuthPrompt: true },
              );
              setStats(retryData.stats);
              return;
            } catch (retryError) {
              if (retryError instanceof ApiError && retryError.status === 401) {
                await handleUnauthorized();
                return;
              }
              setError((retryError as Error).message);
              return;
            }
          }
          return;
        }
        setError((err as Error).message);
      } finally {
        setStatsLoading(false);
      }
    };

    load();
  }, [accessBlocked, authChecking, handleUnauthorized, user]);

  if (authChecking || statsLoading) {
    return (
      <ProtectedPageSkeleton
        title="Verifying stats access"
        detail="Checking your session and loading account statistics."
      />
    );
  }

  if (accessBlocked) {
    return (
      <main className="feature-page">
        <section className="section-block auth-lock-panel">
          <h1>Stats access required</h1>
          <p>Sign in to view your personal activity and badge metrics.</p>
          <div className="inline-actions">
            <button type="button" onClick={requestSignIn} className="nav-cta">
              Open Sign In
            </button>
            <Link href="/auth" className="action-button ghost">
              Go to auth page
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
            {stats.badges.length ? (
              stats.badges.map((badge) => (
                <span key={badge} className="badge-pill">
                  {badge}
                </span>
              ))
            ) : (
              <span className="badge-pill">No badges yet</span>
            )}
          </div>
        </>
      ) : (
        <p>Loading stats...</p>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
