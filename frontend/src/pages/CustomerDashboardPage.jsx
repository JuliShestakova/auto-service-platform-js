import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { useLocation as useClientLocation } from '../contexts/LocationContext';
import FavoriteButton from '../components/FavoriteButton';
import ServiceCardModal from '../components/ServiceCardModal';
import ServiceSuggest from '../components/ServiceSuggest';
import SiteHeader from '../components/SiteHeader';
import { SERVICE_CATALOG } from '../data/serviceCatalog';
import useFavorites from '../hooks/useFavorites';
import { listServiceNames } from '../services/catalog';
import { getExecutor, listExecutorReviews, listExecutors } from '../services/executors';
import { createOrder, listOrders, updateOrder } from '../services/orders';
import { createReview, deleteReview, listMyReviews } from '../services/reviews';
import { resolveBestService, scoreServiceMatch } from '../utils/fuzzyService';

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

function shopCover(id) {
  return SHOP_IMAGES[Math.abs(Number(id) || 0) % SHOP_IMAGES.length];
}

function formatVisitLabel(visitDate, visitTime) {
  if (!visitDate) {
    return visitTime || 'Дата уточняется';
  }

  const date = new Date(`${visitDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  let dayLabel = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  if (date.getTime() === today.getTime()) {
    dayLabel = 'Сегодня';
  } else if (date.getTime() === tomorrow.getTime()) {
    dayLabel = 'Завтра';
  }

  return visitTime ? `${dayLabel}, ${visitTime}` : dayLabel;
}

function orderMatchesWork(order, query) {
  const needle = String(query || '').trim();
  if (!needle) {
    return true;
  }
  const title = String(order?.title || '').trim();
  if (!title) {
    return false;
  }
  return scoreServiceMatch(needle, title) > 0
    || scoreServiceMatch(title, needle) > 0;
}

function orderStatusMeta(status) {
  const value = String(status || '');
  if (value === 'Завершён') {
    return { label: 'Выполнен', tone: 'done' };
  }
  if (value === 'Отменён') {
    return { label: 'Отменён', tone: 'cancelled' };
  }
  if (value === 'В работе') {
    return { label: 'В работе', tone: 'progress' };
  }
  if (value === 'Запланирован') {
    return { label: 'Подтверждена', tone: 'done' };
  }
  if (value === 'Ожидает подтверждения' || value === 'Поиск исполнителя') {
    return { label: 'Ожидает подтверждения', tone: 'wait' };
  }
  return { label: value || 'В обработке', tone: 'wait' };
}

function CalendarStatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" strokeWidth="1.8" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartStatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}


// ======================================================
// ИКОНКИ
// ======================================================

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="17"
        rx="2"
        strokeWidth="1.8"
      />

      <path
        d="M9 4V3h6v1"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M9 9h6M9 13h6M9 17h4"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


// ======================================================
// КАБИНЕТ
// ======================================================

function CustomerDashboardPage({
  section = 'overview',
}) {
  const {
    user,
    logout,
    authFetch,
    updateProfile,
  } = useAuth();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const {
    location: clientLocation,
    status: locationStatus,
    error: locationError,
    setFromAddress,
    setFromGeolocation,
  } = useClientLocation();
  const [locationDraft, setLocationDraft] = useState(clientLocation?.address || '');

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    setLocationDraft(clientLocation?.address || '');
  }, [clientLocation?.address]);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [bookingDetail, setBookingDetail] = useState(null);
  const [detailsExecutor, setDetailsExecutor] = useState(null);
  const [detailsReviews, setDetailsReviews] = useState([]);
  const [detailsFocus, setDetailsFocus] = useState('booking');
  const [bookingService, setBookingService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewedExecutorIds, setReviewedExecutorIds] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [catalogNames, setCatalogNames] = useState(SERVICE_CATALOG);
  const [workQuery, setWorkQuery] = useState('');


  // ====================================================
  // ЗАЩИТА ОТ СТАРЫХ URL ВИДА:
  // /customer#/orders
  // ====================================================

  useEffect(() => {
    const oldHash = window.location.hash;

    if (!oldHash) {
      return;
    }

    const oldRoutes = {
      '#/orders': '/customer',
      '#/bookings': '/customer',
      '#/requests': '/customer',
      '#/garage': '/customer',
      '#/settings': '/customer/settings',
    };

    const newPath = oldRoutes[oldHash];

    if (newPath) {
      navigate(newPath, {
        replace: true,
      });
    }
  }, [navigate]);


  // ====================================================
  // Определяем раздел непосредственно по URL
  // ====================================================

  const getSectionFromPath = () => {
    if (location.pathname === '/customer/settings') {
      return 'settings';
    }
    return section || 'overview';
  };

  const currentSection = getSectionFromPath();
  const isOverview = currentSection === 'overview';
  const isSettings = currentSection === 'settings';

  const workOptions = useMemo(() => {
    const fromOrders = orders
      .map((order) => String(order.title || '').trim())
      .filter(Boolean);
    return [...new Set([...fromOrders, ...catalogNames.filter(Boolean)])];
  }, [orders, catalogNames]);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        const names = await listServiceNames();
        if (!cancelled && names.length) {
          setCatalogNames(names);
        }
      } catch {
        // оставляем локальный каталог
      }
    };

    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyCabinetSearch = (rawWork = workQuery) => {
    const resolved = resolveBestService(rawWork, workOptions)
      || String(rawWork || '').trim();
    setWorkQuery(resolved);
    window.requestAnimationFrame(() => {
      document
        .getElementById('my-bookings')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const clearCabinetSearch = () => {
    setWorkQuery('');
  };


  // ====================================================
  // ДАННЫЕ
  // ====================================================

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return undefined;
    }

    let cancelled = false;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const data = await listOrders(authFetch);
        if (!cancelled) {
          setOrders(data);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user, authFetch, location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      if (!favoriteIds.length) {
        if (!cancelled) {
          setFavoriteShops([]);
        }
        return;
      }

      try {
        const shops = await listExecutors();
        if (cancelled || !Array.isArray(shops)) {
          return;
        }

        setFavoriteShops(
          shops
            .filter((shop) => favoriteIds.includes(Number(shop.id)))
            .slice(0, 6),
        );
      } catch {
        if (!cancelled) {
          setFavoriteShops([]);
        }
      }
    };

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  const activeBookings = useMemo(
    () => orders.filter((order) => (
      order.status !== 'Завершён' && order.status !== 'Отменён'
    )),
    [orders],
  );

  const nearestBooking = useMemo(() => {
    const withDate = [...activeBookings].sort((left, right) => {
      const leftKey = `${left.visit_date || '9999'}-${left.visit_time || ''}`;
      const rightKey = `${right.visit_date || '9999'}-${right.visit_time || ''}`;
      return leftKey.localeCompare(rightKey);
    });
    return withDate[0] || null;
  }, [activeBookings]);

  const allOrders = useMemo(
    () => [...orders]
      .sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || ''))),
    [orders],
  );

  const filteredOrders = useMemo(
    () => allOrders.filter((order) => orderMatchesWork(order, workQuery)),
    [allOrders, workQuery],
  );

  const filteredActiveBookings = useMemo(
    () => filteredOrders.filter((order) => (
      order.status !== 'Завершён' && order.status !== 'Отменён'
    )),
    [filteredOrders],
  );

  const filteredNearestBooking = useMemo(() => {
    const withDate = [...filteredActiveBookings].sort((left, right) => {
      const leftKey = `${left.visit_date || '9999'}-${left.visit_time || ''}`;
      const rightKey = `${right.visit_date || '9999'}-${right.visit_time || ''}`;
      return leftKey.localeCompare(rightKey);
    });
    return withDate[0] || null;
  }, [filteredActiveBookings]);

  const searchActive = Boolean(workQuery.trim());
  const visibleNearest = searchActive ? filteredNearestBooking : nearestBooking;
  const visibleOrders = searchActive ? filteredOrders : allOrders;
  const filteredReviews = useMemo(() => {
    if (!searchActive) {
      return myReviews;
    }
    const shopIds = new Set(
      filteredOrders
        .map((order) => Number(order.executor_id))
        .filter(Boolean),
    );
    return myReviews.filter((review) => shopIds.has(Number(review.executor_id)));
  }, [myReviews, searchActive, filteredOrders]);

  const reloadMyReviews = async () => {
    if (!user?.id) {
      setMyReviews([]);
      setReviewedExecutorIds([]);
      return [];
    }

    try {
      const mine = await listMyReviews(authFetch);
      if (!mine) {
        return null;
      }
      setMyReviews(mine);
      setReviewedExecutorIds(
        [...new Set(mine.map((item) => Number(item.executor_id)).filter(Boolean))],
      );
      return mine;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setMyReviews([]);
      setReviewedExecutorIds([]);
      return undefined;
    }

    let cancelled = false;

    const loadMyReviews = async () => {
      const mine = await reloadMyReviews();
      if (cancelled || mine) {
        return;
      }

      // запасной путь, если /reviews/me ещё недоступен
      const executorIds = [...new Set([
        ...orders.map((order) => Number(order.executor_id)),
        ...favoriteIds.map((id) => Number(id)),
      ].filter(Boolean))];

      if (!executorIds.length) {
        setMyReviews([]);
        setReviewedExecutorIds([]);
        return;
      }

      try {
        const results = await Promise.all(
          executorIds.map(async (executorId) => {
            const reviews = await listExecutorReviews(executorId);
            return Array.isArray(reviews)
              ? reviews.filter((item) => Number(item.user_id) === Number(user.id))
              : [];
          }),
        );

        if (cancelled) {
          return;
        }

        const fallback = results.flat().sort((left, right) => (
          String(right.created_at || '').localeCompare(String(left.created_at || ''))
        ));
        setMyReviews(fallback);
        setReviewedExecutorIds(
          [...new Set(fallback.map((item) => Number(item.executor_id)).filter(Boolean))],
        );
      } catch {
        if (!cancelled) {
          setMyReviews([]);
          setReviewedExecutorIds([]);
        }
      }
    };

    loadMyReviews();
    return () => {
      cancelled = true;
    };
  }, [orders, favoriteIds, user?.id, authFetch]);

  const openReviewModal = (target) => {
    const executorId = Number(target?.executor_id || target?.id || 0);
    if (!executorId) {
      return;
    }

    setReviewTarget({
      id: executorId,
      name: target.executor_name || target.name || 'Автосервис',
      title: target.title || '',
    });
    setReviewRating(0);
    setReviewText('');
    setReviewError('');
  };

  const closeReviewModal = () => {
    if (reviewSaving) {
      return;
    }
    setReviewTarget(null);
    setReviewError('');
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewTarget?.id) {
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Выберите оценку от 1 до 5 звёзд');
      return;
    }

    setReviewError('');
    setReviewSaving(true);
    try {
      const { ok, data, error } = await createReview(authFetch, reviewTarget.id, {
        rating: Number(reviewRating),
        text: reviewText.trim(),
      });

      if (!ok) {
        setReviewError(error || 'Не удалось сохранить отзыв');
        return;
      }

      const saved = {
        ...data,
        shop_name: reviewTarget.name,
      };
      setMyReviews((current) => {
        const withoutDup = current.filter((item) => item.id !== saved.id);
        return [saved, ...withoutDup];
      });
      setReviewedExecutorIds((current) => (
        current.includes(Number(saved.executor_id))
          ? current
          : [...current, Number(saved.executor_id)]
      ));

      if (
        detailsExecutor
        && Number(detailsExecutor.id) === Number(saved.executor_id)
      ) {
        setDetailsReviews((current) => [saved, ...current]);
      }

      setReviewTarget(null);
      setReviewText('');
      setReviewRating(0);

      window.setTimeout(() => {
        document.getElementById('my-reviews')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50);

      reloadMyReviews();
    } catch {
      setReviewError('Не удалось сохранить отзыв');
    } finally {
      setReviewSaving(false);
    }
  };

  const canLeaveReview = (order) => {
    const executorId = Number(order?.executor_id || 0);
    if (!executorId) {
      return false;
    }
    if (reviewedExecutorIds.includes(executorId)) {
      return false;
    }
    return order.status !== 'Отменён';
  };

  const removeLocalReview = (review) => {
    const reviewId = Number(review?.id);
    const executorId = Number(review?.executor_id);
    setMyReviews((current) => current.filter((item) => Number(item.id) !== reviewId));
    setReviewedExecutorIds((current) => current.filter((id) => Number(id) !== executorId));
    setDetailsReviews((current) => current.filter((item) => Number(item.id) !== reviewId));
  };

  const rememberSavedReview = (saved, shopName = '') => {
    const withShop = { ...saved, shop_name: shopName || saved.shop_name };
    setMyReviews((current) => {
      const withoutDup = current.filter((item) => item.id !== withShop.id);
      return [withShop, ...withoutDup];
    });
    setReviewedExecutorIds((current) => (
      current.includes(Number(withShop.executor_id))
        ? current
        : [...current, Number(withShop.executor_id)]
    ));
    if (
      detailsExecutor
      && Number(detailsExecutor.id) === Number(withShop.executor_id)
    ) {
      setDetailsReviews((current) => [withShop, ...current]);
    }
  };

  const deleteMyReview = async (review) => {
    if (!review?.id) return;
    setDeletingReviewId(review.id);
    try {
      const { ok } = await deleteReview(authFetch, review.id);
      if (!ok) return;
      removeLocalReview(review);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const submitDetailsReview = async ({ rating, text }) => {
    if (!detailsExecutor?.id) {
      return { error: 'Автосервис не выбран' };
    }
    const { ok, data, error } = await createReview(authFetch, detailsExecutor.id, {
      rating: Number(rating),
      text: (text || '').trim(),
    });
    if (!ok) {
      return { error: error || 'Не удалось сохранить отзыв' };
    }
    rememberSavedReview(data, detailsExecutor.name);
    return { ok: true };
  };

  const canReviewShop = (shop) => {
    const executorId = Number(shop?.id || shop?.executor_id || 0);
    if (!executorId) {
      return false;
    }
    return !reviewedExecutorIds.includes(executorId);
  };

  const shopTitle = (name) => String(name || 'Автосервис')
    .split(/[·•]/)[0]
    .trim();

  const shopCityLabel = (name, fallback = '') => (
    String(name || '').split(/[·•]/)[1]?.trim() || fallback
  );

  const askCancelOrder = (order) => {
    setCancelError('');
    setCancelReason('');
    setCancelTarget(order);
  };

  const closeCancelModal = () => {
    if (cancelingId) {
      return;
    }
    setCancelTarget(null);
    setCancelReason('');
    setCancelError('');
  };

  const openBookingDetail = (order) => {
    setBookingDetail(order);
  };

  const closeBookingDetail = () => {
    setBookingDetail(null);
  };

  const confirmCancelOrder = async () => {
    if (!cancelTarget?.id) {
      return;
    }

    const reason = cancelReason.trim();
    if (!reason) {
      setCancelError('Укажите причину отмены');
      return;
    }

    setCancelError('');
    setCancelingId(cancelTarget.id);
    try {
      const { ok, data, error } = await updateOrder(authFetch, cancelTarget.id, {
        status: 'Отменён',
        cancel_reason: reason,
      });

      if (!ok) {
        setCancelError(error || 'Не удалось отменить запись');
        return;
      }

      const updated = data;
      setOrders((current) => current.map((item) => (
        item.id === updated.id ? updated : item
      )));
      setCancelTarget(null);
      setCancelReason('');
      setBookingDetail((current) => (
        current?.id === updated.id ? updated : current
      ));
    } catch {
      setCancelError('Не удалось отменить запись');
    } finally {
      setCancelingId(null);
    }
  };

  const closeServiceDetails = () => {
    setDetailsExecutor(null);
    setDetailsReviews([]);
    setDetailsFocus('booking');
    setBookingService('');
    setBookingDate('');
    setBookingTime('');
    setBookingError('');
    setBookingDone(false);
    setBookingSaving(false);
  };

  const openServiceDetails = async (orderOrShop, focus = 'booking') => {
    const executorId = Number(
      orderOrShop?.executor_id || orderOrShop?.id || 0,
    );
    if (!executorId) {
      return;
    }

    setBookingError('');
    setBookingDone(false);
    setDetailsFocus(focus);

    try {
      const executor = await getExecutor(executorId);
      if (!executor) {
        throw new Error('not found');
      }
      const serviceRows = (executor.services || [])
        .map((item) => (Array.isArray(item) ? item[0] : item?.name))
        .filter(Boolean);

      setDetailsExecutor(executor);
      setBookingService(
        orderOrShop?.title && serviceRows.includes(orderOrShop.title)
          ? orderOrShop.title
          : serviceRows[0] || orderOrShop?.title || '',
      );
      setBookingDate(orderOrShop?.visit_date || '');
      setBookingTime(orderOrShop?.visit_time || '');

      setDetailsReviews(await listExecutorReviews(executorId));
    } catch {
      setDetailsExecutor(null);
      setDetailsReviews([]);
    }
  };

  const submitDetailsBooking = async (event) => {
    event.preventDefault();
    setBookingError('');

    if (!detailsExecutor?.id) {
      return;
    }

    if (!bookingService || !bookingDate || !bookingTime) {
      setBookingError('Выберите услугу, дату и время.');
      return;
    }

    setBookingSaving(true);
    try {
      const { ok, data, error } = await createOrder(authFetch, {
        title: bookingService,
        description: '',
        executor_id: detailsExecutor.id,
        visit_date: bookingDate,
        visit_time: bookingTime,
      });

      if (!ok) {
        setBookingError(error || 'Не удалось сохранить запись');
        return;
      }

      setOrders((current) => [data, ...current]);
      setBookingDone(true);
    } catch {
      setBookingError('Не удалось сохранить запись');
    } finally {
      setBookingSaving(false);
    }
  };

  // ====================================================
  // ИМЯ
  // ====================================================

  const firstName =
    user?.name?.split(' ')[0] ||
    user?.firstName ||
    'пользователь';

  useEffect(() => {
    if (!user) {
      return;
    }
    setSettingsName(user.name || '');
    setSettingsEmail(user.email || '');
  }, [user]);

  // ====================================================
  // ВЫХОД
  // ====================================================

  const handleLogout = async () => {
    navigate('/', { replace: true });

    if (typeof logout === 'function') {
      await logout();
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSettingsError('');
    setSettingsMessage('');

    const name = settingsName.trim();
    const email = settingsEmail.trim().toLowerCase();

    if (name.length < 2) {
      setSettingsError('Введите имя');
      return;
    }

    if (!email.includes('@')) {
      setSettingsError('Введите корректный email');
      return;
    }

    if (settingsPassword && settingsPassword.length < 8) {
      setSettingsError('Новый пароль: минимум 8 символов');
      return;
    }

    if (settingsPassword && !settingsCurrentPassword) {
      setSettingsError('Укажите текущий пароль для смены');
      return;
    }

    setSettingsSaving(true);
    try {
      const payload = { name, email };
      if (settingsPassword) {
        payload.password = settingsPassword;
        payload.current_password = settingsCurrentPassword;
      }

      const result = await updateProfile(payload);
      if (!result?.success) {
        setSettingsError(result?.error || 'Не удалось сохранить');
        return;
      }

      setSettingsPassword('');
      setSettingsCurrentPassword('');
      setSettingsMessage('Данные сохранены');
    } catch {
      setSettingsError('Не удалось сохранить');
    } finally {
      setSettingsSaving(false);
    }
  };

  // ====================================================
  // ЕСЛИ НЕ АВТОРИЗОВАН
  // ====================================================

  if (!user) {
    return (
      <div className="customer-page">
        <SiteHeader />
        <main className="customer-main">
          <section className="customer-auth-required">
            <div className="customer-auth-card">
              <p className="customer-label">ЛИЧНЫЙ КАБИНЕТ</p>
              <h1>Войдите в личный кабинет</h1>
              <p>Здесь вы сможете управлять записями в автосервисы.</p>
              <Link to="/login" className="customer-primary-button">
                Войти в кабинет →
              </Link>
                </div>
          </section>
        </main>
            </div>
    );
  }


  // ====================================================
  // ОСНОВНОЙ КАБИНЕТ
  // ====================================================

  return (
    <div className="customer-page">
      <SiteHeader activeNav={isOverview ? 'cabinet' : ''} />

      <main className="customer-main">
        <section className="customer-welcome">
          <p className="customer-label">ЛИЧНЫЙ КАБИНЕТ</p>
          <h1>
            {isOverview && `Здравствуйте, ${firstName}!`}
            {isSettings && 'Настройки'}
          </h1>
          <p>
            {isOverview && 'Управляйте записями в автосервисы в одном месте.'}
            {isSettings && 'Управляйте данными своего аккаунта.'}
          </p>
        </section>

        <div className="customer-content">

          {isOverview && (
            <section className="cab-home">
              <form
                className="cab-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  applyCabinetSearch(workQuery);
                }}
              >
                <div className="cab-search-field">
                  <span className="cab-search-icon" aria-hidden="true">
                    <SearchIcon />
            </span>
                  <ServiceSuggest
                    value={workQuery}
                    options={workOptions}
                    onChange={setWorkQuery}
                    onPick={applyCabinetSearch}
                    placeholder="Например, замена тормозных колодок"
                  />
                  {searchActive ? (
                    <button
                      type="button"
                      className="cab-search-clear"
                      onClick={clearCabinetSearch}
                      aria-label="Сбросить поиск"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                <button type="submit" className="cab-search-submit">
                  Найти
                </button>
              </form>

              <div className="cab-stats">
                <a href="#my-bookings" className="cab-stat">
                  <span className="cab-stat-icon"><CalendarStatIcon /></span>
                  <span>
                    <strong>{activeBookings.length}</strong>
                    <small>Активные записи</small>
            </span>
                </a>
                <a href="#my-bookings" className="cab-stat">
                  <span className="cab-stat-icon"><ClipboardIcon /></span>
                  <span>
                    <strong>{orders.length}</strong>
                    <small>Всего записей</small>
            </span>
                </a>
                <a href="#favorites" className="cab-stat">
                  <span className="cab-stat-icon"><HeartStatIcon /></span>
                  <span>
                    <strong>{favoriteIds.length || favoriteShops.length}</strong>
                    <small>Избранное</small>
            </span>
                </a>
              </div>

              <div className="cab-toolbar">
                  <div>
                  <p className="customer-section-label">ЗАПИСИ</p>
                  <h2>Ваш кабинет</h2>
                  </div>
                <Link to="/search" className="customer-primary-button">
                  Записаться →
                  </Link>
                </div>

              <div className="cab-grid">
                <div className="cab-main-col">
                  <article className="cab-card cab-booking">
                    <div className="cab-card-head">
                      <h2>Ближайшая запись</h2>
                      <a href="#my-bookings" className="cab-link">Все записи</a>
                    </div>

                    {visibleNearest ? (
                      <div className="cab-booking-body">
                        <img
                          className="cab-booking-cover"
                          src={shopCover(visibleNearest.executor_id || visibleNearest.id)}
                          alt=""
                        />
                        <div className="cab-booking-info">
                          <div className="cab-booking-top">
                            <div>
                              <h3>
                                {visibleNearest.executor_id ? (
                                  <button
                                    type="button"
                                    className="cab-shop-link"
                                    onClick={() => openServiceDetails(visibleNearest)}
                                  >
                                    {visibleNearest.executor_name || 'Автосервис'}
                                  </button>
                                ) : (
                                  visibleNearest.executor_name || 'Автосервис'
                                )}
                      </h3>
                              {visibleNearest.executor_rating != null && (
                                <p className="cab-rating">
                                  ★ {visibleNearest.executor_rating}
                                </p>
                              )}
                    </div>
                            <span className={`cab-badge cab-badge-${orderStatusMeta(visibleNearest.status).tone}`}>
                              {orderStatusMeta(visibleNearest.status).label}
                            </span>
                  </div>

                          <ul className="cab-booking-meta">
                            <li>
                              <CalendarStatIcon />
                              {formatVisitLabel(
                                visibleNearest.visit_date,
                                visibleNearest.visit_time,
                              )}
                            </li>
                            <li>
                              <ClipboardIcon />
                              {visibleNearest.title}
                            </li>
                            {visibleNearest.staff_name ? (
                              <li>
                                Мастер: {visibleNearest.staff_name}
                              </li>
                            ) : null}
                          </ul>

                          <div className="cab-booking-actions">
                            <button
                              type="button"
                              className="customer-primary-button"
                              onClick={() => openBookingDetail(visibleNearest)}
                            >
                              Подробнее
                            </button>
                            {canLeaveReview(visibleNearest) ? (
                              <button
                                type="button"
                                className="customer-outline-button"
                                onClick={() => openReviewModal(visibleNearest)}
                              >
                                Оставить отзыв
                              </button>
                            ) : null}
                            {visibleNearest.status !== 'Завершён'
                              && visibleNearest.status !== 'Отменён' ? (
                              <button
                                type="button"
                                className="customer-outline-button"
                                disabled={cancelingId === visibleNearest.id}
                                onClick={() => askCancelOrder(visibleNearest)}
                              >
                                Отменить запись
                              </button>
                            ) : null}
                    </div>
                        </div>
                      </div>
                    ) : (
                      <div className="cab-empty">
                        <div className="cab-empty-icon"><CalendarStatIcon /></div>
                        <h3>
                          {searchActive
                            ? 'Нет активных записей с этой услугой'
                            : 'Записей пока нет'}
                      </h3>
                        <p>
                          {searchActive
                            ? 'Проверьте список ниже — там есть и уже выполненные визиты.'
                            : 'Запишитесь в автосервис — ближайшая запись появится здесь.'}
                        </p>
                        {searchActive ? null : (
                          <Link to="/search" className="customer-primary-button">
                            Записаться →
                    </Link>
                        )}
                  </div>
                    )}
                  </article>

                  <article className="cab-card" id="my-bookings">
                    <div className="cab-card-head">
                      <h2>Мои записи</h2>
                      {searchActive ? (
                        <p className="cab-search-result-hint">
                          {visibleOrders.length
                            ? `Найдено: ${visibleOrders.length}, включая выполненные`
                            : 'Ни текущих, ни выполненных записей'}
                        </p>
                      ) : null}
                    </div>

                    {ordersLoading ? (
                      <p className="cab-muted">Загрузка записей...</p>
                    ) : visibleOrders.length > 0 ? (
                      <ul className="cab-booking-list">
                        {visibleOrders.map((order) => {
                          const meta = orderStatusMeta(order.status);
                          const canCancel = (
                            order.status !== 'Завершён'
                            && order.status !== 'Отменён'
                          );
                          const executorId = Number(order.executor_id) || null;
                          const shopName = (order.executor_name || 'Автосервис')
                            .split(/[·•]/)[0]
                            .trim();
                          const shopCity = (order.executor_name || '')
                            .split(/[·•]/)[1]
                            ?.trim() || '';

                          return (
                            <li key={order.id} className="cab-booking-card">
                              <div className="cab-booking-card-media">
                                <img
                                  src={shopCover(executorId || order.id)}
                                  alt=""
                                />
                                {executorId ? (
                                  <FavoriteButton
                                    className="cab-booking-card-fav"
                                    active={isFavorite(executorId)}
                                    onToggle={() => toggleFavorite(executorId)}
                                  />
                                ) : null}
                  </div>

                              <div className="cab-booking-card-body">
                                <div className="cab-booking-card-main">
                                  <h3>{order.title}</h3>
                                  {executorId ? (
                                    <button
                                      type="button"
                                      className="cab-booking-card-shop cab-shop-link"
                                      onClick={() => openServiceDetails(order)}
                                    >
                                      {shopName}
                                    </button>
                                  ) : (
                                    <p className="cab-booking-card-shop">{shopName}</p>
                                  )}
                                  {shopCity ? (
                                    <p className="cab-booking-card-meta">{shopCity}</p>
                                  ) : null}
                                  <p className="cab-booking-card-meta cab-booking-card-when">
                                    <CalendarStatIcon />
                                    {formatVisitLabel(order.visit_date, order.visit_time)}
                                  </p>
                                  {order.staff_name ? (
                                    <p className="cab-booking-card-meta">
                                      Мастер: {order.staff_name}
                                    </p>
                                  ) : null}
                </div>

                                <div className="cab-booking-card-side">
                                  <span className={`cab-badge cab-badge-${meta.tone}`}>
                                    {meta.label}
                                  </span>
                                  <div className="cab-booking-card-actions">
                                    <button
                                      type="button"
                                      className="cab-booking-card-details"
                                      onClick={() => openBookingDetail(order)}
                                    >
                                      Подробнее
                                    </button>
                                    {canLeaveReview(order) ? (
                                      <button
                                        type="button"
                                        className="cab-booking-card-review"
                                        onClick={() => openReviewModal(order)}
                                      >
                                        Оставить отзыв
                                      </button>
                                    ) : null}
                                    {canCancel ? (
                                      <button
                                        type="button"
                                        className="cab-booking-card-cancel"
                                        disabled={cancelingId === order.id}
                                        onClick={() => askCancelOrder(order)}
                                      >
                                        Отменить
                                      </button>
                                    ) : null}
                    </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="cab-empty cab-empty-compact">
                        <h3>
                          {searchActive
                            ? `Нет записей «${workQuery.trim()}»`
                            : 'Записей пока нет'}
                        </h3>
                        <p>
                          {searchActive
                            ? 'Среди текущих и уже выполненных услуг ничего не нашлось.'
                            : 'Запишитесь в автосервис — визиты появятся здесь.'}
                        </p>
                        {searchActive ? (
                          <button
                            type="button"
                            className="customer-outline-button"
                            onClick={clearCabinetSearch}
                          >
                            Сбросить поиск
                          </button>
                        ) : (
                          <Link to="/search" className="customer-primary-button">
                            Найти автосервис →
                      </Link>
                        )}
                    </div>
                    )}
                  </article>
                  </div>

                <aside className="cab-side-col">
                  <article className="cab-card" id="favorites">
                    <div className="cab-card-head">
                      <h2>Избранные автосервисы</h2>
                </div>

                    {favoriteShops.length > 0 ? (
                      <ul className="cab-fav-list">
                        {favoriteShops.map((shop) => (
                          <li key={shop.id} className="cab-fav-card">
                            <div className="cab-fav-card-top">
                              <button
                                type="button"
                                className="cab-fav-open"
                                onClick={() => openServiceDetails(shop)}
                              >
                                <img src={shopCover(shop.id)} alt="" />
                                <div className="cab-fav-copy">
                                  <strong className="cab-shop-link-text">
                                    {shopTitle(shop.name)}
                                  </strong>
                                  {(shopCityLabel(shop.name, shop.city) || shop.city) ? (
                                    <span className="cab-fav-city">
                                      {shopCityLabel(shop.name, shop.city) || shop.city}
                        </span>
                                  ) : null}
                                  <span className="cab-fav-meta">
                                    ★ {shop.rating}
                                    {shop.address ? ` · ${shop.address}` : ''}
                      </span>
                    </div>
                              </button>
                              <FavoriteButton
                                className="cab-fav-heart"
                                active={isFavorite(shop.id)}
                                onToggle={() => toggleFavorite(shop.id)}
                              />
                </div>
                            <div className="cab-fav-card-actions">
                              <button
                                type="button"
                                className="cab-fav-details"
                                onClick={() => openServiceDetails(shop)}
                              >
                                Подробнее
                              </button>
                              {canReviewShop(shop) ? (
                                <button
                                  type="button"
                                  className="cab-fav-review"
                                  onClick={() => openReviewModal(shop)}
                                >
                                  Оставить отзыв
                                </button>
                              ) : (
                                <span className="cab-fav-reviewed">Отзыв оставлен</span>
                              )}
                      </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="cab-muted">
                        Нажимайте сердечко на карточке автосервиса на главной
                        или в поиске — избранные появятся здесь.
                      </p>
                    )}
                  </article>

                  <article className="cab-card" id="my-reviews">
                    <div className="cab-card-head">
                      <h2>Мои отзывы</h2>
                        </div>
                    {filteredReviews.length > 0 ? (
                      <ul className="cab-review-list">
                        {filteredReviews.slice(0, 6).map((review) => {
                          const shop = favoriteShops.find(
                            (item) => Number(item.id) === Number(review.executor_id),
                          );
                          const order = orders.find(
                            (item) => Number(item.executor_id) === Number(review.executor_id),
                          );
                          const shopName = review.shop_name
                            || shop?.name
                            || order?.executor_name
                            || 'Автосервис';

                          return (
                            <li key={review.id} className="cab-review-item">
                              <div>
                                <button
                                  type="button"
                                  className="cab-shop-link"
                                  onClick={() => openServiceDetails({
                                    id: review.executor_id,
                                    executor_id: review.executor_id,
                                    name: shopName,
                                    executor_name: shopName,
                                  })}
                                >
                                  {shopTitle(shopName)}
                                </button>
                                <span className="cab-review-stars">
                                  {'★'.repeat(Number(review.rating) || 0)}
                                  {'☆'.repeat(Math.max(0, 5 - (Number(review.rating) || 0)))}
                        </span>
                                {review.text ? (
                                  <p>{review.text}</p>
                                ) : (
                                  <p className="cab-muted">Без комментария</p>
                                )}
                        <button
                          type="button"
                                  className="cab-review-delete"
                                  disabled={deletingReviewId === review.id}
                                  onClick={() => deleteMyReview(review)}
                        >
                                  {deletingReviewId === review.id ? 'Удаляем…' : 'Удалить отзыв'}
                        </button>
                      </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="cab-empty cab-empty-compact">
                        <p className="cab-muted">
                          Оставьте отзыв об автосервисе — после визита
                          или прямо на его карточке.
                        </p>
                        {orders.some((order) => canLeaveReview(order)) ? (
                          <button
                            type="button"
                            className="customer-primary-button"
                            onClick={() => {
                              const next = orders.find((order) => canLeaveReview(order));
                              if (next) {
                                openReviewModal(next);
                              }
                            }}
                          >
                            Оставить отзыв
                          </button>
                        ) : (
                          <Link to="/search" className="cab-link">Найти автосервис</Link>
                        )}
                  </div>
              )}
                  </article>
                </aside>
              </div>
            </section>
          )}

          {isSettings && (
            <section className="customer-section customer-section-page">
              <div className="customer-section-header">
                <div>
                  <p className="customer-section-label">АККАУНТ</p>
                  <h2>Настройки</h2>
                  <p>Обновите имя, email и пароль своего аккаунта.</p>
                </div>
                </div>

              <div className="customer-settings-card">
                <form className="customer-settings-form" onSubmit={saveSettings}>
                  <div className="customer-settings-row">
                    <label className="customer-settings-field">
                      <span className="customer-settings-label">Имя</span>
                      <input
                        type="text"
                        value={settingsName}
                        onChange={(event) => setSettingsName(event.target.value)}
                        autoComplete="name"
                        required
                      />
                    </label>
              </div>

                  <div className="customer-settings-divider" />

                  <div className="customer-settings-row">
                    <label className="customer-settings-field">
                      <span className="customer-settings-label">Email</span>
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={(event) => setSettingsEmail(event.target.value)}
                        autoComplete="email"
                        required
                      />
                    </label>
                  </div>

                  <div className="customer-settings-divider" />

                  <div className="customer-settings-row">
                    <label className="customer-settings-field">
                      <span className="customer-settings-label">Текущий пароль</span>
                      <input
                        type="password"
                        value={settingsCurrentPassword}
                        onChange={(event) => setSettingsCurrentPassword(event.target.value)}
                        autoComplete="current-password"
                        placeholder="Нужен только для смены пароля"
                      />
                    </label>
                      </div>

                  <div className="customer-settings-divider" />

                  <div className="customer-settings-row">
                    <label className="customer-settings-field">
                      <span className="customer-settings-label">Новый пароль</span>
                      <input
                        type="password"
                        value={settingsPassword}
                        onChange={(event) => setSettingsPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Минимум 8 символов"
                      />
                    </label>
                        </div>

                  {(settingsError || settingsMessage) && (
                    <div className="customer-settings-feedback">
                      {settingsError ? (
                        <p className="customer-settings-error">{settingsError}</p>
                      ) : (
                        <p className="customer-settings-success">{settingsMessage}</p>
                      )}
                      </div>
                  )}

                  <div className="customer-settings-actions">
                      <button
                      type="submit"
                        className="customer-primary-button"
                      disabled={settingsSaving}
                      >
                      {settingsSaving ? 'Сохранение…' : 'Сохранить изменения'}
                      </button>
                </div>
                </form>
                  </div>

              <div className="customer-settings-card">
                <form
                  className="customer-settings-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setFromAddress(locationDraft);
                  }}
                >
                  <span className="customer-settings-label">МЕСТОПОЛОЖЕНИЕ</span>
                  <h3>Откуда считать расстояние</h3>
                  <p>Нужно, чтобы на карте и в поиске показывать, как далеко автосервис.</p>
                  <label className="customer-settings-field">
                    <span className="customer-settings-label">Адрес</span>
                    <input
                      type="text"
                      value={locationDraft}
                      onChange={(event) => setLocationDraft(event.target.value)}
                      placeholder="Улица, дом, город"
                    />
                  </label>
                  {locationError ? (
                    <p className="customer-settings-error">{locationError}</p>
                  ) : clientLocation ? (
                    <p className="customer-settings-success">
                      Сохранено: {clientLocation.address}
                    </p>
                  ) : null}
                  <div className="customer-settings-actions">
                    <button
                      type="submit"
                      className="customer-primary-button"
                      disabled={locationStatus !== 'idle'}
                    >
                      {locationStatus === 'geocoding' ? 'Ищем…' : 'Сохранить адрес'}
                    </button>
                    <button
                      type="button"
                      className="customer-outline-button"
                      onClick={setFromGeolocation}
                      disabled={locationStatus !== 'idle'}
                    >
                      {locationStatus === 'locating' ? 'Определяем…' : 'Моё местоположение'}
                    </button>
                  </div>
                </form>
                </div>

              <div className="customer-settings-card customer-settings-danger">
                <div>
                  <span className="customer-settings-label">ВЫХОД</span>
                  <h3>Выйти из аккаунта</h3>
                  <p>После выхода потребуется снова войти в аккаунт.</p>
                </div>
                <button
                  type="button"
                  className="customer-profile-menu-button logout"
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </div>
            </section>
          )}

                      </div>

      </main>

      {reviewTarget ? (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={closeReviewModal}
        >
          <div
            className="confirm-modal review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="confirm-modal-close"
              onClick={closeReviewModal}
              aria-label="Закрыть"
            >
              ×
            </button>
            <p className="confirm-modal-label">Отзыв</p>
            <h2 id="review-modal-title">Оставить отзыв</h2>
            <p>
              {reviewTarget.name}
              {reviewTarget.title ? ` · ${reviewTarget.title}` : ''}
            </p>

            <form className="review-modal-form" onSubmit={submitReview}>
              <div className="review-rating-field">
                <span className="review-rating-label">Оценка</span>
                <div className="review-rating-stars" role="group" aria-label="Оценка от 1 до 5">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active = reviewRating >= value;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`review-star${active ? ' is-on' : ''}`}
                        aria-label={`${value} из 5`}
                        aria-pressed={active}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setReviewRating(value);
                          setReviewError('');
                        }}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="m12 3.6 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18.5l.9-5.4-3.9-3.8 5.4-.8L12 3.6Z"
                            fill={active ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    );
                  })}
                      </div>
                <p className="review-rating-hint">
                  {reviewRating > 0
                    ? `Выбрано: ${reviewRating} из 5`
                    : 'Нажмите на звезду, чтобы поставить оценку'}
                </p>
                        </div>

              <label className="review-text-field">
                <span>Комментарий</span>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Расскажите, как прошёл визит"
                />
              </label>

              {reviewError ? (
                <p className="confirm-modal-error">{reviewError}</p>
              ) : null}

              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="customer-outline-button"
                  onClick={closeReviewModal}
                  disabled={reviewSaving}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="customer-primary-button"
                  disabled={reviewSaving}
                >
                  {reviewSaving ? 'Сохраняем…' : 'Отправить отзыв'}
                </button>
                        </div>
            </form>
                        </div>
                      </div>
      ) : null}

      {bookingDetail ? (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={closeBookingDetail}
        >
          <div
            className="confirm-modal booking-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="confirm-modal-close"
              onClick={closeBookingDetail}
              aria-label="Закрыть"
            >
              ×
            </button>
            <p className="confirm-modal-label">Запись</p>
            <h2 id="booking-detail-title">Детали записи</h2>

            <dl className="booking-detail-list">
                  <div>
                <dt>Автосервис</dt>
                <dd>
                  {bookingDetail.executor_id ? (
                  <button
                    type="button"
                      className="cab-shop-link"
                      onClick={() => {
                        closeBookingDetail();
                        openServiceDetails(bookingDetail);
                      }}
                    >
                      {bookingDetail.executor_name || 'Автосервис'}
                  </button>
                  ) : (
                    bookingDetail.executor_name || 'Автосервис не выбран'
                  )}
                </dd>
              </div>
                <div>
                <dt>Услуга</dt>
                <dd>{bookingDetail.title || '—'}</dd>
                </div>
              <div>
                <dt>Дата и время</dt>
                <dd>
                  {bookingDetail.visit_date
                    ? formatVisitLabel(
                      bookingDetail.visit_date,
                      bookingDetail.visit_time,
                    )
                    : 'Не указано'}
                </dd>
              </div>
                  <div>
                <dt>Мастер</dt>
                <dd>
                  {bookingDetail.staff_name
                    ? `${bookingDetail.staff_name}${bookingDetail.staff_position ? ` · ${bookingDetail.staff_position}` : ''}`
                    : 'Назначается автосервисом после подтверждения'}
                </dd>
              </div>
              <div>
                <dt>Статус</dt>
                <dd>
                  <span
                    className={`cab-badge cab-badge-${orderStatusMeta(bookingDetail.status).tone}`}
                  >
                    {orderStatusMeta(bookingDetail.status).label}
                    </span>
                </dd>
                  </div>
              {bookingDetail.status === 'Отменён' && bookingDetail.cancel_reason ? (
                <div>
                  <dt>Причина отмены</dt>
                  <dd>{bookingDetail.cancel_reason}</dd>
                </div>
              ) : null}
            </dl>

            <div className="confirm-modal-actions">
                  <button
                    type="button"
                    className="customer-outline-button"
                onClick={closeBookingDetail}
                  >
                Закрыть
                  </button>
              {bookingDetail.status !== 'Завершён'
                && bookingDetail.status !== 'Отменён' ? (
                  <button
                    type="button"
                  className="customer-primary-button confirm-modal-danger"
                  onClick={() => askCancelOrder(bookingDetail)}
                  >
                  Отменить запись
                  </button>
              ) : null}
                </div>
                  </div>
        </div>
      ) : null}

      {cancelTarget ? (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={closeCancelModal}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            onClick={(event) => event.stopPropagation()}
          >
                  <button
                    type="button"
              className="confirm-modal-close"
              onClick={closeCancelModal}
              aria-label="Закрыть"
                  >
              ×
                  </button>
            <p className="confirm-modal-label">Отмена записи</p>
            <h2 id="cancel-booking-title">Отменить эту запись?</h2>
            <p>
              {cancelTarget.title}
              {cancelTarget.executor_name
                ? ` · ${cancelTarget.executor_name}`
                : ''}
              {cancelTarget.visit_date
                ? ` · ${formatVisitLabel(cancelTarget.visit_date, cancelTarget.visit_time)}`
                : ''}
            </p>
            <label className="cancel-reason-field" htmlFor="cancel-reason">
              Причина отмены
              <textarea
                id="cancel-reason"
                rows={3}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Например: изменились планы"
                disabled={Boolean(cancelingId)}
              />
            </label>
            {cancelError ? (
              <p className="confirm-modal-error">{cancelError}</p>
            ) : null}
            <div className="confirm-modal-actions">
                <button
                  type="button"
                className="customer-outline-button"
                onClick={closeCancelModal}
                disabled={Boolean(cancelingId)}
                >
                Оставить запись
                </button>
              <button
                type="button"
                className="customer-primary-button confirm-modal-danger"
                onClick={confirmCancelOrder}
                disabled={Boolean(cancelingId)}
              >
                {cancelingId ? 'Отменяем…' : 'Да, отменить'}
              </button>
              </div>
        </div>
        </div>
      ) : null}

      {detailsExecutor ? (
        <ServiceCardModal
          executor={detailsExecutor}
          coverImage={shopCover(detailsExecutor.id)}
          reviews={detailsReviews}
          focus={detailsFocus}
          serviceOptions={(detailsExecutor.services || [])
            .map((item) => (Array.isArray(item) ? item[0] : item?.name))
            .filter(Boolean)}
          bookingService={bookingService}
          bookingDate={bookingDate}
          bookingTime={bookingTime}
          bookingError={bookingError}
          bookingSaving={bookingSaving}
          bookingDone={bookingDone}
          user={user}
          onClose={closeServiceDetails}
          onSelectService={setBookingService}
          onChangeService={setBookingService}
          onChangeDate={setBookingDate}
          onChangeTime={setBookingTime}
          onSubmit={submitDetailsBooking}
          onFocusReviews={() => setDetailsFocus('reviews')}
          onSubmitReview={submitDetailsReview}
          onDeleteReview={deleteMyReview}
        />
      ) : null}

    </div>
  );
}


export default CustomerDashboardPage;