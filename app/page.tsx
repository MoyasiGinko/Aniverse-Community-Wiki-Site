"use client";

import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('@/src/components/HomePage'), { ssr: false });

export default function Page() {
  return <HomePage />;
}
