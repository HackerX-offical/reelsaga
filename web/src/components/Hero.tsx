import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ShowSummary } from "../types";
import "./Hero.css";

interface Props {
  shows: ShowSummary[];
}

export function Hero({ shows }: Props) {
  const [index, setIndex] = useState(0);
  const featured = shows.slice(0, 5);
  const show = featured[index] ?? featured[0];

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 8000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (!show) return null;

  return (
    <section className="hero">
      {featured.map((s, i) => (
        <div
          key={s.id}
          className={`hero__bg ${i === index ? "hero__bg--active" : ""}`}
          style={{ backgroundImage: `url(${s.thumbnail})` }}
        />
      ))}
      <div className="hero__gradient" />
      <div className="container hero__content fade-up">
        <p className="hero__label">Featured</p>
        <h1 className="hero__title">{show.name}</h1>
        <p className="hero__desc">{show.description}</p>
        <div className="hero__actions">
          <Link to={`/watch/${show.id}/0`} className="btn btn--primary btn--lg">
            ▶ Play
          </Link>
          <Link to={`/show/${show.id}`} className="btn btn--ghost btn--lg">
            More Info
          </Link>
        </div>
        {featured.length > 1 && (
          <div className="hero__dots">
            {featured.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`hero__dot ${i === index ? "hero__dot--active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Featured ${s.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
