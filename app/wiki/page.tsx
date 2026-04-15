"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../src/lib/apiClient';
import WikiBrowsingPanel from './_components/WikiBrowsingPanel';
import WikiCreateForm from './_components/WikiCreateForm';

export type WikiEntry = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  status: string;
  malAnimeId?: number | null;
  malAnimeTitle?: string;
  coverImageUrl?: string;
  extraImageUrls?: string[];
  revision: number;
  updatedAt?: string;
};

type WikiTab = 'index' | 'featured' | 'recent' | 'create';

const palette = ['#204b57', '#4a2f6d', '#6a3f1f', '#234f34', '#3d3d7a', '#6a2f52'];

function colorFromTitle(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function WikiPage() {
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [tab, setTab] = useState<WikiTab>('index');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ entries: WikiEntry[] }>('/api/wiki');
      setEntries(data.entries);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusCounts = {
    total: entries.length,
    published: entries.filter((entry) => entry.status === 'published').length,
    draft: entries.filter((entry) => entry.status === 'draft').length,
    flagged: entries.filter((entry) => entry.status === 'flagged').length,
  };

  const featuredArticle = entries.find((entry) => entry.status === 'published') || entries[0] || null;
  const recentlyUpdated = [...entries]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 8);

  const trendingTags = Array.from(
    entries
      .flatMap((entry) => entry.tags)
      .reduce((acc, tag) => {
        const key = tag.toLowerCase();
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const renderRightPanel = () => {
    if (loading) {
      return (
        <div className="section-block list-panel fade-in-up">
          <div className="wiki-skeleton" style={{ minHeight: '600px' }} />
        </div>
      );
    }

    if (tab === 'featured') {
      return (
        <section className="section-block wiki-featured fade-in-up">
          <h2>Featured Article</h2>
          {featuredArticle ? (
            <article className="wiki-featured-card">
              <div className="wiki-feature-banner" style={{ background: colorFromTitle(featuredArticle.title) }}>
                {featuredArticle.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featuredArticle.coverImageUrl} alt={featuredArticle.title} className="wiki-banner-image" />
                ) : <span>{featuredArticle.title.slice(0, 1).toUpperCase()}</span>}
              </div>
              <h3>{featuredArticle.title}</h3>
              {featuredArticle.malAnimeTitle ? <p className="meta-line">Referenced Anime: {featuredArticle.malAnimeTitle}</p> : null}
              <p>{featuredArticle.body.slice(0, 460)}{featuredArticle.body.length > 460 ? '...' : ''}</p>
              <div className="pill-list">
                {featuredArticle.tags.map((tag) => <span key={tag} className="badge-pill">#{tag}</span>)}
              </div>
              <div className="inline-actions">
                <Link href={`/wiki/${featuredArticle.id}`} className="action-button">Read Article</Link>
                <span className="meta-line">Status: {featuredArticle.status} | Revision: {featuredArticle.revision}</span>
              </div>
            </article>
          ) : (
            <p>No article is available to feature yet.</p>
          )}
        </section>
      );
    }

    if (tab === 'recent') {
      return (
        <section className="section-block list-panel fade-in-up">
          <h2>Recently Updated</h2>
          <ul>
            {recentlyUpdated.map((entry) => (
              <li key={entry.id} className="wiki-article-row">
                <div>
                  <Link href={`/wiki/${entry.id}`} className="wiki-article-title">{entry.title}</Link>
                  <p>{entry.body.slice(0, 120)}{entry.body.length > 120 ? '...' : ''}</p>
                </div>
                <div className="wiki-article-meta">
                  <span>{entry.status}</span>
                  <span>rev {entry.revision}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    if (tab === 'create') {
      return <WikiCreateForm onCreated={load} />;
    }

    return <WikiBrowsingPanel entries={entries} />;
  };

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="section-header fade-in-up">
        <h1>Aniverse Wiki</h1>
        <p>Community encyclopedia with structured articles, categories, and editorial standards.</p>
      </section>

      <section className="wiki-shell fade-in-up">
        <aside className="section-block wiki-sidebar-panel">
          <h3>Browse Wiki</h3>
          <button type="button" className={tab === 'index' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('index')}>Index</button>
          <button type="button" className={tab === 'featured' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('featured')}>Featured</button>
          <button type="button" className={tab === 'recent' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('recent')}>Recent Updates</button>
          <button type="button" className={tab === 'create' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('create')}>Create</button>

          <h3>Statistics</h3>
          {loading ? (
            <div className="wiki-skeleton" style={{ height: '100px' }} />
          ) : (
            <>
              <ul className="wiki-sidebar-list">
                <li>Total: {statusCounts.total}</li>
                <li>Published: {statusCounts.published}</li>
                <li>Drafts: {statusCounts.draft}</li>
                <li>Flagged: {statusCounts.flagged}</li>
              </ul>

              <h3>Popular Tags</h3>
              <div className="pill-list">
                {trendingTags.slice(0, 6).map(([tag]) => (
                  <span key={tag} className="badge-pill">#{tag}</span>
                ))}
              </div>
            </>
          )}
        </aside>

        <div className="wiki-main-panel">
          {error && !loading ? (
             <div className="section-block error-block fade-in-up">
                <h3>Oops, something went wrong</h3>
                <p>{error}</p>
                <button type="button" className="action-button" onClick={load}>Retry Loading</button>
             </div>
          ) : renderRightPanel()}
        </div>
      </section>
    </main>
  );
}
