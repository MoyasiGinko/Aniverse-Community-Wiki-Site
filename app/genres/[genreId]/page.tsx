"use client";

import dynamic from 'next/dynamic';

const GenrePage = dynamic(() => import('../../../src/components/GenrePage'), { ssr: false });

export default function GenreDetailsPage({ params }: { params: { genreId: string } }) {
  return <GenrePage genreId={params.genreId} />;
}
