import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { fetchClips } from "../api";
import type { Clip } from "../types";
import "./WatchPage.css";
import "./pages.css";

export function ClipPage() {
  const { id } = useParams<{ id: string }>();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClips()
      .then(setClips)
      .finally(() => setLoading(false));
  }, []);

  const clip = clips.find((c) => c.id === Number(id));

  if (loading) {
    return (
      <div className="watch-page watch-page--fallback">
        <div className="skeleton skeleton--player" />
      </div>
    );
  }

  if (!clip?.url) {
    return (
      <div className="watch-page watch-page--fallback">
        <div className="error-panel">
          <p>Clip not found.</p>
          <Link to="/">← Home</Link>
        </div>
      </div>
    );
  }

  const showName = clip.Show?.name ?? "Show";

  return (
    <div className="watch-page watch-page--solo">
      <header className="watch-solo__bar watch-theater__bar">
        <Link to={`/show/${clip.showId}`} className="watch-theater__show">
          {clip.thumbnail && (
            <img src={clip.thumbnail} alt="" className="watch-theater__thumb" />
          )}
          <span className="watch-theater__show-text">
            <span className="watch-theater__show-name">{showName}</span>
            <span className="watch-theater__ep-name">Clip</span>
          </span>
        </Link>
      </header>

      <div className="watch-solo__player">
        <VideoPlayer
          key={clip.url}
          src={clip.url}
          poster={clip.thumbnail}
          title={clip.description}
          layout="theater"
        />
      </div>

      <div className="watch-solo__actions">
        <Link to={`/show/${clip.showId}`} className="btn btn--ghost">
          Full series
        </Link>
        <Link to={`/watch/${clip.showId}/0`} className="btn btn--primary">
          Watch Ep 1 →
        </Link>
      </div>
    </div>
  );
}
