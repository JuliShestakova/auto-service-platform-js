export async function listServiceNames(fetchFn = fetch) {
  const response = await fetchFn('/api/services');
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : [])
    .map((item) => item?.name)
    .filter(Boolean);
}
