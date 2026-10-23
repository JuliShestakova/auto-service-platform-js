export async function parseJson(response) {
  return response.json().catch(() => ({}));
}

export function detailMessage(data, fallback) {
  const detail = data?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const text = detail
      .map((item) => item?.msg || item?.message || '')
      .filter(Boolean)
      .join('. ');
    if (text) return text;
  }
  return fallback;
}
