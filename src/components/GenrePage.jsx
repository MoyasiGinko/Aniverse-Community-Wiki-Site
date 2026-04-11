"use client";

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGenrePageData } from '../redux/features/Genres/pageSlice';

const GenrePage = ({ genreId }) => {
  const dispatch = useDispatch();
  const {
    genreData, animeData, isLoading, error,
  } = useSelector(
    (state) => state.genrespage,
  );

  useEffect(() => {
    const fetchGenreData = async () => {
      if (animeData.length === 0 || genreData.length === 0) {
        try {
          // Fetch genre and anime data if they are not available in the Redux store
          await dispatch(fetchGenrePageData());
        } catch (error) {
          console.log('Error fetching genre and anime data:', error);
        }
      }
    };

    fetchGenreData();
  }, [dispatch, animeData.length, genreData.length]);

  const filterGenreAnimes = useCallback(() => {
    const genre = genreData.find((genre) => genre.mal_id === Number(genreId));

    if (!genre || !animeData) {
      return [];
    }

    return animeData.filter((anime) => anime.genres.some((g) => g.mal_id === Number(genreId)));
  }, [genreData, animeData, genreId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error:
        {error.message}
      </div>
    );
  }

  const genreAnimes = filterGenreAnimes();
  const genreName = genreData.find((genre) => genre.mal_id === Number(genreId))?.name || 'Unknown Genre';

  return (
    <main className="page-shell">
      <div className="section-header">
        <h1>{genreName}</h1>
        <p>{genreAnimes.length} results</p>
      </div>
      <ul className="media-grid">
        {genreAnimes.map((anime) => (
          <li className="media-card" key={anime.mal_id}>
            <Link href={`/anime/${anime.mal_id}`}>
              <Image src={anime.images?.jpg?.image_url || ''} alt={anime.title} width={240} height={330} />
              <h3>{anime.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default GenrePage;
