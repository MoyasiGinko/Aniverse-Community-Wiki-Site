"use client";

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '../../../src/lib/apiClient';

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

type WikiComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName?: string;
};

export default function WikiEntryPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [entryData, commentsData] = await Promise.all([
      apiRequest<{ entry: Entry }>(`/api/wiki/${params.id}`),
      apiRequest<{ comments: WikiComment[] }>(`/api/wiki/${params.id}/comments`),
    ]);

    setEntry(entryData.entry);
    setComments(commentsData.comments);
  };

  useEffect(() => {
    load().catch((err) => setError((err as Error).message));
  }, [params.id]);

  const postComment = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      await apiRequest(`/api/wiki/${params.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody }),
      });
      setCommentBody('');
      setInfo('Comment added.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="section-header">
        <h1>Wiki Article Detail</h1>
        <p>Read complete article details and join discussion. Editing is available in a dedicated editor page.</p>
      </section>
      {entry ? (
        <section className="workspace-layout">
          <aside className="workspace-sidebar section-block">
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
            <Link href="/wiki" className="action-button ghost">Back to Index</Link>
            <Link href={`/wiki/${entry.id}/edit`} className="action-button">Edit Article</Link>
          </aside>

          <div className="workspace-content">
            <section className="section-block portal-card">
              <h2>{entry.title}</h2>
              <p className="meta-line">This page is the public article view.</p>
              {entry.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.coverImageUrl} alt={entry.title} className="wiki-detail-cover" />
              ) : null}
              <article className="wiki-detail-body">
                {entry.body}
              </article>
              {entry.extraImageUrls?.length ? (
                <div className="wiki-gallery">
                  {entry.extraImageUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} key={url} alt="Wiki attachment" className="wiki-gallery-image" />
                  ))}
                </div>
              ) : null}
            </section>

            <section className="section-block portal-card list-panel">
              <h2>Discussion</h2>
              <form className="feature-form auth-form-grid" onSubmit={postComment}>
                <label htmlFor="comment">Add Comment</label>
                <textarea id="comment" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={4} required />
                <button type="submit">Post Comment</button>
              </form>

              <ul>
                {comments.length ? comments.map((comment) => (
                  <li key={comment.id} className="wiki-comment-row">
                    <p>{comment.body}</p>
                    <span className="meta-line">By {comment.authorName || 'Member'} | {(comment.createdAt || '').slice(0, 16).replace('T', ' ')}</span>
                  </li>
                )) : <li>No comments yet.</li>}
              </ul>
            </section>
          </div>
        </section>
      ) : (
        <p>Loading entry...</p>
      )}
      {info ? <p>{info}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
