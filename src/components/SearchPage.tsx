// @ts-nocheck
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AnimeSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]); // Clear search results if search query is empty
      return;
    }

    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
      searchQuery,
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const animeData = data.data;

      setSearchResults(animeData);
    } catch (error) {
      console.error('An error occurred while fetching anime data:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    clearTimeout(typingTimeout); // Clear previous timeout

    const inputValue = e.target.value;
    setSearchQuery(inputValue);

    // Set a timeout for API request after 500ms of inactivity
    const timeout = setTimeout(() => {
      handleSearch();
    }, 500);

    setTypingTimeout(timeout);
  };

  return (
    <main className="page-shell">
      <div className="section-header">
        <h1>Search Anime</h1>
        <p>Find titles instantly and jump into details.</p>
      </div>
      <div className="search-panel">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Search for anime..."
        />
        <button type="button" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="search-results section-block">
        {searchQuery.trim() !== '' && searchResults.length > 0 ? (
          <ul className="media-grid compact">
            {searchResults.map((anime) => (
              <li key={anime.mal_id} className="media-card">
                <Image src={anime.images?.jpg?.image_url || ''} alt={anime.title} width={180} height={260} />
                <h3>
                  <Link href={`/anime/${anime.mal_id}`}>{anime.title}</Link>
                </h3>
              </li>
            ))}
          </ul>
        ) : <p>Start typing to discover anime.</p>}
      </div>
    </main>
  );
};

export default AnimeSearchPage;
