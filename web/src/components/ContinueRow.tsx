import { Link } from "react-router-dom";
import type { ContinueItem } from "../lib/continueWatching";
import "./ContinueRow.css";

interface Props {
  items: ContinueItem[];
}

export function ContinueRow({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className="continue-row">
      <h2 className="continue-row__title">Continue Watching</h2>
      <div className="continue-row__scroll">
        {items.map((item) => (
          <Link
            key={item.showId}
            to={`/watch/${item.showId}/${item.episodeIndex}`}
            className="continue-card"
          >
            <img src={item.thumbnail} alt={item.showName} loading="lazy" />
            <div className="continue-card__overlay" />
            <div className="continue-card__info">
              <p className="continue-card__show">{item.showName}</p>
              <p className="continue-card__ep">{item.episodeName}</p>
            </div>
            <span className="continue-card__play" aria-hidden>▶</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
