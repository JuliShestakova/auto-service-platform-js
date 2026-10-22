import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { useLocation } from '../contexts/LocationContext';
import { CITY_COORDS, DEFAULT_CITY } from '../data/cities';
import {
  SERVICE_ALIASES,
  SERVICE_CATALOG,
} from '../data/serviceCatalog';
import FavoriteButton from '../components/FavoriteButton';
import ServiceCardModal from '../components/ServiceCardModal';
import ServiceSuggest from '../components/ServiceSuggest';
import SiteHeader from '../components/SiteHeader';
import useFavorites from '../hooks/useFavorites';
import { shopCoords } from '../utils/geo';
import shopImage1 from '../assets/shops/shop-1.jpg';
import shopImage2 from '../assets/shops/shop-2.jpg';
import shopImage3 from '../assets/shops/shop-3.jpg';
import shopImage4 from '../assets/shops/shop-4.jpg';
import shopImage5 from '../assets/shops/shop-5.jpg';
import shopImage6 from '../assets/shops/shop-6.jpg';
import shopImage7 from '../assets/shops/shop-7.jpg';
import shopImage8 from '../assets/shops/shop-8.jpg';

const SHOP_IMAGES = [
  shopImage1, shopImage2, shopImage3, shopImage4,
  shopImage5, shopImage6, shopImage7, shopImage8,
];

function shopCover(id) {
  return SHOP_IMAGES[Math.abs(Number(id) || 0) % SHOP_IMAGES.length];
}

function pinIcon(active) {
  return L.divIcon({
    className: `map-pin${active ? ' is-active' : ''}`,
    html: '<i></i>',
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -28],
  });
}

function userIcon() {
  return L.divIcon({
    className: 'map-user-pin',
    html: '<i></i>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function MapPage({ onLogin, onRegister }) {
  const { user, authFetch } = useAuth();
  const { city } = useCity();
  const {
    location,
    status,
    error: locationError,
    setFromAddress,
    setFromGeolocation,
    distanceTo,
    formatDistance,
  } = useLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);

  const [executors, setExecutors] = useState([]);
  const [query, setQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [addressDraft, setAddressDraft] = useState(location?.address || '');
  const [bookingExecutor, setBookingExecutor] = useState(null);
  const [bookingFocus, setBookingFocus] = useState('booking');
  const [bookingReviews, setBookingReviews] = useState([]);
  const [bookingService, setBookingService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  useEffect(() => {
    setAddressDraft(location?.address || '');
  }, [location?.address]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/executors?city=${encodeURIComponent(city)}`);
      if (response.ok) setExecutors(await response.json());
    };
    load();
  }, [city]);

  const workOptions = useMemo(() => ([
    ...new Set([
      ...SERVICE_CATALOG,
      ...SERVICE_ALIASES,
      ...executors.flatMap((item) => (item.services || []).map((row) => row?.[0]).filter(Boolean)),
    ]),
  ]), [executors]);

  const results = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return executors
          .filter((executor) => {
            if (needle) {
              const hay = `${executor.name || ''} ${executor.address || ''}`.toLowerCase();
              const works = (executor.services || []).map((row) => String(row?.[0] || '').toLowerCase()).join(' ');
              if (!hay.includes(needle) && !works.includes(needle)) return false;
            }
        if (openOnly && executor.status !== 'Открыто') return false;
        if (minRating && Number(executor.rating) < minRating) return false;
        return true;
      })
      .map((executor) => ({
        ...executor,
        distanceKm: distanceTo(executor),
      }))
      .sort((left, right) => {
        if (location && left.distanceKm != null && right.distanceKm != null) {
          return left.distanceKm - right.distanceKm;
        }
        return Number(right.rating) - Number(left.rating);
      });
  }, [executors, query, openOnly, minRating, distanceTo, location]);

  const selected = results.find((item) => item.id === selectedId) || null;

  useEffect(() => {
    if (!mapNodeRef.current) return undefined;
    const center = CITY_COORDS[city] || CITY_COORDS[DEFAULT_CITY];
    const map = L.map(mapNodeRef.current, { zoomControl: false, attributionControl: true });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    map.setView(center, 12);
    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);
    const resize = () => map.invalidateSize();
    window.setTimeout(resize, 80);
    window.setTimeout(resize, 300);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, [city]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    const point = shopCoords(selected, city);
    map.panTo([point.lat, point.lng]);
  }, [selected, city]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    results.forEach((shop) => {
      const point = shopCoords(shop, city);
      const marker = L.marker([point.lat, point.lng], {
        icon: pinIcon(selected?.id === shop.id),
        title: shop.name,
      });
      marker.on('click', () => setSelectedId(shop.id));
      layer.addLayer(marker);
    });
    if (location) {
      L.marker([location.lat, location.lng], { icon: userIcon(), title: 'Моё местоположение' })
        .addTo(layer);
    }
    const layers = layer.getLayers();
    if (layers.length > 0 && selectedId == null) {
      map.fitBounds(L.featureGroup(layers).getBounds().pad(0.18), { maxZoom: 13 });
    }
  }, [results, selected?.id, location, city, selectedId]);

  useEffect(() => {
    if (!bookingExecutor?.id) {
      setBookingReviews([]);
      return undefined;
    }
    let cancelled = false;
    fetch(`/api/executors/${bookingExecutor.id}/reviews`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => { if (!cancelled) setBookingReviews(data); })
      .catch(() => { if (!cancelled) setBookingReviews([]); });
    return () => { cancelled = true; };
  }, [bookingExecutor?.id]);

  const openShop = (executor, focus = 'booking') => {
    setBookingExecutor(executor);
    setBookingFocus(focus);
    setBookingService('');
    setBookingDate('');
    setBookingTime('');
    setBookingError('');
    setBookingDone(false);
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    if (!user) {
      onLogin?.();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookingService,
          description: '',
          executor_id: bookingExecutor.id,
          visit_date: bookingDate,
          visit_time: bookingTime,
        }),
      });
      if (!response.ok) {
        setBookingError('Не удалось сохранить запись');
        return;
      }
      setBookingDone(true);
    } finally {
      setBookingSaving(false);
    }
  };

  const submitShopReview = async ({ rating, text }) => {
    if (!user) {
      onLogin?.();
      return { error: 'Войдите, чтобы оставить отзыв' };
    }
    const response = await authFetch(`/api/executors/${bookingExecutor.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, text }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { error: data.detail || 'Не удалось отправить отзыв' };
    setBookingReviews((current) => [data, ...current]);
    return { ok: true };
  };

  const deleteShopReview = async (review) => {
    const response = await authFetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
    if (!response.ok) return;
    setBookingReviews((current) => current.filter((item) => item.id !== review.id));
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    await setFromAddress(addressDraft);
  };

  const cityGenitive = city === 'Краснодар' ? 'Краснодара' : city;

  return (
    <div className="home-page map-page">
      <SiteHeader
        activeNav="map"
        onLogin={onLogin}
        onRegister={onRegister}
      />

      <main className="map-shell">
        <aside className="map-list">
          <p className="map-kicker">Карта автосервисов</p>
          <h1>
            Карта автосервисов
            {' '}
            <span>{cityGenitive}</span>
          </h1>
          <p className="map-lead">Найдите проверенный сервис рядом с вами</p>

          <form className="map-search" onSubmit={(event) => event.preventDefault()}>
            <ServiceSuggest
              value={query}
              options={workOptions}
              onChange={setQuery}
              placeholder="Услуга или название сервиса"
            />
          </form>

          <form className="map-location" onSubmit={saveAddress}>
            <input
              type="text"
              value={addressDraft}
              onChange={(event) => setAddressDraft(event.target.value)}
              placeholder="Ваш адрес, чтобы посчитать расстояние"
            />
            <button type="submit" disabled={status !== 'idle'}>
              {status === 'geocoding' ? 'Ищем…' : 'Сохранить'}
            </button>
            <button
              type="button"
              className="map-geo-btn"
              onClick={setFromGeolocation}
              disabled={status !== 'idle'}
            >
              {status === 'locating' ? 'Определяем…' : 'Моё местоположение'}
            </button>
          </form>
          {locationError ? <p className="map-location-error">{locationError}</p> : null}
          {location ? (
            <p className="map-location-ok">Считаем расстояние от: {location.address}</p>
          ) : null}

          <div className="map-chips">
            <button type="button" className={!query ? 'is-on' : ''} onClick={() => setQuery('')}>
              Все услуги
            </button>
            <button type="button" className={minRating === 4.5 ? 'is-on' : ''} onClick={() => setMinRating((value) => (value === 4.5 ? 0 : 4.5))}>
              Рейтинг 4.5+
            </button>
            <button type="button" className={openOnly ? 'is-on' : ''} onClick={() => setOpenOnly((value) => !value)}>
              Открыто сейчас
            </button>
          </div>

          <p className="map-found">Найдено {results.length} автосервиса · Сортировка: {location ? 'по расстоянию' : 'по рейтингу'}</p>

          <div className="map-cards">
            {results.map((shop) => (
              <article
                key={shop.id}
                className={`map-card${selected?.id === shop.id ? ' is-selected' : ''}`}
              >
                <button type="button" className="map-card-main" onClick={() => setSelectedId(shop.id)}>
                  <img src={shopCover(shop.id)} alt="" />
                  <div>
                    <strong>{shop.name}</strong>
                    <p>★ {shop.rating} · {shop.reviews || 0} отзывов</p>
                    <p>{shop.address}</p>
                    <p className={shop.status === 'Закрыто' ? 'is-closed' : ''}>
                      {shop.status}
                      {shop.hours ? ` · ${shop.hours}` : ''}
                      {shop.distanceKm != null ? ` · ${formatDistance(shop.distanceKm)}` : ''}
                    </p>
                  </div>
                </button>
                <FavoriteButton
                  className="map-card-fav"
                  active={isFavorite(shop.id)}
                  onToggle={() => toggleFavorite(shop.id)}
                />
                <button type="button" className="map-card-more" onClick={() => openShop(shop)}>
                  Подробнее →
                </button>
              </article>
            ))}
          </div>
        </aside>

        <section className="map-canvas-wrap">
          <div className="map-canvas" ref={mapNodeRef} />
          {selected ? (
            <div className="map-float-card">
              <button type="button" className="map-float-close" onClick={() => setSelectedId(null)} aria-label="Закрыть">×</button>
              <img src={shopCover(selected.id)} alt="" />
              <div>
                <strong>{selected.name}</strong>
                <p>★ {selected.rating} · {selected.reviews || 0} отзывов</p>
                <p>{selected.address}</p>
                <p>
                  {selected.status}
                  {selected.hours ? ` · ${selected.hours}` : ''}
                </p>
                {selected.distanceKm != null ? (
                  <p className="map-float-distance">{formatDistance(selected.distanceKm)} от вас</p>
                ) : null}
                <button type="button" className="primary-button" onClick={() => openShop(selected)}>
                  Подробнее
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {bookingExecutor ? (
        <ServiceCardModal
          executor={bookingExecutor}
          coverImage={shopCover(bookingExecutor.id)}
          reviews={bookingReviews}
          focus={bookingFocus}
          serviceOptions={workOptions}
          bookingService={bookingService}
          bookingDate={bookingDate}
          bookingTime={bookingTime}
          bookingError={bookingError}
          bookingSaving={bookingSaving}
          bookingDone={bookingDone}
          user={user}
          onClose={() => setBookingExecutor(null)}
          onSelectService={setBookingService}
          onChangeService={setBookingService}
          onChangeDate={setBookingDate}
          onChangeTime={setBookingTime}
          onSubmit={submitBooking}
          onFocusReviews={() => setBookingFocus('reviews')}
          onSubmitReview={submitShopReview}
          onDeleteReview={deleteShopReview}
        />
      ) : null}
    </div>
  );
}

export default MapPage;
