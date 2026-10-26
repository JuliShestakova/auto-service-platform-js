import { useEffect, useId, useMemo, useRef, useState } from 'react';

export default function FilterSelect({
  value,
  options = [],
  onChange,
  placeholder = 'Выберите',
  searchPlaceholder = 'Поиск',
  action = null,
  emptyLabel = 'Ничего не найдено',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();

  const selected = options.find((item) => String(item.value) === String(value));

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru');
    if (!needle) {
      return options;
    }
    return options.filter((item) => (
      String(item.label).toLocaleLowerCase('ru').includes(needle)
    ));
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

  const pick = (next) => {
    onChange?.(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <div
      className={`filter-select${open ? ' is-open' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="filter-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? '' : 'is-placeholder'}>
          {selected?.label || placeholder}
        </span>
        <span className="filter-select-chevron" aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div className="filter-select-menu" id={listId}>
          <input
            ref={searchRef}
            className="filter-select-search"
            type="text"
            value={query}
            placeholder={searchPlaceholder}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onClick={(event) => event.stopPropagation()}
          />
          <ul className="filter-select-list" role="listbox">
            {filtered.length === 0 ? (
              <li className="filter-select-empty">{emptyLabel}</li>
            ) : (
              filtered.map((item) => {
                const isSelected = String(item.value) === String(value);
                return (
                  <li key={item.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`filter-select-option${isSelected ? ' is-selected' : ''}${item.disabled ? ' is-disabled' : ''}`}
                      disabled={Boolean(item.disabled)}
                      onClick={() => {
                        if (!item.disabled) {
                          pick(item.value);
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {action ? (
            <button
              type="button"
              className="filter-select-action"
              onClick={() => pick(action.value)}
            >
              {action.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
