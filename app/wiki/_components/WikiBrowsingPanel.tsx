"use client";

import Link from 'next/link';
import { useState } from 'react';

type WikiEntry = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: string;
  malAnimeTitle?: string;
  coverImageUrl?: string;
  revision: number;
  updatedAt?: string;
};

const palette = ['#204b57', '#4a2f6d', '#6a3f1f', '#234f34', '#3d3d7a', '#6a2f52'];

function colorFromTitle(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function WikiBrowsingPanel({ entries }: { entries: WikiEntry[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'revision'>('updated');

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

  return (
    <div className="fade-in-up" style={{ display: 'grid', gap: 'var(--space-3)' }}>
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
    </div>
  );
}
