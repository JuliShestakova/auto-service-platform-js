function CustomerDashboardPage() {
  return (
    <main>
      <h1>Личный кабинет заказчика</h1>

      <section>
        <h2>Мои автомобили</h2>

        <article>
          <h3>Toyota Camry</h3>
          <p>Год: 2020</p>
          <p>Пробег: 120 000 км</p>
          <p>VIN: XXXXXXXXXXXXXXXX</p>

          <button type="button">
            Добавить автомобиль
          </button>
        </article>
      </section>

      <section>
        <h2>Мои заказы</h2>

        <article>
          <h3>Заказ #1</h3>

          <p>Замена тормозных колодок</p>
          <p>Статус: В поиске исполнителя</p>

          <button type="button">
            Найти исполнителя
          </button>
        </article>
      </section>
    </main>
  );
}

export default CustomerDashboardPage;