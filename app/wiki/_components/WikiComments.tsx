"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../src/lib/apiClient';

type WikiComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName?: string;
  parentCommentId?: string | null;
};

function toTree<T extends { id: string; parentCommentId?: string | null }>(items: T[]) {
  const byParent = new Map<string, T[]>();
  for (const item of items) {
    const key = item.parentCommentId || 'root';
    byParent.set(key, [...(byParent.get(key) || []), item]);
  }
  return byParent;
}

export default function WikiComments({ entryId }: { entryId: string }) {
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [replyToWikiComment, setReplyToWikiComment] = useState<string | null>(null);
  const [wikiReplyBody, setWikiReplyBody] = useState('');
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const loadComments = async () => {
    setLoading(true);
    try {
      const { comments } = await apiRequest<{ comments: WikiComment[] }>(`/api/wiki/${entryId}/comments`);
      setComments(comments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [entryId]);

  const postWikiComment = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      await apiRequest(`/api/wiki/${entryId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody, parentCommentId: null }),
      });
      setCommentBody('');
      setShowAddCommentForm(false);
      setInfo('Comment added.');
      await loadComments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postWikiReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyToWikiComment) {
      return;
    }

    setError('');
    setInfo('');

    try {
      await apiRequest(`/api/wiki/${entryId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: wikiReplyBody, parentCommentId: replyToWikiComment }),
      });
      setWikiReplyBody('');
      setReplyToWikiComment(null);
      setInfo('Reply added.');
      await loadComments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const wikiCommentTree = useMemo(() => toTree(comments), [comments]);

  const renderWikiCommentNode = (parentId: string | null, depth = 0): JSX.Element[] => {
    const key = parentId || 'root';
    const items = wikiCommentTree.get(key) || [];

    return items.map((comment) => {
      const childNodes = renderWikiCommentNode(comment.id, depth + 1);
      return (
        <li key={comment.id} className={`wiki-comment-node fade-in-up depth-${depth}`}>
          <div className="wiki-comment-card">
            <header className="wiki-comment-header">
              <div className="wiki-avatar">{(comment.authorName || 'M')[0].toUpperCase()}</div>
              <div>
                <strong>{comment.authorName || 'Member'}</strong>
                <span className="meta-line"> • {(comment.createdAt || '').slice(0, 16).replace('T', ' ')}</span>
              </div>
            </header>
            <div className="wiki-comment-body">
              <p>{comment.body}</p>
            </div>
            <div className="wiki-comment-actions">
              <button type="button" className="action-button ghost small" onClick={() => setReplyToWikiComment(comment.id)}>Reply</button>
            </div>
          </div>
          
          {replyToWikiComment === comment.id ? (
            <form className="feature-form auth-form-grid fade-in-up wiki-reply-form" onSubmit={postWikiReply}>
              <label htmlFor={`wiki-reply-${comment.id}`}>Replying to {comment.authorName || 'Member'}</label>
              <textarea id={`wiki-reply-${comment.id}`} value={wikiReplyBody} onChange={(e) => setWikiReplyBody(e.target.value)} rows={3} required placeholder="Post your reply..." />
              <div className="inline-actions">
                <button type="submit">Post Reply</button>
                <button type="button" className="action-button ghost" onClick={() => { setReplyToWikiComment(null); setWikiReplyBody(''); }}>Cancel</button>
              </div>
            </form>
          ) : null}

          {childNodes.length > 0 ? (
            <ul className="wiki-reply-thread">{childNodes}</ul>
          ) : null}
        </li>
      );
    });
  };

  if (loading) {
    return (
      <div className="fade-in-up">
        <h2>Discussion Comments</h2>
        <div className="wiki-skeleton" style={{ height: '240px', marginBottom: '1rem' }} />
        <div className="wiki-skeleton" style={{ height: '120px' }} />
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="portal-toolbar" style={{ marginBottom: '1rem' }}>
        <h2>Discussion Comments</h2>
        {!showAddCommentForm ? (
           <button type="button" className="action-button ghost" onClick={() => setShowAddCommentForm(true)}>Add Comment</button>
        ) : null}
      </div>

      {error ? <p className="error-text fade-in-up">{error}</p> : null}
      {info ? <p className="success-text fade-in-up" style={{ color: 'var(--brand)', marginBottom: '1rem' }}>{info}</p> : null}

      {showAddCommentForm ? (
        <form className="feature-form auth-form-grid fade-in-up" onSubmit={postWikiComment} style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="comment">Write your comment</label>
          <textarea id="comment" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={4} required placeholder="Join the discussion..."/>
          <div className="inline-actions">
            <button type="submit">Post Comment</button>
            <button type="button" className="action-button ghost" onClick={() => setShowAddCommentForm(false)}>Cancel</button>
          </div>
        </form>
      ) : null}

      <ul style={{ marginTop: '1rem', display: 'grid', gap: '0.8rem', paddingLeft: 0, listStyle: 'none' }}>{renderWikiCommentNode(null)}</ul>
    </div>
  );
}
