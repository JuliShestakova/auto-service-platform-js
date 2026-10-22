import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { DEFAULT_CITY } from '../data/cities';
import {
  SERVICE_ALIASES,
  SERVICE_CATALOG,
  SERVICE_GROUPS,
} from '../data/serviceCatalog';
import CitySelect from '../components/CitySelect';
import FavoriteButton from '../components/FavoriteButton';
import ServiceCardModal from '../components/ServiceCardModal';
import ServiceSuggest from '../components/ServiceSuggest';
import SiteHeader from '../components/SiteHeader';
import { useLocation } from '../contexts/LocationContext';
import useFavorites from '../hooks/useFavorites';
import shopImage1 from '../assets/shops/shop-1.jpg';
import shopImage2 from '../assets/shops/shop-2.jpg';
import shopImage3 from '../assets/shops/shop-3.jpg';
import shopImage4 from '../assets/shops/shop-4.jpg';
import shopImage5 from '../assets/shops/shop-5.jpg';
import shopImage6 from '../assets/shops/shop-6.jpg';
import shopImage7 from '../assets/shops/shop-7.jpg';
import shopImage8 from '../assets/shops/shop-8.jpg';

const SHOP_IMAGES = [
  shopImage1,
  shopImage2,
  shopImage3,
  shopImage4,
  shopImage5,
  shopImage6,
  shopImage7,
  shopImage8,
];

const GROUP_META = {
  ТО: { label: 'ТО', icon: 'to' },
  Двигатель: { label: 'Двигатель', icon: 'engine' },
  Трансмиссия: { label: 'Трансмиссия', icon: 'trans' },
  Диагностика: { label: 'Диагностика', icon: 'diag' },
  'Топливная система': { label: 'Топливная система', icon: 'fuel' },
  'Тормозная система': { label: 'Тормозная система', icon: 'brake' },
  'Подвеска и ходовая часть': { label: 'Ходовая', icon: 'chassis' },
  'Рулевое управление': { label: 'Рулевое', icon: 'steer' },
  'Система охлаждения': { label: 'Охлаждение', icon: 'cool' },
  'Выхлопная система': { label: 'Выхлоп', icon: 'exhaust' },
  Электрооборудование: { label: 'Электрика', icon: 'electro' },
  'Кондиционер и отопление': { label: 'Кондиционер', icon: 'ac' },
  'Шиномонтаж и колёса': { label: 'Шиномонтаж', icon: 'tire' },
  'Развал-схождение': { label: 'Развал', icon: 'align' },
  'Кузовной ремонт и покраска': { label: 'Кузов', icon: 'body' },
  'Автомобильные стёкла': { label: 'Стёкла', icon: 'glass' },
  'Мойка и детейлинг': { label: 'Мойка', icon: 'wash' },
  ГБО: { label: 'ГБО', icon: 'gas' },
  'Дополнительные услуги': { label: 'Доп. услуги', icon: 'more' },
  Другое: { label: 'Другое', icon: 'more' },
};

function GroupIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'engine':
      return (
        <svg {...common}>
          <path d="M4 10h3l2-3h4l2 3h3v7H4z" />
          <path d="M10 14h4" />
        </svg>
      );
    case 'trans':
      return (
        <svg {...common}>
          <circle cx="8" cy="12" r="3" />
          <circle cx="16" cy="8" r="2.5" />
          <circle cx="16" cy="16" r="2.5" />
          <path d="M11 12h2.5M14.2 9.5l-1.5 1.5M14.2 14.5l-1.5-1.5" />
        </svg>
      );
    case 'brake':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
        </svg>
      );
    case 'chassis':
      return (
        <svg {...common}>
          <path d="M4 14h16" />
          <path d="M7 14V9h3l2 3h5v2" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
        </svg>
      );
    case 'electro':
      return (
        <svg {...common}>
          <path d="M13 3 6 14h5l-1 7 7-11h-5z" />
        </svg>
      );
    case 'tire':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'diag':
      return (
        <svg {...common}>
          <path d="M9 18h6" />
          <path d="M10 18V9a2 2 0 0 1 4 0v9" />
          <path d="M8 11h8" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.5M12 18.5V21M4.2 6.2l1.8 1.8M18 16l1.8 1.8M3 12h2.5M18.5 12H21M4.2 17.8 6 16M18 8l1.8-1.8" />
        </svg>
      );
  }
}

function shopsWord(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'автосервис';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'автосервиса';
  }
  return 'автосервисов';
}

function priceNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function lowestPrice(executor) {
  const prices = (executor.services || [])
    .map((item) => priceNumber(item?.[1]))
    .filter((price) => price > 0);

  return prices.length ? Math.min(...prices) : 0;
}

function formatPrice(value) {
  if (!value) {
    return 'по запросу';
  }

  return `от ${value.toLocaleString('ru-RU')} ₽`;
}

const BOOKING_TIMES = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00',
];

function serviceRows(executor) {
  return (executor?.services || [])
    .map((item) => (
      Array.isArray(item)
        ? [item[0], item[1]]
        : [item?.name, item?.price]
    ))
    .filter((item) => item[0]);
}

function readApiError(data, fallback) {
  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  return fallback;
}

function SearchPage({ onLogin, onRegister }) {
  const { user, authFetch } = useAuth();
  const { city: selectedCity, cities, setCity } = useCity();
  const { location, distanceTo, formatDistance } = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [params, setParams] = useSearchParams();
  const [executors, setExecutors] = useState([]);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [openOnly, setOpenOnly] = useState(false);
  const [checkedWorks, setCheckedWorks] = useState([]);
  const [bookingExecutor, setBookingExecutor] = useState(null);
  const [bookingFocus, setBookingFocus] = useState('booking');
  const [bookingReviews, setBookingReviews] = useState([]);
  const [bookingService, setBookingService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingSaving, setBookingSaving] = useState(false);
  const [catalogNames, setCatalogNames] = useState(SERVICE_CATALOG);
  const [openGroups, setOpenGroups] = useState(() => new Set());

  const work = params.get('work') || '';
  const city = params.get('city') || selectedCity || DEFAULT_CITY;
  const bookId = params.get('book') || '';
  const nameQuery = params.get('q') || '';
  const [nameDraft, setNameDraft] = useState(nameQuery);
  const [workDraft, setWorkDraft] = useState(work);

  useEffect(() => {
    const urlCity = params.get('city');

    if (!urlCity) {
      const next = new URLSearchParams(params);
      next.set('city', selectedCity);
      setParams(next, { replace: true });
      return;
    }

    if (urlCity !== selectedCity) {
      const next = new URLSearchParams(params);
      next.set('city', selectedCity);
      setParams(next, { replace: true });
    }
    // Синхронизация выбранного города в URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, params.toString()]);

  useEffect(() => {
    const loadExecutors = async () => {
      try {
        setError('');
        const response = await fetch(
          `/api/executors?city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error('Не удалось загрузить автосервисы');
        }

        setExecutors(await response.json());
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить автосервисы'
        );
      }
    };

    loadExecutors();
  }, [city]);

  const changeCity = (nextCity) => {
    setCity(nextCity);
    const next = new URLSearchParams(params);
    next.set('city', nextCity);
    setParams(next);
  };

  const openBooking = (executor, focus = 'booking') => {
    const rows = serviceRows(executor);
    setBookingExecutor(executor);
    setBookingFocus(focus);
    setBookingService(
      rows.some((item) => item[0] === work) ? work : ''
    );
    setBookingDate('');
    setBookingTime('');
    setBookingError('');
    setBookingDone(false);

    if (focus === 'reviews') {
      setTimeout(() => {
        document
          .getElementById('search-modal-reviews')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const closeBooking = () => {
    setBookingExecutor(null);
    setBookingFocus('booking');
    setBookingReviews([]);
    setBookingDone(false);
    setBookingError('');

    if (bookId) {
      const next = new URLSearchParams(params);
      next.delete('book');
      setParams(next, { replace: true });
    }
  };

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) return;
        const data = await response.json();
        const names = data.map((item) => item?.name).filter(Boolean);
        if (names.length) setCatalogNames(names);
      } catch {
        // локальный каталог
      }
    };
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!bookId || executors.length === 0) {
      return;
    }

    const found = executors.find(
      (item) => String(item.id) === bookId
    );

    if (found) {
      openBooking(found);
    }
  }, [bookId, executors]);

  useEffect(() => {
    if (!bookingExecutor?.id) {
      setBookingReviews([]);
      return undefined;
    }

    let cancelled = false;
    const loadReviews = async () => {
      try {
        const response = await fetch(
          `/api/executors/${bookingExecutor.id}/reviews`
        );
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setBookingReviews(data);
      } catch {
        if (!cancelled) setBookingReviews([]);
      }
    };
    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [bookingExecutor?.id]);

  useEffect(() => {
    if (!bookingExecutor) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeBooking();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [bookingExecutor, bookId]);

  useEffect(() => {
    setCheckedWorks(work ? [work] : []);
  }, [work]);

  useEffect(() => {
    setNameDraft(nameQuery);
  }, [nameQuery]);

  useEffect(() => {
    setWorkDraft(work);
  }, [work]);

  const workOptions = useMemo(() => {
    const fromShops = executors.flatMap((executor) =>
      (executor.services || [])
        .map((item) => item?.[0])
        .filter(Boolean)
    );
    return [...new Set([
      ...SERVICE_CATALOG,
      ...SERVICE_ALIASES,
      ...catalogNames,
      ...fromShops,
    ])];
  }, [executors, catalogNames]);

  const filterGroups = useMemo(() => {
    const known = new Set(SERVICE_GROUPS.flatMap((group) => group.items));
    const extras = workOptions.filter((name) => !known.has(name));
    if (extras.length === 0) {
      return SERVICE_GROUPS;
    }
    return [
      ...SERVICE_GROUPS,
      { category: 'Другое', items: extras.sort((a, b) => a.localeCompare(b, 'ru')) },
    ];
  }, [workOptions]);

  const results = useMemo(() => {
    const selectedWorks = new Set(checkedWorks);

    return executors
      .filter((executor) => {
        const needle = nameDraft.trim().toLowerCase();
        if (needle) {
          const haystack = `${executor.name || ''} ${executor.address || ''}`.toLowerCase();
          if (!haystack.includes(needle)) {
            return false;
          }
        }

        if (openOnly && executor.status !== 'Открыто') {
          return false;
        }

        if (minRating && Number(executor.rating) < minRating) {
          return false;
        }

        const price = lowestPrice(executor);
        if (price && price > maxPrice) {
          return false;
        }

        if (selectedWorks.size === 0) {
          return true;
        }

        const offered = (executor.services || [])
          .map((item) => String(item?.[0] || '').toLowerCase())
          .filter(Boolean);

        return [...selectedWorks].some((selected) => {
          const needle = String(selected).toLowerCase();
          return offered.some((name) => (
            name === needle
            || name.includes(needle)
            || needle.includes(name)
          ));
        });
      })
      .sort((left, right) => {
        if (sort === 'price') {
          return lowestPrice(left) - lowestPrice(right);
        }

        if (sort === 'name') {
          return left.name.localeCompare(right.name, 'ru');
        }

        if (sort === 'distance' && location) {
          return (distanceTo(left) ?? 9999) - (distanceTo(right) ?? 9999);
        }

        return Number(right.rating) - Number(left.rating);
      });
  }, [executors, checkedWorks, openOnly, minRating, maxPrice, sort, nameDraft, location, distanceTo]);

  useEffect(() => {
    if (!work) return;
    const group = filterGroups.find((item) => item.items.includes(work));
    if (!group) return;
    setOpenGroups((current) => {
      if (current.has(group.category)) return current;
      const next = new Set(current);
      next.add(group.category);
      return next;
    });
  }, [work, filterGroups]);


  const updateWork = (nextWork) => {
    const next = new URLSearchParams(params);
    if (nextWork) {
      next.set('work', nextWork);
    } else {
      next.delete('work');
    }
    next.set('city', city);
    setParams(next);
    setCheckedWorks(nextWork ? [nextWork] : []);
  };

  const toggleWork = (name) => {
    setCheckedWorks((current) => (
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    ));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setBookingError('');

    if (!user) {
      onLogin();
      return;
    }

    if (user.role !== 'customer') {
      setBookingError('Запись оформляется из аккаунта клиента.');
      return;
    }

    if (!bookingService || !bookingDate || !bookingTime) {
      setBookingError('Выберите услугу, дату и время.');
      return;
    }

    setBookingSaving(true);

    try {
      const response = await authFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookingService,
          description: '',
          executor_id: bookingExecutor.id,
          visit_date: bookingDate,
          visit_time: bookingTime,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setBookingError(
          readApiError(data, 'Не удалось сохранить запись')
        );
        return;
      }

      setBookingDone(true);
    } catch {
      setBookingError('Не удалось сохранить запись');
    } finally {
      setBookingSaving(false);
    }
  };

  const submitShopReview = async ({ rating, text }) => {
    if (!user) {
      onLogin();
      return { error: 'Войдите, чтобы оставить отзыв' };
    }
    if (!bookingExecutor?.id) {
      return { error: 'Автосервис не выбран' };
    }
    const response = await authFetch(`/api/executors/${bookingExecutor.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, text }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: readApiError(data, 'Не удалось отправить отзыв') };
    }
    setBookingReviews((current) => [data, ...current]);
    setBookingExecutor((current) => (
      current
        ? { ...current, reviews: (Number(current.reviews) || 0) + 1 }
        : current
    ));
    return { ok: true };
  };

  const deleteShopReview = async (review) => {
    if (!review?.id) return;
    const response = await authFetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
    if (!response.ok) return;
    setBookingReviews((current) => current.filter((item) => item.id !== review.id));
    setBookingExecutor((current) => (
      current
        ? { ...current, reviews: Math.max(0, (Number(current.reviews) || 1) - 1) }
        : current
    ));
  };

  const applyNameQuery = (value, workValue = workDraft) => {
    const next = new URLSearchParams(params);
    const trimmed = String(value || '').trim();
    const workName = String(workValue || '').trim();
    if (trimmed) next.set('q', trimmed);
    else next.delete('q');
    if (workName) next.set('work', workName);
    else next.delete('work');
    next.set('city', city);
    setParams(next);
    setCheckedWorks(workName ? [workName] : []);
  };

  const resetFilters = () => {
    setSort('rating');
    setMinRating(0);
    setMaxPrice(10000);
    setOpenOnly(false);
    setCheckedWorks([]);
    setNameDraft('');
    setWorkDraft('');
    setParams({ city });
  };

  return (
    <div className="home-page search-page">
      <SiteHeader
        onLogin={onLogin}
        onRegister={onRegister}
      />

      <main className="search-main">
        <form
          id="search-bar"
          className="catalog-search search-bar search-bar-with-work"
          onSubmit={(event) => {
            event.preventDefault();
            applyNameQuery(nameDraft, workDraft);
          }}
        >
          <label className="search-work-field">
            <span>Работа</span>
            <div className="search-field-wrap">
              <span className="search-field-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </span>
              <ServiceSuggest
                value={workDraft}
                options={workOptions}
                onChange={setWorkDraft}
                placeholder="Например, замена колодок"
              />
            </div>
          </label>
          <label>
            <span>Название</span>
            <div className="search-field-wrap">
              <span className="search-field-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                type="search"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                placeholder="Например, ГУД Сервис"
                autoComplete="off"
              />
            </div>
          </label>
          <label className="search-city-field">
            <span>Где искать</span>
            <div className="search-field-wrap is-city">
              <CitySelect
                className="city-select-search"
                value={city}
                cities={cities}
                onChange={changeCity}
              />
            </div>
          </label>
          <button type="submit" className="primary-button search-submit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            Найти сервис
          </button>
        </form>

        <div className="search-title">
          <h1>
            Результаты
            {' '}
            <span>поиска</span>
          </h1>
          <p>
            Найдено {results.length} {shopsWord(results.length)} в {city}
          </p>
        </div>

        {error && <p className="services-subtitle">{error}</p>}

        <div className="search-layout">
          <aside className="search-filters">
            <label className="search-filter-block">
              <span className="search-filter-label">Сортировка</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="rating">По рейтингу</option>
                <option value="price">По цене</option>
                <option value="name">По названию</option>
                <option value="distance" disabled={!location}>По расстоянию</option>
              </select>
            </label>

            <div className="search-filter-block">
              <span className="search-filter-label">Цена услуги</span>
              <div className="search-price-scale">
                <span>0 ₽</span>
                <span>10 000 ₽</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(Number(event.target.value))
                }
              />
              <small className="search-price-value">
                до {maxPrice.toLocaleString('ru-RU')} ₽
              </small>
            </div>

            <fieldset className="search-filter-block">
              <legend className="search-filter-label">Рейтинг</legend>
              {[0, 4.5, 4].map((value) => (
                <label key={value} className="search-radio">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === value}
                    onChange={() => setMinRating(value)}
                  />
                  {value ? `${value} и выше` : 'Любой'}
                </label>
              ))}
            </fieldset>

            <div className="search-works-block">
              <p className="search-works-heading">Услуги</p>
              <div className="search-works-groups">
                {filterGroups.map((group) => {
                  const isOpen = openGroups.has(group.category);
                  const selectedCount = group.items.filter((name) =>
                    checkedWorks.includes(name)
                  ).length;
                  const meta = GROUP_META[group.category] || {
                    label: group.category,
                    icon: 'more',
                  };

                  return (
                    <div
                      key={group.category}
                      className={`swg${isOpen ? ' is-open' : ''}`}
                    >
                      <div
                        className="swg-head"
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                        onClick={() => {
                          setOpenGroups((current) => {
                            const next = new Set(current);
                            if (next.has(group.category)) {
                              next.delete(group.category);
                            } else {
                              next.add(group.category);
                            }
                            return next;
                          });
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.currentTarget.click();
                          }
                        }}
                      >
                        <span className="swg-icon">
                          <GroupIcon name={meta.icon} />
                        </span>
                        <b className="swg-name">{meta.label}</b>
                        {selectedCount > 0 ? (
                          <i className="swg-count">{selectedCount}</i>
                        ) : null}
                        <b className="swg-arrow">{isOpen ? '▾' : '▸'}</b>
                      </div>

                      {isOpen ? (
                        <div className="swg-body">
                          {group.items.map((name) => (
                            <label key={name} className="swg-item">
                              <input
                                type="checkbox"
                                checked={checkedWorks.includes(name)}
                                onChange={() => toggleWork(name)}
                              />
                              {name}
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="search-check">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
              />
              Открыто сейчас
            </label>

            <button
              type="button"
              className="search-reset"
              onClick={resetFilters}
            >
              Сбросить фильтры
            </button>
          </aside>

          <section className="search-results">
            <h2 className="search-results-count">Найдено {results.length}</h2>
            {results.map((executor) => {
              const cover = SHOP_IMAGES[
                Math.abs(Number(executor.id) || 0) % SHOP_IMAGES.length
              ];
              const price = lowestPrice(executor);
              const tags = (executor.services || []).slice(0, 4);
              const shopCity = executor.city || city;
              const nameHasCity = /[·•]/.test(executor.name || '');

              return (
                <article className="result-card" key={executor.id}>
                  <div className="result-thumb-wrap">
                    <button
                      type="button"
                      className="result-thumb"
                      onClick={() => openBooking(executor)}
                      aria-label={`Открыть ${executor.name}`}
                    >
                      <img src={cover} alt="" />
                    </button>
                    <FavoriteButton
                      className="result-favorite"
                      active={isFavorite(executor.id)}
                      onToggle={() => toggleFavorite(executor.id)}
                    />
                  </div>

                  <div className="result-body">
                    <button
                      type="button"
                      className="result-rating result-rating-link shop-rating-button"
                      onClick={() => openBooking(executor, 'reviews')}
                    >
                      ★ {executor.rating}
                      <span className="result-reviews-count">
                        {executor.reviews
                          ? ` ${executor.reviews} отзывов`
                          : ' отзывы'}
                      </span>
                    </button>

                    <h3>
                      <button
                        type="button"
                        className="result-name-link shop-name-button"
                        onClick={() => openBooking(executor)}
                      >
                        {executor.name}
                      </button>
                      {!nameHasCity && shopCity ? (
                        <span className="result-city"> • {shopCity}</span>
                      ) : null}
                    </h3>

                    <p className="result-address">
                      {executor.address}
                      {distanceTo(executor) != null ? (
                        <span className="result-distance"> · {formatDistance(distanceTo(executor))}</span>
                      ) : null}
                    </p>
                    <p
                      className={
                        executor.status === 'Закрыто'
                          ? 'result-status closed'
                          : 'result-status'
                      }
                    >
                      {executor.status}
                      {executor.hours ? ` • ${executor.hours}` : ''}
                    </p>

                    <div className="popular-tags">
                      {tags.map((item) => (
                        <span key={item[0]}>{item[0]}</span>
                      ))}
                    </div>
                  </div>

                  <div className="result-actions">
                    <strong className="result-price-tag">
                      {formatPrice(price)}
                    </strong>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => openBooking(executor)}
                    >
                      Записаться
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="search-summary">
            <h2>Ваш поиск</h2>
            <dl className="search-summary-list">
              <div>
                <dt>Город</dt>
                <dd>{city}</dd>
              </div>
              <div>
                <dt>Название</dt>
                <dd>{nameDraft.trim() || 'Все автосервисы'}</dd>
              </div>
              <div>
                <dt>Работа</dt>
                <dd>{workDraft.trim() || 'Все услуги'}</dd>
              </div>
              <div>
                <dt>Найдено</dt>
                <dd>{results.length} {shopsWord(results.length)}</dd>
              </div>
            </dl>
            <a
              href="#search-bar"
              className="search-summary-edit"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById('search-bar')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              Изменить поиск
            </a>
          </aside>
        </div>
      </main>

      {bookingExecutor && (
        <ServiceCardModal
          executor={bookingExecutor}
          coverImage={SHOP_IMAGES[Math.abs(Number(bookingExecutor.id) || 0) % SHOP_IMAGES.length]}
          reviews={bookingReviews}
          focus={bookingFocus}
          serviceOptions={[
            ...new Set([
              ...serviceRows(bookingExecutor).map(([name]) => name),
              ...catalogNames,
              ...SERVICE_ALIASES,
            ]),
          ]}
          bookingService={bookingService}
          bookingDate={bookingDate}
          bookingTime={bookingTime}
          bookingError={bookingError}
          bookingSaving={bookingSaving}
          bookingDone={bookingDone}
          user={user}
          ordersLink="/customer"
          onClose={closeBooking}
          onSelectService={setBookingService}
          onChangeService={setBookingService}
          onChangeDate={setBookingDate}
          onChangeTime={setBookingTime}
          onSubmit={submitBooking}
          onFocusReviews={() => setBookingFocus('reviews')}
          onSubmitReview={submitShopReview}
          onDeleteReview={deleteShopReview}
        />
      )}

    </div>
  );
}

export default SearchPage;
