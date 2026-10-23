export const STAFF_POSITIONS = [
  'Мастер',
  'Моторист',
  'Автоэлектрик',
  'Мастер по ремонту АКПП',
  'Мастер по ремонту МКПП',
  'Мастер по ходовой части',
  'Мастер по рулевому управлению',
  'Мастер по ремонту двигателей',
  'Шиномонтажник',
  'Специалист по развал-схождению',
  'Кузовщик-жестянщик',
  'Автомаляр',
  'Мастер по полировке кузова',
  'Специалист по шумоизоляции',
  'Специалист по ГБО',
  'Выездной автомеханик',
  'Выездной автодиагност',
  'Мастер по эвакуации автомобилей',
];

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
