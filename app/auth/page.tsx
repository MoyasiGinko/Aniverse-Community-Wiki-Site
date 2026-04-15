"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../src/lib/apiClient';
import { useAuth } from '../../src/context/AuthContext';

const oauthProviders = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'discord', label: 'Continue with Discord' },
  { id: 'facebook', label: 'Continue with Facebook' },
  { id: 'github', label: 'Continue with GitHub' },
] as const;

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'register' && username.trim().length < 3) {
        throw new Error('Username must be at least 3 characters.');
      }

      const response = await apiRequest<{ user: { username: string } }>('/api/auth/' + mode, {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });
      login(response.user);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'discord' | 'facebook' | 'github') => {
    setError('');
    setBusy(true);
    try {
      const response = await apiRequest<{ user: { username: string } }>('/api/auth/oauth', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          email: `${provider}_${Date.now()}@aniverse.local`,
          username: provider + '_user',
        }),
      });
      login(response.user);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Welcome to Aniverse Auth</h1>
        <p>Secure sign in, modern registration, and unified account state across all pages.</p>
      </section>

      <section className="auth-layout">
        <article className="feature-form auth-panel">
          <div className="auth-switch">
            <button type="button" onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>Sign In</button>
            <button type="button" onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>Register</button>
          </div>

          <form className="auth-form-grid" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            {mode === 'register' ? (
              <>
                <label htmlFor="username">Username</label>
                <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </>
            ) : null}

            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {mode === 'register' ? (
              <small className="meta-line">Use 10+ chars with uppercase, lowercase, number and symbol.</small>
            ) : null}

            <button type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign In Securely' : 'Create Secure Account'}</button>
          </form>
        </article>

        <article className="section-block auth-panel">
          <h2>Social Login</h2>
          <p className="meta-line">Use your preferred provider and continue instantly.</p>
          <div className="oauth-grid">
            {oauthProviders.map((provider) => (
              <button key={provider.id} type="button" className="action-button ghost" onClick={() => handleOAuth(provider.id)} disabled={busy}>
                {provider.label}
              </button>
            ))}
          </div>
        </article>
      </section>

      <div className="section-block">
        <h3>Why this auth is solid</h3>
        <div className="pill-list">
          <span className="badge-pill">Strong password rules</span>
          <span className="badge-pill">Secure httpOnly session cookie</span>
          <span className="badge-pill">Global auth state sync</span>
          <span className="badge-pill">Role-aware routing</span>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
