import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import FavoriteButton from '../components/FavoriteButton';
import ServiceCardModal from '../components/ServiceCardModal';
import ServiceSuggest from '../components/ServiceSuggest';
import SiteHeader from '../components/SiteHeader';
import useFavorites from '../hooks/useFavorites';
import {
  SERVICE_ALIASES,
  SERVICE_CATALOG,
} from '../data/serviceCatalog';
import { resolveBestService } from '../utils/fuzzyService';

import bannerImage from '../assets/auto-service-banner.png';
import logoImage from '../assets/logo-header.png';
import serviceOil from '../assets/services/oil-change.jpg';
import serviceBrakes from '../assets/services/brake-pads.jpg';
import serviceDiagnostics from '../assets/services/diagnostics.png';
import serviceTires from '../assets/services/tire-service.png';
import serviceEngine from '../assets/services/engine-repair.jpg';
import serviceAc from '../assets/services/ac-refill.jpg';
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

function ServiceOilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 10.5c0-1.5 1.2-3.2 2.4-4.2L12 5l1.6 1.3C14.8 7.3 16 9 16 10.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ServiceBrakeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 4.8v2.2M12 17v2.2M4.8 12h2.2M17 12h2.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ServiceLaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="5" width="15" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 18.5h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 9.5h6M9 12.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ServiceTireIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m12 5.2 1.1 2.8M12 18.8l-1.1-2.8M5.2 12l2.8-1.1M18.8 12l-2.8 1.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ServiceEngineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11h3l2-2h4l2 2h3v5H4v-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8 9V6.5h5V9M17 12.5h2.5V15M4.5 13.5H3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ServiceAcIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5v17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m5.2 7.2 13.6 9.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18.8 7.2 5.2 16.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ServiceArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6.5 15 12l-6 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const POPULAR_SERVICES = [
  { name: 'Замена масла', image: serviceOil, price: 'от 1 000 ₽', Icon: ServiceOilIcon },
  { name: 'Замена тормозных колодок', image: serviceBrakes, price: 'от 2 500 ₽', Icon: ServiceBrakeIcon },
  { name: 'Компьютерная диагностика', image: serviceDiagnostics, price: 'от 1 500 ₽', Icon: ServiceLaptopIcon },
  { name: 'Шиномонтаж', image: serviceTires, price: 'от 1 200 ₽', Icon: ServiceTireIcon },
  { name: 'Ремонт двигателя', image: serviceEngine, price: 'от 5 000 ₽', Icon: ServiceEngineIcon },
  { name: 'Заправка кондиционера', image: serviceAc, price: 'от 2 000 ₽', Icon: ServiceAcIcon },
];


/* =====================================================
   ИКОНКИ
===================================================== */

function matchesWorkName(name, query) {
  return String(name)
    .toLocaleLowerCase('ru')
    .includes(query);
}

function getMatchedWorks(service, query) {
  if (!query || !Array.isArray(service?.services)) {
    return [];
  }

  return service.services.filter(
    (item) =>
      Array.isArray(item) &&
      matchesWorkName(item[0], query)
  );
}

function orderStatusType(status) {
  if (status === 'В работе') {
    return 'progress';
  }

  if (status === 'Запланирован') {
    return 'planned';
  }

  if (status === 'Ожидает подтверждения') {
    return 'search';
  }

  if (status === 'Завершён') {
    return 'done';
  }

  return 'search';
}

function mapOrder(order) {
  return {
    id: order.id,
    title: order.title,
    status: order.status,
    statusType: orderStatusType(order.status),
    car: order.car_label,
    executorName: order.executor_name,
    executorRating: order.executor_rating,
    executorId: order.executor_id,
    visitDate: order.visit_date,
    visitTime: order.visit_time,
  };
}

function readApiError(data, fallback) {
  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  return fallback;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}


function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="17"
        rx="2"
      />

      <path d="M9 4.5V3h6v1.5" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
    </svg>
  );
}


function ShieldIcon() {
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
      <path d="M12 3 20 6v5c0 5.2-3.3 8.6-8 10-4.7-1.4-8-4.8-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}


function ClockIcon() {
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
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}


function LocationIcon() {
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
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}


function CarIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 29h34" />
      <path d="m11 29 3-9h20l4 9" />
      <path d="M14 20 18 14h12l5 6" />
      <path d="M8 29v5h4" />
      <path d="M40 29v5h-4" />
      <circle cx="14" cy="34" r="4" />
      <circle cx="34" cy="34" r="4" />
      <path d="M19 20h10" />
    </svg>
  );
}


function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}


/* =====================================================
   ЛОГОТИП
===================================================== */

function HeaderLogo() {
  return (
    <img
      className="logo-image"
      src={logoImage}
      alt="Найти автосервис"
    />
  );
}


/* =====================================================
   ДАННЫЕ АВТОСЕРВИСОВ
===================================================== */

/* =====================================================
   FOOTER
===================================================== */

function Footer() {
  const { city } = useCity();
  const searchTo = `/search?city=${encodeURIComponent(city)}`;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <HeaderLogo />
          </Link>
          <p className="site-footer-description">
            Надёжные автосервисы рядом. Сравнивайте,
            выбирайте и записывайтесь онлайн.
          </p>
        </div>

        <div className="site-footer-column">
          <h4>Сервис</h4>
          <Link to={searchTo}>Найти автосервис</Link>
          <a href="/#services">Услуги</a>
          <Link to="/map">Карта автосервисов</Link>
          <a href="/#services">Популярные услуги</a>
        </div>

        <div className="site-footer-column">
          <h4>Информация</h4>
          <Link to="/register">Для автосервисов</Link>
          <a href="#faq">Вопросы и ответы</a>
          <a href="#blog">Блог</a>
        </div>

        <div className="site-footer-column">
          <h4>О проекте</h4>
          <a href="#about">О нас</a>
          <a href="#partners">Партнёрам</a>
          <a href="#terms">Пользовательское соглашение</a>
          <a href="#privacy">Политика конфиденциальности</a>
        </div>

        <div className="site-footer-perks">
          <div>
            <span className="site-footer-perk-icon" aria-hidden="true">
              <ShieldCheckIcon />
            </span>
            <div>
              <strong>Проверенные автосервисы</strong>
              <span>Реальные отзывы и рейтинг</span>
            </div>
          </div>
          <div>
            <span className="site-footer-perk-icon" aria-hidden="true">
              <PercentIcon />
            </span>
            <div>
              <strong>Прозрачные цены</strong>
              <span>Сравнивайте стоимость услуг</span>
            </div>
          </div>
          <div>
            <span className="site-footer-perk-icon" aria-hidden="true">
              <CalendarIcon />
            </span>
            <div>
              <strong>Удобная запись</strong>
              <span>Выберите дату и время онлайн</span>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© 2026 Найти Автосервис. Все права защищены.</span>
        <div className="site-footer-socials" aria-label="Соцсети">
          <a href="https://vk.com" target="_blank" rel="noreferrer" aria-label="ВКонтакте">VK</a>
          <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">TG</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">YT</a>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================
   HOME PAGE
===================================================== */

function HomePage({
  section = 'overview',
  onLogin,
  onRegister,
}) {
  const {
    user,
    logout,
    authFetch,
    refreshCars,
    updateProfile,
  } = useAuth();
  const { city } = useCity();
  const { isFavorite, toggleFavorite } = useFavorites();

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedService, setSelectedService] =
    useState(null);
  const [detailsFocus, setDetailsFocus] = useState('booking');
  const [modalReviews, setModalReviews] = useState([]);
  const [modalReviewsLoading, setModalReviewsLoading] = useState(false);

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [catalogNames, setCatalogNames] = useState(SERVICE_CATALOG);
  const [workQuery, setWorkQuery] = useState('');
  const [heroWork, setHeroWork] = useState('');
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const [bookingService, setBookingService] =
    useState('');

  const [bookingDate, setBookingDate] =
    useState('');

  const [bookingTime, setBookingTime] =
    useState('');

  const [showBookingAuth, setShowBookingAuth] =
    useState(false);

  const [orders, setOrders] = useState([]);
  const [showCarForm, setShowCarForm] = useState(false);
  const [carDraft, setCarDraft] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    vin: '',
  });
  const [cabinetError, setCabinetError] = useState('');
  const [settingsMode, setSettingsMode] = useState('');
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');


  const customerCars = user?.cars || [];

  const isOverview = section === 'overview';
  const isOrders = section === 'orders';
  const isRequests = section === 'requests';
  const isGarage = section === 'garage';
  const isSettings = section === 'settings';

  const requests = orders
    .filter((order) => order.executorName)
    .map((order) => ({
      id: order.id,
      service: order.executorName,
      rating: order.executorRating ?? '—',
      serviceName: order.title,
      price: order.visitDate
        ? `${order.visitDate}${order.visitTime ? `, ${order.visitTime}` : ''}`
        : 'Дата не выбрана',
      executorId: order.executorId,
    }));

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      setOrders([]);
      return undefined;
    }

    let cancelled = false;

    const loadOrders = async () => {
      const response = await authFetch('/api/orders');

      if (!response.ok || cancelled) {
        return;
      }

      const data = await response.json();

      if (!cancelled) {
        setOrders(data.map(mapOrder));
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user, authFetch]);

  const handleLogout = async () => {
    navigate('/', { replace: true });
    if (typeof logout === 'function') {
      await logout();
    }
  };


  /* =====================================================
     ЗАГРУЗКА АВТОСЕРВИСОВ
  ===================================================== */

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError('');

        const response = await fetch(
          `/api/executors?city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error('Не удалось загрузить автосервисы');
        }

        const data = await response.json();

        setServices(data);
      } catch (error) {
        setServicesError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить автосервисы'
        );
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [city]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const names = data
          .map((item) => item?.name)
          .filter(Boolean);
        if (names.length) {
          setCatalogNames(names);
        }
      } catch {
        // оставляем локальный каталог
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    if (!selectedService?.id) {
      setModalReviews([]);
      return undefined;
    }

    let cancelled = false;

    const loadReviews = async () => {
      setModalReviewsLoading(true);
      try {
        const response = await fetch(
          `/api/executors/${selectedService.id}/reviews`
        );
        if (!response.ok) {
          throw new Error('reviews');
        }
        const data = await response.json();
        if (!cancelled) {
          setModalReviews(data);
        }
      } catch {
        if (!cancelled) {
          setModalReviews([]);
        }
      } finally {
        if (!cancelled) {
          setModalReviewsLoading(false);
        }
      }
    };

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [selectedService?.id]);

  useEffect(() => {
    const executorId = new URLSearchParams(
      window.location.search
    ).get('executor');

    if (!executorId || services.length === 0) {
      return;
    }

    const found = services.find(
      (item) => String(item.id) === executorId
    );

    if (found && !selectedService) {
      setSelectedService(found);
      setDetailsFocus('booking');
    }
    // открываем карточку один раз по ?executor=
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);


  /* =====================================================
     ПАГИНАЦИЯ
  ===================================================== */

  const servicesPerPage = 10;

  const normalizedWorkQuery = workQuery
    .trim()
    .toLocaleLowerCase('ru');

  const filteredServices = normalizedWorkQuery
    ? services.filter(
        (service) =>
          getMatchedWorks(
            service,
            normalizedWorkQuery
          ).length > 0
      )
    : services;

  const totalPages = Math.ceil(
    filteredServices.length / servicesPerPage
  );

  const safePage = totalPages > 0
    ? Math.min(currentPage, totalPages)
    : 1;

  const startIndex =
    (safePage - 1) *
    servicesPerPage;

  const visibleServices =
    filteredServices.slice(
      startIndex,
      startIndex + servicesPerPage
    );


  /* =====================================================
     ПРОКРУТКА К СЕРВИСАМ
  ===================================================== */

  const scrollToServices = () => {
    navigate(`/search?city=${encodeURIComponent(city)}`);
  };

  const preferredWorks = [
    ...POPULAR_SERVICES.map((item) => item.name),
    ...SERVICE_ALIASES,
  ];

  const workOptions = (() => {
    const fromShops = services.flatMap((service) =>
      (service.services || [])
        .map((item) => item?.[0])
        .filter(Boolean)
    );
    const preferredSet = new Set(preferredWorks);
    const rest = [...new Set([...catalogNames, ...fromShops])]
      .filter((name) => !preferredSet.has(name))
      .sort((left, right) => left.localeCompare(right, 'ru'));

    return [...new Set([...preferredWorks, ...rest])];
  })();

  const bookingWorkOptions = [
    ...new Set([
      ...(selectedService?.services || [])
        .map((item) => item?.[0])
        .filter(Boolean),
      ...workOptions,
    ]),
  ];

  const submitHeroSearch = (event) => {
    event.preventDefault();
    const resolvedWork = resolveBestService(heroWork, workOptions) || heroWork.trim();
    const params = new URLSearchParams({
      city,
    });

    if (resolvedWork) {
      params.set('work', resolvedWork);
      setHeroWork(resolvedWork);
    }

    navigate(`/search?${params.toString()}`);
  };


  /* =====================================================
     ОТКРЫТИЕ СЕРВИСА
  ===================================================== */

  const closeService = () => {
    setSelectedService(null);
    setDetailsFocus('booking');
    setModalReviews([]);
    setShowBookingAuth(false);
  };

  const openService = (
    service,
    workName = '',
    focus = 'booking'
  ) => {
    setSelectedService(service);
    setDetailsFocus(focus);
    setBookingService(workName);
    setBookingDate('');
    setBookingTime('');
    setShowBookingAuth(false);
  };


  /* =====================================================
     СМЕНА СТРАНИЦЫ
  ===================================================== */

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
    closeService();

    setTimeout(() => {
      document
        .getElementById('services')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 50);
  };


  /* =====================================================
     ЗАПИСЬ
  ===================================================== */

  const handleBooking = async (event) => {
    event.preventDefault();

    if (!user) {
      setShowBookingAuth(true);
      return;
    }

    if (
      !bookingService ||
      !bookingDate ||
      !bookingTime
    ) {
      return;
    }

    const response = await authFetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: bookingService,
        description: '',
        executor_id: selectedService.id,
        visit_date: bookingDate,
        visit_time: bookingTime,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      alert(readApiError(data, 'Не удалось сохранить запись'));
      return;
    }

    setOrders((current) => [mapOrder(data), ...current]);
    setBookingService('');
    setBookingDate('');
    setBookingTime('');

    alert(
      `Запись сохранена!\n\n` +
      `${selectedService.name}\n` +
      `${bookingService}\n` +
      `${bookingDate} в ${bookingTime}`
    );
  };

  const submitShopReview = async ({ rating, text }) => {
    if (!user) {
      setShowBookingAuth(true);
      return { error: 'Войдите, чтобы оставить отзыв' };
    }
    if (!selectedService?.id) {
      return { error: 'Автосервис не выбран' };
    }
    const response = await authFetch(`/api/executors/${selectedService.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, text }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: readApiError(data, 'Не удалось отправить отзыв') };
    }
    setModalReviews((current) => [data, ...current]);
    setSelectedService((current) => (
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
    setModalReviews((current) => current.filter((item) => item.id !== review.id));
    setSelectedService((current) => (
      current
        ? { ...current, reviews: Math.max(0, (Number(current.reviews) || 1) - 1) }
        : current
    ));
  };

  const saveCar = async (event) => {
    event.preventDefault();
    setCabinetError('');

    const response = await authFetch('/api/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand: carDraft.brand.trim(),
        model: carDraft.model.trim(),
        year: carDraft.year ? Number(carDraft.year) : null,
        mileage: carDraft.mileage
          ? Number(carDraft.mileage)
          : null,
        vin: carDraft.vin.trim() || null,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setCabinetError(
        readApiError(data, 'Не удалось сохранить автомобиль')
      );
      return;
    }

    await refreshCars();
    setShowCarForm(false);
    setCarDraft({
      brand: '',
      model: '',
      year: '',
      mileage: '',
      vin: '',
    });
  };

  const removeCar = async (carId) => {
    const response = await authFetch(`/api/cars/${carId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await refreshCars();
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setCabinetError('');

    const payload = {};

    if (settingsMode === 'name') {
      payload.name = settingsName.trim();
    }

    if (settingsMode === 'email') {
      payload.email = settingsEmail.trim();
    }

    if (settingsMode === 'password') {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    const result = await updateProfile(payload);

    if (!result?.success) {
      setCabinetError(
        result?.error || 'Не удалось сохранить данные'
      );
      return;
    }

    setSettingsMode('');
    setCurrentPassword('');
    setNewPassword('');
  };


  return (
    <div className={`home-page${isOverview ? ' home-overview' : ''}`}>

      <SiteHeader
        activeNav="home"
        scrolled={headerScrolled}
        onLogin={onLogin}
        onRegister={onRegister}
      />


      {/* =====================================================
          ГЛАВНЫЙ КОНТЕНТ
      ===================================================== */}

      <main>

        {/* ===================================================
            БАННЕР
        =================================================== */}

        {isOverview && (
        <section className="home-hero">
          <img
            className="home-hero-banner"
            src={bannerImage}
            alt="Автосервис"
          />

          <div className="home-hero-content">
            <div className="home-hero-copy">
              <h1>
                Найдите автосервис,
                <br />
                которому можно <span>доверять</span>
              </h1>
              <p>
                Сравнивайте цены, читайте реальные отзывы
                и записывайтесь онлайн. Обслуживайте автомобиль
                без лишних хлопот.
              </p>
            </div>

            <form className="home-search" onSubmit={submitHeroSearch}>
              <div className="home-search-field">
                <span className="home-search-icon" aria-hidden="true">
                  <WrenchIcon />
                </span>
                <span className="home-search-texts">
                  <ServiceSuggest
                    value={heroWork}
                    options={workOptions}
                    onChange={setHeroWork}
                    placeholder="Например, замена тормозных колодок"
                  />
                </span>
              </div>
              <button type="submit">
                <SearchIcon />
                Найти автосервисы
                <ArrowRightIcon />
              </button>
            </form>

            <div className="home-perks">
              <div>
                <span className="perk-icon" aria-hidden="true">
                  <ShieldCheckIcon />
                </span>
                <div>
                  <strong>Проверенные автосервисы</strong>
                  <span>Реальные отзывы и рейтинг</span>
                </div>
              </div>
              <div>
                <span className="perk-icon" aria-hidden="true">
                  <PercentIcon />
                </span>
                <div>
                  <strong>Прозрачные цены</strong>
                  <span>Сравнивайте стоимость услуг</span>
                </div>
              </div>
              <div>
                <span className="perk-icon" aria-hidden="true">
                  <CalendarIcon />
                </span>
                <div>
                  <strong>Удобная запись</strong>
                  <span>Выберите дату и время онлайн</span>
                </div>
              </div>
              <div>
                <span className="perk-icon" aria-hidden="true">
                  <LocationIcon />
                </span>
                <div>
                  <strong>Сервисы рядом</strong>
                  <span>На карте и со схемой проезда</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}


        {/* ===================================================
            РАЗДЕЛЫ КАБИНЕТА
            Баннер выше остаётся на всех страницах.
        =================================================== */}

        {isOrders && (
          <section className="customer-section customer-section-page">
            <div className="services-header">
              <div>
                <p className="section-label">МОИ ЗАКАЗЫ</p>
                <h2>Все заказы</h2>
                <p className="services-subtitle">
                  Здесь отображаются ваши обращения в автосервисы.
                </p>
              </div>

              <Link
                to="/customer/orders/new"
                className="primary-button"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Создать заказ →
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="customer-orders-list">
                {orders.map((order) => (
                  <article
                    className="order-card"
                    key={order.id}
                  >
                    <div className="order-number">
                      Заказ #{order.id}
                    </div>

                    <div className="order-content">
                      <div>
                        <h3>{order.title}</h3>
                        <p>{order.car}</p>
                      </div>

                      <span
                        className={`order-status ${
                          order.statusType || 'search'
                        }`}
                      >
                        {order.status}
                      </span>

                      <button
                        type="button"
                        className="order-link"
                      >
                        Подробнее →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="customer-empty-card">
                <div className="customer-car-icon">
                  <ClipboardIcon />
                </div>

                <div>
                  <h3>Заказов пока нет</h3>
                  <p>
                    Создайте первый заказ, чтобы найти автосервис.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {isRequests && (
          <section className="customer-section customer-section-page">
            <div className="services-header">
              <div>
                <p className="section-label">ЗАЯВКИ</p>
                <h2>Предложения автосервисов</h2>
                <p className="services-subtitle">
                  Автосервисы откликнулись на ваши заказы.
                </p>
              </div>
            </div>

            {requests.length > 0 ? (
              <div className="customer-requests-list">
                {requests.map((request) => (
                  <article
                    className="request-card"
                    key={request.id}
                  >
                    <div className="request-service-icon">
                      <CarIcon />
                    </div>

                    <div className="request-content">
                      <div className="request-title-row">
                        <h3>{request.service}</h3>
                        <span className="request-rating">
                          ★ {request.rating}
                        </span>
                      </div>

                      <p>{request.serviceName}</p>

                      <span className="request-price-label">
                        Стоимость
                      </span>

                      <strong className="request-price">
                        {request.price}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        navigate(`/executors/${request.executorId}`)
                      }
                    >
                      Посмотреть предложение →
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="customer-empty-card">
                <div className="customer-car-icon">
                  <ClipboardIcon />
                </div>

                <div>
                  <h3>Новых заявок нет</h3>
                  <p>
                    Когда автосервисы ответят на ваши заказы,
                    предложения появятся здесь.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {isGarage && (
          <section className="customer-section customer-section-page">
            <div className="services-header">
              <div>
                <p className="section-label">МОЙ ГАРАЖ</p>
                <h2>Ваши автомобили</h2>
                <p className="services-subtitle">
                  Храните автомобили в одном месте и быстрее
                  записывайтесь в сервис.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setCabinetError('');
                  setShowCarForm((open) => !open);
                }}
              >
                + Добавить автомобиль
              </button>
            </div>

            {showCarForm && (
              <form
                className="customer-settings-card"
                onSubmit={saveCar}
              >
                <div className="customer-settings-row">
                  <input
                    value={carDraft.brand}
                    onChange={(event) =>
                      setCarDraft((draft) => ({
                        ...draft,
                        brand: event.target.value,
                      }))
                    }
                    placeholder="Марка"
                    required
                  />
                  <input
                    value={carDraft.model}
                    onChange={(event) =>
                      setCarDraft((draft) => ({
                        ...draft,
                        model: event.target.value,
                      }))
                    }
                    placeholder="Модель"
                    required
                  />
                </div>
                <div className="customer-settings-row">
                  <input
                    value={carDraft.year}
                    onChange={(event) =>
                      setCarDraft((draft) => ({
                        ...draft,
                        year: event.target.value,
                      }))
                    }
                    placeholder="Год"
                    inputMode="numeric"
                  />
                  <input
                    value={carDraft.mileage}
                    onChange={(event) =>
                      setCarDraft((draft) => ({
                        ...draft,
                        mileage: event.target.value,
                      }))
                    }
                    placeholder="Пробег, км"
                    inputMode="numeric"
                  />
                  <input
                    value={carDraft.vin}
                    onChange={(event) =>
                      setCarDraft((draft) => ({
                        ...draft,
                        vin: event.target.value,
                      }))
                    }
                    placeholder="VIN"
                  />
                </div>
                {cabinetError && <p>{cabinetError}</p>}
                <button
                  type="submit"
                  className="primary-button"
                >
                  Сохранить автомобиль
                </button>
              </form>
            )}

            {customerCars.length > 0 ? (
              <div className="customer-garage-list">
                {customerCars.map((car) => (
                  <article
                    className="customer-car-card"
                    key={car.id}
                  >
                    <div className="customer-car-icon">
                      <CarIcon />
                    </div>

                    <div className="customer-car-info">
                      <h3>
                        {car.brand || 'Автомобиль'}{' '}
                        {car.model || ''}
                      </h3>

                      <p>
                        {car.year || '—'} год ·{' '}
                        {car.mileage || '—'} км
                      </p>
                    </div>

                    <div className="customer-car-details">
                      <div>
                        <span>VIN</span>
                        <strong>
                          {car.vin || 'Не указан'}
                        </strong>
                      </div>

                      <div>
                        <span>Пробег</span>
                        <strong>
                          {car.mileage || 'Не указан'} км
                        </strong>
                      </div>

                      <div>
                        <span>Год выпуска</span>
                        <strong>{car.year || '—'}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="customer-outline-button"
                      onClick={() => removeCar(car.id)}
                    >
                      Удалить
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="customer-empty-card">
                <div className="customer-car-icon">
                  <CarIcon />
                </div>

                <div>
                  <h3>В гараже пока нет автомобилей</h3>
                  <p>
                    Добавьте автомобиль, чтобы использовать его
                    при создании заказа.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setCabinetError('');
                    setShowCarForm(true);
                  }}
                >
                  Добавить автомобиль
                </button>
              </div>
            )}
          </section>
        )}

        {isSettings && (
          <section className="customer-section customer-section-page">
            <div className="services-header">
              <div>
                <p className="section-label">АККАУНТ</p>
                <h2>Настройки</h2>
                <p className="services-subtitle">
                  Управляйте своими персональными данными и
                  настройками аккаунта.
                </p>
              </div>
            </div>

            <div className="customer-settings-card">
              <form onSubmit={saveSettings}>
                <div className="customer-settings-row">
                  <div>
                    <span className="customer-settings-label">
                      Имя
                    </span>
                    {settingsMode === 'name' ? (
                      <input
                        value={settingsName}
                        onChange={(event) =>
                          setSettingsName(event.target.value)
                        }
                        required
                      />
                    ) : (
                      <strong>
                        {user?.name || 'Не указано'}
                      </strong>
                    )}
                  </div>

                  <button
                    type={settingsMode === 'name' ? 'submit' : 'button'}
                    className="customer-outline-button"
                    onClick={() => {
                      if (settingsMode !== 'name') {
                        setCabinetError('');
                        setSettingsName(user?.name || '');
                        setSettingsMode('name');
                      }
                    }}
                  >
                    {settingsMode === 'name' ? 'Сохранить' : 'Изменить'}
                  </button>
                </div>

                <div className="customer-settings-divider" />

                <div className="customer-settings-row">
                  <div>
                    <span className="customer-settings-label">
                      Email
                    </span>
                    {settingsMode === 'email' ? (
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={(event) =>
                          setSettingsEmail(event.target.value)
                        }
                        required
                      />
                    ) : (
                      <strong>
                        {user?.email || 'Не указан'}
                      </strong>
                    )}
                  </div>

                  <button
                    type={settingsMode === 'email' ? 'submit' : 'button'}
                    className="customer-outline-button"
                    onClick={() => {
                      if (settingsMode !== 'email') {
                        setCabinetError('');
                        setSettingsEmail(user?.email || '');
                        setSettingsMode('email');
                      }
                    }}
                  >
                    {settingsMode === 'email' ? 'Сохранить' : 'Изменить'}
                  </button>
                </div>

                <div className="customer-settings-divider" />

                <div className="customer-settings-row">
                  <div>
                    <span className="customer-settings-label">
                      Пароль
                    </span>
                    {settingsMode === 'password' ? (
                      <div>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(event.target.value)
                          }
                          placeholder="Текущий пароль"
                          required
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          placeholder="Новый пароль"
                          minLength={8}
                          required
                        />
                      </div>
                    ) : (
                      <strong>••••••••••</strong>
                    )}
                  </div>

                  <button
                    type={settingsMode === 'password' ? 'submit' : 'button'}
                    className="customer-outline-button"
                    onClick={() => {
                      if (settingsMode !== 'password') {
                        setCabinetError('');
                        setCurrentPassword('');
                        setNewPassword('');
                        setSettingsMode('password');
                      }
                    }}
                  >
                    {settingsMode === 'password'
                      ? 'Сохранить'
                      : 'Изменить пароль'}
                  </button>
                </div>

                {cabinetError && <p>{cabinetError}</p>}
              </form>
            </div>

            <div className="customer-settings-card customer-settings-danger">
              <div>
                <span className="customer-settings-label">
                  ВЫХОД
                </span>
                <h3>Выйти из аккаунта</h3>
                <p>
                  После выхода потребуется снова войти в аккаунт.
                </p>
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

        {isOverview && (
          <>

        {/* ===================================================
            КАК ЭТО РАБОТАЕТ
        =================================================== */}

        <section className="popular-section" id="services">
          <div className="popular-heading">
            <div>
              <h2>Популярные услуги</h2>
            </div>
            <Link to={`/search?city=${encodeURIComponent(city)}`}>Все услуги →</Link>
          </div>

          <div className="work-card-grid">
            {POPULAR_SERVICES.map((item) => {
              const livePrice = services
                .flatMap((service) => service.services || [])
                .find((row) => row?.[0] === item.name)?.[1];
              const Icon = item.Icon;

              return (
                <Link
                  className="work-card"
                  key={item.name}
                  to={`/search?work=${encodeURIComponent(item.name)}&city=${encodeURIComponent(city)}`}
                >
                  <img
                    className="work-card-image"
                    src={item.image}
                    alt={item.name}
                  />
                  <span className="work-card-body">
                    <span className="work-card-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="work-card-text">
                      <strong>{item.name}</strong>
                      <small>{livePrice || item.price}</small>
                    </span>
                    <span className="work-card-arrow" aria-hidden="true">
                      <ServiceArrowIcon />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="popular-section">
          <div className="popular-heading">
            <div>
              <h2>Автосервисы рядом</h2>
              <p>Найдено {services.length}</p>
            </div>
            <Link to={`/search?city=${encodeURIComponent(city)}`}>Все автосервисы →</Link>
          </div>

          <div className="shop-grid">
            {services.slice(0, 4).map((service, index) => (
              <article className="shop-card" key={service.id}>
                <div className="shop-card-media">
                  <img
                    className="shop-card-image"
                    src={SHOP_IMAGES[index % SHOP_IMAGES.length]}
                    alt={service.name}
                  />
                  <FavoriteButton
                    className="shop-card-favorite"
                    active={isFavorite(service.id)}
                    onToggle={() => toggleFavorite(service.id)}
                  />
                </div>
                <div className="shop-card-content">
                  <div className="shop-card-top">
                    <h3>
                      <button
                        type="button"
                        className="result-name-link shop-name-button"
                        onClick={() => openService(service)}
                      >
                        {service.name}
                      </button>
                    </h3>
                    <button
                      type="button"
                      className={`result-rating-link shop-rating-button ${
                        service.status === 'Закрыто' ? 'closed-status' : ''
                      }`}
                      onClick={() => openService(service, '', 'reviews')}
                    >
                      ★ {service.rating}
                      {service.reviews ? ` (${service.reviews})` : ' · отзывы'}
                    </button>
                  </div>
                  <p>{service.address}</p>
                  <p className={
                    service.status === 'Закрыто'
                      ? 'result-status closed'
                      : 'result-status'
                  }>
                    {service.status}
                    {service.hours ? ` · ${service.hours}` : ''}
                  </p>
                  <div className="popular-tags">
                    {(service.services || []).slice(0, 3).map((item) => (
                      <span key={item[0]}>{item[0]}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="shop-book"
                    onClick={() => openService(service)}
                  >
                    Записаться
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="owner-banner">
          <div>
            <h2>Вы автосервис?</h2>
            <p>
              Получайте больше клиентов с площадки «Автосервис рядом».
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={onRegister}
            >
              Разместить автосервис →
            </button>
          </div>
          <ul>
            <li>Новые клиенты каждый день</li>
            <li>Удобное управление записями</li>
            <li>Продвижение в вашем регионе</li>
          </ul>
        </section>

        {/* ===================================================
            АВТОСЕРВИСЫ
        =================================================== */}

        <section
          className="services-section"
        >

          <div className="services-header">

            <div>

              <p className="section-label">
                Выберите подходящий сервис
              </p>

              <h2>
                Автосервисы рядом с вами
              </h2>

              <p className="services-subtitle">
                Сравните рейтинг, стоимость,
                расположение и часы работы.
              </p>

            </div>


            <div className="services-count">
              Найдено
              <strong>
                {filteredServices.length}
              </strong>
            </div>

          </div>


          {!servicesLoading && !servicesError && (
            <form
              className="work-search"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <span className="work-search-icon">
                <SearchIcon />
              </span>

              <input
                id="work-search"
                type="search"
                value={workQuery}
                onChange={(event) => {
                  setWorkQuery(event.target.value);
                  setCurrentPage(1);
                  setSelectedService(null);
                }}
                placeholder="Наименование работы, например замена масла"
                aria-label="Поиск услуги по наименованию работы"
              />

              {workQuery && (
                <button
                  type="button"
                  className="work-search-clear"
                  onClick={() => {
                    setWorkQuery('');
                    setCurrentPage(1);
                  }}
                >
                  Очистить
                </button>
              )}
            </form>
          )}


          {servicesLoading && (
            <p className="services-subtitle">
              Загрузка автосервисов...
            </p>
          )}

          {servicesError && (
            <p className="services-subtitle">
              {servicesError}
            </p>
          )}

          {!servicesLoading &&
            !servicesError &&
            services.length === 0 && (
              <p className="services-subtitle">
                Автосервисы пока не найдены.
              </p>
            )}

          {!servicesLoading &&
            !servicesError &&
            services.length > 0 &&
            filteredServices.length === 0 && (
              <p className="services-subtitle">
                Услуги по запросу «{workQuery.trim()}» не найдены.
              </p>
            )}


          {/* ТАБЛИЦА */}

          {!servicesLoading && !servicesError && filteredServices.length > 0 && (
          <div className="services-table">

            <div className="services-table-head">

              <span>
                Автосервис
              </span>

              <span>
                Адрес
              </span>

              <span>
                Рейтинг
              </span>

              <span>
                Часы работы
              </span>

              <span />

            </div>


            {visibleServices.map(
              (service) => {
                const matchedWorks = getMatchedWorks(
                  service,
                  normalizedWorkQuery
                );

                return (
                <article
                  key={service.id}
                  className="service-row"
                >

                  {/* СЕРВИС */}

                  <div className="service-name">

                    <div className="service-avatar">
                      <CarIcon />
                    </div>

                    <div>

                      <h3>
                        {service.name}
                      </h3>

                      <span
                        className={
                          service.status === 'Закрыто'
                            ? 'closed-status'
                            : undefined
                        }
                      >
                        {service.status}
                      </span>

                      {matchedWorks.length > 0 && (
                        <p className="service-work-match">
                          {matchedWorks
                            .map(
                              ([name, price]) =>
                                `${name} · ${price}`
                            )
                            .join(', ')}
                        </p>
                      )}

                    </div>

                  </div>


                  {/* АДРЕС */}

                  <div className="service-address">

                    <LocationIcon />

                    <span>
                      {service.address}
                    </span>

                  </div>


                  {/* РЕЙТИНГ */}

                  <button
                    type="button"
                    className="service-rating service-rating-link"
                    onClick={() => openService(service, '', 'reviews')}
                  >

                    <span className="star-icon">
                      <StarIcon />
                    </span>

                    <strong>
                      {service.rating}
                    </strong>

                    <span>
                      ({service.reviews || 0} отзывов)
                    </span>

                  </button>


                  {/* ЧАСЫ */}

                  <div className="service-hours">

                    <ClockIcon />

                    <span>
                      {service.hours}
                    </span>

                  </div>


                  {/* КНОПКА */}

                  <div className="service-action">

                    <button
                      type="button"
                      onClick={() =>
                        openService(
                          service,
                          matchedWorks.length === 1
                            ? matchedWorks[0][0]
                            : ''
                        )
                      }
                    >
                      Подробнее
                      <span>
                        →
                      </span>
                    </button>

                  </div>

                </article>
                );
              }
            )}

          </div>
          )}


          {/* =================================================
              ПАГИНАЦИЯ
          ================================================= */}

          {!servicesLoading && !servicesError && totalPages > 1 && (

            <div className="pagination">

              <button
                type="button"
                className="pagination-arrow"
                disabled={
                  safePage === 1
                }
                onClick={() =>
                  handlePageChange(
                    safePage - 1
                  )
                }
              >
                ←
              </button>


              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  type="button"
                  key={page}
                  className={
                    safePage === page
                      ? 'pagination-number active'
                      : 'pagination-number'
                  }
                  onClick={() =>
                    handlePageChange(page)
                  }
                >
                  {page}
                </button>

              ))}


              <button
                type="button"
                className="pagination-arrow"
                disabled={
                  safePage ===
                  totalPages
                }
                onClick={() =>
                  handlePageChange(
                    safePage + 1
                  )
                }
              >
                →
              </button>

            </div>

          )}

        </section>


        {selectedService && (
          <ServiceCardModal
            executor={selectedService}
            coverImage={SHOP_IMAGES[Math.abs(Number(selectedService.id) || 0) % SHOP_IMAGES.length]}
            reviews={modalReviews}
            reviewsLoading={modalReviewsLoading}
            focus={detailsFocus}
            serviceOptions={bookingWorkOptions}
            bookingService={bookingService}
            bookingDate={bookingDate}
            bookingTime={bookingTime}
            user={user}
            onClose={closeService}
            onSelectService={setBookingService}
            onChangeService={setBookingService}
            onChangeDate={setBookingDate}
            onChangeTime={setBookingTime}
            onSubmit={handleBooking}
            onFocusReviews={() => setDetailsFocus('reviews')}
            onSubmitReview={submitShopReview}
            onDeleteReview={deleteShopReview}
          />
        )}

          </>
        )}

        {/* ===================================================
            МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ
            ДЛЯ ЗАПИСИ
        =================================================== */}

        {showBookingAuth && (

          <div
            className="booking-auth-modal-backdrop"
            role="presentation"
            onClick={() =>
              setShowBookingAuth(false)
            }
          >

            <div
              className="booking-auth-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-auth-title"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="booking-auth-close"
                aria-label="Закрыть"
                onClick={() =>
                  setShowBookingAuth(false)
                }
              >
                ×
              </button>


              <div className="booking-auth-icon">
                <CarIcon />
              </div>


              <p className="booking-auth-label">
                Запись в автосервис
              </p>


              <h2 id="booking-auth-title">
                Войдите, чтобы записаться
              </h2>


              <p>
                Чтобы выбрать автомобиль
                и оформить запись, войдите
                в аккаунт или зарегистрируйтесь.
              </p>


              <div className="booking-auth-actions">

                <button
                  type="button"
                  className="booking-auth-primary"
                  onClick={() => {
                    setShowBookingAuth(false);
                    onLogin?.();
                  }}
                >
                  Войти
                </button>


                <button
                  type="button"
                  className="booking-auth-secondary"
                  onClick={() => {
                    setShowBookingAuth(false);
                    onRegister?.();
                  }}
                >
                  Зарегистрироваться
                </button>

              </div>

            </div>

          </div>

        )}

      </main>

      <Footer />

    </div>
  );
}


export default HomePage;