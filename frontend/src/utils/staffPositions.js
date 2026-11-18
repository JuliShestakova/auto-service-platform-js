export const POSITION_SEP = ' · ';

export function parsePositions(value) {
  return [...new Set(
    String(value || '')
      .split(/\s*[·,;/|]\s*/)
      .map((item) => item.trim())
      .filter(Boolean),
  )];
}

export function joinPositions(list) {
  return [...new Set((list || []).map((item) => String(item).trim()).filter(Boolean))]
    .join(POSITION_SEP);
}
