import { searchAnimes } from "@/src/services/animes";
import Card from "@/src/components/ui/Card";
import SearchBar from "@/src/components/ui/SearchBar";
import Pagination from "@/src/components/ui/Pagination";

export default async function AnimeSearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");

  let animes = [];
  let hasNextPage = false;

  if (query) {
    const res = await searchAnimes(query, page);
    animes = res.data || [];
    hasNextPage = res.pagination.has_next_page;
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Search Animes</h1>
      
      <SearchBar basePath="/animes" />

      {query ? (
        <>
          <p className="text-gray-400 mb-6 font-medium">Showing results for "{query}"</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {animes.map((anime: any) => (
              <Card
                key={anime.mal_id}
                title={anime.title_english || anime.title}
                image={anime.images.webp.large_image_url}
                link={`/animes/${anime.mal_id}`}
                rating={anime.score}
              />
            ))}
          </div>
          {animes.length === 0 && <p className="text-gray-500">No results found.</p>}
          
          {(page > 1 || hasNextPage) && (
             <Pagination currentPage={page} hasNextPage={hasNextPage} basePath="/animes/search" />
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500 text-lg">Type something to search for animes.</p>
        </div>
      )}
    </div>
  );
}
