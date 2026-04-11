"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiRequest } from '../../lib/apiClient';

const MyAnimes = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const loadWatchlist = async () => {
    try {
      const data = await apiRequest('/api/watchlist');
      setItems(data.items || []);
    } catch (err) {
      setError((err).message);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleCancelReservation = async (animeId) => {
    try {
      await apiRequest(`/api/watchlist?animeId=${encodeURIComponent(animeId)}`, { method: 'DELETE' });
      await loadWatchlist();
    } catch (err) {
      setError((err).message);
    }
  };

  return (
    <section className="section-block">
      <div className="section-header">
        <h2>Watchlist</h2>
        <p>{items.length} saved titles</p>
      </div>
      {items.length > 0 ? (
        <ul className="media-grid compact">
          {items.map((item) => (
            <li className="media-card" key={item.animeId}>
              <Link href={`/anime/${item.animeId}`}>
                <Image src={item.imageUrl || 'https://cdn.myanimelist.net/images/anime/7/76014.jpg'} alt={item.title} width={220} height={300} />
                <h3>{item.title}</h3>
              </Link>
              <button
                type="button"
                className="anime-cancel-btn"
                onClick={() => handleCancelReservation(item.animeId)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Your watchlist is empty. Explore anime and add your first title.</p>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
};

export default MyAnimes;
