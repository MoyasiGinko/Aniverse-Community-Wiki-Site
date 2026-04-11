"use client";

import dynamic from 'next/dynamic';

const SearchPage = dynamic(() => import('../../src/components/SearchPage'), { ssr: false });

export default function SearchRoutePage() {
  return <SearchPage />;
}
