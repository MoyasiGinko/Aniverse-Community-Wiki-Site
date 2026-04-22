// @ts-nocheck
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGenreData } from '../redux/features/Genres/genreSlice';

const GenreList = () => {
  const dispatch = useDispatch();
  const genreData = useSelector((state) => state.genre);
  const isLoading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);

  useEffect(() => {
    const storedGenreData = JSON.parse(localStorage.getItem('genreData'));
    if (storedGenreData && storedGenreData.length > 0) {
      dispatch(fetchGenreData.fulfilled(storedGenreData));
    } else {
      dispatch(fetchGenreData());
    }
  }, [dispatch]);

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

  return (
    <main className="page-shell">
      <div className="section-header">
        <h1>Genre Atlas</h1>
        <p>Jump into thematic worlds and discover connected titles.</p>
      </div>
      <ul className="genre-grid">
        {genreData.map((genre) => (
          <li key={genre.mal_id}>
            <Link href={`/genres/${genre.mal_id}`} className="genre-chip">
              <span>{genre.name}</span>
              <small>Open collection</small>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default GenreList;
