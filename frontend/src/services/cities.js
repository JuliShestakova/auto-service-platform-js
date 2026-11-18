export async function listCities(fetchFn = fetch) {
  const response = await fetchFn('/api/cities');
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
