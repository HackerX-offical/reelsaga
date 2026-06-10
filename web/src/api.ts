import { authHeaders, clearAuthCache } from "./lib/auth";
import type {
  Clip,
  Episode,
  Genre,
  HomeFeed,
  HomeSection,
  ShowDetail,
  ShowSummary,
  Trailer,
} from "./types";

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

interface PaginatedList<T> {
  shows?: T[];
  trailers?: T[];
  clips?: T[];
  count?: number;
  page?: number;
  limit?: number;
}

async function apiGet<T>(path: string, retry = true): Promise<T> {
  const clean = path.replace(/^\//, "");
  const headers = await authHeaders();
  const res = await fetch(`/api/${clean}`, { headers });

  if (res.status === 401 && retry) {
    clearAuthCache();
    return apiGet<T>(clean, false);
  }

  const body = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${clean}${body ? ` — ${body.slice(0, 80)}` : ""}`);
  }

  let json: ApiResponse<T>;
  try {
    json = JSON.parse(body) as ApiResponse<T>;
  } catch {
    throw new Error(
      `API returned HTML instead of JSON for /${clean}. Check Vercel Root Directory is set to "web" and redeploy.`,
    );
  }
  if (json.success === false) throw new Error(json.message ?? `Failed: ${clean}`);
  if (json.data == null) throw new Error(`Empty response: ${clean}`);
  return json.data;
}

async function apiGetOptional<T>(path: string, headers: Record<string, string>): Promise<T | null> {
  try {
    const clean = path.replace(/^\//, "");
    const res = await fetch(`/api/${clean}`, { headers });
    if (!res.ok) return null;
    const body = await res.text();
    const json = JSON.parse(body) as ApiResponse<T>;
    return json.data ?? null;
  } catch {
    return null;
  }
}

export function normalizeShow(raw: Record<string, unknown>): ShowSummary {
  return {
    id: raw.id as number,
    name: (raw.name as string) ?? "Untitled",
    description: ((raw.description as string) ?? "").slice(0, 400),
    thumbnail: (raw.thumbnail as string) ?? (raw.pic as string) ?? "",
    episodeCount: (raw.episodeCount as number) ?? 0,
    freeEpisodesCount: (raw.freeEpisodesCount as number) ?? null,
    watchCount: (raw.watchCount as number) ?? null,
    shareCount: (raw.shareCount as number) ?? null,
    languageId: (raw.languageId as number) ?? 1,
    genres: raw.genres as ShowSummary["genres"],
  };
}

function mergeShows(...lists: ShowSummary[][]): ShowSummary[] {
  const map = new Map<number, ShowSummary>();
  for (const list of lists) {
    for (const s of list) {
      if (typeof s.id === "number" && s.name) map.set(s.id, s);
    }
  }
  return [...map.values()].sort((a, b) => (b.watchCount ?? 0) - (a.watchCount ?? 0));
}

async function fetchAllShowPages(
  type: string,
  headers: Record<string, string>,
  pageSize = 100,
): Promise<ShowSummary[]> {
  const out: ShowSummary[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (out.length < total) {
    const path = `shows?type=${encodeURIComponent(type)}&page=${page}&limit=${pageSize}`;
    const data = await apiGetOptional<PaginatedList<Record<string, unknown>>>(path, headers);
    if (!data?.shows?.length) break;

    total = data.count ?? out.length + data.shows.length;
    out.push(...data.shows.map(normalizeShow));

    if (data.shows.length < pageSize || out.length >= total) break;
    page += 1;
    if (page > 50) break;
  }

  return out;
}

export async function fetchAllShows(): Promise<ShowSummary[]> {
  const headers = await authHeaders();

  const [all, trending, popular, newShows, recommended, feed] = await Promise.all([
    fetchAllShowPages("all", headers),
    fetchAllShowPages("trending", headers, 50),
    fetchAllShowPages("popular", headers, 50),
    fetchAllShowPages("new", headers, 50),
    fetchAllShowPages("recommended", headers, 50),
    apiGetOptional<HomeFeed>("v1/home", headers),
  ]);

  const sectionShows = (feed?.sections ?? []).flatMap((s) => s.shows ?? []);
  const promoted = (feed?.promotedShows ?? []).filter((s) => typeof s.id === "number");

  return mergeShows(
    all,
    trending,
    popular,
    newShows,
    recommended,
    sectionShows.map((s) => normalizeShow(s as unknown as Record<string, unknown>)),
    promoted.map((s) => normalizeShow(s as unknown as Record<string, unknown>)),
  );
}

export async function fetchShowDetail(id: number): Promise<ShowDetail> {
  const data = await apiGet<{
    show: ShowDetail & { videos?: Episode[]; episodes?: Episode[] };
  }>(`show/${id}`);
  const show = data.show;
  return { ...show, videos: show.videos ?? show.episodes ?? [] };
}

export async function fetchHomeFeed(): Promise<HomeFeed> {
  return apiGet<HomeFeed>("v1/home");
}

export async function fetchTrailers(maxItems = 80): Promise<Trailer[]> {
  const headers = await authHeaders();
  const out: Trailer[] = [];
  const pageSize = 50;
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (out.length < total && out.length < maxItems) {
    const data = await apiGetOptional<PaginatedList<Trailer>>(
      `v1/trailers?page=${page}&limit=${pageSize}`,
      headers,
    );
    const batch = data?.trailers ?? [];
    if (!batch.length) break;

    total = data?.count ?? out.length + batch.length;
    out.push(...batch);

    if (batch.length < pageSize || out.length >= total) break;
    page += 1;
    if (page > 10) break;
  }

  return out.slice(0, maxItems);
}

export async function fetchClips(maxItems = 80): Promise<Clip[]> {
  const headers = await authHeaders();
  const out: Clip[] = [];
  const pageSize = 50;
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (out.length < total && out.length < maxItems) {
    const data = await apiGetOptional<PaginatedList<Clip>>(
      `clips?page=${page}&limit=${pageSize}`,
      headers,
    );
    const batch = data?.shows ?? data?.clips ?? [];
    if (!batch.length) break;

    total = data?.count ?? out.length + batch.length;
    out.push(...batch);

    if (batch.length < pageSize || out.length >= total) break;
    page += 1;
    if (page > 10) break;
  }

  return out.slice(0, maxItems);
}

export async function fetchList(type: string): Promise<ShowSummary[]> {
  const headers = await authHeaders();
  return fetchAllShowPages(type, headers, 100);
}

export async function searchShows(query: string): Promise<ShowSummary[]> {
  const q = encodeURIComponent(query.trim());
  if (!q) return fetchAllShows();

  const headers = await authHeaders();
  const out: ShowSummary[] = [];
  const pageSize = 50;
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (out.length < total) {
    const data = await apiGetOptional<PaginatedList<Record<string, unknown>>>(
      `search?q=${q}&page=${page}&limit=${pageSize}`,
      headers,
    );
    if (!data?.shows?.length) break;

    total = data.count ?? out.length + data.shows.length;
    out.push(...data.shows.map(normalizeShow));

    if (data.shows.length < pageSize || out.length >= total) break;
    page += 1;
    if (page > 20) break;
  }

  return out;
}

export function homeSections(feed: HomeFeed): HomeSection[] {
  return (feed.sections ?? [])
    .filter((s) => s.shows && s.shows.length > 0 && s.title)
    .map((s) => ({
      ...s,
      shows: (s.shows ?? []).map((sh) =>
        normalizeShow(sh as unknown as Record<string, unknown>),
      ),
    }));
}

export function promotedShows(feed: HomeFeed, catalog: ShowSummary[]): ShowSummary[] {
  return (feed.promotedShows ?? [])
    .filter((s) => typeof s.id === "number" && s.isShow !== false)
    .map((s) => {
      const match = catalog.find((c) => c.id === s.id);
      return match ?? normalizeShow(s as unknown as Record<string, unknown>);
    });
}

export function allGenres(shows: ShowSummary[]): Genre[] {
  const map = new Map<number, Genre>();
  for (const s of shows) {
    for (const g of s.genres ?? []) map.set(g.id, g);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
