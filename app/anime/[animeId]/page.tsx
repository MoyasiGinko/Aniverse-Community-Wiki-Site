"use client";

import dynamic from 'next/dynamic';

const DetailsPage = dynamic(() => import('../../../src/components/Details'), { ssr: false });

export default function AnimeDetailsRoutePage({ params }: { params: { animeId: string } }) {
  return <DetailsPage animeId={params.animeId} />;
}
