"use client";

import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../src/lib/apiClient';

type Thread = { id: string; title: string; body: string; createdAt?: string };
type Comment = { id: string; threadId: string; body: string; createdAt?: string };
type CommunityPanel = 'overview' | 'feed' | 'create' | 'live';

export default function CommunityPage() {
  const [panel, setPanel] = useState<CommunityPanel>('overview');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const loadThreads = async () => {
    const data = await apiRequest<{ threads: Thread[] }>('/api/community/threads');
    setThreads(data.threads);
  };

  const loadComments = async (threadId: string) => {
    const data = await apiRequest<{ comments: Comment[] }>(`/api/community/threads/${threadId}/comments`);
    setComments(data.comments);
  };

  useEffect(() => {
    loadThreads().catch((err) => setError((err as Error).message));
  }, []);

  const createThread = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await apiRequest('/api/community/threads', {
        method: 'POST',
        body: JSON.stringify({ title, body }),
      });
      setTitle('');
      setBody('');
      setPanel('feed');
      setInfo('Thread published successfully.');
      await loadThreads();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const createComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;

    setError('');
    setInfo('');
    try {
      await apiRequest(`/api/community/threads/${activeThread.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody }),
      });
      setCommentBody('');
      setInfo('Comment posted.');
      await loadComments(activeThread.id);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const report = async (type: 'thread' | 'comment', targetId: string) => {
    try {
      await apiRequest('/api/community/reports', {
        method: 'POST',
        body: JSON.stringify({ type, targetId, reason: 'Community guideline violation' }),
      });
      setInfo('Report sent to moderators.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filteredThreads = threads.filter((thread) => {
    const searchIn = `${thread.title} ${thread.body}`.toLowerCase();
    return searchIn.includes(search.trim().toLowerCase());
  });

  const topThread = threads[0] || null;

  const renderPanel = () => {
    if (panel === 'overview') {
      return (
        <section className="section-block portal-card">
          <h2>Community Overview</h2>
          <p className="meta-line">Engagement metrics and conversation health at a glance.</p>
          <div className="stats-grid">
            <div><span>Total Threads</span><strong>{threads.length}</strong></div>
            <div><span>Total Comments</span><strong>{comments.length}</strong></div>
            <div><span>Active Thread</span><strong>{activeThread ? 'Yes' : 'No'}</strong></div>
            <div><span>Average Thread Length</span><strong>{threads.length ? Math.round(threads.reduce((sum, thread) => sum + thread.body.length, 0) / threads.length) : 0}</strong></div>
            <div><span>Filtered Results</span><strong>{filteredThreads.length}</strong></div>
            <div><span>Reports Channel</span><strong>Enabled</strong></div>
          </div>
          {topThread ? (
            <article className="section-block portal-preview">
              <h3>Most Recent Thread</h3>
              <p><strong>{topThread.title}</strong></p>
              <p>{topThread.body.slice(0, 180)}{topThread.body.length > 180 ? '...' : ''}</p>
            </article>
          ) : null}
        </section>
      );
    }

    if (panel === 'feed') {
      return (
        <section className="section-block portal-card list-panel">
          <div className="portal-toolbar">
            <h2>Discussion Feed</h2>
            <div className="portal-toolbar-controls">
              <input
                aria-label="Search threads"
                placeholder="Search threads"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <ul className="thread-list">
            {filteredThreads.length ? filteredThreads.map((thread) => (
              <li key={thread.id} className="thread-row thread-card">
                <div>
                  <h3>{thread.title}</h3>
                  <p>{thread.body.slice(0, 160)}{thread.body.length > 160 ? '...' : ''}</p>
                </div>
                <div className="inline-actions">
                  <button
                    type="button"
                    className="action-button ghost"
                    onClick={() => {
                      setActiveThread(thread);
                      setPanel('live');
                      loadComments(thread.id).catch((err) => setError((err as Error).message));
                    }}
                  >
                    Open
                  </button>
                  <button type="button" onClick={() => report('thread', thread.id)}>Report</button>
                </div>
              </li>
            )) : <li>No threads match the current query.</li>}
          </ul>
        </section>
      );
    }

    if (panel === 'create') {
      return (
        <section className="section-block portal-card">
          <h2>Start a Discussion</h2>
          <p className="meta-line">Kick off high-quality conversations with clear context.</p>
          <form className="feature-form auth-form-grid" onSubmit={createThread}>
            <label htmlFor="thread-title">Thread title</label>
            <input id="thread-title" value={title} onChange={(e) => setTitle(e.target.value)} required />

            <label htmlFor="thread-body">Thread body</label>
            <textarea id="thread-body" value={body} onChange={(e) => setBody(e.target.value)} rows={6} required />

            <button type="submit">Publish Thread</button>
          </form>
        </section>
      );
    }

    return (
      <section className="section-block portal-card list-panel">
        <h2>Live Thread Room</h2>
        {activeThread ? (
          <>
            <article className="section-block portal-preview">
              <h3>{activeThread.title}</h3>
              <p>{activeThread.body}</p>
            </article>

            <form className="feature-form auth-form-grid" onSubmit={createComment}>
              <label htmlFor="comment">Your Reply</label>
              <textarea id="comment" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={4} required />
              <button type="submit">Post Comment</button>
            </form>

            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <span>{comment.body}</span>
                  <button type="button" onClick={() => report('comment', comment.id)}>Report</button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Select a thread in feed to open the live discussion room.</p>
        )}
      </section>
    );
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Community Hub</h1>
        <p>Professional forum experience with structured feed, live threads, and moderation controls.</p>
      </section>

      <section className="workspace-layout portal-layout">
        <aside className="workspace-sidebar section-block">
          <h3>Community Menu</h3>
          <button type="button" className={panel === 'overview' ? 'workspace-link active' : 'workspace-link'} onClick={() => setPanel('overview')}>Overview</button>
          <button type="button" className={panel === 'feed' ? 'workspace-link active' : 'workspace-link'} onClick={() => setPanel('feed')}>Feed</button>
          <button type="button" className={panel === 'create' ? 'workspace-link active' : 'workspace-link'} onClick={() => setPanel('create')}>Start Thread</button>
          <button type="button" className={panel === 'live' ? 'workspace-link active' : 'workspace-link'} onClick={() => setPanel('live')}>Live Thread</button>
        </aside>

        <div className="workspace-content">
          {renderPanel()}
        </div>
      </section>

      {info ? <p>{info}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
