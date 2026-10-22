import { CITY_COORDS, DEFAULT_CITY } from '../data/cities';

export function shopCoords(executor, fallbackCity = DEFAULT_CITY) {
  const lat = executor?.latitude == null ? NaN : Number(executor.latitude);
  const lng = executor?.longitude == null ? NaN : Number(executor.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
    return { lat, lng };
  }

  const center = CITY_COORDS[executor?.city] || CITY_COORDS[fallbackCity] || CITY_COORDS[DEFAULT_CITY];
  const n = Number(executor?.id) || 0;
  const angle = (n * 2.399) % (Math.PI * 2);
  const radius = 0.01 + (n % 8) * 0.0035;
  return {
    lat: center[0] + Math.sin(angle) * radius,
    lng: center[1] + Math.cos(angle) * radius,
  };
}

export function haversineKm(from, to) {
  if (!from || !to) return null;
  const lat1 = Number(from.lat);
  const lng1 = Number(from.lng);
  const lat2 = Number(to.lat);
  const lng2 = Number(to.lng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return '';
  if (km < 0.1) return 'рядом';
  if (km < 10) return `${km.toFixed(1)} км`;
  return `${Math.round(km)} км`;
}

function cityMatches(props, city) {
  if (!city) return true;
  const needle = String(city).toLowerCase();
  const hay = [props.city, props.locality, props.county, props.state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

export async function geocodeAddress(query, city = '') {
  const raw = String(query || '').trim();
  if (!raw) return null;
  const needle = city && !raw.toLowerCase().includes(city.toLowerCase())
    ? `${raw}, ${city}`
    : raw;
  const center = CITY_COORDS[city] || CITY_COORDS[DEFAULT_CITY];

  try {
    const params = new URLSearchParams({
      q: needle,
      limit: '8',
    });
    if (center) {
      params.set('lat', String(center[0]));
      params.set('lon', String(center[1]));
    }
    const photonRes = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
    if (photonRes.ok) {
      const photon = await photonRes.json();
      const features = photon?.features || [];
      const preferred = features.find((item) => cityMatches(item.properties || {}, city))
        || features[0];
      const [lng, lat] = preferred?.geometry?.coordinates || [];
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {
          lat,
          lng,
          address: raw.includes(city) ? raw : needle,
          source: 'address',
        };
      }
    }
  } catch {
    /* fallback below */
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(needle)}&count=1&language=ru&format=json`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  const hit = data?.results?.[0];
  if (!hit) return null;
  return {
    lat: hit.latitude,
    lng: hit.longitude,
    address: [hit.name, hit.admin1, hit.country].filter(Boolean).join(', '),
    source: 'address',
  };
}

export async function reverseGeocode(lat, lng) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ru`;
  const response = await fetch(url);
  if (!response.ok) {
    return {
      lat,
      lng,
      address: 'Моё местоположение',
      source: 'gps',
    };
  }
  const data = await response.json();
  const address = [
    data.locality || data.city,
    data.principalSubdivision,
    data.countryName,
  ].filter(Boolean).join(', ') || 'Моё местоположение';
  return { lat, lng, address, source: 'gps' };
}
