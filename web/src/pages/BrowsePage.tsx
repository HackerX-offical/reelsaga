import { useMemo, useState } from "react";
import { ShowCard } from "../components/ShowCard";
import { useShows } from "../context/ShowsContext";
import { allGenres } from "../api";
import "./pages.css";

export function BrowsePage() {
  const { shows, loading, error, refresh } = useShows();
  const [genreId, setGenreId] = useState<number | null>(null);

  const genres = useMemo(() => allGenres(shows), [shows]);

  const filtered = useMemo(() => {
    if (!genreId) return shows;
    return shows.filter((s) => s.genres?.some((g) => g.id === genreId));
  }, [shows, genreId]);

  return (
    <div className="container page browse">
      <header className="page-header">
        <h1>Browse</h1>
        <p>{loading ? "Loading…" : `${filtered.length} series`}</p>
      </header>

      {!loading && genres.length > 0 && (
        <div className="genre-bar">
          <button
            type="button"
            className={`genre-chip ${genreId === null ? "genre-chip--active" : ""}`}
            onClick={() => setGenreId(null)}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`genre-chip ${genreId === g.id ? "genre-chip--active" : ""}`}
              onClick={() => setGenreId(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="browse__grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      )}

      {error && (
        <div className="error-panel">
          <p>{error}</p>
          <button type="button" className="btn btn--primary" onClick={refresh}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="browse__grid">
          {filtered.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}
