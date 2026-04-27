import { getTrendingAnimes, getPopularAnimes } from "@/src/services/animes";
import Carousel from "@/src/components/ui/Carousel";
import Card from "@/src/components/ui/Card";

export const metadata = {
  title: "Animes | Aniverse",
  description: "Discover trending and popular anime series.",
};

export default async function AnimesHomepage() {
  const [trendingRes, popularRes] = await Promise.all([
    getTrendingAnimes(),
    getPopularAnimes()
  ]);

  const trending = trendingRes.data || [];
  const popular = popularRes.data || [];

  return (
    <div className="domain-page">
      <div 
        className="domain-hero" 
        style={{ backgroundImage: `url(${trending[0]?.images.webp.large_image_url || ''})` }}
      >
        <div className="domain-hero-content">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {trending[0]?.title_english || trending[0]?.title}
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg line-clamp-3 mb-6">
            {trending[0]?.synopsis}
          </p>
          <div className="flex gap-4">
            <a href={`/animes/${trending[0]?.mal_id}`} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition">
              View Details
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <Carousel title="Trending Now">
          {trending.map((anime: any) => (
            <div key={`trend-${anime.mal_id}`} className="flex-none">
              <Card
                title={anime.title_english || anime.title}
                image={anime.images.webp.large_image_url}
                link={`/animes/${anime.mal_id}`}
                rating={anime.score}
                category={anime.genres?.[0]?.name}
              />
            </div>
          ))}
        </Carousel>

        <Carousel title="Highest Rated Popular">
          {popular.map((anime: any) => (
            <div key={`pop-${anime.mal_id}`} className="flex-none">
              <Card
                title={anime.title_english || anime.title}
                image={anime.images.webp.large_image_url}
                link={`/animes/${anime.mal_id}`}
                rating={anime.score}
                category={anime.genres?.[0]?.name}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
