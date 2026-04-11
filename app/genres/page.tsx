"use client";

import dynamic from 'next/dynamic';

const GenreList = dynamic(() => import('../../src/components/Genre'), { ssr: false });

export default function GenresPage() {
  return <GenreList />;
}
