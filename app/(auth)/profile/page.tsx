"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/src/lib/apiClient";
import { useAuth } from "@/src/context/AuthContext";
import { useProtectedAuth } from "@/src/hooks/useProtectedAuth";
import ProtectedPageSkeleton from "@/src/components/ProtectedPageSkeleton";

type Profile = {
  id: string;
  email: string;
  username: string;
  role: "user" | "mod" | "admin";
  bio: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    user,
    checking: authChecking,
    accessBlocked,
    requestSignIn,
    handleUnauthorized,
  } = useProtectedAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [watchlist, setWatchlist] = useState<
    Array<{ animeId: string; title: string }>
  >([]);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    const me = await apiRequest<{ profile: Profile }>("/api/profile", {
      suppressAuthPrompt: true,
    });
    setProfile(me.profile);
    const list = await apiRequest<{
      items: Array<{ animeId: string; title: string }>;
    }>("/api/watchlist", {
      suppressAuthPrompt: true,
    });
    setWatchlist(list.items);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (authChecking) {
        return;
      }

      if (accessBlocked || !user) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      setError("");
      try {
        await loadProfileData();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const syncedUser = await handleUnauthorized();

          if (syncedUser) {
            try {
              await loadProfileData();
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
        setDataLoading(false);
      }
    };

    load();
  }, [accessBlocked, authChecking, handleUnauthorized, loadProfileData, user]);

  const onLogout = async () => {
    try {
      await logout();
      router.push("/auth");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (authChecking || dataLoading) {
    return (
      <ProtectedPageSkeleton
        title="Verifying profile access"
        detail="Checking your session and loading profile data before rendering."
      />
    );
  }

  if (accessBlocked) {
    return (
      <main className="feature-page">
        <section className="section-block auth-lock-panel">
          <h1>Profile access required</h1>
          <p>Sign in to view your profile, watchlist, and account settings.</p>
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
        <h1>My Profile</h1>
        <p>Manage account identity and track your watchlist activity.</p>
      </section>
      {profile || user ? (
        <>
          <section className="section-block">
            <p>
              <strong>{(profile || user)?.username}</strong> (
              {(profile || user)?.role})
            </p>
            <p>{(profile || user)?.email}</p>
            <p>{(profile || user)?.bio || "No bio set yet."}</p>
          </section>
          <div className="inline-actions">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/settings?tab=profile">Edit Profile</Link>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </div>

          <section className="section-block list-panel">
            <h2>Watchlist</h2>
            {watchlist.length ? (
              <ul>
                {watchlist.map((item) => (
                  <li key={item.animeId}>{item.title}</li>
                ))}
              </ul>
            ) : (
              <p>Your watchlist is empty.</p>
            )}
          </section>
        </>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
