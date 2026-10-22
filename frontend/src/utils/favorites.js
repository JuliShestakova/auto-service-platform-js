export const FAVORITES_KEY = 'favorite_executor_ids';
export const FAVORITES_EVENT = 'favorites-changed';

export function readFavoriteIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.map(Number).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function writeFavoriteIds(ids) {
  const next = [...new Set(ids.map(Number).filter(Boolean))];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: next }));
  return next;
}

export function toggleFavoriteId(id) {
  const value = Number(id);
  if (!value) {
    return readFavoriteIds();
  }

  const current = readFavoriteIds();
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return writeFavoriteIds(next);
}

export function isFavoriteId(id, ids = readFavoriteIds()) {
  return ids.includes(Number(id));
}
