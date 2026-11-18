export async function listServiceCatalog(fetchFn = fetch) {
  const response = await fetchFn('/api/services');
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function listServiceNames(fetchFn = fetch) {
  const items = await listServiceCatalog(fetchFn);
  return items.map((item) => item?.name).filter(Boolean);
}

export function groupServicesByCategory(items = []) {
  const map = new Map();
  items.forEach((item) => {
    const category = item?.category || 'Услуги';
    const name = item?.name;
    if (!name) return;
    if (!map.has(category)) {
      map.set(category, []);
    }
    map.get(category).push(name);
  });
  return Array.from(map.entries()).map(([category, names]) => ({
    category,
    items: names,
  }));
}
