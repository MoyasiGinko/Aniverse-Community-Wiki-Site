import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const malId = Number(id);

  if (!Number.isFinite(malId) || malId <= 0) {
    return NextResponse.json({ error: 'Invalid MAL anime id' }, { status: 400 });
  }

  const target = `https://api.jikan.moe/v4/anime/${malId}/full`;
  const response = await fetch(target, {
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch MAL anime details' }, { status: 502 });
  }

  const payload = await response.json() as {
    data?: {
      mal_id: number;
      title: string;
      title_english?: string;
      synopsis?: string;
      images?: { jpg?: { image_url?: string; large_image_url?: string } };
      trailer?: { images?: { maximum_image_url?: string } };
      score?: number;
      rank?: number;
      popularity?: number;
      members?: number;
      favorites?: number;
      episodes?: number;
      status?: string;
      rating?: string;
      season?: string;
      year?: number;
      genres?: Array<{ name: string }>;
      studios?: Array<{ name: string }>;
      type?: string;
    };
  };

  const anime = payload.data;
  if (!anime) {
    return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
  }

  return NextResponse.json({
    anime: {
      malId: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english || '',
      synopsis: anime.synopsis || '',
      imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
      bannerUrl: anime.trailer?.images?.maximum_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
      score: anime.score || null,
      rank: anime.rank || null,
      popularity: anime.popularity || null,
      members: anime.members || null,
      favorites: anime.favorites || null,
      episodes: anime.episodes || null,
      status: anime.status || '',
      rating: anime.rating || '',
      season: anime.season || '',
      year: anime.year || null,
      type: anime.type || '',
      genres: (anime.genres || []).map((item) => item.name),
      studios: (anime.studios || []).map((item) => item.name),
    },
  });
}
