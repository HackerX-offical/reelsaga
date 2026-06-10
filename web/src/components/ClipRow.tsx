import { Link } from "react-router-dom";
import type { Clip } from "../types";
import "./ClipRow.css";

interface Props {
  title: string;
  clips: Clip[];
}

export function ClipRow({ title, clips }: Props) {
  if (!clips.length) return null;

  return (
    <section className="clip-row">
      <h2 className="clip-row__title">{title}</h2>
      <div className="clip-row__scroll">
        {clips.map((clip) => (
          <Link
            key={clip.id}
            to={`/clip/${clip.id}`}
            className="clip-card"
          >
            <img
              src={clip.thumbnail}
              alt={clip.Show?.name ?? clip.description}
              loading="lazy"
            />
            <span className="clip-card__play" aria-hidden>▶</span>
            <p className="clip-card__name">{clip.Show?.name ?? "Clip"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
