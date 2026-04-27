import { getTrendingBooks, getPopularBooks } from "@/src/services/books";
import Carousel from "@/src/components/ui/Carousel";
import Card from "@/src/components/ui/Card";

export const metadata = {
  title: "Books | Aniverse",
  description: "Discover new and popular books.",
};

export default async function BooksHomepage() {
  const [trendingRes, popularRes] = await Promise.all([
    getTrendingBooks(),
    getPopularBooks()
  ]);

  const trending = trendingRes.items || [];
  const popular = popularRes.items || [];

  const heroBook = trending[0]?.volumeInfo;

  return (
    <div className="domain-page">
      <div 
        className="domain-hero" 
        style={{ backgroundImage: `url(${heroBook?.imageLinks?.extraLarge || heroBook?.imageLinks?.thumbnail || ''})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
      >
        <div className="domain-hero-content p-6 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {heroBook?.title || "Book Universe"}
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg line-clamp-3 mb-6">
            {heroBook?.description || "Explore thousands of books right at your fingertips."}
          </p>
          {trending[0] && (
            <div className="flex gap-4">
              <a href={`/books/${trending[0].id}`} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition">
                Read Details
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <Carousel title="New Releases">
          {trending.map((book: any) => (
            <div key={`trend-${book.id}`} className="flex-none">
              <Card
                title={book.volumeInfo.title}
                image={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')}
                link={`/books/${book.id}`}
                rating={book.volumeInfo.averageRating}
                category={book.volumeInfo.authors?.[0]}
              />
            </div>
          ))}
        </Carousel>

        <Carousel title="Popular Fantasy & Sci-Fi">
          {popular.map((book: any) => (
            <div key={`pop-${book.id}`} className="flex-none">
              <Card
                title={book.volumeInfo.title}
                image={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')}
                link={`/books/${book.id}`}
                rating={book.volumeInfo.averageRating}
                category={book.volumeInfo.authors?.[0]}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
