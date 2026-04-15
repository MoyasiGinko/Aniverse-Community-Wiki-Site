"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '../../../src/lib/apiClient';
import ProgressiveImage from '../../../src/components/ProgressiveImage';
import WikiComments from '../_components/WikiComments';
import WikiThreads from '../_components/WikiThreads';
import AnimeReferenceCard from '../_components/AnimeReferenceCard';

type Entry = {
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

export default function WikiEntryPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [discussionTab, setDiscussionTab] = useState<'comments' | 'threads'>('comments');

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const entryData = await apiRequest<{ entry: Entry }>(`/api/wiki/${params.id}`);
      setEntry(entryData.entry);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntryData();
  }, [params.id]);

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="section-header fade-in-up">
        <h1>Wiki Article Detail</h1>
        <p>Read complete article details and track referenced anime stats with fluid, modern interactions.</p>
      </section>

      {loading ? (
        <section className="wiki-detail-shell">
          <div className="wiki-skeleton wiki-skeleton-main" />
          <div className="wiki-skeleton wiki-skeleton-side" />
        </section>
      ) : error ? (
        <section className="section-block error-block fade-in-up">
           <h3>Failed to Load Entry</h3>
           <p className="error-text">{error}</p>
           <button type="button" className="action-button" onClick={loadEntryData}>Retry</button>
        </section>
      ) : entry ? (
        <section className="wiki-detail-shell fade-in-up">
          <section className="wiki-detail-left">
            <aside className="section-block">
              <h3>Article Meta</h3>
              <p><strong>{entry.title}</strong></p>
              <p className="meta-line">Slug: {entry.slug}</p>
              <p className="meta-line">Revision: {entry.revision}</p>
              <p className="meta-line">Status: {entry.status}</p>
              <p className="meta-line">Updated: {(entry.updatedAt || '').slice(0, 10) || 'N/A'}</p>
              {entry.malAnimeTitle ? <p className="meta-line">Reference: {entry.malAnimeTitle}</p> : null}
              <div className="pill-list">
                {entry.tags.map((tag) => <span key={tag} className="badge-pill">#{tag}</span>)}
              </div>
              <div className="inline-actions">
                <Link href="/wiki" className="action-button ghost">Back to Index</Link>
                <Link href={`/wiki/${entry.id}/edit`} className="action-button">Edit Article</Link>
              </div>
            </aside>

            <section className="section-block portal-card">
              <h2>{entry.title}</h2>
              <p className="meta-line">This page is the public article view.</p>
              <article className="wiki-detail-body">{entry.body}</article>
            </section>

            <section className="section-block portal-card list-panel">
              <div className="discussion-tabbar">
                <button type="button" className={discussionTab === 'comments' ? 'workspace-link active' : 'workspace-link'} onClick={() => setDiscussionTab('comments')}>Comments</button>
                <button type="button" className={discussionTab === 'threads' ? 'workspace-link active' : 'workspace-link'} onClick={() => setDiscussionTab('threads')}>Threads</button>
              </div>

              {discussionTab === 'comments' ? (
                <WikiComments entryId={entry.id} />
              ) : (
                <WikiThreads />
              )}
            </section>

            {entry.extraImageUrls?.length ? (
              <section className="section-block portal-card">
                <h2>Attachments</h2>
                <div className="wiki-gallery">
                  {entry.extraImageUrls.map((url) => (
                    <ProgressiveImage src={url} key={url} alt="Wiki attachment" className="wiki-gallery-image" />
                  ))}
                </div>
              </section>
            ) : null}
          </section>

          {entry.malAnimeId ? (
            <AnimeReferenceCard malAnimeId={entry.malAnimeId} />
          ) : (
            <aside className="wiki-detail-right section-block fade-in-up">
              <h3>Referenced Anime</h3>
              <p className="meta-line">No MAL reference attached for this article yet.</p>
            </aside>
          )}
        </section>
      ) : null}
    </main>
  );
}
