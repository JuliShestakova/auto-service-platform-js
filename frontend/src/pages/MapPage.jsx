const mapExecutors = [
  {
    id: 1,
    name: 'Автосервис «Мотор»',
    address: 'Краснодар, ул. Красная, 125',
    price: 2500,
    rating: 4.9,
    latitude: 45.0355,
    longitude: 38.9753,
  },
  {
    id: 2,
    name: 'СТО «АвтоМастер»',
    address: 'Краснодар, ул. Северная, 48',
    price: 2200,
    rating: 4.8,
    latitude: 45.0442,
    longitude: 38.9761,
  },
  {
    id: 3,
    name: 'Автосервис «Гараж»',
    address: 'Краснодар, ул. Московская, 76',
    price: 2000,
    rating: 4.7,
    latitude: 45.0485,
    longitude: 39.0067,
  },
];

function MapPage() {
  return (
    <main>
      <h1>Исполнители на карте</h1>

      <section>
        <div>
          <h2>Карта</h2>

          <div
            style={{
              minHeight: '400px',
              border: '1px solid #ccc',
              padding: '20px',
            }}
          >
            <p>
              Здесь будет интерактивная карта исполнителей.
            </p>

            {mapExecutors.map((executor) => (
              <div key={executor.id}>
                📍 {executor.name}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Исполнители рядом</h2>

          {mapExecutors.map((executor) => (
            <article key={executor.id}>
              <h3>{executor.name}</h3>

              <p>⭐ {executor.rating}</p>

              <p>
                Замена тормозных колодок — от{' '}
                {executor.price.toLocaleString('ru-RU')} ₽
              </p>

              <p>{executor.address}</p>

              <p>
                Координаты: {executor.latitude},{' '}
                {executor.longitude}
              </p>

              <button type="button">
                Подробнее
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default MapPage;