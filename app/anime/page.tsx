"use client";

import dynamic from 'next/dynamic';

const Animes = dynamic(() => import('../../src/components/Animes'), { ssr: false });

export default function AnimePage() {
  return <Animes />;
}
