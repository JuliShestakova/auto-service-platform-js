export const FAVORITES_KEY = 'favorite_executor_ids';
export const FAVORITES_EVENT = 'favorites-changed';

function storageKey(ownerId) {
  return ownerId ? `${FAVORITES_KEY}:${ownerId}` : `${FAVORITES_KEY}:guest`;
}

function parseIds(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.map(Number).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function readFavoriteIds(ownerId) {
  try {
    const ids = parseIds(localStorage.getItem(storageKey(ownerId)));
    if (ids.length > 0 || ownerId) {
      return ids;
    }
    return parseIds(localStorage.getItem(FAVORITES_KEY));
  } catch {
    return [];
  }
}

export function writeFavoriteIds(ids, ownerId) {
  const next = [...new Set(ids.map(Number).filter(Boolean))];
  localStorage.setItem(storageKey(ownerId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, {
    detail: { ids: next, ownerId: ownerId || null },
  }));
  return next;
}

export function toggleFavoriteId(id, ownerId) {
  const value = Number(id);
  if (!value) {
    return readFavoriteIds(ownerId);
  }

  const current = readFavoriteIds(ownerId);
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return writeFavoriteIds(next, ownerId);
}

export function isFavoriteId(id, ids) {
  return (ids || []).includes(Number(id));
}
