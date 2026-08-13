import { useState } from 'react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log('Вход:', {
      email,
      password,
    });
  };

  return (
    <main>
      <h1>Вход</h1>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">
          Войти
        </button>
      </form>
    </main>
  );
}

export default LoginPage;