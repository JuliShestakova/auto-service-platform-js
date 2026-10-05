import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ExecutorsPage() {
  const [executors, setExecutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchExecutors() {
      try {
        const response = await fetch('/api/executors');

        if (!response.ok) {
          throw new Error('Не удалось загрузить исполнителей');
        }

        const data = await response.json();

        setExecutors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchExecutors();
  }, []);

  if (loading) {
    return (
      <main>
        <h1>Исполнители</h1>
        <p>Загрузка...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Исполнители</h1>
        <p>{error}</p>
      </main>
    );
  }

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