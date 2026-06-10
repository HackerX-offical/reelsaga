export interface Genre {
  id: number;
  name: string;
}

export interface ShowSummary {
  id: number;
  name: string;
  description: string;
  episodeCount: number;
  freeEpisodesCount: number | null;
  watchCount: number | null;
  shareCount: number | null;
  thumbnail: string;
  languageId: number;
  genres?: Genre[];
}

export interface Episode {
  id: number;
  name: string;
  showId: number;
  thumbnail: string | null;
  url: string;
  serialNumber: number | null;
  likeCount: number;
  isFree: boolean;
}

export interface ShowDetail {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  freeEpisodesCount: number;
  watchCount?: number;
  videos: Episode[];
  genres?: Genre[];
}

export interface Trailer {
  id: number;
  description: string;
  showId: number;
  thumbnail: string;
  url: string;
  likeCount: number;
  Show?: { id: number; name: string; thumbnail: string };
}

export interface Clip {
  id: number;
  description: string;
  showId: number;
  thumbnail: string;
  url: string;
  durationMs?: number;
  Show?: { id: number; name: string; thumbnail: string };
}

export interface HomeSection {
  title: string;
  viewType?: string;
  url?: string;
  shows?: ShowSummary[];
}

export interface HomeFeed {
  promotedShows?: Array<Partial<ShowSummary> & { id: number | string; isShow?: boolean }>;
  sections?: HomeSection[];
}
