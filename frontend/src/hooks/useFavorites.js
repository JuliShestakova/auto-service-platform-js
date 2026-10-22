import { useEffect, useState } from 'react';
import {
  FAVORITES_EVENT,
  isFavoriteId,
  readFavoriteIds,
  toggleFavoriteId,
} from '../utils/favorites';

export default function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds());

  useEffect(() => {
    const sync = (event) => {
      if (Array.isArray(event?.detail)) {
        setFavoriteIds(event.detail);
        return;
      }
      setFavoriteIds(readFavoriteIds());
    };

    const onStorage = (event) => {
      if (event.key === null || event.key === 'favorite_executor_ids') {
        setFavoriteIds(readFavoriteIds());
      }
    };

    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggleFavorite = (id) => {
    setFavoriteIds(toggleFavoriteId(id));
  };

  const isFavorite = (id) => isFavoriteId(id, favoriteIds);

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
  };
}
