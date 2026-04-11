"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../../src/lib/apiClient';

export default function EditProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest<{ profile: { username: string; bio: string; avatarUrl: string } }>('/api/profile');
        setUsername(data.profile.username);
        setBio(data.profile.bio);
        setAvatarUrl(data.profile.avatarUrl);
      } catch {
        router.push('/auth');
      }
    };

    load();
  }, [router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ username, bio, avatarUrl }),
      });
      router.push('/profile');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Edit Profile</h1>
        <p>Keep your identity and profile details up to date.</p>
      </section>
      <form className="feature-form" onSubmit={onSubmit}>
        <label htmlFor="username">Username</label>
        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label htmlFor="avatar">Avatar URL</label>
        <input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />

        <label htmlFor="bio">Bio</label>
        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />

        <button type="submit">Save Profile</button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
