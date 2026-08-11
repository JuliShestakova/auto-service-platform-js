import { useState } from 'react';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log('Регистрация:', {
      name,
      email,
      password,
      role,
    });
  };

  return (
    <main>
      <h1>Регистрация</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
            Имя
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Введите имя"
            required
          />
        </div>

        <div>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Введите email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            Пароль
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
            required
          />
        </div>

        <div>
          <label htmlFor="role">
            Тип пользователя
          </label>

          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="customer">
              Заказчик
            </option>

            <option value="executor">
              Исполнитель
            </option>
          </select>
        </div>

        <button type="submit">
          Зарегистрироваться
        </button>
      </form>
    </main>
  );
}

export default RegisterPage;