"use client";

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../src/lib/apiClient';

type WikiEntry = {
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

type MalAnime = {
  malId: number;
  title: string;
  imageUrl: string;
  type?: string;
  year?: number | null;
  episodes?: number | null;
};

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
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'revision'>('updated');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [extraImageUrls, setExtraImageUrls] = useState('');
  const [animeQuery, setAnimeQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<MalAnime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<MalAnime | null>(null);
  const [searchingAnime, setSearchingAnime] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = async () => {
    const data = await apiRequest<{ entries: WikiEntry[] }>('/api/wiki');
    setEntries(data.entries);
  };

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, []);

  const searchAnime = async () => {
    setError('');
    setSearchingAnime(true);
    try {
      const response = await apiRequest<{ items: MalAnime[] }>(`/api/mal/anime-search?q=${encodeURIComponent(animeQuery)}`);
      setAnimeResults(response.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearchingAnime(false);
    }
  };

  const createEntry = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await apiRequest('/api/wiki', {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
          status: 'draft',
          malAnimeId: selectedAnime?.malId ?? null,
          malAnimeTitle: selectedAnime?.title || '',
          coverImageUrl: selectedAnime?.imageUrl || '',
          extraImageUrls: extraImageUrls.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
        }),
      });
      setTitle('');
      setBody('');
      setTags('');
      setExtraImageUrls('');
      setAnimeQuery('');
      setAnimeResults([]);
      setSelectedAnime(null);
      setInfo('Article created successfully. You can now open it from the article index.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const statusCounts = {
    total: entries.length,
    published: entries.filter((entry) => entry.status === 'published').length,
    draft: entries.filter((entry) => entry.status === 'draft').length,
    flagged: entries.filter((entry) => entry.status === 'flagged').length,
  };

  const filteredEntries = entries.filter((entry) => {
    const passesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const searchIn = `${entry.title} ${entry.body} ${entry.tags.join(' ')}`.toLowerCase();
    const passesQuery = searchIn.includes(query.trim().toLowerCase());
    return passesStatus && passesQuery;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'revision') {
      return b.revision - a.revision;
    }
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });

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
    if (tab === 'featured') {
      return (
        <section className="section-block wiki-featured">
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
        <section className="section-block list-panel">
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
      return (
        <section className="section-block">
          <h2>Create New Article</h2>
          <p className="meta-line">Start a new entry with title, canonical content, and tags.</p>
          <form className="feature-form auth-form-grid" onSubmit={createEntry}>
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

            <label htmlFor="body">Body</label>
            <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={9} required />

            <label htmlFor="tags">Tags (comma-separated)</label>
            <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />

            <label htmlFor="anime-reference">Reference Anime (MAL)</label>
            <div className="wiki-anime-search">
              <input
                id="anime-reference"
                value={animeQuery}
                onChange={(e) => setAnimeQuery(e.target.value)}
                placeholder="Search anime by name"
              />
              <button type="button" className="action-button ghost" onClick={searchAnime} disabled={!animeQuery.trim() || searchingAnime}>
                {searchingAnime ? 'Searching...' : 'Search MAL'}
              </button>
            </div>

            {animeResults.length ? (
              <ul className="wiki-anime-results">
                {animeResults.map((anime) => (
                  <li key={anime.malId}>
                    <button type="button" className="wiki-anime-option" onClick={() => setSelectedAnime(anime)}>
                      {anime.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={anime.imageUrl} alt={anime.title} className="wiki-anime-thumb" />
                      ) : null}
                      <span>{anime.title}</span>
                      <small>{anime.type || 'Anime'} {anime.year ? `(${anime.year})` : ''}</small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {selectedAnime ? (
              <div className="wiki-selected-anime">
                <p>Selected Reference: <strong>{selectedAnime.title}</strong> (MAL: {selectedAnime.malId})</p>
                {selectedAnime.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedAnime.imageUrl} alt={selectedAnime.title} className="wiki-selected-cover" />
                ) : null}
              </div>
            ) : null}

            <label htmlFor="extra-images">Additional Image URLs (one per line or comma separated)</label>
            <textarea
              id="extra-images"
              value={extraImageUrls}
              onChange={(e) => setExtraImageUrls(e.target.value)}
              rows={4}
              placeholder="https://..."
            />

            <button type="submit">Create Article</button>
          </form>
          {info ? <p>{info}</p> : null}
        </section>
      );
    }

    return (
      <>
        <section className="section-block wiki-discovery-bar">
          <h2>Article Index</h2>
          <div className="portal-toolbar-controls">
            <input
              aria-label="Search articles"
              placeholder="Search article title, content, or tags"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="flagged">Flagged</option>
              <option value="archived">Archived</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'updated' | 'title' | 'revision')}>
              <option value="updated">Sort by latest update</option>
              <option value="title">Sort by title</option>
              <option value="revision">Sort by revision</option>
            </select>
          </div>
        </section>

        <section className="section-block list-panel wiki-article-index">
          <h2>Browse All Articles</h2>
          <ul>
            {sortedEntries.length ? sortedEntries.map((entry) => (
              <li key={entry.id} className="wiki-article-row">
                <div className="wiki-article-leading">
                  <div className="wiki-thumb" style={{ background: colorFromTitle(entry.title) }}>
                    {entry.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.coverImageUrl} alt={entry.title} className="wiki-thumb-image" />
                    ) : entry.title.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/wiki/${entry.id}`} className="wiki-article-title">{entry.title}</Link>
                    {entry.malAnimeTitle ? <p className="meta-line">Reference: {entry.malAnimeTitle}</p> : null}
                    <p>{entry.body.slice(0, 180)}{entry.body.length > 180 ? '...' : ''}</p>
                    <div className="pill-list">
                      {entry.tags.slice(0, 5).map((tag) => <span key={tag} className="badge-pill">#{tag}</span>)}
                    </div>
                  </div>
                </div>
                <div className="wiki-article-meta">
                  <span>Status: {entry.status}</span>
                  <span>Revision: {entry.revision}</span>
                  <span>Updated: {(entry.updatedAt || '').slice(0, 10) || 'N/A'}</span>
                </div>
              </li>
            )) : <li>No articles found for the current filter.</li>}
          </ul>
        </section>
      </>
    );
  };

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="section-header">
        <h1>Aniverse Wiki</h1>
        <p>Community encyclopedia with structured articles, categories, and editorial standards.</p>
      </section>

      <section className="wiki-shell">
        <aside className="section-block wiki-sidebar-panel">
          <h3>Browse Wiki</h3>
          <button type="button" className={tab === 'index' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('index')}>Index</button>
          <button type="button" className={tab === 'featured' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('featured')}>Featured</button>
          <button type="button" className={tab === 'recent' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('recent')}>Recent Updates</button>
          <button type="button" className={tab === 'create' ? 'workspace-link active' : 'workspace-link'} onClick={() => setTab('create')}>Create</button>

          <h3>Statistics</h3>
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
        </aside>

        <div className="wiki-main-panel">
          {renderRightPanel()}
        </div>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
