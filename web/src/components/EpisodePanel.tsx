import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Episode } from "../types";
import "./EpisodePanel.css";

interface Props {
  showId: number;
  showName: string;
  episodes: Episode[];
  currentIndex: number;
  freeCount?: number;
  variant?: "sidebar" | "strip" | "dock";
}

export function EpisodePanel({
  showId,
  showName,
  episodes,
  currentIndex,
  freeCount,
  variant = "sidebar",
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      block: variant === "strip" ? "nearest" : "nearest",
      inline: variant === "strip" || variant === "dock" ? "center" : "nearest",
      behavior: "smooth",
    });
  }, [currentIndex, variant]);

  return (
    <aside
      className={`ep-panel ${
        variant === "strip" ? "ep-panel--mobile" : variant === "dock" ? "ep-panel--dock" : ""
      }`}
      aria-label="Episodes"
    >
      {variant !== "dock" && (
        <header className="ep-panel__head">
          <div>
            <p className="ep-panel__label">Episodes</p>
            <h2 className="ep-panel__title">{showName}</h2>
          </div>
          <span className="ep-panel__count">
            {currentIndex + 1} / {episodes.length}
          </span>
        </header>
      )}

      {variant !== "dock" && (
        <p className="ep-panel__meta">
          {episodes.length} total
          {freeCount != null ? ` · ${freeCount} free` : ""}
        </p>
      )}

      <div className="ep-panel__list" ref={listRef}>
        {episodes.map((ep, i) => {
          const active = i === currentIndex;
          return (
            <Link
              key={ep.id}
              ref={active ? activeRef : undefined}
              to={`/watch/${showId}/${i}`}
              className={`ep-item ${active ? "ep-item--active" : ""} ${!ep.isFree ? "ep-item--premium" : ""}`}
              aria-current={active ? "true" : undefined}
            >
              <span className="ep-item__num">{i + 1}</span>
              {variant !== "dock" && (
                <>
                  <div className="ep-item__body">
                    <span className="ep-item__name">{ep.name}</span>
                    {!ep.isFree && <span className="ep-item__badge">Premium</span>}
                  </div>
                  <span className="ep-item__icon" aria-hidden>
                    {active ? "▶" : ""}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
