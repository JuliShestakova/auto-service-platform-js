import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

import bannerImage from '../assets/auto-service-banner.png';
import logoImage from '../assets/logo.png';


/* =====================================================
   ИКОНКИ
===================================================== */

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


function CalendarIcon() {
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
      <rect
        x="7"
        y="9"
        width="34"
        height="32"
        rx="4"
      />

      <path d="M14 5v8" />
      <path d="M34 5v8" />
      <path d="M7 18h34" />

      <circle cx="16" cy="25" r="1" />
      <circle cx="24" cy="25" r="1" />
      <circle cx="32" cy="25" r="1" />

      <circle cx="16" cy="33" r="1" />
      <circle cx="24" cy="33" r="1" />
      <circle cx="32" cy="33" r="1" />
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
    <div className="logo-brand">
      <img
        className="logo-image"
        src={logoImage}
        alt="Автосервис рядом"
      />

      <span className="logo-text">
        <span className="logo-text-black">
          Автосервис
        </span>

        <span className="logo-text-coral">
          рядом
        </span>
      </span>
    </div>
  );
}


/* =====================================================
   ДАННЫЕ АВТОСЕРВИСОВ
===================================================== */

const services = [
  {
    id: 1,
    name: 'Автосервис Мотор',
    rating: 4.9,
    reviews: 128,
    price: 'от 2 500 ₽',
    address: 'ул. Красная, 120',
    status: 'Открыто',
    hours: '09:00–20:00',
    description:
      'Диагностика, техническое обслуживание и ремонт автомобилей.',
    services: [
      ['Диагностика автомобиля', 'от 1 000 ₽'],
      ['Замена масла', 'от 1 500 ₽'],
      ['Замена тормозных колодок', 'от 2 500 ₽'],
      ['Ремонт подвески', 'от 3 000 ₽'],
    ],
  },

  {
    id: 2,
    name: 'АвтоПрофи',
    rating: 4.8,
    reviews: 96,
    price: 'от 2 800 ₽',
    address: 'ул. Северная, 45',
    status: 'Открыто',
    hours: '08:00–21:00',
    description:
      'Полный комплекс обслуживания автомобилей и компьютерная диагностика.',
    services: [
      ['Компьютерная диагностика', 'от 1 200 ₽'],
      ['Замена масла', 'от 1 700 ₽'],
      ['Тормозная система', 'от 2 800 ₽'],
      ['Ходовая часть', 'от 3 500 ₽'],
    ],
  },

  {
    id: 3,
    name: 'Гараж №1',
    rating: 4.7,
    reviews: 74,
    price: 'от 2 300 ₽',
    address: 'ул. Ставропольская, 88',
    status: 'Закрыто',
    hours: '09:00–19:00',
    description:
      'Ремонт и обслуживание автомобилей. Работаем с большинством марок.',
    services: [
      ['Диагностика', 'от 900 ₽'],
      ['Замена масла', 'от 1 400 ₽'],
      ['Тормозные колодки', 'от 2 300 ₽'],
      ['Ремонт подвески', 'от 3 000 ₽'],
    ],
  },

  {
    id: 4,
    name: 'АвтоМастер',
    rating: 4.9,
    reviews: 112,
    price: 'от 2 700 ₽',
    address: 'ул. Московская, 64',
    status: 'Открыто',
    hours: '08:30–20:00',
    description:
      'Профессиональный ремонт и техническое обслуживание автомобилей.',
    services: [
      ['Диагностика', 'от 1 000 ₽'],
      ['ТО автомобиля', 'от 2 700 ₽'],
      ['Замена колодок', 'от 2 600 ₽'],
      ['Ремонт двигателя', 'от 5 000 ₽'],
    ],
  },

  {
    id: 5,
    name: 'Drive Service',
    rating: 4.8,
    reviews: 87,
    price: 'от 2 600 ₽',
    address: 'ул. Дзержинского, 91',
    status: 'Открыто',
    hours: '09:00–21:00',
    description:
      'Современный автосервис с онлайн-записью и диагностикой.',
    services: [
      ['Диагностика', 'от 1 000 ₽'],
      ['Замена масла', 'от 1 600 ₽'],
      ['Тормозная система', 'от 2 600 ₽'],
      ['Сход-развал', 'от 1 800 ₽'],
    ],
  },

  {
    id: 6,
    name: 'АвтоГарант',
    rating: 4.6,
    reviews: 63,
    price: 'от 2 400 ₽',
    address: 'ул. Тургенева, 32',
    status: 'Открыто',
    hours: '09:00–19:00',
    description:
      'Ремонт автомобилей и плановое техническое обслуживание.',
    services: [
      ['Диагностика', 'от 900 ₽'],
      ['Замена масла', 'от 1 400 ₽'],
      ['Тормозная система', 'от 2 400 ₽'],
      ['Ремонт подвески', 'от 3 200 ₽'],
    ],
  },

  {
    id: 7,
    name: 'Pro Auto',
    rating: 4.9,
    reviews: 141,
    price: 'от 3 000 ₽',
    address: 'ул. Калинина, 150',
    status: 'Открыто',
    hours: '08:00–22:00',
    description:
      'Автосервис полного цикла с опытными специалистами.',
    services: [
      ['Диагностика', 'от 1 100 ₽'],
      ['Техническое обслуживание', 'от 3 000 ₽'],
      ['Замена колодок', 'от 2 900 ₽'],
      ['Ремонт двигателя', 'от 6 000 ₽'],
    ],
  },

  {
    id: 8,
    name: 'АвтоЛидер',
    rating: 4.7,
    reviews: 58,
    price: 'от 2 500 ₽',
    address: 'ул. Уральская, 18',
    status: 'Открыто',
    hours: '09:00–20:00',
    description:
      'Обслуживание автомобилей различных марок.',
    services: [
      ['Диагностика', 'от 1 000 ₽'],
      ['Замена масла', 'от 1 500 ₽'],
      ['Тормозные колодки', 'от 2 500 ₽'],
      ['Ремонт подвески', 'от 3 000 ₽'],
    ],
  },

  {
    id: 9,
    name: 'Механика',
    rating: 4.8,
    reviews: 91,
    price: 'от 2 600 ₽',
    address: 'ул. Новороссийская, 210',
    status: 'Открыто',
    hours: '08:00–20:00',
    description:
      'Диагностика и ремонт автомобилей с гарантией на работы.',
    services: [
      ['Диагностика', 'от 900 ₽'],
      ['Замена масла', 'от 1 500 ₽'],
      ['Тормозная система', 'от 2 600 ₽'],
      ['Ремонт ходовой', 'от 3 200 ₽'],
    ],
  },

  {
    id: 10,
    name: 'Auto Expert',
    rating: 4.9,
    reviews: 105,
    price: 'от 2 900 ₽',
    address: 'ул. Восточная, 42',
    status: 'Открыто',
    hours: '09:00–21:00',
    description:
      'Современный сервис с профессиональным оборудованием.',
    services: [
      ['Компьютерная диагностика', 'от 1 100 ₽'],
      ['ТО автомобиля', 'от 2 900 ₽'],
      ['Замена тормозных колодок', 'от 2 700 ₽'],
      ['Ремонт подвески', 'от 3 500 ₽'],
    ],
  },

  {
    id: 11,
    name: 'Автоцентр Юг',
    rating: 4.6,
    reviews: 49,
    price: 'от 2 200 ₽',
    address: 'ул. Российская, 77',
    status: 'Открыто',
    hours: '09:00–19:00',
    description:
      'Ремонт и обслуживание автомобилей.',
    services: [
      ['Диагностика', 'от 900 ₽'],
      ['Замена масла', 'от 1 300 ₽'],
      ['Тормоза', 'от 2 200 ₽'],
      ['Подвеска', 'от 2 900 ₽'],
    ],
  },

  {
    id: 12,
    name: 'Garage Pro',
    rating: 4.7,
    reviews: 67,
    price: 'от 2 400 ₽',
    address: 'ул. Ярославская, 25',
    status: 'Открыто',
    hours: '09:00–20:00',
    description:
      'Ремонт и техническое обслуживание.',
    services: [
      ['Диагностика', 'от 900 ₽'],
      ['Замена масла', 'от 1 400 ₽'],
      ['Тормоза', 'от 2 400 ₽'],
      ['Ходовая', 'от 3 000 ₽'],
    ],
  },
];


/* =====================================================
   FOOTER
===================================================== */

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <HeaderLogo />
          </Link>
          <p className="site-footer-description">
            Находим автосервис,<br />
            которому можно доверять.
          </p>
        </div>

        <div className="site-footer-column">
          <h4>Клиентам</h4>
          <Link to="/">Найти сервис</Link>
          <Link to="/customer/orders/new">Создать заказ</Link>
          <Link to="/orders">Мои заказы</Link>
          <Link to="/requests">Мои заявки</Link>
          <Link to="/garage">Мой гараж</Link>
        </div>

        <div className="site-footer-column">
          <h4>Автосервисам</h4>
          <Link to="/executor">Кабинет автосервиса</Link>
        </div>

        <div className="site-footer-column">
          <h4>Помощь</h4>
          <a href="/#services">Как это работает</a>
          <a href="/#services">Найти автосервис</a>
          <Link to="/customer/orders/new">Создать заказ</Link>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© 2026 Автосервис рядом</span>
        <div className="site-footer-bottom-links">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Пользовательское соглашение</a>
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
  } = useAuth();

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedService, setSelectedService] =
    useState(null);

  const [bookingService, setBookingService] =
    useState('');

  const [bookingDate, setBookingDate] =
    useState('');

  const [bookingTime, setBookingTime] =
    useState('');

  const [bookingCarId, setBookingCarId] =
    useState('');

  const [showBookingAuth, setShowBookingAuth] =
    useState(false);


  const customerCars = user?.cars || [];

  const isOverview = section === 'overview';
  const isOrders = section === 'orders';
  const isRequests = section === 'requests';
  const isGarage = section === 'garage';
  const isSettings = section === 'settings';

  const orders = [
    {
      id: 1,
      title: 'Замена тормозных колодок',
      status: 'В поиске исполнителя',
      statusType: 'search',
      car: customerCars[0]
        ? `${customerCars[0].brand || ''} ${customerCars[0].model || ''}, ${customerCars[0].year || ''}`.trim()
        : 'Автомобиль не указан',
    },
  ];

  const requests = [
    {
      id: 1,
      service: 'Автосервис Мотор',
      rating: '4.9',
      serviceName: 'Замена тормозных колодок',
      price: '2 500 ₽',
    },
  ];

  const firstName =
    user?.name?.split(' ')[0] ||
    user?.firstName ||
    'Пользователь';

  const initials =
    user?.name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'И';

  const handleLogout = () => {
    setProfileOpen(false);

    if (typeof logout === 'function') {
      logout();
    }

    navigate('/');
  };


  /* =====================================================
     АВТОМОБИЛЬ ПО УМОЛЧАНИЮ
  ===================================================== */

  useEffect(() => {
    if (!user) {
      setBookingCarId('');
      return;
    }

    if (customerCars.length === 0) {
      setBookingCarId('');
      return;
    }

    const exists = customerCars.some(
      (car) =>
        String(car.id) === String(bookingCarId)
    );

    if (!exists) {
      setBookingCarId(
        String(customerCars[0].id)
      );
    }
  }, [
    user,
    customerCars,
    bookingCarId,
  ]);


  const selectedBookingCar =
    customerCars.find(
      (car) =>
        String(car.id) ===
        String(bookingCarId)
    );


  /* =====================================================
     ПАГИНАЦИЯ
  ===================================================== */

  const servicesPerPage = 10;

  const totalPages = Math.ceil(
    services.length / servicesPerPage
  );

  const startIndex =
    (currentPage - 1) *
    servicesPerPage;

  const visibleServices =
    services.slice(
      startIndex,
      startIndex + servicesPerPage
    );


  /* =====================================================
     ПРОКРУТКА К СЕРВИСАМ
  ===================================================== */

  const scrollToServices = () => {
    setSelectedService(null);

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
     ОТКРЫТИЕ СЕРВИСА
  ===================================================== */

  const openService = (service) => {
    setSelectedService(service);

    setBookingService('');
    setBookingDate('');
    setBookingTime('');
    setShowBookingAuth(false);

    if (customerCars.length > 0) {
      setBookingCarId(
        String(customerCars[0].id)
      );
    } else {
      setBookingCarId('');
    }

    setTimeout(() => {
      document
        .getElementById('service-details')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 50);
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
    setSelectedService(null);

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

  const handleBooking = (event) => {
    event.preventDefault();

    if (!user) {
      setShowBookingAuth(true);
      return;
    }

    if (!selectedBookingCar) {
      return;
    }

    if (
      !bookingService ||
      !bookingDate ||
      !bookingTime
    ) {
      return;
    }

    console.log(
      'Запись в автосервис:',
      {
        service:
          selectedService?.name,

        car:
          selectedBookingCar,

        bookingService,
        bookingDate,
        bookingTime,

        customer:
          user,
      }
    );

    alert(
      `Запись создана!\n\n` +
      `${selectedService.name}\n` +
      `${selectedBookingCar.brand} ` +
      `${selectedBookingCar.model}\n` +
      `${bookingService}\n` +
      `${bookingDate} в ${bookingTime}`
    );
  };


  return (
    <div className="home-page">

      {/* =====================================================
          ШАПКА
      ===================================================== */}

      <header className="site-header">

        <div className="header-inner">

          {/* ЛОГО */}

          <Link
            to="/"
            className="logo"
          >
            <HeaderLogo />
          </Link>


          {/* ОСНОВНАЯ НАВИГАЦИЯ */}

          <nav className="main-nav">

            {isOverview ? (
              <button
                type="button"
                className="nav-button"
                onClick={scrollToServices}
              >
                Найти сервис
              </button>
            ) : (
              <Link
                to="/"
                className="nav-button"
              >
                Найти сервис
              </Link>
            )}

            <Link
              to="/customer/orders/new"
              className="nav-button"
            >
              Создать заказ
            </Link>

          </nav>


          {/* =================================================
              ПРАВАЯ ЧАСТЬ ШАПКИ
          ================================================= */}

          <div className="auth-nav">

            {user ? (
              <>
                {/* ЗАКАЗЫ */}

                {user.role === 'customer' && (
                  <>
                    <Link
                      to="/orders"
                      className="header-action-link"
                    >
                      Заказы
                    </Link>

                    {/* ЗАЯВКИ */}

                    <Link
                      to="/requests"
                      className="header-action-link"
                    >
                      Заявки
                    </Link>
                  </>
                )}


                {/* ПРОФИЛЬ */}

                {user.role === 'customer' ? (
                  <div
                    className="header-profile-wrapper"
                    style={{
                      position: 'relative',
                    }}
                  >
                    <button
                      type="button"
                      className="header-user"
                      title="Личный кабинет"
                      onClick={() =>
                        setProfileOpen((value) => !value)
                      }
                      aria-expanded={profileOpen}
                      aria-haspopup="menu"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '9px',
                        border: '0',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px 0',
                      }}
                    >
                      <span
                        className="header-user-avatar"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fff0eb',
                          color: '#f56a4d',
                          border: '1px solid #ffd2c5',
                          fontSize: '14px',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </span>

                      <span className="header-user-name">
                        {firstName}
                      </span>

                      <span
                        style={{
                          fontSize: '14px',
                          color: '#777',
                          lineHeight: 1,
                        }}
                      >
                        {profileOpen ? '⌃' : '⌄'}
                      </span>
                    </button>

                    {profileOpen && (
                      <div
                        role="menu"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 10px)',
                          right: 0,
                          width: '230px',
                          background: '#fff',
                          border: '1px solid #eee2dc',
                          borderRadius: '14px',
                          boxShadow: '0 14px 35px rgba(40, 25, 20, 0.12)',
                          padding: '10px',
                          zIndex: 100,
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 11px',
                            borderBottom: '1px solid #f1e7e2',
                            marginBottom: '6px',
                          }}
                        >
                          <strong
                            style={{
                              display: 'block',
                              color: '#171515',
                            }}
                          >
                            {user.name || firstName}
                          </strong>

                          {user.email && (
                            <span
                              style={{
                                display: 'block',
                                marginTop: '3px',
                                color: '#8a817d',
                                fontSize: '13px',
                              }}
                            >
                              {user.email}
                            </span>
                          )}
                        </div>

                        <Link
                          to="/settings"
                          className="header-profile-menu-link"
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display: 'block',
                            padding: '10px 11px',
                            borderRadius: '9px',
                            color: '#171515',
                            textDecoration: 'none',
                          }}
                        >
                          Настройки
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 11px',
                            border: '0',
                            borderRadius: '9px',
                            background: 'transparent',
                            color: '#d9573c',
                            cursor: 'pointer',
                            font: 'inherit',
                          }}
                        >
                          Выйти
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={
                      user.role === 'admin'
                        ? '/admin'
                        : '/executor'
                    }
                    className="header-user"
                    title="Личный кабинет"
                  >
                    <span className="header-user-name">
                      {firstName}
                    </span>
                  </Link>
                )}

              </>
            ) : (
              <>
                <button
                  type="button"
                  className="auth-link"
                  onClick={onLogin}
                >
                  Войти
                </button>

                <button
                  type="button"
                  className="register-link"
                  onClick={onRegister}
                >
                  Регистрация
                </button>
              </>
            )}

          </div>

        </div>

      </header>


      {/* =====================================================
          ГЛАВНЫЙ КОНТЕНТ
      ===================================================== */}

      <main>

        {/* ===================================================
            БАННЕР
        =================================================== */}

        <section className="hero-section">

          <img
            className="hero-image"
            src={bannerImage}
            alt="Современный автосервис"
          />

          <div className="hero-overlay" />

          <div className="hero-inner">

            <div className="hero-content">

              <p className="hero-label">
                Автосервис рядом с вами
              </p>

              <h1>
                Найдите сервис,
                <br />
                которому можно
                <br />
                доверять
              </h1>

              <p className="hero-description">
                Сравнивайте автосервисы по
                рейтингу, стоимости и
                расположению.
                <br />
                Создавайте заказ и выбирайте
                подходящего исполнителя.
              </p>


              {/* КНОПКИ */}

              <div className="hero-actions">

                <button
                  type="button"
                  className="primary-button"
                  onClick={scrollToServices}
                >

                  <span className="button-icon">
                    <SearchIcon />
                  </span>

                  <span>
                    Найти автосервис
                  </span>

                  <span className="button-arrow">
                    →
                  </span>

                </button>


                <Link
                  to="/customer/orders/new"
                  className="secondary-button"
                >

                  <span className="button-icon">
                    <ClipboardIcon />
                  </span>

                  <span>
                    Создать заказ
                  </span>

                  <span className="button-arrow">
                    →
                  </span>

                </Link>

              </div>


              {/* ПРЕИМУЩЕСТВА */}

              <div className="hero-benefits">

                <div className="benefit">

                  <span className="benefit-icon">
                    <ShieldIcon />
                  </span>

                  <span>
                    Проверенные
                    <br />
                    автосервисы
                  </span>

                </div>


                <div className="benefit">

                  <span className="benefit-icon">
                    <ClockIcon />
                  </span>

                  <span>
                    Удобная
                    <br />
                    запись онлайн
                  </span>

                </div>


                <div className="benefit">

                  <span className="benefit-icon">
                    <LocationIcon />
                  </span>

                  <span>
                    Сервисы
                    <br />
                    рядом с вами
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


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
              >
                + Добавить автомобиль
              </button>
            </div>

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
              <div className="customer-settings-row">
                <div>
                  <span className="customer-settings-label">
                    Имя
                  </span>
                  <strong>
                    {user?.name || 'Не указано'}
                  </strong>
                </div>

                <button
                  type="button"
                  className="customer-outline-button"
                >
                  Изменить
                </button>
              </div>

              <div className="customer-settings-divider" />

              <div className="customer-settings-row">
                <div>
                  <span className="customer-settings-label">
                    Email
                  </span>
                  <strong>
                    {user?.email || 'Не указан'}
                  </strong>
                </div>

                <button
                  type="button"
                  className="customer-outline-button"
                >
                  Изменить
                </button>
              </div>

              <div className="customer-settings-divider" />

              <div className="customer-settings-row">
                <div>
                  <span className="customer-settings-label">
                    Пароль
                  </span>
                  <strong>••••••••••</strong>
                </div>

                <button
                  type="button"
                  className="customer-outline-button"
                >
                  Изменить пароль
                </button>
              </div>
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
            АВТОСЕРВИСЫ
        =================================================== */}

        <section
          id="services"
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
                {services.length}
              </strong>
            </div>

          </div>


          {/* ТАБЛИЦА */}

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
              (service) => (
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

                      <span>
                        {service.status}
                      </span>

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

                  <div className="service-rating">

                    <span className="star-icon">
                      <StarIcon />
                    </span>

                    <strong>
                      {service.rating}
                    </strong>

                    <span>
                      ({service.reviews})
                    </span>

                  </div>


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
                        openService(service)
                      }
                    >
                      Подробнее
                      <span>
                        →
                      </span>
                    </button>

                  </div>

                </article>
              )
            )}

          </div>


          {/* =================================================
              ПАГИНАЦИЯ
          ================================================= */}

          {totalPages > 1 && (

            <div className="pagination">

              <button
                type="button"
                className="pagination-arrow"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  handlePageChange(
                    currentPage - 1
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
                    currentPage === page
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
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  handlePageChange(
                    currentPage + 1
                  )
                }
              >
                →
              </button>

            </div>

          )}

        </section>


        {/* ===================================================
            КАРТОЧКА АВТОСЕРВИСА
        =================================================== */}

        {selectedService && (

          <section
            id="service-details"
            className="service-details-section"
          >

            <div className="service-details-card">

              <div className="service-details-main">

                <div className="service-details-top">

                  <div className="service-avatar large">
                    <CarIcon />
                  </div>

                  <div>

                    <p className="service-details-label">
                      Автосервис
                    </p>

                    <h2>
                      {selectedService.name}
                    </h2>

                    <div className="service-details-rating">

                      <span className="star-icon">
                        <StarIcon />
                      </span>

                      <strong>
                        {selectedService.rating}
                      </strong>

                      <span>
                        {selectedService.reviews}
                        {' '}
                        отзывов
                      </span>

                    </div>

                  </div>

                </div>


                {/* ИНФОРМАЦИЯ */}

                <div className="service-info-grid">

                  <div>

                    <span className="info-icon">
                      <LocationIcon />
                    </span>

                    <div>
                      <small>
                        Адрес
                      </small>

                      <strong>
                        {selectedService.address}
                      </strong>
                    </div>

                  </div>


                  <div>

                    <span className="info-icon">
                      <ClockIcon />
                    </span>

                    <div>
                      <small>
                        Часы работы
                      </small>

                      <strong>
                        {selectedService.hours}
                      </strong>
                    </div>

                  </div>


                  <div>

                    <span className="info-icon">
                      <ShieldIcon />
                    </span>

                    <div>
                      <small>
                        Статус
                      </small>

                      <strong className="open-status">
                        {selectedService.status}
                      </strong>
                    </div>

                  </div>

                </div>


                <p className="service-details-description">
                  {selectedService.description}
                </p>


                {/* УСЛУГИ */}

                <div className="price-section">

                  <div className="price-section-header">

                    <div>

                      <p className="section-label">
                        Услуги и цены
                      </p>

                      <h3>
                        Выберите необходимую работу
                      </h3>

                    </div>

                  </div>


                  <div className="price-list">

                    {selectedService.services.map(
                      ([name, price]) => (

                        <button
                          type="button"
                          key={name}
                          className={
                            bookingService === name
                              ? 'price-item selected'
                              : 'price-item'
                          }
                          onClick={() =>
                            setBookingService(name)
                          }
                        >

                          <span>
                            {name}
                          </span>

                          <strong>
                            {price}
                          </strong>

                        </button>

                      )
                    )}

                  </div>

                </div>

              </div>


              {/* =================================================
                  ЗАПИСЬ
              ================================================= */}

              <aside className="booking-card">

                <p className="booking-label">
                  Запись онлайн
                </p>

                <h3>
                  Запишитесь на обслуживание
                </h3>

                <p className="booking-description">
                  Выберите услугу, дату и
                  удобное время.
                </p>


                <form
                  className="booking-form"
                  onSubmit={handleBooking}
                >

                  {/* АВТОМОБИЛЬ */}

                  <div className="booking-field booking-car-field">

                    <label htmlFor="booking-car">
                      Автомобиль
                    </label>


                    {user ? (

                      customerCars.length > 0 ? (

                        <select
                          id="booking-car"
                          value={bookingCarId}
                          onChange={(event) =>
                            setBookingCarId(
                              event.target.value
                            )
                          }
                          required
                        >

                          {customerCars.map(
                            (car) => (

                              <option
                                key={car.id}
                                value={car.id}
                              >
                                {car.brand}{' '}
                                {car.model},{' '}
                                {car.year}
                              </option>

                            )
                          )}

                        </select>

                      ) : (

                        <div className="booking-no-car">

                          <p>
                            В личном кабинете
                            пока нет автомобиля.
                          </p>

                          <Link to="/garage">
                            Добавить автомобиль
                          </Link>

                        </div>

                      )

                    ) : (

                      <div className="booking-login-hint">

                        <span>
                          Войдите в аккаунт,
                          чтобы выбрать автомобиль
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setShowBookingAuth(
                              true
                            )
                          }
                        >
                          Войти
                        </button>

                      </div>

                    )}

                  </div>


                  {/* УСЛУГА */}

                  <div className="booking-field">

                    <label htmlFor="booking-service">
                      Услуга
                    </label>

                    <select
                      id="booking-service"
                      value={bookingService}
                      onChange={(event) =>
                        setBookingService(
                          event.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Выберите услугу
                      </option>

                      {selectedService.services.map(
                        ([name]) => (

                          <option
                            key={name}
                            value={name}
                          >
                            {name}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* ДАТА */}

                  <div className="booking-field">

                    <label htmlFor="booking-date">
                      Дата
                    </label>

                    <input
                      id="booking-date"
                      type="date"
                      value={bookingDate}
                      onChange={(event) =>
                        setBookingDate(
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>


                  {/* ВРЕМЯ */}

                  <div className="booking-field">

                    <label htmlFor="booking-time">
                      Время
                    </label>

                    <select
                      id="booking-time"
                      value={bookingTime}
                      onChange={(event) =>
                        setBookingTime(
                          event.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Выберите время
                      </option>

                      <option value="09:00">
                        09:00
                      </option>

                      <option value="10:00">
                        10:00
                      </option>

                      <option value="11:00">
                        11:00
                      </option>

                      <option value="12:00">
                        12:00
                      </option>

                      <option value="13:00">
                        13:00
                      </option>

                      <option value="14:00">
                        14:00
                      </option>

                      <option value="15:00">
                        15:00
                      </option>

                      <option value="16:00">
                        16:00
                      </option>

                      <option value="17:00">
                        17:00
                      </option>

                      <option value="18:00">
                        18:00
                      </option>

                      <option value="19:00">
                        19:00
                      </option>

                    </select>

                  </div>


                  <button
                    type="submit"
                    className="booking-submit"
                    disabled={
                      Boolean(user) &&
                      !selectedBookingCar
                    }
                  >
                    Записаться
                    <span>
                      →
                    </span>
                  </button>

                </form>

              </aside>

            </div>


            {/* НАЗАД */}

            <button
              type="button"
              className="close-details"
              onClick={() =>
                setSelectedService(null)
              }
            >
              ← Вернуться к списку сервисов
            </button>

          </section>

        )}


        {/* ===================================================
            КАК ЭТО РАБОТАЕТ
        =================================================== */}

        <section className="how-section">

          <p className="section-label">
            Просто и удобно
          </p>

          <h2>
            Как это работает
          </h2>

          <div className="section-line" />


          <div className="steps-grid">

            {/* 01 */}

            <article className="step-card">

              <div className="step-card-top">

                <span className="step-number">
                  01
                </span>

                <span className="step-icon">
                  <CarIcon />
                </span>

              </div>

              <h3>
                Найдите сервис
              </h3>

              <p>
                Сравните автосервисы по рейтингу,
                стоимости и расположению.
              </p>

            </article>


            {/* 02 */}

            <article className="step-card">

              <div className="step-card-top">

                <span className="step-number">
                  02
                </span>

                <span className="step-icon">
                  <SearchIcon />
                </span>

              </div>

              <h3>
                Выберите услугу
              </h3>

              <p>
                Посмотрите услуги и цены
                выбранного автосервиса.
              </p>

            </article>


            {/* 03 */}

            <article className="step-card">

              <div className="step-card-top">

                <span className="step-number">
                  03
                </span>

                <span className="step-icon">
                  <CalendarIcon />
                </span>

              </div>

              <h3>
                Запишитесь онлайн
              </h3>

              <p>
                Выберите дату и удобное время
                для обслуживания автомобиля.
              </p>

            </article>

          </div>

        </section>



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