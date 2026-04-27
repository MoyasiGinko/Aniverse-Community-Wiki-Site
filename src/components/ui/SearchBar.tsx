"use client";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`${basePath}/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push(basePath);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-lg mb-8">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full bg-white/5 border border-white/20 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400 backdrop-blur-md"
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}
