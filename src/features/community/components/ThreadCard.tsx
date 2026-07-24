"use client";

import Link from "next/link";
import { GlassCard, Badge, Button } from "@/src/components/ui";
import { useVoteThreadMutation } from "../hooks/useCommunityQueries";
import type { Thread } from "../services/communityService";

export default function ThreadCard({ thread }: { thread: Thread }) {
  const voteMutation = useVoteThreadMutation();

  const handleVote = (e: React.MouseEvent, value: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    voteMutation.mutate({ threadId: thread.id, value });
  };

  return (
    <GlassCard variant="interactive" className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {thread.communitySlug ? (
            <Badge variant="brand" size="sm">
              c/{thread.communitySlug}
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              General
            </Badge>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            • Posted by {thread.authorName || "Community Member"}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(thread.createdAt).toLocaleDateString()}
        </span>
      </div>

      <Link
        href={
          thread.communitySlug && thread.slug
            ? `/community/${thread.communitySlug}/${thread.slug}`
            : `/community/thread/${thread.id}`
        }
        className="group"
      >
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[var(--brand)] transition-colors">
          {thread.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
          {thread.body}
        </p>
      </Link>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleVote(e, 1)}
            isLoading={voteMutation.isPending}
            className="!px-2.5 !py-1"
          >
            ▲ {thread.upvotesCount || 0}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleVote(e, -1)}
            isLoading={voteMutation.isPending}
            className="!px-2.5 !py-1"
          >
            ▼
          </Button>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          💬 {thread.commentsCount || 0} Comments
        </span>
      </div>
    </GlassCard>
  );
}
