export const HOURS_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d[–\-—](?:[01]\d|2[0-3]):[0-5]\d$/;

export function normalizeClockTime(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return '';
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return '';
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseHoursRange(value) {
  const match = String(value || '').match(
    /^(\d{1,2}:\d{2})\s*[–\-—]\s*(\d{1,2}:\d{2})$/,
  );
  if (!match) {
    return { from: '', to: '' };
  }
  return {
    from: normalizeClockTime(match[1]),
    to: normalizeClockTime(match[2]),
  };
}

export function joinHoursRange(from, to) {
  const start = normalizeClockTime(from);
  const end = normalizeClockTime(to);
  if (!start || !end) {
    return '';
  }
  return `${start}–${end}`;
}

export function isCompleteHoursRange(from, to) {
  return Boolean(from) === Boolean(to);
}

export function isValidHoursRange(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return true;
  }
  return HOURS_PATTERN.test(trimmed.replace(/\s+/g, ''));
}
