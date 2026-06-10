import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShowCard } from "../components/ShowCard";
import { searchShows } from "../api";
import type { ShowSummary } from "../types";
import "./pages.css";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const [results, setResults] = useState<ShowSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchShows(q)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container page browse">
      <header className="page-header">
        <h1>{q ? `Results for “${q}”` : "Browse all"}</h1>
        <p>{loading ? "Searching…" : `${results.length} shows`}</p>
      </header>
      {loading ? (
        <div className="browse__grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="empty">No shows match your search.</p>
      ) : (
        <div className="browse__grid">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}
