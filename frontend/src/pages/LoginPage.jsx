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


  const handleSubmit = (event) => {
    event.preventDefault();

    setError('');
    setIsLoading(true);


    const result = login(
      email.trim(),
      password
    );


    /* =====================================================
       ОШИБКА АВТОРИЗАЦИИ
    ===================================================== */

    if (!result?.success) {

      setError(
        result?.error ||
        'Неверный email или пароль.'
      );

      setIsLoading(false);

      return;
    }


    /* =====================================================
       ПОЛУЧАЕМ ПОЛЬЗОВАТЕЛЯ
    ===================================================== */

    const user = result.user;


    /* =====================================================
       ЗАКРЫВАЕМ МОДАЛЬНОЕ ОКНО
    ===================================================== */

    if (onClose) {
      onClose();
    }


    setIsLoading(false);


    /* =====================================================
       ПЕРЕХОД ПО РОЛИ
    ===================================================== */


    /*
     * АДМИНИСТРАТОР
     */

    if (user?.role === 'admin') {

      navigate('/admin');

      return;
    }


    /*
     * АВТОСЕРВИС / ИСПОЛНИТЕЛЬ
     */

    if (user?.role === 'executor') {

      navigate('/executor');

      return;
    }


    /*
     * ЗАКАЗЧИК
     */

    if (user?.role === 'customer') {

      navigate('/customer');

      return;
    }


    /*
     * ЕСЛИ РОЛЬ НЕ ОПРЕДЕЛЕНА
     */

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


        {/* =================================================
            ЗАГОЛОВОК
        ================================================= */}

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


        {/* =================================================
            ФОРМА
        ================================================= */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >


          {/* EMAIL */}

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

                setEmail(
                  event.target.value
                );

                setError('');

              }}
              placeholder="Введите email"
              autoComplete="email"
              disabled={isLoading}
              required
            />

          </div>


          {/* ПАРОЛЬ */}

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

                setPassword(
                  event.target.value
                );

                setError('');

              }}
              placeholder="Введите пароль"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />

          </div>


          {/* ОШИБКА */}

          {error && (

            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>

          )}


          {/* КНОПКА ВХОДА */}

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


        {/* =================================================
            РЕГИСТРАЦИЯ
        ================================================= */}

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