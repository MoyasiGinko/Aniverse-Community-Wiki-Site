"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDetails } from '../redux/features/Details/detailsSlice';
import {
  fetchWatchlist,
  reserveAnime,
  cancelReservation,
} from '../redux/features/Animes/animesSlice';

const DetailsPage = ({ animeId }) => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state) => state.details);
  const isReserved = useSelector((state) => state.animes.watchlistIds.includes(String(animeId)));

  useEffect(() => {
    dispatch(fetchWatchlist());
    dispatch(fetchDetails(animeId));
  }, [dispatch, animeId]);

  const handleReserveAnime = () => {
    dispatch(reserveAnime({
      animeId,
      title: data?.title || 'Untitled',
      imageUrl: data?.images?.jpg?.image_url || '',
    }));
  };

  const handleCancelReservation = () => {
    dispatch(cancelReservation(animeId));
  };

  if (isLoading) {
    return <div>Loading anime details...</div>;
  }

  if (error) {
    return (
      <div>
        Error loading anime details:
        {error}
      </div>
    );
  }

  if (!data) {
    return <div>No anime details available</div>;
  }

  const { title, images, synopsis } = data;

  return (
    <main className="page-shell">
      <section className="detail-hero">
        <div className="detail-media">
          <Image src={images?.jpg?.image_url || ''} alt={title} width={320} height={460} />
        </div>
        <div className="detail-copy">
          <h1>{title}</h1>
          <p>{synopsis}</p>
          <div className="inline-actions">
            <Link href={`/anime/${animeId}/details`} className="action-button ghost">Full Details</Link>
            {isReserved ? (
              <button
                type="button"
                className="anime-cancel-btn"
                onClick={handleCancelReservation}
              >
                Remove from Watchlist
              </button>
            ) : (
              <button
                type="button"
                className="anime-reserve-btn"
                onClick={handleReserveAnime}
              >
                Add to Watchlist
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default DetailsPage;
