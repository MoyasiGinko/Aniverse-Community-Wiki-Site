import { apiRequest } from "@/src/lib/apiClient";

export type WikiEntry = {
  id: string;
  slug: string;
  title: string;
  body: string;
  status: "draft" | "published" | "flagged" | "archived";
  authorId: string;
  coverImageUrl?: string;
  updatedAt: string;
  createdAt: string;
};

export async function fetchWikiEntries(): Promise<WikiEntry[]> {
  const data = await apiRequest<{ entries: WikiEntry[] }>("/api/wiki");
  return data.entries || [];
}

export async function fetchWikiEntryBySlug(slug: string): Promise<WikiEntry | null> {
  const data = await apiRequest<{ entry: WikiEntry }>(`/api/wiki/${slug}`);
  return data.entry || null;
}
