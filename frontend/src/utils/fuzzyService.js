function normalizeRu(text) {
  return String(text || '')
    .toLocaleLowerCase('ru')
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(left, right) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

const SYNONYMS = [
  { keys: ['колодк', 'тормоз'], hint: 'тормозных колодок' },
  { keys: ['масл'], hint: 'замена масла' },
  { keys: ['шином', 'резин', 'колес'], hint: 'шиномонтаж' },
  { keys: ['диагност', 'компьютер'], hint: 'компьютерная диагностика' },
  { keys: ['двигател', 'мотор'], hint: 'ремонт двигателя' },
  { keys: ['кондиц', 'заправк'], hint: 'заправка кондиционера' },
];

function expandQuery(query) {
  const normalized = normalizeRu(query);
  if (!normalized) return '';

  let expanded = normalized;
  for (const group of SYNONYMS) {
    if (group.keys.some((key) => normalized.includes(key))) {
      expanded = `${expanded} ${group.hint}`;
    }
  }

  return normalizeRu(expanded);
}

function tokenMatchDistance(queryToken, candidateToken) {
  if (
    candidateToken.includes(queryToken)
    || queryToken.includes(candidateToken)
  ) {
    return 0;
  }

  return levenshtein(queryToken, candidateToken);
}

function maxAllowedDistance(token) {
  if (token.length <= 3) return 1;
  if (token.length <= 6) return 2;
  return 3;
}

export function scoreServiceMatch(query, serviceName) {
  const rawQuery = normalizeRu(query);
  if (!rawQuery) return 0;

  const candidate = normalizeRu(serviceName);
  const expanded = expandQuery(rawQuery);

  if (candidate.includes(rawQuery)) {
    return 200 - Math.abs(candidate.length - rawQuery.length);
  }

  const queryTokens = [...new Set(expanded.split(' ').filter(Boolean))];
  const candidateTokens = candidate.split(' ').filter(Boolean);

  let score = 0;

  for (const queryToken of queryTokens) {
    let best = Infinity;

    for (const candidateToken of candidateTokens) {
      best = Math.min(
        best,
        tokenMatchDistance(queryToken, candidateToken),
      );
    }

    if (best > maxAllowedDistance(queryToken)) {
      // синонимный токен не обязан совпасть строго
      if (SYNONYMS.some((group) => group.hint.includes(queryToken))) {
        continue;
      }
      return -1;
    }

    score += 40 - best * 8;
  }

  return score;
}

export function findServiceMatches(query, options, limit = 8) {
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    return [];
  }

  return options
    .map((name) => ({
      name,
      score: scoreServiceMatch(trimmed, name),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'ru'))
    .slice(0, limit)
    .map((item) => item.name);
}

export function resolveBestService(query, options) {
  const matches = findServiceMatches(query, options, 1);
  return matches[0] || '';
}
