import { useState } from 'react';

function RegisterPage({
  isModal = false,
  onSwitchToLogin,
}) {
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
    <main className={isModal ? 'auth-page auth-page-modal' : 'auth-page'}>
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-label">
            АВТОСЕРВИС РЯДОМ
          </p>

          <h1 id={isModal ? 'auth-modal-title' : undefined}>
            Регистрация
          </h1>

          <p className="auth-subtitle">
            Создайте аккаунт и начните пользоваться сервисом.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <fieldset className="auth-role">
            <legend>Выберите роль</legend>

            <label
              className={
                role === 'customer'
                  ? 'auth-role-option active'
                  : 'auth-role-option'
              }
            >
              <input
                type="radio"
                name="role"
                value="customer"
                checked={role === 'customer'}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              />

              <span>Заказчик</span>
            </label>

            <label
              className={
                role === 'executor'
                  ? 'auth-role-option active'
                  : 'auth-role-option'
              }
            >
              <input
                type="radio"
                name="role"
                value="executor"
                checked={role === 'executor'}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              />

              <span>Исполнитель</span>
            </label>
          </fieldset>

          <div className="auth-field">
            <label htmlFor="register-name">
              Имя
            </label>

            <input
              id="register-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Введите имя"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Введите email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">
              Пароль
            </label>

            <input
              id="register-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Введите пароль"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password-confirm">
              Подтверждение пароля
            </label>

            <input
              id="register-password-confirm"
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

          <button
            type="submit"
            className="auth-submit"
          >
            Зарегистрироваться
          </button>
        </form>

        {onSwitchToLogin && (
          <div className="auth-switch">
            <span>Уже есть аккаунт?</span>

            <button
              type="button"
              onClick={onSwitchToLogin}
            >
              Войти
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default RegisterPage;