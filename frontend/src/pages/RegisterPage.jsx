import { useState } from 'react';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('customer');

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log('Регистрация:', {
      name,
      email,
      password,
      passwordConfirm,
      role,
    });
  };

  return (
    <main>
      <h1>Регистрация</h1>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Выберите роль</legend>

          <label>
            <input
              type="radio"
              name="role"
              value="customer"
              checked={role === 'customer'}
              onChange={(event) => setRole(event.target.value)}
            />
            Заказчик
          </label>

          <label>
            <input
              type="radio"
              name="role"
              value="executor"
              checked={role === 'executor'}
              onChange={(event) => setRole(event.target.value)}
            />
            Исполнитель
          </label>
        </fieldset>

        <div>
          <label htmlFor="name">
            Имя
          </label>

          <input
            id="name"
            name="name"
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
            name="email"
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
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
            required
          />
        </div>

        <div>
          <label htmlFor="passwordConfirm">
            Подтверждение пароля
          </label>

          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) =>
              setPasswordConfirm(event.target.value)
            }
            placeholder="Повторите пароль"
            required
          />
        </div>

        <button type="submit">
          Зарегистрироваться
        </button>
      </form>
    </main>
  );
}

export default RegisterPage;