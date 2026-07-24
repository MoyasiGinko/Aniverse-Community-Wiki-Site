export type AnimeItem = {
  mal_id: number;
  title: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score?: number;
  episodes?: number;
  status?: string;
  synopsis?: string;
  genres?: Array<{ mal_id: number; name: string }>;
};

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

export async function fetchTopAnime(): Promise<AnimeItem[]> {
  try {
    const res = await fetch(`${JIKAN_BASE_URL}/top/anime?limit=12`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchAnimeDetails(id: number): Promise<AnimeItem | null> {
  try {
    const res = await fetch(`${JIKAN_BASE_URL}/anime/${id}/full`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function searchAnime(query: string): Promise<AnimeItem[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=12`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}
