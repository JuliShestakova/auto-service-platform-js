import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CustomerGaragePage() {
  const { user } = useAuth();

  const cars = user?.cars || [];

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

  return (
    <main className="customer-page">

      <div className="customer-container">

        <div className="customer-page-header">

          <div>
            <p className="customer-label">
              МОЙ ГАРАЖ
            </p>

            <h1>
              Автомобили
            </h1>

            <p>
              Ваши автомобили для быстрой записи
              в автосервис.
            </p>
          </div>

          <button
            type="button"
            className="customer-outline-button"
          >
            + Добавить автомобиль
          </button>

        </div>


        <div className="customer-garage-list">

          {cars.length === 0 ? (
            <div className="customer-empty-card">
              <div className="customer-empty-icon">
                🚗
              </div>

              <h2>
                В гараже пока нет автомобилей
              </h2>

              <p>
                Добавьте автомобиль, чтобы быстрее
                создавать заказы и записываться
                в автосервис.
              </p>

              <button
                type="button"
                className="customer-primary-button"
              >
                Добавить автомобиль
              </button>
            </div>
          ) : (
            cars.map((car) => (
              <article
                className="customer-car-card"
                key={car.id}
              >

                <div className="customer-car-icon">
                  🚗
                </div>


                <div className="customer-car-content">

                  <div className="customer-car-top">

                    <div>
                      <h2>
                        {car.brand} {car.model}
                      </h2>

                      <p>
                        {car.year} год · {car.mileage.toLocaleString('ru-RU')} км
                      </p>
                    </div>

                    <span className="customer-car-badge">
                      Основной автомобиль
                    </span>

                  </div>


                  <div className="customer-car-details">

                    <div>
                      <span>VIN</span>
                      <strong>{car.vin}</strong>
                    </div>

                    <div>
                      <span>Пробег</span>
                      <strong>
                        {car.mileage.toLocaleString('ru-RU')} км
                      </strong>
                    </div>

                    <div>
                      <span>Год выпуска</span>
                      <strong>{car.year}</strong>
                    </div>

                  </div>


                  <div className="customer-car-actions">

                    <Link
                      to="/customer/orders/new"
                      className="customer-primary-button"
                    >
                      Записаться в сервис →
                    </Link>

                    <button
                      type="button"
                      className="customer-text-button"
                    >
                      Редактировать
                    </button>

                  </div>

                </div>

              </article>
            ))
          )}

        </div>

      </div>

    </main>
  );
}

export default CustomerGaragePage;