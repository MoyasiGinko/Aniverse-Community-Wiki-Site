"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";

type ThreadComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName?: string;
  parentCommentId?: string | null;
  replyCount?: number;
  userVote?: 1 | -1 | 0;
  stats?: {
    upvotes: number;
    downvotes: number;
  };
};

function ReplyIcon({ kind }: { kind: "up" | "down" | "reply" | "menu" }) {
  if (kind === "up") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path d="M12 5l6.5 8h-4.2V19H9.7v-6H5.5L12 5z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "down") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path d="M12 19l-6.5-8h4.2V5h4.6v6h4.2L12 19z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "reply") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="community-stat-icon"
      >
        <path
          d="M10 8l-6 4 6 4v-3h3.5A4.5 4.5 0 0118 17.5V19a6 6 0 00-6-6H10V8z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="community-stat-icon">
      <circle cx="6" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="18" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

function toTree<T extends { id: string; parentCommentId?: string | null }>(
  items: T[],
) {
  const byParent = new Map<string, T[]>();
  for (const item of items) {
    const key = item.parentCommentId || "root";
    byParent.set(key, [...(byParent.get(key) || []), item]);
  }
  return byParent;
}

function formatTimeAgo(value: string) {
  const date = new Date(value);
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export default function ThreadRepliesPanel({ threadId }: { threadId: string }) {
  const [comments, setComments] = useState<ThreadComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [openMenuCommentId, setOpenMenuCommentId] = useState<string | null>(
    null,
  );
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ comments: ThreadComment[] }>(
        `/api/community/threads/${threadId}/comments`,
      );
      setComments(data.comments || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [threadId]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuCommentId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const getReplyCount = (commentId: string) =>
    comments.filter((item) => item.parentCommentId === commentId).length;

  const updateCommentState = (
    commentId: string,
    updater: (entry: ThreadComment) => ThreadComment,
  ) => {
    setComments((current) =>
      current.map((entry) => (entry.id === commentId ? updater(entry) : entry)),
    );
  };

  const postComment = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      await apiRequest(`/api/community/threads/${threadId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: commentBody, parentCommentId: null }),
      });
      setCommentBody("");
      setShowCommentForm(false);
      setInfo("Reply posted.");
      await loadComments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const postNestedReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyToCommentId) {
      return;
    }

    setError("");
    setInfo("");

    try {
      await apiRequest(`/api/community/threads/${threadId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          body: replyBody,
          parentCommentId: replyToCommentId,
        }),
      });
      setReplyBody("");
      setReplyToCommentId(null);
      setInfo("Nested reply posted.");
      await loadComments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleVote = async (comment: ThreadComment, value: 1 | -1) => {
    const previousVote = comment.userVote || 0;
    const nextVote = previousVote === value ? 0 : value;
    const previousStats = comment.stats || { upvotes: 0, downvotes: 0 };

    const upDelta = (nextVote === 1 ? 1 : 0) - (previousVote === 1 ? 1 : 0);
    const downDelta = (nextVote === -1 ? 1 : 0) - (previousVote === -1 ? 1 : 0);

    updateCommentState(comment.id, (entry) => ({
      ...entry,
      userVote: nextVote,
      stats: {
        upvotes: Math.max(0, (entry.stats?.upvotes || 0) + upDelta),
        downvotes: Math.max(0, (entry.stats?.downvotes || 0) + downDelta),
      },
    }));

    try {
      if (nextVote === 0) {
        await apiRequest(
          `/api/community/threads/${threadId}/comments/${comment.id}/vote`,
          { method: "DELETE" },
        );
      } else {
        await apiRequest(
          `/api/community/threads/${threadId}/comments/${comment.id}/vote`,
          {
            method: "POST",
            body: JSON.stringify({ value: nextVote }),
          },
        );
      }
    } catch (err) {
      updateCommentState(comment.id, (entry) => ({
        ...entry,
        userVote: previousVote,
        stats: previousStats,
      }));
      setError((err as Error).message);
    }
  };

  const reportComment = async (commentId: string) => {
    const reason =
      window.prompt("Report reason", "Inappropriate content") || "";
    if (!reason.trim()) {
      return;
    }

    try {
      await apiRequest("/api/community/reports", {
        method: "POST",
        body: JSON.stringify({
          type: "comment",
          targetId: commentId,
          reason: reason.trim(),
        }),
      });
      setInfo("Comment reported.");
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOpenMenuCommentId(null);
    }
  };

  const commentTree = useMemo(() => toTree(comments), [comments]);

  const renderNode = (parentId: string | null, depth = 0): JSX.Element[] => {
    const key = parentId || "root";
    const items = commentTree.get(key) || [];

    return items.map((comment) => {
      const childNodes = renderNode(comment.id, depth + 1);

      return (
        <li
          key={comment.id}
          className={`wiki-comment-node fade-in-up depth-${depth}`}
        >
          <div className="wiki-comment-card">
            <header className="wiki-comment-header">
              <div className="wiki-avatar">
                {(comment.authorName || "M")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <strong>{comment.authorName || "Member"}</strong>
                <span className="meta-line">
                  {" "}
                  • {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              <div
                className="community-thread-menu-wrap"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="community-thread-menu-button"
                  aria-label="Reply options"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenuCommentId((current) =>
                      current === comment.id ? null : comment.id,
                    );
                  }}
                >
                  <span
                    className="community-thread-menu-dots"
                    aria-hidden="true"
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </button>
                {openMenuCommentId === comment.id ? (
                  <div className="community-thread-menu-dropdown" role="menu">
                    <button
                      type="button"
                      onClick={() => reportComment(comment.id)}
                    >
                      Report
                    </button>
                  </div>
                ) : null}
              </div>
            </header>
            <div className="wiki-comment-body">
              <p>{comment.body}</p>
            </div>
            <div className="wiki-comment-actions">
              <button
                type="button"
                className={`community-thread-stat ${comment.userVote === 1 ? "is-active" : ""}`}
                aria-label={`Upvote reply (${comment.stats?.upvotes || 0} upvotes)`}
                onClick={() => toggleVote(comment, 1)}
              >
                <ReplyIcon kind="up" />
                <span>{comment.stats?.upvotes || 0}</span>
              </button>
              <button
                type="button"
                className={`community-thread-stat ${comment.userVote === -1 ? "is-active" : ""}`}
                aria-label={`Downvote reply (${comment.stats?.downvotes || 0} downvotes)`}
                onClick={() => toggleVote(comment, -1)}
              >
                <ReplyIcon kind="down" />
                <span>{comment.stats?.downvotes || 0}</span>
              </button>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setReplyToCommentId(comment.id)}
              >
                <ReplyIcon kind="reply" />
                Reply
              </button>
              <span className="meta-line">
                {comment.replyCount ?? getReplyCount(comment.id)} replies
              </span>
            </div>
          </div>

          {replyToCommentId === comment.id ? (
            <form
              className="feature-form auth-form-grid fade-in-up wiki-reply-form"
              onSubmit={postNestedReply}
            >
              <label htmlFor={`thread-reply-${comment.id}`}>
                Replying to {comment.authorName || "Member"}
              </label>
              <textarea
                id={`thread-reply-${comment.id}`}
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                rows={3}
                required
                placeholder="Post your nested reply..."
              />
              <div className="inline-actions">
                <button type="submit">Post Reply</button>
                <button
                  type="button"
                  className="action-button ghost"
                  onClick={() => {
                    setReplyToCommentId(null);
                    setReplyBody("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {childNodes.length ? (
            <ul className="wiki-reply-thread">{childNodes}</ul>
          ) : null}
        </li>
      );
    });
  };

  return (
    <section
      id="thread-replies"
      className="section-block fade-in-up"
      style={{ marginTop: "1.2rem" }}
    >
      <div className="portal-toolbar" style={{ marginBottom: "1rem" }}>
        <h3>Thread Replies</h3>
        {!showCommentForm ? (
          <button
            type="button"
            className="action-button ghost"
            onClick={() => setShowCommentForm(true)}
          >
            Add Reply
          </button>
        ) : null}
      </div>

      {error ? <p className="error-text fade-in-up">{error}</p> : null}
      {info ? (
        <p
          className="success-text fade-in-up"
          style={{ color: "var(--brand)", marginBottom: "1rem" }}
        >
          {info}
        </p>
      ) : null}

      {showCommentForm ? (
        <form
          className="feature-form auth-form-grid fade-in-up"
          onSubmit={postComment}
          style={{ marginBottom: "1rem" }}
        >
          <label htmlFor="thread-comment-root">Write your reply</label>
          <textarea
            id="thread-comment-root"
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            rows={4}
            required
            placeholder="Join the discussion..."
          />
          <div className="inline-actions">
            <button type="submit">Post Reply</button>
            <button
              type="button"
              className="action-button ghost"
              onClick={() => setShowCommentForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="wiki-skeleton" style={{ height: "80px" }}></div>
      ) : (
        <ul
          style={{
            display: "grid",
            gap: "0.8rem",
            listStyle: "none",
            paddingLeft: 0,
          }}
        >
          {comments.length ? (
            renderNode(null)
          ) : (
            <li className="meta-line">No replies yet. Start the thread.</li>
          )}
        </ul>
      )}
    </section>
  );
}
