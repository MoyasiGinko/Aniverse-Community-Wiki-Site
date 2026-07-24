"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWikiEntries, fetchWikiEntryBySlug } from "../services/wikiService";

export function useWikiEntriesQuery() {
  return useQuery({
    queryKey: ["wiki", "entries"],
    queryFn: fetchWikiEntries,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

export function useWikiEntryBySlugQuery(slug: string) {
  return useQuery({
    queryKey: ["wiki", "entry", slug],
    queryFn: () => fetchWikiEntryBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
}
