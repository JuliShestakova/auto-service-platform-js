import { detailMessage, parseJson } from './api';

export function canBookOnline(user) {
  return !user || user.role === 'customer';
}

export async function listOrders(authFetch) {
  const response = await authFetch('/api/orders');
  if (!response.ok) {
    return [];
  }
  const data = await parseJson(response);
  return Array.isArray(data) ? data : [];
}

export async function createOrder(authFetch, payload) {
  const response = await authFetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(response);
  return {
    ok: response.ok,
    data,
    error: response.ok ? '' : detailMessage(data, 'Не удалось сохранить запись'),
  };
}

export async function updateOrder(authFetch, orderId, payload) {
  const response = await authFetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(response);
  return {
    ok: response.ok,
    data,
    error: response.ok ? '' : detailMessage(data, 'Не удалось обновить запись'),
  };
}
