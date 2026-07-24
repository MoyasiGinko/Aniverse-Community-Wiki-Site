"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnimeDetails, fetchTopAnime, searchAnime } from "../services/animeService";

export function useTopAnimeQuery() {
  return useQuery({
    queryKey: ["anime", "top"],
    queryFn: fetchTopAnime,
    staleTime: 1000 * 60 * 15, // 15 mins cache
  });
}

export function useAnimeDetailsQuery(id: number) {
  return useQuery({
    queryKey: ["anime", "details", id],
    queryFn: () => fetchAnimeDetails(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30, // 30 mins cache
  });
}

export function useAnimeSearchQuery(query: string) {
  return useQuery({
    queryKey: ["anime", "search", query],
    queryFn: () => searchAnime(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
