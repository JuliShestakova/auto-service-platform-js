import { useState } from 'react';

function CreateOrderPage() {
  const [car, setCar] = useState('Toyota Camry');
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log('Новый заказ:', {
      car,
      service,
      description,
      date,
      time,
    });
  };

  return (
    <main>
      <h1>Создание заказа</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="car">
            Автомобиль
          </label>

          <select
            id="car"
            value={car}
            onChange={(event) => setCar(event.target.value)}
          >
            <option value="Toyota Camry">
              Toyota Camry, 2020
            </option>

            <option value="Lada Vesta">
              Lada Vesta, 2021
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="service">
            Необходимая работа
          </label>

          <input
            id="service"
            type="text"
            value={service}
            onChange={(event) => setService(event.target.value)}
            placeholder="Например: замена тормозных колодок"
            required
          />
        </div>

        <div>
          <label htmlFor="description">
            Описание проблемы
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Опишите проблему с автомобилем"
            rows="5"
          />
        </div>

        <div>
          <label htmlFor="date">
            Желаемая дата
          </label>

          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="time">
            Желаемое время
          </label>

          <input
            id="time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </div>

        <button type="submit">
          Создать заказ
        </button>
      </form>
    </main>
  );
}

export default CreateOrderPage;