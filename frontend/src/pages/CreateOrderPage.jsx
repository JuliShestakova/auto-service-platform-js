import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function readApiError(data, fallback) {
  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  return fallback;
}

function CreateOrderPage() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const cars = user?.cars || [];

  const [carId, setCarId] = useState('');
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cars.length > 0 && !carId) {
      setCarId(String(cars[0].id));
    }
  }, [cars, carId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    const response = await authFetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: service.trim(),
        description: description.trim(),
        car_id: carId ? Number(carId) : null,
        visit_date: date || null,
        visit_time: time || null,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setIsSaving(false);

    if (!response.ok) {
      setError(readApiError(data, 'Не удалось создать заказ'));
      return;
    }

    navigate('/customer/orders', { replace: true });
  };

  return (
    <main className="order-create">
      <h1>Создание заказа</h1>

      {cars.length === 0 ? (
        <p>
          Сначала добавьте автомобиль в{' '}
          <Link to="/customer/garage">гараже</Link>.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="car">
              Автомобиль
            </label>

            <select
              id="car"
              value={carId}
              onChange={(event) => setCarId(event.target.value)}
              required
            >
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model}
                  {car.year ? `, ${car.year}` : ''}
                </option>
              ))}
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
            />
          </div>

          {error && <p>{error}</p>}

          <button type="submit" disabled={isSaving}>
            Создать заказ
          </button>
        </form>
      )}
    </main>
  );
}

export default CreateOrderPage;
