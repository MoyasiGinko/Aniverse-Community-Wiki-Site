// Jikan API (Unofficial MyAnimeList API)
// Documentation: https://docs.api.jikan.moe/

const BASE_URL = "https://api.jikan.moe/v4";

export async function getTrendingAnimes(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/top/anime?filter=airing&page=${page}&limit=12`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`Failed to fetch trending animes: ${res.statusText}`);
      return { data: [] };
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching trending animes:", error);
    return { data: [] };
  }
}

export async function getPopularAnimes(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/top/anime?filter=bypopularity&page=${page}&limit=12`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`Failed to fetch popular animes: ${res.statusText}`);
      return { data: [] };
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching popular animes:", error);
    return { data: [] };
  }
}

export async function getAnimeDetails(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/anime/${id}/full`, { next: { revalidate: 86400 } });
    if (!res.ok) {
      console.error(`Failed to fetch anime details for ${id}: ${res.statusText}`);
      return { data: null };
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching anime details for ${id}:`, error);
    return { data: null };
  }
}

export async function searchAnimes(query: string, page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20`, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to search animes for query "${query}": ${res.statusText}`);
      return { data: [] };
    }
    return await res.json();
  } catch (error) {
    console.error(`Error searching animes for query "${query}":`, error);
    return { data: [] };
  }
}
