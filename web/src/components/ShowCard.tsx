import { Link } from "react-router-dom";
import type { ShowSummary } from "../types";
import "./ShowCard.css";

interface Props {
  show: ShowSummary;
}

export function ShowCard({ show }: Props) {
  return (
    <Link to={`/show/${show.id}`} className="show-card">
      <div className="show-card__thumb">
        <img src={show.thumbnail} alt={show.name} loading="lazy" />
        <div className="show-card__overlay" />
        <span className="show-card__play" aria-hidden>▶</span>
        {show.freeEpisodesCount != null && (
          <span className="show-card__eps">{show.freeEpisodesCount} free</span>
        )}
      </div>
      <div className="show-card__meta">
        <h3 className="show-card__title">{show.name}</h3>
        {show.watchCount != null && show.watchCount > 0 && (
          <p className="show-card__stat">{(show.watchCount / 1000).toFixed(0)}k+ watches</p>
        )}
      </div>
    </Link>
  );
}
