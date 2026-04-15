"use client";

import { FormEvent, useState } from 'react';
import { apiRequest } from '../../../src/lib/apiClient';

type MalAnime = {
  malId: number;
  title: string;
  imageUrl: string;
  type?: string;
  year?: number | null;
  episodes?: number | null;
};

export default function WikiCreateForm({ onCreated }: { onCreated: () => void }) {
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
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
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
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-block fade-in-up">
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

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Article'}
        </button>
      </form>
      {info ? <p className="success-text fade-in-up" style={{ marginTop: '1rem', color: 'var(--brand)' }}>{info}</p> : null}
      {error ? <p className="error-text fade-in-up" style={{ marginTop: '1rem' }}>{error}</p> : null}
    </section>
  );
}
