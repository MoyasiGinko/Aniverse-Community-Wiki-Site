"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../src/lib/apiClient';

type ThreadComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName?: string;
  parentCommentId?: string | null;
};

type CommunityThread = {
  id: string;
  title: string;
  body: string;
};

function toTree<T extends { id: string; parentCommentId?: string | null }>(items: T[]) {
  const byParent = new Map<string, T[]>();
  for (const item of items) {
    const key = item.parentCommentId || 'root';
    byParent.set(key, [...(byParent.get(key) || []), item]);
  }
  return byParent;
}

export default function WikiThreads() {
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [loading, setLoading] = useState(true);

  const [threadTitle, setThreadTitle] = useState('');
  const [threadBody, setThreadBody] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [threadComments, setThreadComments] = useState<ThreadComment[]>([]);
  const [threadCommentBody, setThreadCommentBody] = useState('');
  const [replyToThreadComment, setReplyToThreadComment] = useState<string | null>(null);
  const [threadReplyBody, setThreadReplyBody] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [showCreateThreadForm, setShowCreateThreadForm] = useState(false);

  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const loadThreads = async () => {
    setLoading(true);
    try {
      const { threads } = await apiRequest<{ threads: CommunityThread[] }>('/api/community/threads');
      setThreads(threads || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreadComments = async (threadId: string) => {
    setLoadingComments(true);
    try {
      const data = await apiRequest<{ comments: ThreadComment[] }>(`/api/community/threads/${threadId}/comments`);
      setThreadComments(data.comments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingComments(false);
    }
  };

  const createThread = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      const response = await apiRequest<{ thread: CommunityThread }>('/api/community/threads', {
        method: 'POST',
        body: JSON.stringify({ title: threadTitle, body: threadBody }),
      });
      setThreadTitle('');
      setThreadBody('');
      setInfo('Discussion thread published.');
      setShowCreateThreadForm(false);
      await loadThreads();
      setActiveThreadId(response.thread.id);
      setShowAddCommentForm(false);
      await loadThreadComments(response.thread.id);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postThreadComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeThreadId) {
      return;
    }

    setError('');
    setInfo('');

    try {
      await apiRequest(`/api/community/threads/${activeThreadId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: threadCommentBody, parentCommentId: null }),
      });
      setThreadCommentBody('');
      setShowAddCommentForm(false);
      setInfo('Thread comment added.');
      await loadThreadComments(activeThreadId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postThreadReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !replyToThreadComment) {
      return;
    }

    setError('');
    setInfo('');

    try {
      await apiRequest(`/api/community/threads/${activeThreadId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: threadReplyBody, parentCommentId: replyToThreadComment }),
      });
      setThreadReplyBody('');
      setReplyToThreadComment(null);
      setInfo('Thread reply added.');
      await loadThreadComments(activeThreadId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const threadCommentTree = useMemo(() => toTree(threadComments), [threadComments]);

  const renderThreadCommentNode = (parentId: string | null, depth = 0): JSX.Element[] => {
    const key = parentId || 'root';
    const items = threadCommentTree.get(key) || [];

    return items.map((comment) => (
      <li key={comment.id} className="wiki-comment-row fade-in-up" style={{ marginLeft: `${depth * 14}px` }}>
        <p>{comment.body}</p>
        <div className="inline-actions">
          <span className="meta-line">By {comment.authorName || 'Member'} | {(comment.createdAt || '').slice(0, 16).replace('T', ' ')}</span>
          <button type="button" className="action-button ghost" onClick={() => setReplyToThreadComment(comment.id)}>Reply</button>
        </div>
        {replyToThreadComment === comment.id ? (
          <form className="feature-form auth-form-grid fade-in-up" onSubmit={postThreadReply}>
            <label htmlFor={`thread-reply-${comment.id}`}>Reply</label>
            <textarea id={`thread-reply-${comment.id}`} value={threadReplyBody} onChange={(e) => setThreadReplyBody(e.target.value)} rows={3} required />
            <div className="inline-actions">
              <button type="submit">Post Reply</button>
              <button type="button" className="action-button ghost" onClick={() => { setReplyToThreadComment(null); setThreadReplyBody(''); }}>Cancel</button>
            </div>
          </form>
        ) : null}
        <ul>{renderThreadCommentNode(comment.id, depth + 1)}</ul>
      </li>
    ));
  };


  if (loading) {
    return (
      <div className="fade-in-up">
        <h2>Threads</h2>
        <div className="wiki-skeleton" style={{ height: '240px', marginBottom: '1rem' }} />
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="portal-toolbar" style={{ marginBottom: '1rem' }}>
        <h2>Threads</h2>
        {!showCreateThreadForm ? (
          <button type="button" className="action-button ghost" onClick={() => setShowCreateThreadForm(true)}>Create Thread</button>
        ) : null}
      </div>
      
      {error ? <p className="error-text fade-in-up">{error}</p> : null}
      {info ? <p className="success-text fade-in-up" style={{ color: 'var(--brand)', marginBottom: '1rem' }}>{info}</p> : null}
      
      {showCreateThreadForm ? (
        <form className="feature-form auth-form-grid fade-in-up" onSubmit={createThread} style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="thread-title">Create Thread Title</label>
          <input id="thread-title" value={threadTitle} onChange={(e) => setThreadTitle(e.target.value)} required />
          <label htmlFor="thread-body">Thread Body</label>
          <textarea id="thread-body" value={threadBody} onChange={(e) => setThreadBody(e.target.value)} rows={4} required />
          <div className="inline-actions">
            <button type="submit">Publish Thread</button>
            <button type="button" className="action-button ghost" onClick={() => setShowCreateThreadForm(false)}>Cancel</button>
          </div>
        </form>
      ) : null}

      <ul style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem' }}>
        {threads.length ? threads.map((thread) => (
          <li key={thread.id} className="wiki-comment-row">
            <div className="inline-actions">
              <strong>{thread.title}</strong>
              <button type="button" className="action-button ghost" onClick={() => {
                setActiveThreadId(thread.id);
                setShowAddCommentForm(false);
                loadThreadComments(thread.id);
              }}>
                Open Thread
              </button>
            </div>
            <p>{thread.body.slice(0, 220)}{thread.body.length > 220 ? '...' : ''}</p>
          </li>
        )) : <li className="meta-line">No threads yet.</li>}
      </ul>

      {activeThreadId ? (
        <section className="section-block fade-in-up" style={{ marginTop: '1.5rem' }}>
          <div className="portal-toolbar" style={{ marginBottom: '1rem' }}>
            <h3>Thread Replies</h3>
            {!showAddCommentForm ? (
               <button type="button" className="action-button ghost" onClick={() => setShowAddCommentForm(true)}>Add Reply</button>
            ) : null}
          </div>

          {showAddCommentForm ? (
            <form className="feature-form auth-form-grid fade-in-up" onSubmit={postThreadComment} style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="thread-comment">Write your reply</label>
              <textarea id="thread-comment" value={threadCommentBody} onChange={(e) => setThreadCommentBody(e.target.value)} rows={4} required placeholder="Join the discussion..." />
              <div className="inline-actions">
                <button type="submit">Post Thread Comment</button>
                <button type="button" className="action-button ghost" onClick={() => setShowAddCommentForm(false)}>Cancel</button>
              </div>
            </form>
          ) : null}

          {loadingComments ? (
             <div className="wiki-skeleton fade-in-up" style={{ height: '80px', marginTop: '1rem' }} />
          ) : (
            <ul style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>{renderThreadCommentNode(null)}</ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
