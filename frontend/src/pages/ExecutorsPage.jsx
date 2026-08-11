import { Link } from 'react-router-dom';

const executors = [
  {
    id: 1,
    name: 'Автосервис Мотор',
    rating: 4.9,
    reviews: 128,
    price: 'от 2 500 ₽',
    address: 'ул. Красная, 120',
    status: 'Открыто',
  },
  {
    id: 2,
    name: 'АвтоПрофи',
    rating: 4.8,
    reviews: 96,
    price: 'от 2 800 ₽',
    address: 'ул. Северная, 45',
    status: 'Открыто',
  },
  {
    id: 3,
    name: 'Гараж №1',
    rating: 4.7,
    reviews: 74,
    price: 'от 2 300 ₽',
    address: 'ул. Ставропольская, 88',
    status: 'Закрыто',
  },
];

function ExecutorsPage() {
  return (
    <main>
      <h1>Исполнители</h1>

      <p>
        Подходящие автосервисы для вашего заказа
      </p>

      <section>
        {executors.map((executor) => (
          <article key={executor.id}>
            <h2>{executor.name}</h2>

            <p>
              ⭐ {executor.rating} · {executor.reviews} отзывов
            </p>

            <p>
              Стоимость: {executor.price}
            </p>

            <p>
              Адрес: {executor.address}
            </p>

            <p>
              Статус: {executor.status}
            </p>

            <Link to={`/executors/${executor.id}`}>
              Подробнее
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

export default ExecutorsPage;