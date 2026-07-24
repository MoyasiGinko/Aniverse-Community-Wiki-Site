"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchThreadById, fetchThreads, voteThread } from "../services/communityService";

export function useThreadsQuery(communitySlug?: string) {
  return useQuery({
    queryKey: ["community", "threads", communitySlug || "all"],
    queryFn: () => fetchThreads(communitySlug),
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
}

export function useThreadDetailsQuery(id: string) {
  return useQuery({
    queryKey: ["community", "thread", id],
    queryFn: () => fetchThreadById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVoteThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, value }: { threadId: string; value: 1 | -1 }) =>
      voteThread(threadId, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
      queryClient.invalidateQueries({ queryKey: ["community", "thread", variables.threadId] });
    },
  });
}
