import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import CitySelect from './CitySelect';
import logoImage from '../assets/logo-header.png';

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V18h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 5.7l.1.1a1.7 1.7 0 0 0 1.9.3H11V5.5h2.5V5.6a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H19V13h-.1a1.7 1.7 0 0 0-1.5 1Z"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CabinetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21v-6h6v6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function cabinetLabel(role) {
  if (role === 'admin') return 'Панель администратора';
  if (role === 'executor') return 'Кабинет автосервиса';
  return 'Личный кабинет';
}

function cabinetPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'executor') return '/executor';
  if (role === 'customer') return '/customer';
  return '/';
}

function settingsPath(role) {
  if (role === 'customer') return '/customer/settings';
  if (role === 'executor') return '/executor';
  if (role === 'admin') return '/admin';
  return '/';
}

export default function SiteHeader({
  activeNav = '',
  onLogin,
  onRegister,
  scrolled = false,
  variant = 'default',
  searchValue = '',
  onSearchChange,
  noticeCount = 0,
  notices = [],
  onOpenNotice,
  displayName = '',
}) {
  const { user, logout } = useAuth();
  const { city, cities, setCity } = useCity();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const menuRef = useRef(null);
  const noticeRef = useRef(null);
  const isExecutorCabinet = variant === 'executor';
  const accountName = displayName || user?.name || user?.firstName || 'Профиль';

  const firstName = isExecutorCabinet
    ? accountName
    : accountName.split(' ')[0] || 'Профиль';

  const initials =
    accountName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    || 'П';

  useEffect(() => {
    if (!profileOpen && !noticeOpen) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
      if (!noticeRef.current?.contains(event.target)) {
        setNoticeOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setNoticeOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen, noticeOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    navigate('/', { replace: true });
    if (typeof logout === 'function') {
      await logout();
    }
  };

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${isExecutorCabinet ? ' is-executor-cab' : ''}`}>
      <div className={`header-inner${isExecutorCabinet ? ' is-executor-cab' : ''}`}>
        <Link to="/" className="logo" aria-label="Найти автосервис">
          <img className="logo-image" src={logoImage} alt="Найти автосервис" />
        </Link>

        {isExecutorCabinet ? (
          <label className="executor-cab-search">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Поиск по клиенту, автомобилю, услуге…"
            />
          </label>
        ) : (
          <nav className="main-nav" aria-label="Основная навигация">
            <Link
              to="/"
              className={`nav-button${activeNav === 'home' ? ' nav-button-active' : ''}`}
            >
              Главная
            </Link>
            <a
              href="/#services"
              className={`nav-button${activeNav === 'services' ? ' nav-button-active' : ''}`}
            >
              Услуги
            </a>
            <Link
              to="/register"
              className={`nav-button${activeNav === 'register' ? ' nav-button-active' : ''}`}
            >
              Для автосервисов
            </Link>
            <Link
              to="/map"
              className={`nav-button${activeNav === 'map' ? ' nav-button-active' : ''}`}
            >
              Карта сервисов
            </Link>
          </nav>
        )}

        {isExecutorCabinet ? null : (
          <div className="header-city">
            <CitySelect
              value={city}
              cities={cities}
              onChange={setCity}
            />
          </div>
        )}

        <div className="auth-nav">
          {user ? (
            <>
              {isExecutorCabinet ? (
                <div className="executor-cab-bell-wrap" ref={noticeRef}>
                  <button
                    type="button"
                    className={`executor-cab-bell ${noticeOpen ? 'is-open' : ''}`}
                    aria-label="Уведомления"
                    aria-expanded={noticeOpen}
                    onClick={() => setNoticeOpen((value) => !value)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path d="M10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {noticeCount > 0 ? <b>{noticeCount}</b> : null}
                  </button>
                  {noticeOpen ? (
                    <div className="ex-notice-drop" role="menu">
                      <strong>Уведомления</strong>
                      {notices.length > 0 ? notices.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`ex-notice-item ${item.read_at ? '' : 'is-unread'} is-${item.kind}`}
                          onClick={() => {
                            onOpenNotice?.(item);
                            setNoticeOpen(false);
                          }}
                        >
                          <b>{item.title}</b>
                          <span>{item.body}</span>
                          <time>
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                              : ''}
                          </time>
                        </button>
                      )) : (
                        <p>Пока нет уведомлений</p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="header-profile-wrapper" ref={menuRef}>
                <button
                  type="button"
                  className={`header-capsule header-user${profileOpen ? ' is-open' : ''}`}
                  title="Профиль"
                  onClick={() => setProfileOpen((value) => !value)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="header-user-avatar">{initials}</span>
                  <span className="header-user-name">{firstName}</span>
                  <span className="header-user-chevron" aria-hidden="true">
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

                {profileOpen && (
                  <div className="header-profile-menu" role="menu">
                    <div className="header-profile-info">
                      <strong>{accountName}</strong>
                      {user.email ? <span>{user.email}</span> : null}
                    </div>

                    <div className="header-profile-divider" />

                    <Link
                      to={cabinetPath(user.role)}
                      className="header-profile-item"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                    >
                      <span className="header-profile-item-icon">
                        <CabinetIcon />
                      </span>
                      {cabinetLabel(user.role)}
                    </Link>

                    <Link
                      to={settingsPath(user.role)}
                      className="header-profile-item"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                    >
                      <span className="header-profile-item-icon">
                        <SettingsIcon />
                      </span>
                      Настройки
                    </Link>

                    <button
                      type="button"
                      className="header-profile-item is-logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  if (typeof onLogin === 'function') {
                    onLogin();
                    return;
                  }
                  navigate('/login');
                }}
              >
                Войти
              </button>
              <button
                type="button"
                className="register-link"
                onClick={() => {
                  if (typeof onRegister === 'function') {
                    onRegister();
                    return;
                  }
                  navigate('/register');
                }}
              >
                Зарегистрироваться
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
