import { useEffect, useState } from "react";
import { Hero } from "../components/Hero";
import { ShowRow } from "../components/ShowRow";
import { TrailerRow } from "../components/TrailerRow";
import { ClipRow } from "../components/ClipRow";
import { ContinueRow } from "../components/ContinueRow";
import { useShows } from "../context/ShowsContext";
import {
  fetchClips,
  fetchHomeFeed,
  fetchTrailers,
  homeSections,
  promotedShows,
} from "../api";
import { getContinueWatching } from "../lib/continueWatching";
import type { Clip, HomeSection, ShowSummary, Trailer } from "../types";
import type { ContinueItem } from "../lib/continueWatching";
import "./pages.css";

export function HomePage() {
  const { shows, loading, error, refresh } = useShows();
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [heroShows, setHeroShows] = useState<ShowSummary[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [continueItems, setContinueItems] = useState<ContinueItem[]>([]);

  useEffect(() => {
    setContinueItems(getContinueWatching());
  }, []);

  useEffect(() => {
    Promise.all([fetchHomeFeed(), fetchTrailers(), fetchClips()])
      .then(([feed, trailerList, clipList]) => {
        setSections(homeSections(feed));
        setTrailers(trailerList);
        setClips(clipList);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!shows.length) return;
    fetchHomeFeed()
      .then((feed) => {
        const promoted = promotedShows(feed, shows);
        setHeroShows(promoted.length ? promoted : shows.slice(0, 5));
      })
      .catch(() => {
        setHeroShows(shows.slice(0, 5));
      });
  }, [shows]);

  if (loading) {
    return (
      <div className="page page--home">
        <div className="skeleton skeleton--hero" />
        <div className="container">
          <div className="skeleton skeleton--row" />
          <div className="skeleton skeleton--row" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <div className="error-panel">
          <h2>Could not reach ReelSaga</h2>
          <p>{error}</p>
          <button type="button" className="btn btn--primary" onClick={refresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--home">
      {heroShows.length > 0 && <Hero shows={heroShows} />}
      <div className="container home-rows">
        <ContinueRow items={continueItems} />
        {clips.length > 0 && <ClipRow title="Quick Clips" clips={clips} />}
        {trailers.length > 0 && <TrailerRow title="Trailers" trailers={trailers} />}
        {sections.map((section) => (
          <ShowRow
            key={section.title}
            title={section.title}
            shows={section.shows ?? []}
            seeAllHref="/browse"
          />
        ))}
        <ShowRow title="All Series" shows={shows} seeAllHref="/browse" />
      </div>
    </div>
  );
}
