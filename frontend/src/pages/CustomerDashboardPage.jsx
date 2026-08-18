import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';

import logoImage from '../assets/logo.png';


// ======================================================
// ИКОНКИ
// ======================================================

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
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


function CarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M3 13l2-5h14l2 5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M3 13v5h18v-5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="7"
        cy="17"
        r="1.5"
        strokeWidth="1.8"
      />

      <circle
        cx="17"
        cy="17"
        r="1.5"
        strokeWidth="1.8"
      />
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


function RequestIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M8 4h8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M6 7h12v12H6z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M9 11h6M9 15h4"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}


function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        strokeWidth="1.8"
      />

      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 5.7l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1h2.5v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V13h-.1a1.7 1.7 0 0 0-1.5 1Z"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function ArrowIcon() {
  return (
    <span className="customer-arrow">
      →
    </span>
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
  } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);


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
      '#/orders': '/customer/orders',
      '#/requests': '/customer/requests',
      '#/garage': '/customer/garage',
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
    const pathname = location.pathname;

    if (pathname === '/customer/orders') {
      return 'orders';
    }

    if (pathname === '/customer/requests') {
      return 'requests';
    }

    if (pathname === '/customer/garage') {
      return 'garage';
    }

    if (pathname === '/customer/settings') {
      return 'settings';
    }

    return section || 'overview';
  };


  const currentSection = getSectionFromPath();


  const isOverview =
    currentSection === 'overview';

  const isOrders =
    currentSection === 'orders';

  const isRequests =
    currentSection === 'requests';

  const isGarage =
    currentSection === 'garage';

  const isSettings =
    currentSection === 'settings';


  // ====================================================
  // ДАННЫЕ
  // ====================================================

  const cars = user?.cars || [];


  const orders = [
    {
      id: 1,
      title: 'Замена тормозных колодок',
      status: 'В поиске исполнителя',
      statusType: 'search',

      car: cars[0]
        ? `${cars[0].brand || 'Toyota'} ${cars[0].model || 'Camry'}, ${cars[0].year || '2020'}`
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


  // ====================================================
  // ИМЯ
  // ====================================================

  const firstName =
    user?.name?.split(' ')[0] ||
    user?.firstName ||
    'пользователь';


  const initials =
    user?.name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'И';


  // ====================================================
  // ВЫХОД
  // ====================================================

  const handleLogout = () => {
    setProfileOpen(false);

    if (typeof logout === 'function') {
      logout();
    }

    navigate('/');
  };


  // ====================================================
  // ЕСЛИ НЕ АВТОРИЗОВАН
  // ====================================================

  if (!user) {
    return (
      <div className="customer-page">

        <header className="customer-header">

          <div className="customer-header-inner">

            <Link
              to="/"
              className="customer-logo"
            >
              <img
                src={logoImage}
                alt="Автосервис рядом"
              />
            </Link>


            <nav className="customer-header-actions">

              <Link
                to="/executors"
                className="customer-header-link"
              >
                Найти сервис
              </Link>

              <Link
                to="/login"
                className="customer-header-link"
              >
                Войти
              </Link>

            </nav>

          </div>

        </header>


        <main className="customer-main">

          <section className="customer-auth-required">

            <div className="customer-auth-card">

              <p className="customer-label">
                ЛИЧНЫЙ КАБИНЕТ
              </p>

              <h1>
                Войдите в личный кабинет
              </h1>

              <p>
                Здесь вы сможете управлять автомобилями,
                заказами и предложениями автосервисов.
              </p>

              <Link
                to="/login"
                className="customer-primary-button"
              >
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

      {/* ================================================
          HEADER
      ================================================= */}

      <header className="customer-header">

        <div className="customer-header-inner">

          {/* ЛОГО */}

          <Link
            to="/customer"
            className="customer-logo"
            aria-label="Автосервис рядом"
          >
            <img
              src={logoImage}
              alt="Автосервис рядом"
            />
          </Link>


          {/* ЦЕНТР */}

          <nav
            className="customer-header-main-nav"
            aria-label="Основная навигация"
          >

            <Link
              to="/executors"
              className="customer-header-link"
            >
              Найти сервис
            </Link>

            <Link
              to="/customer/orders/new"
              className="customer-header-link"
            >
              Создать заказ
            </Link>

          </nav>


          {/* ПРАВАЯ ЧАСТЬ */}

          <div className="customer-header-actions">

            <Link
              to="/customer/orders"
              className={`customer-header-link ${
                isOrders ? 'active' : ''
              }`}
            >
              Заказы
            </Link>


            <Link
              to="/customer/requests"
              className={`customer-header-link customer-header-link-with-badge ${
                isRequests ? 'active' : ''
              }`}
            >
              Заявки

              {requests.length > 0 && (
                <span className="customer-header-badge">
                  {requests.length}
                </span>
              )}

            </Link>


            {/* ПРОФИЛЬ */}

            <div className="customer-profile-wrapper">

              <button
                type="button"
                className="customer-profile-button"
                onClick={() =>
                  setProfileOpen(
                    (value) => !value
                  )
                }
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >

                <span className="customer-profile-avatar">
                  {initials}
                </span>

                <span className="customer-profile-name">
                  {firstName}
                </span>

                <span className="customer-profile-chevron">
                  {profileOpen ? '⌃' : '⌄'}
                </span>

              </button>


              {profileOpen && (

                <div
                  className="customer-profile-menu"
                  role="menu"
                >

                  <div className="customer-profile-info">

                    <strong>
                      {user?.name || firstName}
                    </strong>

                    {user?.email && (
                      <span>
                        {user.email}
                      </span>
                    )}

                  </div>


                  <div className="customer-profile-divider" />


                  <Link
                    to="/customer/settings"
                    className="customer-profile-menu-link"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >
                    <SettingsIcon />
                    Настройки
                  </Link>


                  <button
                    type="button"
                    className="customer-profile-menu-button logout"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </header>


      {/* ================================================
          MAIN
      ================================================= */}

      <main className="customer-main">


        {/* ==============================================
            ЗАГОЛОВОК
        ============================================== */}

        <section className="customer-welcome">

          <p className="customer-label">
            ЛИЧНЫЙ КАБИНЕТ
          </p>


          <h1>

            {isOverview &&
              `Здравствуйте, ${firstName}!`}

            {isOrders &&
              'Мои заказы'}

            {isRequests &&
              'Мои заявки'}

            {isGarage &&
              'Мой гараж'}

            {isSettings &&
              'Настройки'}

          </h1>


          <p>

            {isOverview &&
              'Управляйте автомобилями, заказами и записями в одном месте.'}

            {isOrders &&
              'Все ваши обращения и текущие заказы в автосервисах.'}

            {isRequests &&
              'Предложения автосервисов по вашим заказам.'}

            {isGarage &&
              'Ваши автомобили для быстрой записи в автосервис.'}

            {isSettings &&
              'Управляйте данными своего аккаунта.'}

          </p>

        </section>


        {/* ==============================================
            НАВИГАЦИЯ КАБИНЕТА
        ============================================== */}

        <nav
          className="customer-menu"
          aria-label="Разделы кабинета"
        >

          {/* ОБЗОР */}

          <Link
            to="/customer"
            className={`customer-menu-card ${
              isOverview ? 'active' : ''
            }`}
          >

            <span className="customer-menu-icon">
              <HomeIcon />
            </span>

            <span className="customer-menu-card-content">

              <strong>
                Обзор
              </strong>

              <small>
                Главная кабинета
              </small>

            </span>

            <ArrowIcon />

          </Link>


          {/* ГАРАЖ */}

          <Link
            to="/customer/garage"
            className={`customer-menu-card ${
              isGarage ? 'active' : ''
            }`}
          >

            <span className="customer-menu-icon">
              <CarIcon />
            </span>

            <span className="customer-menu-card-content">

              <strong>
                Мой гараж
              </strong>

              <small>
                {cars.length === 0
                  ? 'Нет автомобилей'
                  : cars.length === 1
                    ? '1 автомобиль'
                    : `${cars.length} автомобилей`}
              </small>

            </span>

            <ArrowIcon />

          </Link>


          {/* ЗАКАЗЫ */}

          <Link
            to="/customer/orders"
            className={`customer-menu-card ${
              isOrders ? 'active' : ''
            }`}
          >

            <span className="customer-menu-icon">
              <ClipboardIcon />
            </span>

            <span className="customer-menu-card-content">

              <strong>
                Мои заказы
              </strong>

              <small>
                {orders.length === 1
                  ? '1 активный заказ'
                  : `${orders.length} активных заказа`}
              </small>

            </span>

            <ArrowIcon />

          </Link>


          {/* ЗАЯВКИ */}

          <Link
            to="/customer/requests"
            className={`customer-menu-card ${
              isRequests ? 'active' : ''
            }`}
          >

            <span className="customer-menu-icon">
              <RequestIcon />
            </span>

            <span className="customer-menu-card-content">

              <strong>
                Мои заявки
              </strong>

              <small>
                {requests.length === 1
                  ? '1 новое предложение'
                  : `${requests.length} новых предложений`}
              </small>

            </span>


            {requests.length > 0 && (
              <span className="customer-menu-badge">
                {requests.length}
              </span>
            )}


            <ArrowIcon />

          </Link>

        </nav>


        {/* ==============================================
            CONTENT
        ============================================== */}

        <div className="customer-content">


          {/* ============================================
              ОБЗОР
          ============================================ */}

          {isOverview && (
            <>

              {/* ГАРАЖ */}

              <section className="customer-section">

                <div className="customer-section-header">

                  <div>

                    <p className="customer-section-label">
                      МОЙ ГАРАЖ
                    </p>

                    <h2>
                      Автомобиль
                    </h2>

                    <p>
                      Ваш автомобиль для быстрой записи
                      в автосервис.
                    </p>

                  </div>


                  <Link
                    to="/customer/garage"
                    className="customer-outline-button"
                  >
                    Открыть гараж →
                  </Link>

                </div>


                {cars.length > 0 ? (

                  <div className="customer-car-card">

                    <div className="customer-car-icon">
                      <CarIcon />
                    </div>

                    <div className="customer-car-info">

                      <h3>
                        {cars[0].brand || 'Toyota'}{' '}
                        {cars[0].model || 'Camry'}
                      </h3>

                      <p>
                        {cars[0].year || '2020'} год
                        {' · '}
                        {cars[0].mileage || '120 000'} км
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="customer-empty-card">

                    <div className="customer-car-icon">
                      <CarIcon />
                    </div>

                    <div>

                      <h3>
                        В гараже пока нет автомобилей
                      </h3>

                      <p>
                        Добавьте автомобиль, чтобы
                        быстрее записываться в автосервисы.
                      </p>

                    </div>

                    <Link
                      to="/customer/garage"
                      className="customer-primary-button"
                    >
                      Добавить автомобиль
                    </Link>

                  </div>

                )}

              </section>


              {/* ЗАКАЗЫ */}

              <section className="customer-section">

                <div className="customer-section-header">

                  <div>

                    <p className="customer-section-label">
                      МОИ ЗАКАЗЫ
                    </p>

                    <h2>
                      Последний заказ
                    </h2>

                    <p>
                      Следите за статусом вашего обращения.
                    </p>

                  </div>


                  <Link
                    to="/customer/orders"
                    className="customer-outline-button"
                  >
                    Все заказы →
                  </Link>

                </div>


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

                        <h3>
                          {order.title}
                        </h3>

                        <p>
                          {order.car}
                        </p>

                      </div>


                      <span
                        className={`order-status ${
                          order.statusType || 'search'
                        }`}
                      >
                        {order.status}
                      </span>


                      <Link
                        to="/customer/orders"
                        className="order-link"
                      >
                        Подробнее →
                      </Link>

                    </div>

                  </article>

                ))}

              </section>


              {/* ЗАЯВКИ */}

              <section className="customer-section customer-section-last">

                <div className="customer-section-header">

                  <div>

                    <p className="customer-section-label">
                      ЗАЯВКИ
                    </p>

                    <h2>
                      Предложения автосервисов
                    </h2>

                    <p>
                      Ответы исполнителей на ваши заказы.
                    </p>

                  </div>


                  <Link
                    to="/customer/requests"
                    className="customer-outline-button"
                  >
                    Все заявки →
                  </Link>

                </div>


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

                        <h3>
                          {request.service}
                        </h3>

                        <span className="request-rating">
                          ★ {request.rating}
                        </span>

                      </div>

                      <p>
                        {request.serviceName}
                      </p>

                      <span className="request-price-label">
                        Стоимость
                      </span>

                      <strong className="request-price">
                        {request.price}
                      </strong>

                    </div>


                    <Link
                      to="/customer/requests"
                      className="customer-primary-button"
                    >
                      Посмотреть предложение →
                    </Link>

                  </article>

                ))}

              </section>

            </>
          )}


          {/* ============================================
              ЗАКАЗЫ
          ============================================ */}

          {isOrders && (

            <section className="customer-section customer-section-page">

              <div className="customer-section-header">

                <div>

                  <p className="customer-section-label">
                    МОИ ЗАКАЗЫ
                  </p>

                  <h2>
                    Все заказы
                  </h2>

                  <p>
                    Здесь отображаются все ваши обращения
                    в автосервисы.
                  </p>

                </div>


                <Link
                  to="/customer/orders/new"
                  className="customer-primary-button"
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

                          <h3>
                            {order.title}
                          </h3>

                          <p>
                            {order.car}
                          </p>

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

                    <h3>
                      Заказов пока нет
                    </h3>

                    <p>
                      Создайте первый заказ,
                      чтобы найти автосервис.
                    </p>

                  </div>

                </div>

              )}

            </section>

          )}


          {/* ============================================
              ЗАЯВКИ
          ============================================ */}

          {isRequests && (

            <section className="customer-section customer-section-page">

              <div className="customer-section-header">

                <div>

                  <p className="customer-section-label">
                    ЗАЯВКИ
                  </p>

                  <h2>
                    Предложения автосервисов
                  </h2>

                  <p>
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

                          <h3>
                            {request.service}
                          </h3>

                          <span className="request-rating">
                            ★ {request.rating}
                          </span>

                        </div>

                        <p>
                          {request.serviceName}
                        </p>

                        <span className="request-price-label">
                          Стоимость
                        </span>

                        <strong className="request-price">
                          {request.price}
                        </strong>

                      </div>


                      <button
                        type="button"
                        className="customer-primary-button"
                      >
                        Посмотреть предложение →
                      </button>

                    </article>

                  ))}

                </div>

              ) : (

                <div className="customer-empty-card">

                  <div className="customer-car-icon">
                    <RequestIcon />
                  </div>

                  <div>

                    <h3>
                      Новых заявок нет
                    </h3>

                    <p>
                      Когда автосервисы ответят на ваши
                      заказы, предложения появятся здесь.
                    </p>

                  </div>

                </div>

              )}

            </section>

          )}


          {/* ============================================
              ГАРАЖ
          ============================================ */}

          {isGarage && (

            <section className="customer-section customer-section-page">

              <div className="customer-section-header">

                <div>

                  <p className="customer-section-label">
                    МОЙ ГАРАЖ
                  </p>

                  <h2>
                    Ваши автомобили
                  </h2>

                  <p>
                    Храните автомобили в одном месте
                    и быстрее записывайтесь в сервис.
                  </p>

                </div>


                <button
                  type="button"
                  className="customer-primary-button"
                >
                  + Добавить автомобиль
                </button>

              </div>


              {cars.length > 0 ? (

                <div className="customer-garage-list">

                  {cars.map((car) => (

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
                          {car.year || '—'} год
                          {' · '}
                          {car.mileage || '—'} км
                        </p>

                      </div>


                      <div className="customer-car-details">

                        <div>
                          <span>
                            VIN
                          </span>

                          <strong>
                            {car.vin || 'Не указан'}
                          </strong>
                        </div>


                        <div>
                          <span>
                            Пробег
                          </span>

                          <strong>
                            {car.mileage || 'Не указан'} км
                          </strong>
                        </div>


                        <div>
                          <span>
                            Год выпуска
                          </span>

                          <strong>
                            {car.year || '—'}
                          </strong>
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

                    <h3>
                      В гараже пока нет автомобилей
                    </h3>

                    <p>
                      Добавьте автомобиль, чтобы
                      использовать его при создании заказа.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="customer-primary-button"
                  >
                    Добавить автомобиль
                  </button>

                </div>

              )}

            </section>

          )}


          {/* ============================================
              НАСТРОЙКИ
          ============================================ */}

          {isSettings && (

            <section className="customer-section customer-section-page">

              <div className="customer-section-header">

                <div>

                  <p className="customer-section-label">
                    АККАУНТ
                  </p>

                  <h2>
                    Настройки
                  </h2>

                  <p>
                    Управляйте своими персональными данными
                    и настройками аккаунта.
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

                    <strong>
                      ••••••••••
                    </strong>

                  </div>


                  <button
                    type="button"
                    className="customer-outline-button"
                  >
                    Изменить пароль
                  </button>

                </div>

              </div>


              {/* ВЫХОД */}

              <div className="customer-settings-card customer-settings-danger">

                <div>

                  <span className="customer-settings-label">
                    ВЫХОД
                  </span>

                  <h3>
                    Выйти из аккаунта
                  </h3>

                  <p>
                    После выхода потребуется снова
                    войти в аккаунт.
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

        </div>

      </main>

    </div>
  );
}


export default CustomerDashboardPage;