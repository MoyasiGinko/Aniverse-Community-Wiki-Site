"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAnimes,
  fetchWatchlist,
  reserveAnime,
  cancelReservation,
  fetchNextPage,
  fetchPreviousPage,
  fetchFirstPage,
} from '../redux/features/Animes/animesSlice';

const Animes = () => {
  const dispatch = useDispatch();
  const {
    animes, watchlistIds, currentPage, status, error,
  } = useSelector(
    (state) => state.animes,
  );

  useEffect(() => {
    dispatch(fetchAnimes(currentPage));
    dispatch(fetchWatchlist());
  }, [dispatch, currentPage]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return (
      <div>
        Error:
        {error}
      </div>
    );
  }

  const handleReserveAnime = (anime) => {
    dispatch(reserveAnime({
      animeId: anime.mal_id,
      title: anime.title,
      imageUrl: anime.images?.jpg?.image_url,
    }));
  };

  const handleCancelReservation = (animeId) => {
    dispatch(cancelReservation(animeId));
  };

  const getReservationStatus = (animeId) => {
    return watchlistIds.includes(String(animeId));
  };

  const handleNextPage = () => {
    dispatch(fetchNextPage());
  };

  const handlePreviousPage = () => {
    dispatch(fetchPreviousPage());
  };

  const handleFirstPage = () => {
    dispatch(fetchFirstPage());
  };

  return (
    <main className="page-shell">
      <div className="section-header">
        <h1>Anime Library</h1>
        <p>Page {currentPage}</p>
      </div>

      <div className="media-grid">
        {animes.map((anime) => (
          <article className="media-card" key={anime.mal_id}>
            <Link href={`/anime/${anime.mal_id}`}>
              <Image
                className="animeImage"
                src={anime.images?.jpg?.image_url}
                alt={anime.title}
                width={240}
                height={330}
              />
              <h3>{anime.title}</h3>
            </Link>
            <p className="meta-line">Episodes: {anime.episodes || 'N/A'}</p>
            {getReservationStatus(anime.mal_id) ? (
              <button
                type="button"
                className="anime-cancel-btn"
                onClick={() => handleCancelReservation(anime.mal_id)}
              >
                Remove from Watchlist
              </button>
            ) : (
              <button
                type="button"
                className="anime-reserve-btn"
                data-testid="cancel-reservation-button"
                onClick={() => handleReserveAnime(anime)}
              >
                Add to Watchlist
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="pagination-buttons">
        <button type="button" onClick={handleFirstPage}>
          First
        </button>
        <button
          type="button"
          className="prev-button"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button type="button" className="next-button" onClick={handleNextPage}>
          Next
        </button>
      </div>
    </main>
  );
};

export default Animes;
