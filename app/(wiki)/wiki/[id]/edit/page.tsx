"use client";

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/src/lib/apiClient';

type Entry = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: string;
  malAnimeId?: number | null;
  malAnimeTitle?: string;
  coverImageUrl?: string;
  extraImageUrls?: string[];
  revision: number;
};

type MalAnime = {
  malId: number;
  title: string;
  imageUrl: string;
  type?: string;
  year?: number | null;
};

export default function WikiEntryEditPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [extraImageUrls, setExtraImageUrls] = useState('');
  const [animeQuery, setAnimeQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<MalAnime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<MalAnime | null>(null);
  const [searchingAnime, setSearchingAnime] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = async () => {
    const data = await apiRequest<{ entry: Entry }>(`/api/wiki/${params.id}`);
    setEntry(data.entry);
    setTitle(data.entry.title);
    setBody(data.entry.body);
    setTags(data.entry.tags.join(', '));
    setStatus(data.entry.status);
    setExtraImageUrls((data.entry.extraImageUrls || []).join('\n'));
    if (data.entry.malAnimeId && data.entry.malAnimeTitle) {
      setSelectedAnime({
        malId: data.entry.malAnimeId,
        title: data.entry.malAnimeTitle,
        imageUrl: data.entry.coverImageUrl || '',
      });
    }
  };

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, [params.id]);

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

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');

    try {
      await apiRequest(`/api/wiki/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          body,
          status,
          tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          malAnimeId: selectedAnime?.malId ?? null,
          malAnimeTitle: selectedAnime?.title || '',
          coverImageUrl: selectedAnime?.imageUrl || '',
          extraImageUrls: extraImageUrls.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
        }),
      });
      setInfo('Article revision saved.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="section-header">
        <h1>Edit Wiki Article</h1>
        <p>Dedicated editor workspace for article updates and publishing control.</p>
      </section>

      {entry ? (
        <section className="workspace-layout">
          <aside className="workspace-sidebar section-block">
            <h3>Editing Target</h3>
            <p><strong>{entry.title}</strong></p>
            <p className="meta-line">Current revision: {entry.revision}</p>
            <p className="meta-line">Current status: {entry.status}</p>
            <Link href={`/wiki/${entry.id}`} className="action-button ghost">Back to Article</Link>
          </aside>

          <div className="workspace-content">
            <section className="section-block portal-card">
              <form className="feature-form auth-form-grid" onSubmit={save}>
                <label htmlFor="title">Title</label>
                <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

                <label htmlFor="body">Body</label>
                <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={12} required />

                <label htmlFor="tags">Tags</label>
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

                <label htmlFor="status">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="flagged">Flagged</option>
                  <option value="archived">Archived</option>
                </select>

                <button type="submit">Save Revision</button>
              </form>
            </section>
          </div>
        </section>
      ) : (
        <p>Loading editor...</p>
      )}

      {info ? <p>{info}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
