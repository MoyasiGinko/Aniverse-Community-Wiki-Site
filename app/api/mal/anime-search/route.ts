import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q')?.trim() || '';

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  const target = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`;
  const response = await fetch(target, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch MAL anime search results' }, { status: 502 });
  }

  const payload = await response.json() as {
    data?: Array<{
      mal_id: number;
      title: string;
      images?: { jpg?: { image_url?: string } };
      type?: string;
      year?: number;
      episodes?: number;
    }>;
  };

  const items = (payload.data || []).map((entry) => ({
    malId: entry.mal_id,
    title: entry.title,
    imageUrl: entry.images?.jpg?.image_url || '',
    type: entry.type || '',
    year: entry.year || null,
    episodes: entry.episodes || null,
  }));

  return NextResponse.json({ items });
}
