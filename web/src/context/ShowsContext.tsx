import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchAllShows } from "../api";
import type { ShowSummary } from "../types";

interface ShowsContextValue {
  shows: ShowSummary[];
  loading: boolean;
  error: string | null;
  getShow: (id: number) => ShowSummary | undefined;
  refresh: () => Promise<void>;
}

const ShowsContext = createContext<ShowsContextValue | null>(null);

export function ShowsProvider({ children }: { children: ReactNode }) {
  const [shows, setShows] = useState<ShowSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllShows();
      setShows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect to ReelSaga API");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const getShow = (id: number) => shows.find((s) => s.id === id);

  return (
    <ShowsContext.Provider value={{ shows, loading, error, getShow, refresh: load }}>
      {children}
    </ShowsContext.Provider>
  );
}

export function useShows() {
  const ctx = useContext(ShowsContext);
  if (!ctx) throw new Error("useShows must be used within ShowsProvider");
  return ctx;
}
