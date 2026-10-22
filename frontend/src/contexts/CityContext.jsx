import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { CITIES, DEFAULT_CITY, isKnownCity } from '../data/cities';

const CityContext = createContext(undefined);
const CITY_STORAGE_KEY = 'selectedCity';

function readStoredCity() {
  try {
    const stored = localStorage.getItem(CITY_STORAGE_KEY);
    if (stored && isKnownCity(stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_CITY;
}

export function CityProvider({ children }) {
  const [city, setCityState] = useState(readStoredCity);

  useEffect(() => {
    try {
      localStorage.setItem(CITY_STORAGE_KEY, city);
    } catch {
      /* ignore */
    }
  }, [city]);

  const setCity = (nextCity) => {
    if (isKnownCity(nextCity)) {
      setCityState(nextCity);
    }
  };

  const value = useMemo(
    () => ({
      city,
      cities: CITIES,
      setCity,
    }),
    [city],
  );

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);

  if (!context) {
    throw new Error('useCity must be used within CityProvider');
  }

  return context;
}
