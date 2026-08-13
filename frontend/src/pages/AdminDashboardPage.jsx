const statistics = [
  {
    title: 'Заказчики',
    value: 128,
  },
  {
    title: 'Исполнители',
    value: 42,
  },
  {
    title: 'Заказы',
    value: 356,
  },
  {
    title: 'Отзывы',
    value: 214,
  },
];

function AdminDashboardPage() {
  return (
    <main>
      <h1>Панель администратора</h1>

      <section>
        <h2>Статистика</h2>

        {statistics.map((stat) => (
          <article key={stat.title}>
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </article>
        ))}
      </section>

      <section>
        <h2>Управление пользователями</h2>

        <button type="button">
          Заказчики
        </button>

        <button type="button">
          Исполнители
        </button>
      </section>

      <section>
        <h2>Управление заказами</h2>

        <p>
          Администратор может просматривать все заказы
          пользователей системы.
        </p>

        <button type="button">
          Все заказы
        </button>
      </section>

      <section>
        <h2>Управление отзывами</h2>

        <p>
          Администратор может просматривать отзывы
          и управлять их публикацией.
        </p>

        <button type="button">
          Все отзывы
        </button>
      </section>
    </main>
  );
}

export default AdminDashboardPage;