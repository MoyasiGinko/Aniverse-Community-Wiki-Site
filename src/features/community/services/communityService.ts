import { apiRequest } from "@/src/lib/apiClient";

export type Thread = {
  id: string;
  slug: string;
  title: string;
  body: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  communitySlug?: string | null;
  upvotesCount?: number;
  commentsCount?: number;
  createdAt: string;
};

export async function fetchThreads(communitySlug?: string): Promise<Thread[]> {
  const url = communitySlug
    ? `/api/community/threads?communitySlug=${encodeURIComponent(communitySlug)}`
    : "/api/community/threads";
  const data = await apiRequest<{ threads: Thread[] }>(url);
  return data.threads || [];
}

export async function fetchThreadById(id: string): Promise<Thread | null> {
  const data = await apiRequest<{ thread: Thread }>(`/api/community/threads/${id}`);
  return data.thread || null;
}

export async function voteThread(threadId: string, value: 1 | -1): Promise<void> {
  await apiRequest(`/api/community/threads/${threadId}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}
