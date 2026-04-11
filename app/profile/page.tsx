"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../src/lib/apiClient';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [watchlist, setWatchlist] = useState<Array<{ animeId: string; title: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiRequest<{ profile: Profile }>('/api/profile');
        setProfile(me.profile);
        const list = await apiRequest<{ items: Array<{ animeId: string; title: string }> }>('/api/watchlist');
        setWatchlist(list.items);
      } catch {
        router.push('/auth');
      }
    };

    load();
  }, [router]);

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      router.push('/auth');
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
      {profile ? (
        <>
          <section className="section-block">
            <p><strong>{profile.username}</strong> ({profile.role})</p>
            <p>{profile.email}</p>
            <p>{profile.bio || 'No bio set yet.'}</p>
          </section>
          <div className="inline-actions">
            <Link href="/profile/edit">Edit Profile</Link>
            <button type="button" onClick={logout}>Logout</button>
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
        <p>Loading profile...</p>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
