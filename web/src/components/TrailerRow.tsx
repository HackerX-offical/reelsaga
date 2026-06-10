import { Link } from "react-router-dom";
import type { Trailer } from "../types";
import "./TrailerRow.css";

interface Props {
  title: string;
  trailers: Trailer[];
}

export function TrailerRow({ title, trailers }: Props) {
  if (!trailers.length) return null;

  return (
    <section className="trailer-row">
      <h2 className="trailer-row__title">{title}</h2>
      <div className="trailer-row__scroll">
        {trailers.map((trailer) => (
          <Link
            key={trailer.id}
            to={`/trailer/${trailer.id}`}
            className="trailer-card"
          >
            <img
              src={trailer.thumbnail}
              alt={trailer.Show?.name ?? trailer.description}
              loading="lazy"
            />
            <span className="trailer-card__play" aria-hidden>▶</span>
            <div className="trailer-card__info">
              <p className="trailer-card__name">
                {trailer.Show?.name ?? "Trailer"}
              </p>
              <p className="trailer-card__desc">{trailer.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
