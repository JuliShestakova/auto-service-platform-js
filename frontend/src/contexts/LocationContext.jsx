import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useCity } from './CityContext';
import {
  formatDistance,
  geocodeAddress,
  haversineKm,
  reverseGeocode,
  shopCoords,
} from '../utils/geo';

const LocationContext = createContext(undefined);
const STORAGE_KEY = 'clientLocation';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(Number(parsed?.lat)) || !Number.isFinite(Number(parsed?.lng))) {
      return null;
    }
    return {
      lat: Number(parsed.lat),
      lng: Number(parsed.lng),
      address: String(parsed.address || 'Моё местоположение'),
      source: parsed.source || 'address',
    };
  } catch {
    return null;
  }
}

export function LocationProvider({ children }) {
  const { user, updateProfile } = useAuth();
  const { city } = useCity();
  const [location, setLocation] = useState(readStored);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const persist = useCallback((next, { syncProfile = true } = {}) => {
    setLocation(next);
    setError('');
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (syncProfile && user && next) {
      updateProfile?.({
        address: next.address,
        latitude: next.lat,
        longitude: next.lng,
      });
    }
  }, [user, updateProfile]);

  useEffect(() => {
    if (readStored()) return;
    if (user?.latitude == null || user?.longitude == null) return;
    persist({
      lat: Number(user.latitude),
      lng: Number(user.longitude),
      address: user.address || 'Моё местоположение',
      source: 'saved',
    }, { syncProfile: false });
  }, [user, persist]);

  const setFromAddress = useCallback(async (query) => {
    setStatus('geocoding');
    setError('');
    try {
      const found = await geocodeAddress(query, city);
      if (!found) {
        setError('Не удалось найти этот адрес. Уточните улицу и город.');
        return null;
      }
      persist(found);
      return found;
    } catch {
      setError('Не удалось определить адрес');
      return null;
    } finally {
      setStatus('idle');
    }
  }, [city, persist]);

  const setFromGeolocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Геолокация недоступна в этом браузере');
      return null;
    }
    setStatus('locating');
    setError('');
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
        });
      });
      const next = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude,
      );
      persist(next);
      return next;
    } catch {
      setError('Разрешите доступ к геолокации или введите адрес вручную');
      return null;
    } finally {
      setStatus('idle');
    }
  }, [persist]);

  const clearLocation = useCallback(() => persist(null), [persist]);

  const distanceTo = useCallback((executor) => {
    if (!location) return null;
    return haversineKm(location, shopCoords(executor, city));
  }, [location, city]);

  const value = useMemo(() => ({
    location,
    status,
    error,
    setFromAddress,
    setFromGeolocation,
    clearLocation,
    distanceTo,
    formatDistance,
  }), [location, status, error, setFromAddress, setFromGeolocation, clearLocation, distanceTo]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const value = useContext(LocationContext);
  if (!value) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return value;
}
