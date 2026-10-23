import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FAVORITES_EVENT,
  isFavoriteId,
  readFavoriteIds,
  toggleFavoriteId,
} from '../services/favorites';

function ownerIdFromUser(user) {
  if (user?.role === 'customer' && user?.id) {
    return user.id;
  }
  return null;
}

export default function useFavorites() {
  const { user } = useAuth();
  const canFavorite = !user || user.role === 'customer';
  const ownerId = ownerIdFromUser(user);
  const [favoriteIds, setFavoriteIds] = useState(() => (
    canFavorite ? readFavoriteIds(ownerId) : []
  ));

  useEffect(() => {
    if (!canFavorite) {
      setFavoriteIds([]);
      return undefined;
    }

    setFavoriteIds(readFavoriteIds(ownerId));

    const sync = (event) => {
      const detail = event?.detail;
      if (detail && typeof detail === 'object' && Array.isArray(detail.ids)) {
        if ((detail.ownerId || null) === (ownerId || null)) {
          setFavoriteIds(detail.ids);
        }
        return;
      }
      setFavoriteIds(readFavoriteIds(ownerId));
    };

    const onStorage = (event) => {
      if (event.key === null || String(event.key).startsWith('favorite_executor_ids')) {
        setFavoriteIds(readFavoriteIds(ownerId));
      }
    };

    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [ownerId, canFavorite]);

  const toggleFavorite = (id) => {
    if (!canFavorite) {
      return;
    }
    setFavoriteIds(toggleFavoriteId(id, ownerId));
  };

  const isFavorite = (id) => canFavorite && isFavoriteId(id, favoriteIds);

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    canFavorite,
  };
}
