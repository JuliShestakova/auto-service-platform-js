const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SPECIAL = '!@#$%^&*_-+=?';

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Не меньше 8 символов',
    test: (value) => value.length >= 8 && value.length <= 128,
  },
  {
    id: 'upper',
    label: 'Заглавная буква',
    test: (value) => /[A-ZА-ЯЁ]/.test(value),
  },
  {
    id: 'lower',
    label: 'Строчная буква',
    test: (value) => /[a-zа-яё]/.test(value),
  },
  {
    id: 'digit',
    label: 'Цифра',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'Спецсимвол (!@#$%^&* и т.п.)',
    test: (value) => /[^A-Za-zА-Яа-яЁё0-9\s]/.test(value),
  },
  {
    id: 'spaces',
    label: 'Без пробелов',
    test: (value) => value.length > 0 && !/\s/.test(value),
  },
];

export function getPasswordChecks(value) {
  const password = String(value || '');
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    ok: rule.test(password),
  }));
}

export function isValidPassword(value) {
  const password = String(value || '');
  if (!password || password.length > 128) {
    return false;
  }
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

function pick(chars) {
  const index = Math.floor(Math.random() * chars.length);
  return chars[index];
}

function shuffle(list) {
  const items = [...list];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function generatePassword(length = 12) {
  const size = Math.max(10, Math.min(24, Number(length) || 12));
  const required = [
    pick(UPPER),
    pick(LOWER),
    pick(DIGITS),
    pick(SPECIAL),
  ];
  const pool = UPPER + LOWER + DIGITS + SPECIAL;
  while (required.length < size) {
    required.push(pick(pool));
  }
  return shuffle(required).join('');
}
