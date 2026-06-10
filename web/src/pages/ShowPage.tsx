import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchShowDetail } from "../api";
import { useShows } from "../context/ShowsContext";
import type { ShowDetail } from "../types";
import "./pages.css";

export function ShowPage() {
  const { id } = useParams<{ id: string }>();
  const { getShow } = useShows();
  const [detail, setDetail] = useState<ShowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showId = Number(id);
  const summary = getShow(showId);

  useEffect(() => {
    if (!showId) return;
    setLoading(true);
    setError(null);
    fetchShowDetail(showId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load show"))
      .finally(() => setLoading(false));
  }, [showId]);

  if (loading) {
    return (
      <div className="show-page">
        <div className="skeleton skeleton--banner" />
        <div className="container">
          <div className="skeleton skeleton--detail" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="container page">
        <div className="error-panel">
          <p>{error ?? "Show not found."}</p>
          <Link to="/browse" className="btn btn--ghost">← Browse</Link>
        </div>
      </div>
    );
  }

  const thumb = detail.thumbnail || summary?.thumbnail;

  return (
    <div className="show-page">
      <div
        className="show-page__banner"
        style={{ backgroundImage: thumb ? `url(${thumb})` : undefined }}
      />
      <div className="container show-page__body">
        <div className="show-page__info">
          {thumb && (
            <img src={thumb} alt={detail.name} className="show-page__poster" />
          )}
          <div className="show-page__copy">
            <div className="show-page__tags">
              {detail.genres?.slice(0, 3).map((g) => (
                <span key={g.id} className="tag">{g.name}</span>
              ))}
            </div>
            <h1>{detail.name}</h1>
            <p className="show-page__desc">{detail.description}</p>
            <p className="show-page__meta">
              {detail.videos.length} episodes · {detail.freeEpisodesCount} free
              {detail.watchCount ? ` · ${(detail.watchCount / 1000).toFixed(0)}k watches` : ""}
            </p>
            <div className="show-page__actions">
              <Link to={`/watch/${showId}/0`} className="btn btn--primary btn--lg">
                ▶ Play
              </Link>
            </div>
          </div>
        </div>
        <section className="episodes">
          <h2>Episodes</h2>
          <div className="episodes__grid">
            {detail.videos.map((ep, i) => (
              <Link
                key={ep.id}
                to={`/watch/${showId}/${i}`}
                className={`episode-card ${!ep.isFree ? "episode-card--premium" : ""}`}
              >
                <span className="episode-card__num">{i + 1}</span>
                <div className="episode-card__body">
                  <span className="episode-card__name">{ep.name}</span>
                  {!ep.isFree && <span className="episode-card__badge">Premium</span>}
                </div>
                <span className="episode-card__play" aria-hidden>▶</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
