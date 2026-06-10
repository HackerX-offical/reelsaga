const KEY = "reelsaga_continue";

export interface ContinueItem {
  showId: number;
  showName: string;
  thumbnail: string;
  episodeIndex: number;
  episodeName: string;
  updatedAt: number;
}

export function getContinueWatching(): ContinueItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as ContinueItem[]).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveContinueWatching(item: Omit<ContinueItem, "updatedAt">) {
  const list = getContinueWatching().filter((x) => x.showId !== item.showId);
  list.unshift({ ...item, updatedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
}

export function removeContinueWatching(showId: number) {
  const list = getContinueWatching().filter((x) => x.showId !== showId);
  localStorage.setItem(KEY, JSON.stringify(list));
}
