import { getAnimeDetails } from "@/src/services/animes";
import Image from "next/image";

export default async function AnimeDetailsPage({ params }: { params: { id: string } }) {
  const data = await getAnimeDetails(params.id);
  const anime = data.data;

  if (!anime) return <div className="p-8 text-white">Anime not found</div>;

  return (
    <div className="domain-page">
      <div 
        className="domain-hero" 
        style={{ backgroundImage: `url(${anime.images.webp.large_image_url})`, backgroundPosition: 'top' }}
      >
        <div className="domain-hero-content flex flex-col md:flex-row gap-8 items-end w-full">
          <div className="flex-none shadow-2xl relative w-48 h-72 md:w-64 md:h-96 rounded-lg overflow-hidden border-2 border-white/10">
             <Image 
               src={anime.images.webp.large_image_url} 
               alt={anime.title} 
               layout="fill" 
               objectFit="cover" 
             />
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{anime.title_english || anime.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4 text-sm font-medium text-gray-300">
               {anime.score && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">★ {anime.score}</span>}
               {anime.year && <span className="bg-white/10 px-2 py-1 rounded">{anime.year}</span>}
               {anime.episodes && <span className="bg-white/10 px-2 py-1 rounded">{anime.episodes} Episodes</span>}
               <span className="bg-white/10 px-2 py-1 rounded">{anime.status}</span>
            </div>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed">
              {anime.synopsis}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 text-white grid md:grid-cols-3 gap-8">
         <div className="glass-panel p-6 rounded-xl">
           <h3 className="text-xl font-bold mb-4">Information</h3>
           <ul className="space-y-2 text-sm text-gray-300">
             <li><strong>Japanese Title:</strong> {anime.title_japanese}</li>
             <li><strong>Type:</strong> {anime.type}</li>
             <li><strong>Source:</strong> {anime.source}</li>
             <li><strong>Rating:</strong> {anime.rating}</li>
             <li><strong>Genres:</strong> {anime.genres.map((g: any) => g.name).join(", ")}</li>
           </ul>
         </div>

         <div className="md:col-span-2 glass-panel p-6 rounded-xl">
           <h3 className="text-xl font-bold mb-4">Trailer</h3>
           {anime.trailer?.youtube_id ? (
             <div className="aspect-video w-full rounded-lg overflow-hidden">
               <iframe 
                 className="w-full h-full"
                 src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                 title="YouTube video player"
                 frameBorder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               ></iframe>
             </div>
           ) : (
             <p className="text-gray-400">No trailer available.</p>
           )}
         </div>
      </div>
    </div>
  );
}
