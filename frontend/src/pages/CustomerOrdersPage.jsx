import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CustomerOrdersPage() {
  const { user } = useAuth();

  const orders = [
    {
      id: 1,
      title: 'Замена тормозных колодок',
      car: 'Toyota Camry, 2020',
      status: 'В поиске исполнителя',
      statusType: 'search',
    },
  ];

  if (!user) {
    return (
      <main className="customer-section">
        <div className="customer-empty">
          <h1>Войдите в аккаунт</h1>
          <p>
            Чтобы посмотреть свои заказы,
            необходимо войти в кабинет.
          </p>

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
              МОИ ЗАКАЗЫ
            </p>

            <h1>
              Заказы
            </h1>

            <p>
              Все ваши обращения и текущие заказы.
            </p>
          </div>

          <Link
            to="/customer/orders/new"
            className="customer-primary-button"
          >
            + Создать заказ
          </Link>

        </div>


        <div className="customer-orders-list">

          {orders.map((order) => (
            <article
              className="customer-order-card"
              key={order.id}
            >

              <div className="customer-order-main">

                <span className="customer-order-number">
                  ЗАКАЗ #{order.id}
                </span>

                <h2>
                  {order.title}
                </h2>

                <p>
                  {order.car}
                </p>

              </div>


              <div className="customer-order-right">

                <span className="customer-status">
                  {order.status}
                </span>

                <button
                  type="button"
                  className="customer-outline-button"
                >
                  Подробнее →
                </button>

              </div>

            </article>
          ))}

        </div>

      </div>

    </main>
  );
}

export default CustomerOrdersPage;