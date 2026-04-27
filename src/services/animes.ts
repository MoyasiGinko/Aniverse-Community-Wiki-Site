// Jikan API (Unofficial MyAnimeList API)
// Documentation: https://docs.api.jikan.moe/

const BASE_URL = "https://api.jikan.moe/v4";

export async function getTrendingAnimes(page = 1) {
  const res = await fetch(`${BASE_URL}/top/anime?filter=airing&page=${page}&limit=12`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch trending animes");
  return res.json();
}

export async function getPopularAnimes(page = 1) {
  const res = await fetch(`${BASE_URL}/top/anime?filter=bypopularity&page=${page}&limit=12`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch popular animes");
  return res.json();
}

export async function getAnimeDetails(id: string) {
  const res = await fetch(`${BASE_URL}/anime/${id}/full`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch anime details");
  return res.json();
}

export async function searchAnimes(query: string, page = 1) {
  const res = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to search animes");
  return res.json();
}
