import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CustomerSettingsPage() {
  const {
    user,
    logout,
  } = useAuth();

  if (!user) {
    return (
      <main className="customer-section">
        <div className="customer-empty">
          <h1>Войдите в аккаунт</h1>

          <Link
            to="/"
            className="customer-primary-button"
          >
            На главную
          </Link>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="customer-page">

      <div className="customer-container customer-settings-container">

        <div className="customer-page-header">

          <div>
            <p className="customer-label">
              ПРОФИЛЬ
            </p>

            <h1>
              Настройки
            </h1>

            <p>
              Управляйте данными своего аккаунта.
            </p>
          </div>

        </div>


        <section className="customer-settings-card">

          <div className="customer-profile-avatar">
            {user.name?.charAt(0)?.toUpperCase() || 'И'}
          </div>


          <div className="customer-settings-content">

            <div className="customer-setting-row">

              <div>
                <span>Имя</span>
                <strong>
                  {user.name}
                </strong>
              </div>

              <button
                type="button"
                className="customer-text-button"
              >
                Изменить
              </button>

            </div>


            <div className="customer-setting-row">

              <div>
                <span>Email</span>
                <strong>
                  {user.email}
                </strong>
              </div>

              <button
                type="button"
                className="customer-text-button"
              >
                Изменить
              </button>

            </div>


            <div className="customer-setting-row">

              <div>
                <span>Тип аккаунта</span>

                <strong>
                  Заказчик
                </strong>
              </div>

            </div>


            <div className="customer-setting-danger">

              <div>
                <span>Аккаунт</span>

                <strong>
                  Выйти из аккаунта
                </strong>
              </div>

              <button
                type="button"
                className="customer-logout-button"
                onClick={handleLogout}
              >
                Выйти
              </button>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default CustomerSettingsPage;