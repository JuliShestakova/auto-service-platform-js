import { useEffect, useId, useRef, useState } from 'react';

export default function CitySelect({
  value,
  cities,
  onChange,
  className = '',
  ariaLabel = 'Выбор города',
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

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
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`city-select${open ? ' is-open' : ''} ${className}`.trim()}
      ref={rootRef}
    >
      <button
        type="button"
        className="city-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="city-select-pin" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle cx="12" cy="10" r="2.4" fill="currentColor" />
          </svg>
        </span>
        <span className="city-select-value">{value}</span>
        <span className="city-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          id={listId}
          className="city-select-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          {cities.map((name) => {
            const selected = name === value;
            return (
              <li key={name} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`city-select-option${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  <span>{name}</span>
                  {selected && (
                    <span className="city-select-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
