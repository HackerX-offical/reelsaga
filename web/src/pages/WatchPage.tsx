import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { EpisodePanel } from "../components/EpisodePanel";
import { fetchShowDetail } from "../api";
import { saveContinueWatching } from "../lib/continueWatching";
import type { ShowDetail } from "../types";
import "./WatchPage.css";
import "./pages.css";

export function WatchPage() {
  const { showId: idParam, episode: epParam } = useParams<{ showId: string; episode: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ShowDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showId = Number(idParam);
  const episodeIndex = Number(epParam ?? 0);

  useEffect(() => {
    if (!showId) return;
    setError(null);
    fetchShowDetail(showId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [showId]);

  const episodes = detail?.videos ?? [];
  const current = episodes[episodeIndex];
  const hasNext = episodeIndex < episodes.length - 1;
  const hasPrev = episodeIndex > 0;

  const goPrev = useCallback(() => {
    if (hasPrev) navigate(`/watch/${showId}/${episodeIndex - 1}`);
  }, [hasPrev, navigate, showId, episodeIndex]);

  const goNext = useCallback(() => {
    if (hasNext) navigate(`/watch/${showId}/${episodeIndex + 1}`);
  }, [hasNext, navigate, showId, episodeIndex]);

  useEffect(() => {
    if (!detail || !current) return;
    saveContinueWatching({
      showId: detail.id,
      showName: detail.name,
      thumbnail: detail.thumbnail,
      episodeIndex,
      episodeName: current.name,
    });
  }, [detail, current, episodeIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (error) {
    return (
      <div className="watch-page watch-page--fallback">
        <div className="error-panel">
          <p>{error}</p>
          <Link to="/browse">← Browse</Link>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="watch-page watch-page--fallback">
        <div className="skeleton skeleton--player" />
      </div>
    );
  }

  if (!current?.url) {
    return (
      <div className="watch-page watch-page--fallback">
        <div className="error-panel">
          <p>Episode not available.</p>
          <Link to={`/show/${showId}`}>← Back to show</Link>
        </div>
      </div>
    );
  }

  const panelProps = {
    showId,
    showName: detail.name,
    episodes,
    currentIndex: episodeIndex,
    freeCount: detail.freeEpisodesCount,
  };

  return (
    <div className="watch-theater">
      <header className="watch-theater__bar">
        <Link to={`/show/${showId}`} className="watch-theater__show" title={detail.name}>
          <img src={detail.thumbnail} alt="" className="watch-theater__thumb" />
          <span className="watch-theater__show-text">
            <span className="watch-theater__show-name">{detail.name}</span>
            <span className="watch-theater__ep-name">{current.name}</span>
          </span>
        </Link>

        <div className="watch-theater__nav">
          <button
            type="button"
            className="watch-theater__nav-btn"
            onClick={goPrev}
            disabled={!hasPrev}
            aria-label="Previous episode"
          >
            ‹
          </button>
          <span className="watch-theater__counter">
            {episodeIndex + 1} <span className="watch-theater__counter-sep">/</span> {episodes.length}
          </span>
          <button
            type="button"
            className="watch-theater__nav-btn"
            onClick={goNext}
            disabled={!hasNext}
            aria-label="Next episode"
          >
            ›
          </button>
        </div>
      </header>

      <div className="watch-theater__player">
        <VideoPlayer
          key={current.url}
          src={current.url}
          poster={detail.thumbnail}
          title={current.name}
          layout="theater"
          onEnded={goNext}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      </div>

      <aside className="watch-theater__sidebar">
        <EpisodePanel {...panelProps} variant="sidebar" />
      </aside>

      <div className="watch-theater__dock">
        <EpisodePanel {...panelProps} variant="dock" />
      </div>
    </div>
  );
}
