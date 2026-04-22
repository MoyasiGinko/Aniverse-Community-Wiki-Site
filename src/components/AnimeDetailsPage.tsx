// @ts-nocheck
"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { fetchDetails } from "../redux/features/Details/detailsSlice";

const AnimeDetailsPage = ({ animeId }) => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector((state) => state.details);

  useEffect(() => {
    dispatch(fetchDetails(animeId));
  }, [dispatch, animeId]);

  if (isLoading) {
    return (
      <div className="anime-details-page">
        <div className="loading-message">Loading anime details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="anime-details-page">
        <div className="error-message">
          Error loading anime details: {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="anime-details-page">
        <div>No anime details available</div>
      </div>
    );
  }

  const {
    title,
    images,
    synopsis,
    episodes,
    aired,
    rating,
    score,
    popularity,
    genres,
    studios,
  } = data;

  return (
    <main className="page-shell">
      <section className="detail-hero">
        <div className="detail-media">
          <Image
            src={images?.jpg?.image_url || ""}
            alt={title}
            width={320}
            height={460}
          />
        </div>
        <div className="detail-copy">
          <h1>{title}</h1>
          <p>{synopsis}</p>
          <div className="stats-grid">
            <div>
              <span>Episodes</span>
              <strong>{episodes || "N/A"}</strong>
            </div>
            <div>
              <span>Aired</span>
              <strong>{aired?.string || "N/A"}</strong>
            </div>
            <div>
              <span>Rating</span>
              <strong>{rating || "N/A"}</strong>
            </div>
            <div>
              <span>Score</span>
              <strong>{score || "N/A"}</strong>
            </div>
            <div>
              <span>Popularity</span>
              <strong>{popularity || "N/A"}</strong>
            </div>
          </div>
          <div className="pill-list">
            {genres.map((genre) => (
              <span key={genre.mal_id} className="badge-pill">
                {genre.name}
              </span>
            ))}
          </div>
          <div className="pill-list">
            {studios.map((studio) => (
              <span key={studio.mal_id} className="badge-pill">
                {studio.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AnimeDetailsPage;
