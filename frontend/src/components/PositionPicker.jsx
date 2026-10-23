import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { STAFF_POSITIONS } from '../data/staffPositions';

export default function PositionPicker({
  value = [],
  onChange,
  placeholder = 'Выберите должности',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();
  const selected = Array.isArray(value) ? value : [];

  const options = useMemo(() => {
    const extras = selected.filter((item) => !STAFF_POSITIONS.includes(item));
    return [...extras, ...STAFF_POSITIONS];
  }, [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru');
    if (!needle) {
      return options;
    }
    return options.filter((item) => item.toLocaleLowerCase('ru').includes(needle));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return undefined;
    }

    const timer = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 0);

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = (name) => {
    if (selected.includes(name)) {
      onChange?.(selected.filter((item) => item !== name));
      return;
    }
    onChange?.([...selected, name]);
  };

  const label = selected.length === 0
    ? placeholder
    : selected.length <= 2
      ? selected.join(', ')
      : `${selected[0]}, ${selected[1]} и ещё ${selected.length - 2}`;

  return (
    <div
      className={`position-picker${open ? ' is-open' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="position-picker-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected.length ? '' : 'is-placeholder'}>{label}</span>
        <span className="position-picker-chevron" aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div className="position-picker-menu" id={listId}>
          <input
            ref={searchRef}
            className="position-picker-search"
            type="text"
            value={query}
            placeholder="Поиск"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onClick={(event) => event.stopPropagation()}
          />
          <ul className="position-picker-list" role="listbox" aria-multiselectable="true">
            {filtered.length === 0 ? (
              <li className="position-picker-empty">Ничего не найдено</li>
            ) : (
              filtered.map((name) => {
                const checked = selected.includes(name);
                return (
                  <li key={name} role="option" aria-selected={checked}>
                    <button
                      type="button"
                      className={`position-picker-option${checked ? ' is-selected' : ''}`}
                      onClick={() => toggle(name)}
                    >
                      <span className="position-picker-box" aria-hidden="true">
                        {checked ? '✓' : ''}
                      </span>
                      {name}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
