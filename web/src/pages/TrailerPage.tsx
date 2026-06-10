import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { fetchTrailers } from "../api";
import type { Trailer } from "../types";
import "./WatchPage.css";
import "./pages.css";

export function TrailerPage() {
  const { id } = useParams<{ id: string }>();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrailers()
      .then(setTrailers)
      .finally(() => setLoading(false));
  }, []);

  const trailer = trailers.find((t) => t.id === Number(id));

  if (loading) {
    return (
      <div className="watch-page watch-page--fallback">
        <div className="skeleton skeleton--player" />
      </div>
    );
  }

  if (!trailer?.url) {
    return (
      <div className="watch-page watch-page--fallback">
        <div className="error-panel">
          <p>Trailer not found.</p>
          <Link to="/">← Home</Link>
        </div>
      </div>
    );
  }

  const showName = trailer.Show?.name ?? "Show";

  return (
    <div className="watch-page watch-page--solo">
      <header className="watch-solo__bar watch-theater__bar">
        <Link to={`/show/${trailer.showId}`} className="watch-theater__show">
          {trailer.thumbnail && (
            <img src={trailer.thumbnail} alt="" className="watch-theater__thumb" />
          )}
          <span className="watch-theater__show-text">
            <span className="watch-theater__show-name">{showName}</span>
            <span className="watch-theater__ep-name">Trailer</span>
          </span>
        </Link>
      </header>

      <div className="watch-solo__player">
        <VideoPlayer
          key={trailer.url}
          src={trailer.url}
          poster={trailer.thumbnail}
          title={trailer.description || `${showName} — Trailer`}
          layout="theater"
        />
      </div>

      <div className="watch-solo__actions">
        <Link to={`/show/${trailer.showId}`} className="btn btn--ghost">
          Show details
        </Link>
        <Link to={`/watch/${trailer.showId}/0`} className="btn btn--primary">
          Watch Ep 1 →
        </Link>
      </div>
    </div>
  );
}
