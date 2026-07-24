"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import { FiPlus, FiSearch, FiFilm, FiCheckCircle } from "react-icons/fi";
import "@/src/styles/auth.css";

type MalAnime = {
  malId: number;
  title: string;
  imageUrl: string;
  type?: string;
  year?: number | null;
  episodes?: number | null;
};

export default function WikiCreateForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [extraImageUrls, setExtraImageUrls] = useState("");
  const [animeQuery, setAnimeQuery] = useState("");
  const [animeResults, setAnimeResults] = useState<MalAnime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<MalAnime | null>(null);
  const [searchingAnime, setSearchingAnime] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchAnime = async () => {
    setError("");
    setSearchingAnime(true);
    try {
      const response = await apiRequest<{ items: MalAnime[] }>(
        `/api/mal/anime-search?q=${encodeURIComponent(animeQuery)}`,
      );
      setAnimeResults(response.items || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearchingAnime(false);
    }
  };

  const createEntry = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      await apiRequest("/api/wiki", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          tags: tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status: "published",
          malAnimeId: selectedAnime?.malId ?? null,
          malAnimeTitle: selectedAnime?.title || "",
          coverImageUrl: selectedAnime?.imageUrl || "",
          extraImageUrls: extraImageUrls
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      setTitle("");
      setBody("");
      setTags("");
      setExtraImageUrls("");
      setAnimeQuery("");
      setAnimeResults([]);
      setSelectedAnime(null);
      setInfo("Article published successfully to the Aniverse Wiki database!");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="settings-card fade-in-up">
      <div className="settings-header-block">
        <div className="settings-header-info">
          <h2>Create New Wiki Article</h2>
          <p>Publish a canonical anime entry, lore article, or character guide.</p>
        </div>
        <span className="auth-badge">
          <FiPlus style={{ marginRight: "4px" }} /> Editor Portal
        </span>
      </div>

      <form className="settings-form-grid" onSubmit={createEntry} style={{ marginTop: "1rem" }}>
        <div className="settings-field-group">
          <label htmlFor="title" className="settings-label">Article Title</label>
          <input
            id="title"
            className="settings-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Void Century & Ancient Kingdom"
            required
          />
        </div>

        <div className="settings-field-group">
          <label htmlFor="body" className="settings-label">Article Body & Lore Details</label>
          <textarea
            id="body"
            className="settings-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Write complete article details, lore breakdowns, or historical timelines..."
            required
          />
        </div>

        <div className="settings-field-group">
          <label htmlFor="tags" className="settings-label">Tags (comma-separated)</label>
          <input
            id="tags"
            className="settings-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="OnePiece, Lore, Poneglyphs, VoidCentury"
          />
        </div>

        {/* MAL Anime Lookup */}
        <div className="settings-field-group">
          <label htmlFor="anime-reference" className="settings-label">Reference Anime (MyAnimeList)</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="anime-reference"
              className="settings-input"
              value={animeQuery}
              onChange={(e) => setAnimeQuery(e.target.value)}
              placeholder="Search anime title on MAL database..."
            />
            <button
              type="button"
              className="action-button ghost small"
              onClick={searchAnime}
              disabled={!animeQuery.trim() || searchingAnime}
            >
              <FiSearch style={{ marginRight: "4px" }} /> {searchingAnime ? "Searching..." : "Search MAL"}
            </button>
          </div>
        </div>

        {animeResults.length ? (
          <div className="security-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {animeResults.slice(0, 4).map((anime) => (
              <div
                key={anime.malId}
                className="session-item-row"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedAnime(anime)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiFilm style={{ color: "var(--brand)" }} />
                  <strong style={{ fontSize: "0.85rem", color: "var(--text)" }}>{anime.title}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {selectedAnime ? (
          <div className="security-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiCheckCircle style={{ color: "#10b981" }} />
              <strong>Selected Reference: {selectedAnime.title} (MAL #{selectedAnime.malId})</strong>
            </div>
          </div>
        ) : null}

        <div className="settings-field-group">
          <label htmlFor="extra-images" className="settings-label">Additional Attachment Image URLs (one per line)</label>
          <textarea
            id="extra-images"
            className="settings-textarea"
            value={extraImageUrls}
            onChange={(e) => setExtraImageUrls(e.target.value)}
            rows={3}
            placeholder="https://example.com/attachment.png"
          />
        </div>

        <div className="settings-action-row">
          <button type="submit" className="action-button" disabled={submitting}>
            <FiPlus style={{ marginRight: "6px" }} /> {submitting ? "Publishing..." : "Publish Article to Wiki"}
          </button>
        </div>
      </form>

      {info ? <div className="alert-success" style={{ marginTop: "1rem" }}>✓ {info}</div> : null}
      {error ? <div className="alert-error" style={{ marginTop: "1rem" }}>✕ {error}</div> : null}
    </section>
  );
}
