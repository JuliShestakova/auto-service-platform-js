/** Fallback до загрузки городов из API / БД. */
export const DEFAULT_CITY = 'Краснодар';

export function buildCityCoords(cities = []) {
  const coords = {};
  cities.forEach((item) => {
    if (!item?.name) return;
    coords[item.name] = [Number(item.latitude), Number(item.longitude)];
  });
  return coords;
}

export function pickDefaultCity(cities = [], fallback = DEFAULT_CITY) {
  const preferred = cities.find((item) => item?.is_default)?.name;
  if (preferred) return preferred;
  if (cities[0]?.name) return cities[0].name;
  return fallback;
}
