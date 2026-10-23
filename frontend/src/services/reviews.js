import { detailMessage, parseJson } from './api';

export function canCustomerReview(user) {
  return user?.role === 'customer';
}

export async function listMyReviews(authFetch) {
  const response = await authFetch('/api/reviews/me');
  if (!response.ok) {
    return null;
  }
  const data = await parseJson(response);
  return Array.isArray(data) ? data : [];
}

export async function createReview(authFetch, executorId, { rating, text }) {
  const response = await authFetch(`/api/executors/${executorId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, text }),
  });
  const data = await parseJson(response);
  return {
    ok: response.ok,
    data,
    error: response.ok ? '' : detailMessage(data, 'Не удалось отправить отзыв'),
  };
}

export async function deleteReview(authFetch, reviewId) {
  const response = await authFetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });
  return { ok: response.ok };
}
