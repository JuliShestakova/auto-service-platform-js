import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_CITY,
  buildCityCoords,
  pickDefaultCity,
} from '../data/cities';
import { listCities } from '../services/cities';
import { setCityCoordsCache } from '../utils/geo';

const CityContext = createContext(undefined);
const CITY_STORAGE_KEY = 'selectedCity';

function readStoredCity() {
  try {
    return localStorage.getItem(CITY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function CityProvider({ children }) {
  const [cityRows, setCityRows] = useState([]);
  const [city, setCityState] = useState(readStoredCity() || DEFAULT_CITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    listCities()
      .then((rows) => {
        if (cancelled) return;
        setCityRows(rows);
        const names = rows.map((item) => item.name);
        const coords = buildCityCoords(rows);
        setCityCoordsCache(coords, pickDefaultCity(rows));

        setCityState((current) => {
          if (current && names.includes(current)) {
            return current;
          }
          const stored = readStoredCity();
          if (stored && names.includes(stored)) {
            return stored;
          }
          return pickDefaultCity(rows);
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCityRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!city) return;
    try {
      localStorage.setItem(CITY_STORAGE_KEY, city);
    } catch {
      /* ignore */
    }
  }, [city]);

  const cities = useMemo(
    () => cityRows.map((item) => item.name),
    [cityRows],
  );

  const cityCoords = useMemo(
    () => buildCityCoords(cityRows),
    [cityRows],
  );

  const setCity = (nextCity) => {
    if (!nextCity) return;
    if (cities.length > 0 && !cities.includes(nextCity)) return;
    setCityState(nextCity);
  };

  const value = useMemo(
    () => ({
      city,
      cities,
      cityCoords,
      cityRows,
      loading,
      setCity,
      defaultCity: pickDefaultCity(cityRows),
    }),
    [city, cities, cityCoords, cityRows, loading],
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
