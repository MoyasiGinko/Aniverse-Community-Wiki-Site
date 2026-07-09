import { searchBooks } from "@/src/services/books";
import Card from "@/src/components/ui/Card";
import SearchBar from "@/src/components/ui/SearchBar";
import Pagination from "@/src/components/ui/Pagination";

export default async function BooksSearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");
  const maxResults = 20;
  const startIndex = (page - 1) * maxResults;

  let books = [];
  let totalItems = 0;

  if (query) {
    const res = await searchBooks(query, startIndex);
    books = res.items || [];
    totalItems = res.totalItems || 0;
  }

  const hasNextPage = (startIndex + maxResults) < totalItems;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Search Books</h1>
      
      <SearchBar basePath="/books" />

      {query ? (
        <>
          <p className="text-gray-400 mb-6 font-medium">Showing results for &quot;{query}&quot;</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {books.map((book: any) => (
              <Card
                key={book.id}
                title={book.volumeInfo.title}
                image={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')}
                link={`/books/${book.id}`}
                rating={book.volumeInfo.averageRating}
                category={book.volumeInfo.authors?.[0]}
              />
            ))}
          </div>
          {books.length === 0 && <p className="text-gray-500">No results found.</p>}
          
          {(page > 1 || hasNextPage) && (
             <Pagination currentPage={page} hasNextPage={hasNextPage} basePath="/books/search" />
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500 text-lg">Type something to search for books.</p>
        </div>
      )}
    </div>
  );
}
