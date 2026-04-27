import { getBookDetails } from "@/src/services/books";
import Image from "next/image";

export default async function BookDetailsPage({ params }: { params: { id: string } }) {
  const book = await getBookDetails(params.id);

  if (!book) return <div className="p-8 text-white">Book not found</div>;

  const info = book.volumeInfo;

  return (
    <div className="domain-page">
      <div 
        className="domain-hero" 
        style={{ backgroundImage: `url(${info.imageLinks?.extraLarge || info.imageLinks?.thumbnail || ''})`, backgroundPosition: 'top', backgroundSize: 'cover' }}
      >
        <div className="domain-hero-content flex flex-col md:flex-row gap-8 items-end w-full">
          <div className="flex-none shadow-2xl relative w-48 h-72 rounded-lg overflow-hidden border-2 border-white/10">
             <Image 
               src={info.imageLinks?.thumbnail?.replace('http:', 'https:') || "/placeholder.jpg"} 
               alt={info.title} 
               layout="fill" 
               objectFit="cover" 
             />
          </div>
          <div className="flex-1 bg-black/70 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{info.title}</h1>
            {info.subtitle && <h2 className="text-xl text-gray-300 mb-4">{info.subtitle}</h2>}
            <div className="flex flex-wrap gap-2 mb-4 text-sm font-medium text-gray-300">
               {info.averageRating && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">★ {info.averageRating}</span>}
               {info.publishedDate && <span className="bg-white/10 px-2 py-1 rounded">{info.publishedDate}</span>}
               {info.pageCount && <span className="bg-white/10 px-2 py-1 rounded">{info.pageCount} Pages</span>}
            </div>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed line-clamp-4" dangerouslySetInnerHTML={{ __html: info.description || "No description available." }}></p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 text-white grid md:grid-cols-3 gap-8">
         <div className="glass-panel p-6 rounded-xl">
           <h3 className="text-xl font-bold mb-4">Information</h3>
           <ul className="space-y-2 text-sm text-gray-300">
             <li><strong>Authors:</strong> {info.authors?.join(", ")}</li>
             <li><strong>Publisher:</strong> {info.publisher}</li>
             <li><strong>Categories:</strong> {info.categories?.join(", ")}</li>
             <li><strong>Language:</strong> {info.language}</li>
           </ul>
         </div>

         <div className="md:col-span-2 glass-panel p-6 rounded-xl">
           <h3 className="text-xl font-bold mb-4">Preview</h3>
           <div className="flex gap-4">
             <a href={book.accessInfo?.webReaderLink} target="_blank" rel="noreferrer" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition">
               Read Preview
             </a>
             <a href={info.infoLink} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-md font-semibold transition border border-white/20">
               View on Google Books
             </a>
           </div>
         </div>
      </div>
    </div>
  );
}
