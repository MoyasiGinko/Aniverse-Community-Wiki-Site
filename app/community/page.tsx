"use client";

import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../src/lib/apiClient';

type Thread = { id: string; title: string; body: string };
type Comment = { id: string; threadId: string; body: string };

export default function CommunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [commentBody, setCommentBody] = useState('');
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
    try {
      await apiRequest('/api/community/threads', {
        method: 'POST',
        body: JSON.stringify({ title, body }),
      });
      setTitle('');
      setBody('');
      await loadThreads();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const createComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;

    setError('');
    try {
      await apiRequest(`/api/community/threads/${activeThread.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody }),
      });
      setCommentBody('');
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
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="feature-page">
      <section className="section-header">
        <h1>Community</h1>
        <p>Start discussions, reply, and keep spaces healthy with reports.</p>
      </section>

      <form className="feature-form" onSubmit={createThread}>
        <label htmlFor="thread-title">Thread title</label>
        <input id="thread-title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label htmlFor="thread-body">Thread body</label>
        <textarea id="thread-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} required />

        <button type="submit">Create Thread</button>
      </form>

      <section className="section-block list-panel">
        <h2>Threads</h2>
        <ul className="thread-list">
          {threads.map((thread) => (
            <li key={thread.id} className="thread-row">
              <button
                type="button"
                onClick={() => {
                  setActiveThread(thread);
                  loadComments(thread.id).catch((err) => setError((err as Error).message));
                }}
              >
                {thread.title}
              </button>
              <button type="button" onClick={() => report('thread', thread.id)}>Report</button>
            </li>
          ))}
        </ul>
      </section>

      {activeThread ? (
        <section className="section-block list-panel">
          <h3>{activeThread.title}</h3>
          <p>{activeThread.body}</p>

          <form className="feature-form" onSubmit={createComment}>
            <label htmlFor="comment">Comment</label>
            <textarea id="comment" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={3} required />
            <button type="submit">Post Comment</button>
          </form>

          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id}>
                {comment.body}
                <button type="button" onClick={() => report('comment', comment.id)}>Report</button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}
    </main>
  );
}
