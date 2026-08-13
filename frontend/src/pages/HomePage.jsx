import { Link } from 'react-router-dom';
import bannerImage from '../assets/auto-service-banner.png';

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
      <rect x="5" y="4" width="14" height="17" rx="2" />
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
      <rect x="7" y="9" width="34" height="32" rx="4" />
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

function HeaderLogo() {
  return (
    <span className="logo">
      <span className="logo-mark">
        <svg
          viewBox="0 0 60 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 23C8 22 11 20 14 16C18 11 23 8 31 8H42C48 8 52 11 56 16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M9 23H51"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M17 16H45"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span>Автосервис рядом</span>
    </span>
  );
}

function HomePage() {
  return (
    <div className="home-page">

      {/* =====================================================
          ШАПКА
          ===================================================== */}

      <header className="site-header">
        <div className="header-inner">

          <Link to="/" className="logo">
            <HeaderLogo />
          </Link>

          <nav className="main-nav">
            <Link
              to="/executors"
              className="nav-button"
            >
              Найти сервис
            </Link>

            <Link
              to="/customer/orders/new"
              className="nav-button"
            >
              Создать заказ
            </Link>
          </nav>

          <div className="auth-nav">
            <Link to="/login">
              Войти
            </Link>

            <Link
              to="/register"
              className="register-link"
            >
              Регистрация
            </Link>
          </div>

        </div>
      </header>


      {/* =====================================================
          HERO
          ===================================================== */}

      <main>

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
                Сравнивайте автосервисы по рейтингу,
                стоимости и расположению.
                Создавайте заказ и выбирайте
                подходящего исполнителя.
              </p>


              <div className="hero-actions">

                <Link
                  to="/executors"
                  className="primary-button"
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
                </Link>


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


              {/* Преимущества */}

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
                Создайте заказ
              </h3>

              <p>
                Укажите автомобиль и необходимые
                работы.
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
                Найдите исполнителя
              </h3>

              <p>
                Сравните автосервисы по рейтингу,
                стоимости и расположению.
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
                Запишитесь на обслуживание
              </h3>

              <p>
                Выберите подходящий автосервис
                и удобное время.
              </p>

            </article>

          </div>

        </section>

      </main>

    </div>
  );
}

export default HomePage;