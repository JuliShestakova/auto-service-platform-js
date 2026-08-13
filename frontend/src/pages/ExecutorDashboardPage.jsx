function ExecutorDashboardPage() {
  return (
    <main>
      <h1>Личный кабинет исполнителя</h1>

      <section>
        <h2>Мои заказы</h2>

        <article>
          <h3>Заказ #101</h3>
          <p>Замена тормозных колодок</p>
          <p>Автомобиль: Toyota Camry, 2020</p>
          <p>Статус: Новый</p>
          <p>Стоимость: 2 500 ₽</p>
        </article>

        <article>
          <h3>Заказ #102</h3>
          <p>Замена масла</p>
          <p>Автомобиль: Kia Rio, 2019</p>
          <p>Статус: В работе</p>
          <p>Стоимость: 1 500 ₽</p>
        </article>
      </section>

      <section>
        <h2>Мои услуги и цены</h2>

        <article>
          <p>Замена тормозных колодок — от 2 500 ₽</p>
          <p>Замена масла — от 1 500 ₽</p>
          <p>Компьютерная диагностика — от 2 000 ₽</p>
        </article>

        <button type="button">
          Редактировать прайс
        </button>
      </section>

      <section>
        <h2>График работы</h2>

        <p>Пн–Пт: 09:00–19:00</p>
        <p>Сб: 10:00–17:00</p>
        <p>Вс: выходной</p>

        <button type="button">
          Изменить график
        </button>
      </section>

      <section>
        <h2>Адрес</h2>

        <p>Краснодар, ул. Красная, 125</p>

        <button type="button">
          Изменить адрес
        </button>
      </section>

      <section>
        <h2>Отзывы</h2>

        <article>
          <p>⭐ 5 — Александр</p>
          <p>Быстро и качественно выполнили работу.</p>
        </article>

        <article>
          <p>⭐ 5 — Ирина</p>
          <p>Хороший сервис, адекватные цены.</p>
        </article>
      </section>
    </main>
  );
}

export default ExecutorDashboardPage;