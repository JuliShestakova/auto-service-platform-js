import { useParams, useNavigate } from 'react-router-dom';

const executors = {
  1: {
    name: 'Автосервис Мотор',
    rating: 4.9,
    reviews: 128,
    address: 'ул. Красная, 120',
    phone: '+7 (900) 123-45-67',
    status: 'Открыто',
    description:
      'Автосервис полного цикла. Диагностика, техническое обслуживание и ремонт автомобилей.',
    services: [
      {
        name: 'Замена тормозных колодок',
        price: 'от 2 500 ₽',
      },
      {
        name: 'Замена масла',
        price: 'от 1 500 ₽',
      },
      {
        name: 'Компьютерная диагностика',
        price: 'от 1 000 ₽',
      },
    ],
  },

  2: {
    name: 'АвтоПрофи',
    rating: 4.8,
    reviews: 96,
    address: 'ул. Северная, 45',
    phone: '+7 (900) 234-56-78',
    status: 'Открыто',
    description:
      'Специализированный автосервис с диагностикой и ремонтом автомобилей.',
    services: [
      {
        name: 'Замена тормозных колодок',
        price: 'от 2 800 ₽',
      },
      {
        name: 'Замена масла',
        price: 'от 1 700 ₽',
      },
      {
        name: 'Диагностика автомобиля',
        price: 'от 1 200 ₽',
      },
    ],
  },

  3: {
    name: 'Гараж №1',
    rating: 4.7,
    reviews: 74,
    address: 'ул. Ставропольская, 88',
    phone: '+7 (900) 345-67-89',
    status: 'Закрыто',
    description:
      'Небольшой автосервис с основными услугами по ремонту автомобилей.',
    services: [
      {
        name: 'Замена тормозных колодок',
        price: 'от 2 300 ₽',
      },
      {
        name: 'Замена масла',
        price: 'от 1 400 ₽',
      },
    ],
  },
};

function ExecutorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const executor = executors[id];

  if (!executor) {
    return (
      <main>
        <h1>Исполнитель не найден</h1>

        <p>
          Автосервис с таким идентификатором не найден.
        </p>
      </main>
    );
  }

  const handleSelectExecutor = () => {
    localStorage.setItem(
      'selectedExecutor',
      JSON.stringify({
        id,
        name: executor.name,
      })
    );

    navigate('/customer');
  };

  return (
    <main>
      <h1>{executor.name}</h1>

      <p>
        ⭐ {executor.rating} · {executor.reviews} отзывов
      </p>

      <p>
        Статус: {executor.status}
      </p>

      <p>
        Адрес: {executor.address}
      </p>

      <p>
        Телефон: {executor.phone}
      </p>

      <section>
        <h2>Об автосервисе</h2>

        <p>{executor.description}</p>
      </section>

      <section>
        <h2>Услуги и цены</h2>

        {executor.services.map((service) => (
          <article key={service.name}>
            <h3>{service.name}</h3>
            <p>{service.price}</p>
          </article>
        ))}
      </section>

      <button
        type="button"
        onClick={handleSelectExecutor}
      >
        Выбрать исполнителя
      </button>
    </main>
  );
}

export default ExecutorDetailsPage;