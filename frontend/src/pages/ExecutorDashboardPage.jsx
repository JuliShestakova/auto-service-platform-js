import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/logo.png';


/* =========================================================
   ИКОНКИ
========================================================= */

function Icon({ type }) {
  const paths = {
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),

    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </>
    ),

    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 9h16" />
        <path d="M8 13h2" />
        <path d="M14 13h2" />
        <path d="M8 17h2" />
      </>
    ),

    car: (
      <>
        <path d="M4 14l2-6h12l2 6" />
        <path d="M4 14v5h3" />
        <path d="M20 14v5h-3" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L12.2 3h-4l-.4 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 3.3 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
      </>
    ),

    logout: (
      <>
        <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M8 12h10" />
      </>
    ),

    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
  };

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
      {paths[type]}
    </svg>
  );
}


/* =========================================================
   ТЕСТОВЫЕ ЗАЯВКИ
========================================================= */

const requests = [
  {
    id: 1024,
    title: 'Замена тормозных колодок',
    car: 'Toyota Camry, 2020',
    distance: '2,4 км',
    budget: 'до 3 500 ₽',
    time: 'Сегодня',
  },

  {
    id: 1023,
    title: 'Диагностика двигателя',
    car: 'Kia Rio, 2019',
    distance: '4,1 км',
    budget: 'до 2 000 ₽',
    time: 'Сегодня',
  },

  {
    id: 1022,
    title: 'Замена масла и фильтров',
    car: 'Hyundai Solaris, 2021',
    distance: '1,8 км',
    budget: 'до 2 500 ₽',
    time: 'Завтра',
  },
];


/* =========================================================
   АКТИВНЫЕ ЗАКАЗЫ
========================================================= */

const activeOrders = [
  {
    id: 1018,
    title: 'Ремонт подвески',
    customer: 'Алексей П.',
    car: 'Volkswagen Polo, 2018',
    status: 'В работе',
    statusType: 'progress',
    date: '18 авг.',
  },

  {
    id: 1015,
    title: 'Замена масла',
    customer: 'Марина К.',
    car: 'Kia Sportage, 2022',
    status: 'Запланирован',
    statusType: 'planned',
    date: '19 авг.',
  },
];


/* =========================================================
   РАСПИСАНИЕ
========================================================= */

const schedule = [
  {
    time: '09:00',
    title: 'Диагностика двигателя',
    customer: 'Иван С.',
    car: 'Kia Rio',
    status: 'Запланировано',
  },

  {
    time: '12:30',
    title: 'Ремонт подвески',
    customer: 'Алексей П.',
    car: 'Volkswagen Polo',
    status: 'В работе',
  },

  {
    time: '16:00',
    title: 'Замена масла',
    customer: 'Марина К.',
    car: 'Kia Sportage',
    status: 'Запланировано',
  },
];


/* =========================================================
   ОСНОВНОЙ КАБИНЕТ ИСПОЛНИТЕЛЯ
========================================================= */

export default function ExecutorDashboardPage() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [section, setSection] = useState('overview');


  /* -------------------------------------------------------
     ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
  ------------------------------------------------------- */

  const firstName =
    user?.name?.split(' ')[0] ||
    user?.firstName ||
    'Автосервис';

  const initials =
    user?.name
      ?.split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'АС';


  /* -------------------------------------------------------
     ЗАГОЛОВОК РАЗДЕЛА
  ------------------------------------------------------- */

  const title = useMemo(
    () => ({
      overview: [
        'ОБЗОР',
        'Кабинет автосервиса',
        'Управляйте заявками, заказами и расписанием в одном месте.',
      ],

      requests: [
        'ЗАЯВКИ',
        'Новые заявки',
        'Заказы клиентов, которые сейчас доступны вашему автосервису.',
      ],

      orders: [
        'ЗАКАЗЫ',
        'Мои заказы',
        'Текущие и запланированные работы автосервиса.',
      ],

      schedule: [
        'РАСПИСАНИЕ',
        'Расписание',
        'Ближайшие записи и загрузка автосервиса.',
      ],

      settings: [
        'ПРОФИЛЬ',
        'Профиль автосервиса',
        'Данные, которые видят клиенты на странице автосервиса.',
      ],
    }[section]),
    [section]
  );


  /* =======================================================
     ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН
  ======================================================= */

  if (!user) {
    return (
      <div className="role-dashboard-page">

        <RoleHeader
          title="Кабинет автосервиса"
          initials="АС"
        />

        <main className="role-dashboard-auth">

          <div className="role-empty-card">

            <div className="role-empty-icon">
              <Icon type="car" />
            </div>

            <h1>Войдите в аккаунт</h1>

            <p>
              Кабинет автосервиса доступен после
              авторизации.
            </p>

            <Link
              className="primary-button"
              to="/login"
            >
              Войти →
            </Link>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     ВЫХОД
  ======================================================= */

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    }

    navigate('/');
  };


  /* =======================================================
     РЕНДЕР КАБИНЕТА
  ======================================================= */

  return (
    <div className="role-dashboard-page">

      {/* =================================================
          ШАПКА ИСПОЛНИТЕЛЯ
      ================================================= */}

      <RoleHeader
        title="Кабинет автосервиса"
        firstName={firstName}
        initials={initials}
        onLogout={handleLogout}
        onLogoClick={() => setSection('overview')}
      />


      <main className="role-dashboard-layout">

        {/* =================================================
            ЛЕВОЕ МЕНЮ
        ================================================= */}

        <aside className="role-sidebar">

          <div className="role-sidebar-label">
            КАБИНЕТ
          </div>


          <button
            type="button"
            className={`role-side-link ${
              section === 'overview' ? 'active' : ''
            }`}
            onClick={() => setSection('overview')}
          >
            <Icon type="grid" />
            <span>Обзор</span>
          </button>


          <button
            type="button"
            className={`role-side-link ${
              section === 'requests' ? 'active' : ''
            }`}
            onClick={() => setSection('requests')}
          >
            <Icon type="clipboard" />
            <span>Новые заявки</span>
            <b>3</b>
          </button>


          <button
            type="button"
            className={`role-side-link ${
              section === 'orders' ? 'active' : ''
            }`}
            onClick={() => setSection('orders')}
          >
            <Icon type="car" />
            <span>Мои заказы</span>
          </button>


          <button
            type="button"
            className={`role-side-link ${
              section === 'schedule' ? 'active' : ''
            }`}
            onClick={() => setSection('schedule')}
          >
            <Icon type="calendar" />
            <span>Расписание</span>
          </button>


          <div className="role-sidebar-divider" />


          <button
            type="button"
            className={`role-side-link ${
              section === 'settings' ? 'active' : ''
            }`}
            onClick={() => setSection('settings')}
          >
            <Icon type="settings" />
            <span>Профиль сервиса</span>
          </button>


          <button
            type="button"
            className="role-side-link role-side-logout"
            onClick={handleLogout}
          >
            <Icon type="logout" />
            <span>Выйти</span>
          </button>

        </aside>


        {/* =================================================
            ОСНОВНАЯ ОБЛАСТЬ
        ================================================= */}

        <section className="role-dashboard-main">

          <div className="role-page-heading">

            <div>

              <p className="section-label">
                {title[0]}
              </p>

              <h1>
                {title[1]}
              </h1>

              <p>
                {title[2]}
              </p>

            </div>


            <div className="role-heading-status">
              <span />
              Сервис работает
            </div>

          </div>


          {/* =================================================
              ОБЗОР
          ================================================= */}

          {section === 'overview' && (
            <>
              <div className="role-stat-grid">

                <Stat
                  label="Новые заявки"
                  value="3"
                  note="требуют ответа"
                  accent
                />

                <Stat
                  label="В работе"
                  value="2"
                  note="активных заказа"
                />

                <Stat
                  label="Сегодня"
                  value="4"
                  note="записи в расписании"
                />

                <Stat
                  label="Рейтинг"
                  value="4.9"
                  note="128 отзывов"
                />

              </div>


              <div className="role-two-column">

                <DashboardCard
                  title="Новые заявки"
                  label="3 заявки"
                  action="Все заявки →"
                  onAction={() => setSection('requests')}
                >
                  <div className="role-list">

                    {requests.map((item) => (
                      <RequestRow
                        key={item.id}
                        item={item}
                        compact
                      />
                    ))}

                  </div>
                </DashboardCard>


                <DashboardCard
                  title="Сегодня"
                  label="4 записи"
                  action="Расписание →"
                  onAction={() => setSection('schedule')}
                >
                  <div className="role-schedule-list">

                    {schedule.map((item) => (
                      <ScheduleRow
                        key={item.time}
                        item={item}
                      />
                    ))}

                  </div>
                </DashboardCard>

              </div>
            </>
          )}


          {/* =================================================
              ЗАЯВКИ
          ================================================= */}

          {section === 'requests' && (
            <DashboardCard
              title="Доступные заявки"
              label={`${requests.length} новых`}
              wide
            >

              <div className="role-list">

                {requests.map((item) => (
                  <RequestRow
                    key={item.id}
                    item={item}
                  />
                ))}

              </div>

            </DashboardCard>
          )}


          {/* =================================================
              ЗАКАЗЫ
          ================================================= */}

          {section === 'orders' && (
            <DashboardCard
              title="Мои заказы"
              label={`${activeOrders.length} активных`}
              wide
            >

              <div className="role-list">

                {activeOrders.map((item) => (
                  <article
                    className="executor-order-card"
                    key={item.id}
                  >

                    <div className="executor-order-number">
                      Заказ #{item.id}
                    </div>


                    <div className="executor-order-main">

                      <div>

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          {item.customer} · {item.car}
                        </p>

                      </div>


                      <span
                        className={`role-status ${item.statusType}`}
                      >
                        {item.status}
                      </span>


                      <span className="executor-order-date">
                        {item.date}
                      </span>


                      <button
                        type="button"
                        className="text-action"
                      >
                        Подробнее →
                      </button>

                    </div>

                  </article>
                ))}

              </div>

            </DashboardCard>
          )}


          {/* =================================================
              РАСПИСАНИЕ
          ================================================= */}

          {section === 'schedule' && (
            <DashboardCard
              title="Расписание на сегодня"
              label="18 августа"
              wide
            >

              <div className="role-calendar">

                {schedule.map((item) => (
                  <ScheduleRow
                    key={item.time}
                    item={item}
                    large
                  />
                ))}

              </div>

            </DashboardCard>
          )}


          {/* =================================================
              ПРОФИЛЬ СЕРВИСА
          ================================================= */}

          {section === 'settings' && (
            <div className="role-settings-stack">

              <DashboardCard title="Данные автосервиса">

                <SettingRow
                  label="Название"
                  value={
                    user?.serviceName ||
                    'Автосервис Мотор'
                  }
                />

                <SettingRow
                  label="Email"
                  value={
                    user?.email ||
                    'Не указан'
                  }
                />

                <SettingRow
                  label="Телефон"
                  value={
                    user?.phone ||
                    '+7 (900) 000-00-00'
                  }
                />

                <SettingRow
                  label="Адрес"
                  value={
                    user?.address ||
                    'ул. Красная, 120'
                  }
                />

              </DashboardCard>


              <DashboardCard title="Публичный профиль">

                <SettingRow
                  label="Рейтинг"
                  value="4.9 · 128 отзывов"
                />

                <SettingRow
                  label="Статус"
                  value="Открыто"
                  accent
                />


                <div className="role-settings-action">

                  <button
                    type="button"
                    className="customer-outline-button"
                  >
                    Редактировать профиль
                  </button>

                </div>

              </DashboardCard>

            </div>
          )}


          {/* =================================================
              ФУТЕР
          ================================================= */}

          <RoleFooter />

        </section>

      </main>

    </div>
  );
}


/* =========================================================
   ШАПКА ИСПОЛНИТЕЛЯ
========================================================= */

function RoleHeader({
  firstName,
  initials,
  onLogout,
  onLogoClick,
}) {
  return (
    <header className="role-header">

      <div className="role-header-inner">

        {/* =================================================
            ВАЖНО:
            ЛОГОТИП ИСПОЛНИТЕЛЯ ВЕДЁТ В /executor
        ================================================= */}

        <Link
          to="/executor"
          className="role-logo"
          aria-label="Обзор кабинета автосервиса"
          onClick={(event) => {
            event.preventDefault();
            onLogoClick();
          }}
        >

          <img
            src={logoImage}
            alt="Автосервис рядом"
          />

          <span>
            <strong>Автосервис</strong>
            <b> рядом</b>
          </span>

        </Link>



        {/* =================================================
            ПРОФИЛЬ
        ================================================= */}

        <div className="role-header-user">

          <span className="role-header-avatar">
            {initials}
          </span>

          <span>
            {firstName}
          </span>


          <button
            type="button"
            onClick={onLogout}
            title="Выйти"
            aria-label="Выйти"
          >
            <Icon type="logout" />
          </button>

        </div>

      </div>

    </header>
  );
}


/* =========================================================
   СТАТИСТИКА
========================================================= */

function Stat({
  label,
  value,
  note,
  accent,
}) {
  return (
    <article
      className={`role-stat-card ${
        accent ? 'accent' : ''
      }`}
    >

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {note}
      </small>

    </article>
  );
}


/* =========================================================
   КАРТОЧКА
========================================================= */

function DashboardCard({
  title,
  label,
  action,
  onAction,
  children,
  wide,
}) {
  return (
    <section
      className={`role-card ${
        wide ? 'wide' : ''
      }`}
    >

      <div className="role-card-heading">

        <div>

          <h2>
            {title}
          </h2>

          <span>
            {label}
          </span>

        </div>


        {action && (
          <button
            type="button"
            className="text-action"
            onClick={onAction}
          >
            {action}
          </button>
        )}

      </div>


      {children}

    </section>
  );
}


/* =========================================================
   ЗАЯВКА
========================================================= */

function RequestRow({
  item,
  compact,
}) {
  return (
    <article
      className={`executor-request-card ${
        compact ? 'compact' : ''
      }`}
    >

      <div className="role-request-icon">
        <Icon type="car" />
      </div>


      <div className="executor-request-main">

        <div className="executor-request-title">

          <h3>
            {item.title}
          </h3>

          <span>
            {item.time}
          </span>

        </div>


        <p>
          {item.car} · {item.distance}
        </p>


        <strong>
          {item.budget}
        </strong>

      </div>


      <button
        type="button"
        className="primary-button small"
      >
        Откликнуться →
      </button>

    </article>
  );
}


/* =========================================================
   РАСПИСАНИЕ
========================================================= */

function ScheduleRow({
  item,
  large,
}) {
  return (
    <article
      className={`executor-schedule-row ${
        large ? 'large' : ''
      }`}
    >

      <time>
        {item.time}
      </time>


      <div>

        <h3>
          {item.title}
        </h3>

        <p>
          {item.customer} · {item.car}
        </p>

      </div>


      <span
        className={`role-status ${
          item.status === 'В работе'
            ? 'progress'
            : 'planned'
        }`}
      >
        {item.status}
      </span>

    </article>
  );
}


/* =========================================================
   НАСТРОЙКА
========================================================= */

function SettingRow({
  label,
  value,
  accent,
}) {
  return (
    <div className="role-setting-row">

      <div>

        <span>
          {label}
        </span>

        <strong
          className={
            accent
              ? 'accent-text'
              : ''
          }
        >
          {value}
        </strong>

      </div>


      <button
        type="button"
        className="customer-outline-button"
      >
        Изменить
      </button>

    </div>
  );
}


/* =========================================================
   ФУТЕР
========================================================= */

function RoleFooter() {
  return (
    <footer className="role-footer">

      <span>
        © 2026 Автосервис рядом
      </span>


      <div>

        <Link to="/">
          Главная
        </Link>

        <a href="#">
          Политика конфиденциальности
        </a>

        <a href="#">
          Пользовательское соглашение
        </a>

      </div>

    </footer>
  );
}