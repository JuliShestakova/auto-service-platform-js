import { useRef } from 'react';
import { normalizeClockTime } from '../utils/hours';

export default function HoursRangeInputs({
  from = '',
  to = '',
  onChange,
  disabled = false,
  idPrefix = 'hours',
}) {
  const toRef = useRef(null);

  const focusEnd = () => {
    const end = toRef.current;
    if (!end || end.disabled) {
      return;
    }
    end.focus();
    end.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    try {
      end.showPicker?.();
    } catch {
      // showPicker can throw if the browser blocks it.
    }
  };

  return (
    <div className="hours-range">
      <input
        id={`${idPrefix}-from`}
        type="time"
        step="60"
        lang="ru"
        value={from}
        disabled={disabled}
        onChange={(event) => {
          const nextFrom = normalizeClockTime(event.target.value);
          const justFilled = Boolean(nextFrom) && !from;
          onChange?.({ from: nextFrom, to });
          if (justFilled && !to) {
            focusEnd();
          }
        }}
        aria-label="Начало работы"
      />
      <span className="hours-range-sep" aria-hidden="true">–</span>
      <input
        ref={toRef}
        id={`${idPrefix}-to`}
        type="time"
        step="60"
        lang="ru"
        value={to}
        disabled={disabled}
        onChange={(event) => onChange?.({
          from,
          to: normalizeClockTime(event.target.value),
        })}
        aria-label="Конец работы"
      />
    </div>
  );
}
