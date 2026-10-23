export async function listExecutors({ city, pending, fetchFn = fetch } = {}) {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (pending) params.set('pending', 'true');
  const query = params.toString();
  const response = await fetchFn(`/api/executors${query ? `?${query}` : ''}`);
  if (!response.ok) {
    throw new Error('Не удалось загрузить автосервисы');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getExecutor(id, fetchFn = fetch) {
  const response = await fetchFn(`/api/executors/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Не удалось загрузить автосервис');
  }
  return response.json();
}

export async function listExecutorReviews(id, fetchFn = fetch) {
  const response = await fetchFn(`/api/executors/${id}/reviews`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
