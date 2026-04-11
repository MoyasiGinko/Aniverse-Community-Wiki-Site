"use client";

import dynamic from 'next/dynamic';

const AnimeDetailsPage = dynamic(() => import('../../../../src/components/AnimeDetailsPage'), { ssr: false });

export default function AnimeMoreDetailsRoutePage({ params }: { params: { animeId: string } }) {
  return <AnimeDetailsPage animeId={params.animeId} />;
}
