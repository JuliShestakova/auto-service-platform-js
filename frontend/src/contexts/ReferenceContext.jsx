import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  categoriesToMeta,
  listBookingSlots,
  listFeaturedServices,
  listServiceAliases,
  listServiceCategories,
  listServiceSearchSynonyms,
  listStaffPositions,
} from '../services/reference';
import { setServiceSynonyms } from '../utils/fuzzyService';

const ReferenceContext = createContext(undefined);

export function ReferenceProvider({ children }) {
  const [staffPositions, setStaffPositions] = useState([]);
  const [serviceAliases, setServiceAliases] = useState([]);
  const [bookingSlots, setBookingSlots] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listStaffPositions(),
      listServiceAliases(),
      listServiceSearchSynonyms(),
      listBookingSlots(),
      listServiceCategories(),
      listFeaturedServices(),
    ])
      .then(([
        positions,
        aliases,
        synonyms,
        slots,
        categories,
        featured,
      ]) => {
        if (cancelled) return;
        setStaffPositions(positions);
        setServiceAliases(aliases);
        setServiceSynonyms(synonyms);
        setBookingSlots(slots);
        setServiceCategories(categories);
        setFeaturedServices(featured);
      })
      .catch(() => {
        if (!cancelled) {
          setStaffPositions([]);
          setServiceAliases([]);
          setBookingSlots([]);
          setServiceCategories([]);
          setFeaturedServices([]);
          setServiceSynonyms([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryMeta = useMemo(
    () => categoriesToMeta(serviceCategories),
    [serviceCategories],
  );

  const value = useMemo(
    () => ({
      staffPositions,
      serviceAliases,
      bookingSlots,
      serviceCategories,
      categoryMeta,
      featuredServices,
      loading,
    }),
    [
      staffPositions,
      serviceAliases,
      bookingSlots,
      serviceCategories,
      categoryMeta,
      featuredServices,
      loading,
    ],
  );

  return (
    <ReferenceContext.Provider value={value}>
      {children}
    </ReferenceContext.Provider>
  );
}

export function useReference() {
  const context = useContext(ReferenceContext);
  if (!context) {
    throw new Error('useReference must be used within ReferenceProvider');
  }
  return context;
}
