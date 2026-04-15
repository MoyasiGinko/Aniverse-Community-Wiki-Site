"use client";

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '../../../src/lib/apiClient';
import ProgressiveImage from '../../../src/components/ProgressiveImage';

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

type MalAnimeDetails = {
  malId: number;
  title: string;
  titleEnglish: string;
  synopsis: string;
  imageUrl: string;
  bannerUrl: string;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  episodes: number | null;
  status: string;
  rating: string;
  season: string;
  year: number | null;
  type: string;
  genres: string[];
  studios: string[];
};

type CommunityThread = {
  id: string;
  title: string;
  body: string;
};

export default function WikiEntryPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [anime, setAnime] = useState<MalAnimeDetails | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadBody, setThreadBody] = useState('');
  const [discussionTab, setDiscussionTab] = useState<'comments' | 'threads'>('comments');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);

    const [entryData, commentsData, threadsData] = await Promise.all([
      apiRequest<{ entry: Entry }>(`/api/wiki/${params.id}`),
      apiRequest<{ comments: WikiComment[] }>(`/api/wiki/${params.id}/comments`),
      apiRequest<{ threads: CommunityThread[] }>('/api/community/threads'),
    ]);

    setEntry(entryData.entry);
    setComments(commentsData.comments);
    setThreads(threadsData.threads || []);

    if (entryData.entry.malAnimeId) {
      try {
        const mal = await apiRequest<{ anime: MalAnimeDetails }>(`/api/mal/anime/${entryData.entry.malAnimeId}`);
        setAnime(mal.anime);
      } catch {
        setAnime(null);
      }
    } else {
      setAnime(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    load().catch((err) => {
      setError((err as Error).message);
      setLoading(false);
    });
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

  const createThread = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      await apiRequest('/api/community/threads', {
        method: 'POST',
        body: JSON.stringify({ title: threadTitle, body: threadBody }),
      });
      setThreadTitle('');
      setThreadBody('');
      setInfo('Discussion thread published.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const relatedThreads = threads.filter((thread) => {
    if (!entry) {
      return false;
    }
    const needleA = entry.title.toLowerCase();
    const needleB = (entry.malAnimeTitle || '').toLowerCase();
    const hay = `${thread.title} ${thread.body}`.toLowerCase();
    return hay.includes(needleA) || (needleB && hay.includes(needleB));
  }).slice(0, 8);

  return (
    <main className="feature-page wiki-fandom-page">
      <section className="section-header">
        <h1>Wiki Article Detail</h1>
        <p>Read complete article details and track referenced anime stats with fluid, modern interactions.</p>
      </section>

      {loading ? (
        <section className="wiki-detail-shell">
          <div className="wiki-skeleton wiki-skeleton-main" />
          <div className="wiki-skeleton wiki-skeleton-side" />
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
              {entry.coverImageUrl ? (
                <ProgressiveImage src={entry.coverImageUrl} alt={entry.title} className="wiki-detail-cover" />
              ) : null}
              <article className="wiki-detail-body">{entry.body}</article>
              {entry.extraImageUrls?.length ? (
                <div className="wiki-gallery">
                  {entry.extraImageUrls.map((url) => (
                    <ProgressiveImage src={url} key={url} alt="Wiki attachment" className="wiki-gallery-image" />
                  ))}
                </div>
              ) : null}
            </section>

            <section className="section-block portal-card list-panel">
              <div className="discussion-tabbar">
                <button type="button" className={discussionTab === 'comments' ? 'workspace-link active' : 'workspace-link'} onClick={() => setDiscussionTab('comments')}>Comments</button>
                <button type="button" className={discussionTab === 'threads' ? 'workspace-link active' : 'workspace-link'} onClick={() => setDiscussionTab('threads')}>Threads</button>
              </div>

              {discussionTab === 'comments' ? (
                <div className="fade-in-up">
                  <h2>Discussion Comments</h2>
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
                </div>
              ) : (
                <div className="fade-in-up">
                  <h2>Related Threads</h2>
                  <form className="feature-form auth-form-grid" onSubmit={createThread}>
                    <label htmlFor="thread-title">Create Thread Title</label>
                    <input id="thread-title" value={threadTitle} onChange={(e) => setThreadTitle(e.target.value)} required />
                    <label htmlFor="thread-body">Thread Body</label>
                    <textarea id="thread-body" value={threadBody} onChange={(e) => setThreadBody(e.target.value)} rows={4} required />
                    <button type="submit">Create Thread</button>
                  </form>

                  <ul>
                    {relatedThreads.length ? relatedThreads.map((thread) => (
                      <li key={thread.id} className="wiki-comment-row">
                        <strong>{thread.title}</strong>
                        <p>{thread.body.slice(0, 220)}{thread.body.length > 220 ? '...' : ''}</p>
                      </li>
                    )) : <li>No related threads yet.</li>}
                  </ul>
                </div>
              )}
            </section>
          </section>

          <aside className="wiki-detail-right section-block fade-in-up">
            <h3>Referenced Anime</h3>
            {anime ? (
              <>
                {anime.bannerUrl ? (
                  <ProgressiveImage src={anime.bannerUrl} alt={anime.title} className="wiki-anime-banner" />
                ) : null}

                <h4>{anime.title}</h4>
                {anime.titleEnglish ? <p className="meta-line">{anime.titleEnglish}</p> : null}
                <ul className="metric-list wiki-anime-metrics">
                  <li><strong>{anime.score ?? 'N/A'}</strong><span> Score</span></li>
                  <li><strong>{anime.rank ?? 'N/A'}</strong><span> Rank</span></li>
                  <li><strong>{anime.popularity ?? 'N/A'}</strong><span> Popularity</span></li>
                  <li><strong>{anime.members ?? 'N/A'}</strong><span> Members</span></li>
                  <li><strong>{anime.favorites ?? 'N/A'}</strong><span> Favorites</span></li>
                  <li><strong>{anime.episodes ?? 'N/A'}</strong><span> Episodes</span></li>
                </ul>

                <p className="meta-line">{anime.type} | {anime.status} {anime.year ? `| ${anime.year}` : ''}</p>
                {anime.genres?.length ? (
                  <div className="pill-list">
                    {anime.genres.slice(0, 8).map((genre) => <span className="badge-pill" key={genre}>{genre}</span>)}
                  </div>
                ) : null}
                {anime.synopsis ? <p className="meta-line">{anime.synopsis.slice(0, 360)}{anime.synopsis.length > 360 ? '...' : ''}</p> : null}
              </>
            ) : (
              <p className="meta-line">No MAL reference attached for this article yet.</p>
            )}
          </aside>
        </section>
      ) : (
        <p>Loading entry...</p>
      )}

      {info ? <p>{info}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
