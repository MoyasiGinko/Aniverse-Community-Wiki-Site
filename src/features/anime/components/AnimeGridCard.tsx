"use client";

import Link from "next/link";
import { GlassCard, Badge } from "@/src/components/ui";
import ProgressiveImage from "@/src/components/ProgressiveImage";
import type { AnimeItem } from "../services/animeService";

export default function AnimeGridCard({ anime }: { anime: AnimeItem }) {
  return (
    <Link href={`/animes/${anime.mal_id}`} className="block group">
      <GlassCard variant="interactive" className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-xl bg-slate-800">
          <ProgressiveImage
            src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {anime.score ? (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="brand" size="sm">
                ★ {anime.score}
              </Badge>
            </div>
          ) : null}
        </div>
        <div className="p-4 flex flex-col flex-grow justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-[var(--brand)] transition-colors">
            {anime.title}
          </h3>
          {anime.episodes ? (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
              {anime.episodes} Episodes
            </span>
          ) : null}
        </div>
      </GlassCard>
    </Link>
  );
}
