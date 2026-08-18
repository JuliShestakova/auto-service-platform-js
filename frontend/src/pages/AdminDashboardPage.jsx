import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/logo.png';


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

    users: (
      <>
        <circle cx="9" cy="9" r="3" />
        <path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5" />
        <path d="M15 7.5a3 3 0 0 1 0 5.5M17 14c2.2.4 3.4 2 3.7 4" />
      </>
    ),

    car: (
      <>
        <path d="M4 14l2-6h12l2 6" />
        <path d="M4 14v5h3M20 14v5h-3" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </>
    ),

    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1" />
        <path d="M9 9h6M9 13h6M9 17h4" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 6v5c0 5.2-3.3 8.6-8 10-4.7-1.4-8-4.8-8-10V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L12.2 3h-4l-.4 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 3.3 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1 2.1 1.2.4 2.7h4l.4-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
      </>
    ),

    logout: (
      <>
        <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5" />
        <path d="M14 8l4 4-4 4M8 12h10" />
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


/* =====================================================
   ДЕМО-ДАННЫЕ
===================================================== */

const users = [
  {
    id: 1,
    name: 'Иван Петров',
    email: 'ivan@example.ru',
    role: 'Клиент',
    status: 'Активен',
  },
  {
    id: 2,
    name: 'Автосервис Мотор',
    email: 'motor@example.ru',
    role: 'Автосервис',
    status: 'На проверке',
  },
  {
    id: 3,
    name: 'Марина Кузнецова',
    email: 'marina@example.ru',
    role: 'Клиент',
    status: 'Активен',
  },
  {
    id: 4,
    name: 'АвтоПрофи',
    email: 'pro@example.ru',
    role: 'Автосервис',
    status: 'Активен',
  },
];


const orders = [
  {
    id: 1024,
    title: 'Замена тормозных колодок',
    customer: 'Иван Петров',
    executor: 'Не выбран',
    status: 'Поиск исполнителя',
  },
  {
    id: 1023,
    title: 'Диагностика двигателя',
    customer: 'Марина Кузнецова',
    executor: 'Автосервис Мотор',
    status: 'В работе',
  },
  {
    id: 1022,
    title: 'Замена масла',
    customer: 'Алексей Смирнов',
    executor: 'АвтоПрофи',
    status: 'Завершён',
  },
];


const services = [
  {
    name: 'Автосервис Мотор',
    city: 'Краснодар',
    rating: '4.9',
    status: 'Активен',
  },
  {
    name: 'АвтоПрофи',
    city: 'Краснодар',
    rating: '4.8',
    status: 'Активен',
  },
  {
    name: 'Garage Pro',
    city: 'Краснодар',
    rating: '4.7',
    status: 'На проверке',
  },
];


/* =====================================================
   КАБИНЕТ АДМИНИСТРАТОРА
===================================================== */

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();


  /* =====================================================
     ОПРЕДЕЛЯЕМ ТЕКУЩИЙ РАЗДЕЛ ИЗ URL
  ===================================================== */

  const getSectionFromPath = () => {
    const path = location.pathname;

    if (path === '/admin') {
      return 'overview';
    }

    if (path === '/admin/orders') {
      return 'orders';
    }

    if (path === '/admin/users') {
      return 'users';
    }

    if (path === '/admin/executors') {
      return 'services';
    }

    if (path === '/admin/moderation') {
      return 'moderation';
    }

    if (path === '/admin/settings') {
      return 'settings';
    }

    return 'overview';
  };


  const section = getSectionFromPath();


  /* =====================================================
     ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
  ===================================================== */

  const firstName =
    user?.name?.split(' ')[0] ||
    'Администратор';


  const initials =
    user?.name
      ?.split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'AD';


  /* =====================================================
     ВЫХОД
  ===================================================== */

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    }

    navigate('/');
  };


  /* =====================================================
     ЕСЛИ НЕ АВТОРИЗОВАН
  ===================================================== */

  if (!user) {
    return (
      <div className="role-dashboard-page">

        <RoleHeader
          firstName="Гость"
          initials="AD"
          onLogout={() => navigate('/login')}
        />

        <main className="role-dashboard-auth">

          <div className="role-empty-card">

            <div className="role-empty-icon">
              <Icon type="shield" />
            </div>

            <h1>
              Войдите в аккаунт
            </h1>

            <p>
              Панель администратора доступна
              после авторизации.
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


  /* =====================================================
     ЗАГОЛОВКИ РАЗДЕЛОВ
  ===================================================== */

  const titles = {
    overview: [
      'ОБЗОР',
      'Панель администратора',
      'Контроль пользователей, заказов и автосервисов платформы.',
    ],

    orders: [
      'ЗАКАЗЫ',
      'Все заказы',
      'Контролируйте обращения клиентов и работу исполнителей.',
    ],

    users: [
      'ПОЛЬЗОВАТЕЛИ',
      'Пользователи',
      'Клиенты и автосервисы, зарегистрированные на платформе.',
    ],

    services: [
      'АВТОСЕРВИСЫ',
      'Автосервисы',
      'Проверка и управление исполнителями платформы.',
    ],

    moderation: [
      'МОДЕРАЦИЯ',
      'Проверка',
      'Объекты, которым требуется внимание администратора.',
    ],

    settings: [
      'СИСТЕМА',
      'Настройки',
      'Основные настройки административной панели.',
    ],
  };


  return (
    <div className="role-dashboard-page admin-dashboard">

      {/* =====================================================
          ШАПКА
      ===================================================== */}

      <RoleHeader
        firstName={firstName}
        initials={initials}
        onLogout={handleLogout}
      />


      <main className="role-dashboard-layout">

        {/* =====================================================
            БОКОВОЕ МЕНЮ
        ===================================================== */}

        <aside className="role-sidebar">

          <div className="role-sidebar-label">
            АДМИНИСТРИРОВАНИЕ
          </div>


          <AdminNav
            active={section}
            type="grid"
            label="Обзор"
            value="overview"
            path="/admin"
            navigate={navigate}
          />


          <AdminNav
            active={section}
            type="clipboard"
            label="Заказы"
            value="orders"
            path="/admin/orders"
            navigate={navigate}
          />


          <AdminNav
            active={section}
            type="users"
            label="Пользователи"
            value="users"
            path="/admin/users"
            navigate={navigate}
          />


          <AdminNav
            active={section}
            type="car"
            label="Автосервисы"
            value="services"
            path="/admin/executors"
            navigate={navigate}
          />


          <AdminNav
            active={section}
            type="shield"
            label="Модерация"
            value="moderation"
            path="/admin/moderation"
            badge="3"
            navigate={navigate}
          />


          <div className="role-sidebar-divider" />


          <AdminNav
            active={section}
            type="settings"
            label="Настройки"
            value="settings"
            path="/admin/settings"
            navigate={navigate}
          />


          <button
            type="button"
            className="role-side-link role-side-logout"
            onClick={handleLogout}
          >
            <Icon type="logout" />
            <span>
              Выйти
            </span>
          </button>

        </aside>


        {/* =====================================================
            ОСНОВНАЯ ЧАСТЬ
        ===================================================== */}

        <section className="role-dashboard-main">

          <div className="role-page-heading">

            <div>

              <p className="section-label">
                {titles[section][0]}
              </p>

              <h1>
                {titles[section][1]}
              </h1>

              <p>
                {titles[section][2]}
              </p>

            </div>


            <div className="role-heading-status admin">
              <span />
              Система работает
            </div>

          </div>


          {/* =====================================================
              ОБЗОР
          ===================================================== */}

          {section === 'overview' && (
            <>
              <div className="role-stat-grid admin-stats">

                <Stat
                  label="Пользователи"
                  value="1 284"
                  note="+42 за месяц"
                />

                <Stat
                  label="Автосервисы"
                  value="86"
                  note="4 на проверке"
                  accent
                />

                <Stat
                  label="Заказы"
                  value="3 412"
                  note="128 активных"
                />

                <Stat
                  label="Завершено"
                  value="92%"
                  note="за последние 30 дней"
                />

              </div>


              <div className="role-two-column">

                <DashboardCard
                  title="Последние заказы"
                  label="3 последних"
                  action="Все заказы →"
                  onAction={() => navigate('/admin/orders')}
                >
                  <AdminOrderList />
                </DashboardCard>


                <DashboardCard
                  title="Требует внимания"
                  label="3 объекта"
                  action="Модерация →"
                  onAction={() => navigate('/admin/moderation')}
                >

                  <div className="moderation-list">

                    <ModerationItem
                      title="Автосервис Garage Pro"
                      note="Ожидает проверки документов"
                    />

                    <ModerationItem
                      title="Профиль АвтоМастер"
                      note="Изменены реквизиты"
                    />

                    <ModerationItem
                      title="Жалоба #184"
                      note="Требует ответа администратора"
                    />

                  </div>

                </DashboardCard>

              </div>
            </>
          )}


          {/* =====================================================
              ЗАКАЗЫ
          ===================================================== */}

          {section === 'orders' && (
            <DashboardCard
              title="Все заказы"
              label={`${orders.length} в демо-данных`}
              wide
            >
              <AdminOrderList />
            </DashboardCard>
          )}


          {/* =====================================================
              ПОЛЬЗОВАТЕЛИ
          ===================================================== */}

          {section === 'users' && (
            <DashboardCard
              title="Пользователи платформы"
              label={`${users.length} в демо-данных`}
              wide
            >

              <div className="admin-table">

                <div className="admin-table-head">

                  <span>
                    Пользователь
                  </span>

                  <span>
                    Роль
                  </span>

                  <span>
                    Статус
                  </span>

                  <span />

                </div>


                {users.map((item) => (

                  <div
                    className="admin-table-row"
                    key={item.id}
                  >

                    <div>

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.email}
                      </small>

                    </div>

                    <span>
                      {item.role}
                    </span>

                    <span
                      className={`admin-pill ${
                        item.status === 'На проверке'
                          ? 'warning'
                          : ''
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      type="button"
                      className="text-action"
                    >
                      Открыть →
                    </button>

                  </div>

                ))}

              </div>

            </DashboardCard>
          )}


          {/* =====================================================
              АВТОСЕРВИСЫ
          ===================================================== */}

          {section === 'services' && (
            <DashboardCard
              title="Автосервисы"
              label={`${services.length} в демо-данных`}
              wide
            >

              <div className="admin-table">

                <div className="admin-table-head">

                  <span>
                    Автосервис
                  </span>

                  <span>
                    Город
                  </span>

                  <span>
                    Рейтинг
                  </span>

                  <span>
                    Статус
                  </span>

                </div>


                {services.map((item) => (

                  <div
                    className="admin-table-row"
                    key={item.name}
                  >

                    <div>
                      <strong>
                        {item.name}
                      </strong>
                    </div>

                    <span>
                      {item.city}
                    </span>

                    <span>
                      ★ {item.rating}
                    </span>

                    <span
                      className={`admin-pill ${
                        item.status !== 'Активен'
                          ? 'warning'
                          : ''
                      }`}
                    >
                      {item.status}
                    </span>

                  </div>

                ))}

              </div>

            </DashboardCard>
          )}


          {/* =====================================================
              МОДЕРАЦИЯ
          ===================================================== */}

          {section === 'moderation' && (
            <DashboardCard
              title="Объекты на проверке"
              label="3 требуют внимания"
              wide
            >

              <div className="moderation-list large">

                <ModerationItem
                  title="Автосервис Garage Pro"
                  note="Проверка документов нового исполнителя"
                  action="Проверить"
                />

                <ModerationItem
                  title="АвтоМастер"
                  note="Изменение реквизитов организации"
                  action="Открыть"
                />

                <ModerationItem
                  title="Жалоба #184"
                  note="Клиент сообщил о проблеме с заказом #1012"
                  action="Разобрать"
                />

              </div>

            </DashboardCard>
          )}


          {/* =====================================================
              НАСТРОЙКИ
          ===================================================== */}

          {section === 'settings' && (
            <DashboardCard
              title="Настройки системы"
              label="Параметры платформы"
              wide
            >

              <SettingRow
                label="Название платформы"
                value="Автосервис рядом"
              />

              <SettingRow
                label="Регистрация автосервисов"
                value="Открыта"
                accent
              />

              <SettingRow
                label="Автоматическая модерация"
                value="Включена"
                accent
              />

              <SettingRow
                label="Уведомления администратора"
                value="Включены"
                accent
              />

            </DashboardCard>
          )}


          {/* =====================================================
              ФУТЕР
          ===================================================== */}

          <RoleFooter />

        </section>

      </main>

    </div>
  );
}


/* =====================================================
   МЕНЮ АДМИНИСТРАТОРА
===================================================== */

function AdminNav({
  active,
  type,
  label,
  value,
  path,
  badge,
  navigate,
}) {
  return (
    <button
      type="button"
      className={`role-side-link ${
        active === value ? 'active' : ''
      }`}
      onClick={() => navigate(path)}
    >
      <Icon type={type} />

      <span>
        {label}
      </span>

      {badge && (
        <b>
          {badge}
        </b>
      )}
    </button>
  );
}


/* =====================================================
   ШАПКА
===================================================== */

function RoleHeader({
  firstName,
  initials,
  onLogout,
}) {
  return (
    <header className="role-header">

      <div className="role-header-inner">

        {/* ЛОГОТИП ВЕДЁТ В ОБЗОР АДМИНИСТРАТОРА */}

        <Link
          to="/admin"
          className="role-logo"
        >
          <img
            src={logoImage}
            alt="Автосервис рядом"
          />

          <span>
            <strong>
              Автосервис
            </strong>

            <b>
              {' '}рядом
            </b>
          </span>

        </Link>


        <nav className="role-header-nav">

          <Link to="/">
            Главная
          </Link>

          <Link to="/executors">
            Автосервисы
          </Link>

        </nav>


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
            aria-label="Выйти"
          >
            <Icon type="logout" />
          </button>

        </div>

      </div>

    </header>
  );
}


/* =====================================================
   СТАТИСТИКА
===================================================== */

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


/* =====================================================
   КАРТОЧКА
===================================================== */

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


/* =====================================================
   СПИСОК ЗАКАЗОВ
===================================================== */

function AdminOrderList() {
  return (
    <div className="role-list">

      {orders.map((item) => (

        <article
          className="admin-order-row"
          key={item.id}
        >

          <div className="admin-order-id">
            #{item.id}
          </div>


          <div>

            <h3>
              {item.title}
            </h3>

            <p>
              {item.customer}
              {' · '}
              Исполнитель: {item.executor}
            </p>

          </div>


          <span
            className={`admin-pill ${
              item.status === 'В работе'
                ? 'progress'
                : ''
            }`}
          >
            {item.status}
          </span>


          <button
            type="button"
            className="text-action"
          >
            Подробнее →
          </button>

        </article>

      ))}

    </div>
  );
}


/* =====================================================
   МОДЕРАЦИЯ
===================================================== */

function ModerationItem({
  title,
  note,
  action,
}) {
  return (
    <article className="moderation-item">

      <div className="moderation-icon">
        <Icon type="shield" />
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {note}
        </p>

      </div>


      {action && (
        <button
          type="button"
          className="customer-outline-button"
        >
          {action}
        </button>
      )}

    </article>
  );
}


/* =====================================================
   НАСТРОЙКА
===================================================== */

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


/* =====================================================
   ФУТЕР
===================================================== */

function RoleFooter() {
  return (
    <footer className="role-footer">

      <span>
        © 2026 Автосервис рядом
      </span>

      <div>

        <Link to="/admin">
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