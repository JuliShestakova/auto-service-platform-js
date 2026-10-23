import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  findServiceMatches,
  resolveBestService,
} from '../utils/fuzzyService';

export default function ServiceSuggest({
  value,
  options,
  onChange,
  onResolvedChange,
  onPick,
  placeholder = 'Например, замена тормозных колодок',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const rootRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const typed = query.trim().length > 0;

  const matches = useMemo(
    () => (typed ? findServiceMatches(query, options, 12) : []),
    [query, options, typed],
  );

  const showMenu = open && typed && matches.length > 0;

  useEffect(() => {
    if (!showMenu) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showMenu]);

  const pick = (name) => {
    setQuery(name);
    onChange?.(name);
    onResolvedChange?.(name);
    setOpen(false);
    onPick?.(name);
  };

  const resolveCurrent = () => {
    if (!query.trim()) {
      onChange?.('');
      onResolvedChange?.('');
      return '';
    }
    const best = resolveBestService(query, options) || query.trim();
    onChange?.(best);
    onResolvedChange?.(best);
    return best;
  };

  return (
    <div className="service-suggest" ref={rootRef}>
      <input
        className="service-suggest-input"
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showMenu}
        aria-controls={listId}
        onFocus={() => {
          // подсказки только после ввода, не по клику
          if (query.trim()) {
            setOpen(true);
          }
        }}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange?.(next);
          setOpen(next.trim().length > 0);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            resolveCurrent();
            setOpen(false);
          }, 120);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const best = resolveCurrent();
            setQuery(best);
            setOpen(false);
            onPick?.(best);
          }

          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      />

      {showMenu && (
        <ul id={listId} className="service-suggest-menu" role="listbox">
          {matches.map((name) => (
            <li key={name} role="option">
              <button
                type="button"
                className="service-suggest-option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
