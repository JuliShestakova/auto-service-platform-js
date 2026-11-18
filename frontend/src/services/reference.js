async function fetchJson(url, fetchFn = fetch) {
  const response = await fetchFn(url);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function listStaffPositions(fetchFn = fetch) {
  const rows = await fetchJson('/api/staff-positions', fetchFn);
  return rows.map((item) => item?.name).filter(Boolean);
}

export async function listServiceAliases(fetchFn = fetch) {
  const rows = await fetchJson('/api/service-aliases', fetchFn);
  return rows.map((item) => item?.name).filter(Boolean);
}

export async function listServiceSearchSynonyms(fetchFn = fetch) {
  return fetchJson('/api/service-search-synonyms', fetchFn);
}

export async function listBookingSlots(fetchFn = fetch) {
  const rows = await fetchJson('/api/booking-slots', fetchFn);
  return rows.map((item) => item?.time).filter(Boolean);
}

export async function listServiceCategories(fetchFn = fetch) {
  return fetchJson('/api/service-categories', fetchFn);
}

export async function listFeaturedServices(fetchFn = fetch) {
  return fetchJson('/api/featured-services', fetchFn);
}

export function categoriesToMeta(rows = []) {
  const meta = {};
  rows.forEach((item) => {
    if (!item?.name) return;
    meta[item.name] = {
      label: item.short_label || item.name,
      icon: item.icon || 'more',
    };
  });
  return meta;
}
