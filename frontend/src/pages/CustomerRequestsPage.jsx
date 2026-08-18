import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CustomerRequestsPage() {
  const { user } = useAuth();

  const requests = [
    {
      id: 1,
      service: 'Автосервис Мотор',
      rating: '4.9',
      serviceTitle: 'Замена тормозных колодок',
      price: '2 500 ₽',
    },
  ];

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
              ЗАЯВКИ ОТ АВТОСЕРВИСОВ
            </p>

            <h1>
              Новые предложения
            </h1>

            <p>
              Автосервисы откликнулись на ваши заказы.
            </p>
          </div>

        </div>


        <div className="customer-requests-list">

          {requests.map((request) => (
            <article
              className="customer-request-card"
              key={request.id}
            >

              <div className="customer-service-avatar">
                🚗
              </div>


              <div className="customer-request-info">

                <h2>
                  {request.service}
                </h2>

                <div className="customer-rating">
                  ★ {request.rating}
                </div>

                <p>
                  {request.serviceTitle}
                </p>

                <span>
                  Предложенная стоимость
                </span>

                <strong>
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

      </div>

    </main>
  );
}

export default CustomerRequestsPage;