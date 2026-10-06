import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage({
  isModal = false,
  onClose,
  onSwitchToRegister,
}) {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setIsLoading(true);

    const result = await login(
      email.trim(),
      password
    );

    if (!result?.success) {
      setError(
        result?.error ||
        'Неверный email или пароль.'
      );

      setIsLoading(false);

      return;
    }

    const user = result.user;

    if (onClose) {
      onClose();
    }

    setIsLoading(false);

    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }

    if (user?.role === 'executor') {
      navigate('/executor');
      return;
    }

    if (user?.role === 'customer') {
      navigate('/customer');
      return;
    }

    navigate('/');
  };

  return (
    <main
      className={
        isModal
          ? 'auth-page auth-page-modal'
          : 'auth-page'
      }
    >
      <div className="auth-card">

        <div className="auth-header">
          <p className="auth-label">
            АВТОСЕРВИС РЯДОМ
          </p>

          <h1
            id={
              isModal
                ? 'auth-modal-title'
                : undefined
            }
          >
            Войти
          </h1>

          <p className="auth-subtitle">
            Войдите, чтобы продолжить работу
            с сервисом.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              placeholder="Введите email"
              autoComplete="email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">
              Пароль
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              placeholder="Введите пароль"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >
            {isLoading
              ? 'Входим...'
              : 'Войти'}
          </button>
        </form>

        {onSwitchToRegister && (
          <div className="auth-switch">
            <span>
              Нет аккаунта?
            </span>

            <button
              type="button"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              Зарегистрироваться
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

export default LoginPage;