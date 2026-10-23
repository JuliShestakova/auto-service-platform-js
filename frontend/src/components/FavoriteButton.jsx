import { useAuth } from '../contexts/AuthContext';

function HeartIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FavoriteButton({
  active = false,
  onToggle,
  className = '',
  label,
}) {
  const { user } = useAuth();
  if (user?.role === 'executor' || user?.role === 'admin') {
    return null;
  }

  return (
    <button
      type="button"
      className={`favorite-button${active ? ' is-active' : ''}${className ? ` ${className}` : ''}`}
      aria-label={label || (active ? 'Убрать из избранного' : 'Добавить в избранное')}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle?.();
      }}
    >
      <HeartIcon filled={active} />
    </button>
  );
}
