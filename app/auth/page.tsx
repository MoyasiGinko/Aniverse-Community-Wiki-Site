"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../src/lib/apiClient';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await apiRequest('/api/auth/' + mode, {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleOAuth = async (provider: 'google' | 'discord') => {
    setError('');
    try {
      await apiRequest('/api/auth/oauth', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          email: `${provider}_${Date.now()}@aniverse.local`,
          username: provider + '_user',
        }),
      });
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Account Access</h1>
        <p>Use local login/register or simulated Google/Discord auth for v1 flow.</p>
      </section>

      <div className="auth-switch">
        <button type="button" onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>Login</button>
        <button type="button" onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>Register</button>
      </div>

      <form className="feature-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        {mode === 'register' ? (
          <>
            <label htmlFor="username">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </>
        ) : null}

        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
      </form>

      <div className="oauth-row">
        <button type="button" onClick={() => handleOAuth('google')}>Continue with Google</button>
        <button type="button" onClick={() => handleOAuth('discord')}>Continue with Discord</button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
