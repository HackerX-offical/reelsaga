import { Link } from "react-router-dom";
import { ShowCard } from "./ShowCard";
import type { ShowSummary } from "../types";
import "./ShowRow.css";

interface Props {
  title: string;
  shows: ShowSummary[];
  seeAllHref?: string;
}

export function ShowRow({ title, shows, seeAllHref }: Props) {
  if (!shows.length) return null;

  return (
    <section className="show-row">
      <div className="show-row__head">
        <h2 className="show-row__title">{title}</h2>
        {seeAllHref && (
          <Link to={seeAllHref} className="show-row__more">See all →</Link>
        )}
      </div>
      <div className="show-row__scroll">
        {shows.map((show) => (
          <div key={show.id} className="show-row__item">
            <ShowCard show={show} />
          </div>
        ))}
      </div>
    </section>
  );
}
