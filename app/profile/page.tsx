"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../src/lib/apiClient';
import { useAuth } from '../../src/context/AuthContext';

type Profile = {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'mod' | 'admin';
  bio: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, setUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [watchlist, setWatchlist] = useState<Array<{ animeId: string; title: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const active = await refreshUser();
        if (!active) {
          router.push('/auth');
          return;
        }
        const me = await apiRequest<{ profile: Profile }>('/api/profile');
        setProfile(me.profile);
        setUser(me.profile);
        const list = await apiRequest<{ items: Array<{ animeId: string; title: string }> }>('/api/watchlist');
        setWatchlist(list.items);
      } catch {
        router.push('/auth');
      }
    };

    load();
  }, [router, refreshUser, setUser]);

  const onLogout = async () => {
    try {
      await logout();
      router.push('/auth');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>My Profile</h1>
        <p>Manage account identity and track your watchlist activity.</p>
      </section>
      {profile || user ? (
        <>
          <section className="section-block">
            <p><strong>{(profile || user)?.username}</strong> ({(profile || user)?.role})</p>
            <p>{(profile || user)?.email}</p>
            <p>{(profile || user)?.bio || 'No bio set yet.'}</p>
          </section>
          <div className="inline-actions">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/settings?tab=profile">Edit Profile</Link>
            <button type="button" onClick={onLogout}>Logout</button>
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
      ) : (
        <p>{loading ? 'Loading profile...' : 'Preparing profile...'}</p>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
