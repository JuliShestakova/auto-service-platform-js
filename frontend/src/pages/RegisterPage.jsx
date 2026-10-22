import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CITIES, DEFAULT_CITY } from '../data/cities';

const EMAIL_ALLOWED = /[^a-z0-9@._-]/g;
const EMAIL_PATTERN = (
  /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/
);
const NAME_PATTERN = /^[A-Za-zА-Яа-яЁё](?:[A-Za-zА-Яа-яЁё\s.'-]{0,98}[A-Za-zА-Яа-яЁё.])?$/;
const SHOP_NAME_PATTERN = /^[A-Za-zА-Яа-яЁё0-9](?:[A-Za-zА-Яа-яЁё0-9\s.&«»"'-]{0,98}[A-Za-zА-Яа-яЁё0-9.«»"'])?$/;
const ADDRESS_PATTERN = /^[A-Za-zА-Яа-яЁё0-9][A-Za-zА-Яа-яЁё0-9\s.,/\-№#]{4,254}$/;
const HOURS_PATTERN = /^[\d\s.:\-–—]{0,50}$/;

function normalizeEmail(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(EMAIL_ALLOWED, '');
}

function isValidEmail(value) {
  const email = normalizeEmail(value);

  if (
    !email
    || email.length > 254
    || email.includes('..')
    || email.includes('.-')
    || email.includes('-.')
    || email.includes('__')
    || email.includes('--')
    || !EMAIL_PATTERN.test(email)
  ) {
    return false;
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || localPart.length > 64 || !domain || domain.length > 253) {
    return false;
  }

  const tld = domain.split('.').at(-1);
  return Boolean(tld && /^[a-z]{2,24}$/.test(tld));
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidPhone(value) {
  const digits = digitsOnly(value);
  // Россия: 11 цифр, начинается с 7 или 8
  if (digits.length === 11 && /^[78]/.test(digits)) {
    return true;
  }
  // 10 цифр без кода страны
  return digits.length === 10 && digits.startsWith('9');
}

function formatPhoneInput(value) {
  let digits = digitsOnly(value).slice(0, 11);

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }

  if (!digits) {
    return '';
  }

  if (digits[0] !== '7') {
    digits = `7${digits}`.slice(0, 11);
  }

  const rest = digits.slice(1);
  let result = '+7';

  if (rest.length > 0) {
    result += ` (${rest.slice(0, 3)}`;
  }
  if (rest.length >= 3) {
    result += ')';
  }
  if (rest.length > 3) {
    result += ` ${rest.slice(3, 6)}`;
  }
  if (rest.length > 6) {
    result += `-${rest.slice(6, 8)}`;
  }
  if (rest.length > 8) {
    result += `-${rest.slice(8, 10)}`;
  }

  return result;
}

function isValidPassword(value) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    return false;
  }
  if (/\s/.test(value)) {
    return false;
  }
  // Хотя бы одна буква и одна цифра
  return /[A-Za-zА-Яа-яЁё]/.test(value) && /\d/.test(value);
}

function getErrorMessage(detail) {
  if (typeof detail === 'string') {
    return detail.replace(/^Value error,\s*/i, '');
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object') {
          const msg = item.msg || item.message || 'Ошибка проверки данных';
          return String(msg).replace(/^Value error,\s*/i, '');
        }

        return String(item);
      })
      .filter(Boolean)
      .join('; ');
  }

  if (detail && typeof detail === 'object') {
    return (
      detail.message
      || detail.msg
      || 'Не удалось выполнить операцию. Проверьте введённые данные.'
    );
  }

  return 'Не удалось выполнить операцию. Попробуйте ещё раз.';
}

function RegisterPage({
  isModal = false,
  onClose,
  onSwitchToLogin,
}) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [hours, setHours] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isExecutor = role === 'executor';

  const validationError = useMemo(() => {
    const trimmedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const trimmedAddress = address.trim();
    const trimmedHours = hours.trim();

    if (!trimmedName) {
      return isExecutor
        ? 'Введите название автосервиса'
        : 'Введите имя';
    }

    if (trimmedName.length < 2) {
      return isExecutor
        ? 'Название слишком короткое'
        : 'Имя слишком короткое';
    }

    if (isExecutor) {
      if (!SHOP_NAME_PATTERN.test(trimmedName)) {
        return 'Название содержит недопустимые символы';
      }
      if (!city || !CITIES.includes(city)) {
        return 'Выберите город из списка';
      }
      if (!trimmedAddress || trimmedAddress.length < 5) {
        return 'Укажите полный адрес автосервиса';
      }
      if (!ADDRESS_PATTERN.test(trimmedAddress)) {
        return 'Адрес содержит недопустимые символы';
      }
      if (!isValidPhone(phone)) {
        return 'Укажите телефон в формате +7 (999) 123-45-67';
      }
      if (trimmedHours && !HOURS_PATTERN.test(trimmedHours)) {
        return 'Часы работы указаны некорректно';
      }
    } else if (!NAME_PATTERN.test(trimmedName)) {
      return 'Имя может содержать только буквы, пробел, дефис и точку';
    }

    if (!isValidEmail(normalizedEmail)) {
      return (
        'Email должен быть латиницей, без пробелов и спецсимволов. '
        + 'Пример: name@gmail.com'
      );
    }

    if (!isValidPassword(password)) {
      return 'Пароль: минимум 8 символов, хотя бы одна буква и одна цифра';
    }

    if (password !== passwordConfirm) {
      return 'Пароли не совпадают';
    }

    if (!acceptTerms) {
      return 'Примите пользовательское соглашение';
    }

    if (!acceptPrivacy) {
      return (
        'Дайте согласие на обработку персональных данных '
        + 'и примите политику конфиденциальности'
      );
    }

    return '';
  }, [
    name,
    email,
    password,
    passwordConfirm,
    role,
    isExecutor,
    phone,
    address,
    city,
    hours,
    acceptTerms,
    acceptPrivacy,
  ]);

  const canSubmit = !validationError && !isLoading;

  const getDashboardPath = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'executor':
        return '/executor';
      case 'customer':
        return '/customer';
      default:
        return '/';
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setRole('customer');
    setPhone('');
    setAddress('');
    setCity(DEFAULT_CITY);
    setHours('');
    setAcceptTerms(false);
    setAcceptPrivacy(false);
    setAcceptMarketing(false);
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError('');
    setSuccess('');

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setError('Отметьте обязательные согласия, чтобы продолжить');
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedHours = hours.trim();

    setIsLoading(true);

    try {
      const payload = {
        name: trimmedName,
        email: normalizedEmail,
        password,
        role,
        accept_terms: true,
        accept_privacy: true,
      };

      if (isExecutor) {
        payload.phone = trimmedPhone;
        payload.address = trimmedAddress;
        payload.city = city;
        if (trimmedHours) {
          payload.hours = trimmedHours;
        }
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        // Сервер мог вернуть пустой или не JSON-ответ.
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data?.detail ?? data?.message),
        );
      }

      const loginResult = await login(normalizedEmail, password);

      if (!loginResult?.success || !loginResult.user) {
        setSuccess(
          'Регистрация прошла успешно. Войдите в аккаунт, используя свои данные.',
        );

        if (isModal && onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          navigate('/login', { replace: true });
        }

        return;
      }

      const loggedUser = loginResult.user;
      const dashboardPath = getDashboardPath(loggedUser.role);

      resetForm();

      if (isModal && onClose) {
        onClose();
      }

      navigate(dashboardPath, { replace: true });
    } catch (submitError) {
      console.error('Ошибка регистрации:', submitError);

      setError(
        typeof submitError?.message === 'string'
          ? submitError.message
          : 'Произошла ошибка при регистрации. Попробуйте ещё раз.',
      );
    } finally {
      setIsLoading(false);
    }
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
          <p className="auth-label">АВТОСЕРВИС РЯДОМ</p>

          <h1 id={isModal ? 'auth-modal-title' : undefined}>
            {isExecutor ? 'Регистрация автосервиса' : 'Регистрация'}
          </h1>

          <p className="auth-subtitle">
            {isExecutor
              ? 'Добавьте свой автосервис на платформу и принимайте заявки.'
              : 'Создайте аккаунт и начните пользоваться сервисом.'}
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <fieldset className="auth-role" disabled={isLoading}>
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
                onChange={(event) => handleRoleChange(event.target.value)}
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
                onChange={(event) => handleRoleChange(event.target.value)}
              />
              <span>Автосервис</span>
            </label>
          </fieldset>

          {isExecutor ? (
            <>
              <div className="auth-field">
                <label htmlFor="register-shop-name">
                  Название автосервиса
                </label>
                <input
                  id="register-shop-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Например, АвтоПро"
                  autoComplete="organization"
                  maxLength={100}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-city">Город</label>
                <select
                  id="register-city"
                  name="city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  disabled={isLoading}
                  required
                >
                  {CITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="register-address">Адрес</label>
                <input
                  id="register-address"
                  name="address"
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Улица, дом"
                  autoComplete="street-address"
                  maxLength={255}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-phone">Телефон</label>
                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(formatPhoneInput(event.target.value));
                  }}
                  placeholder="+7 (999) 123-45-67"
                  autoComplete="tel"
                  disabled={isLoading}
                  required
                />
                <small>Формат: +7 (999) 123-45-67</small>
              </div>

              <div className="auth-field">
                <label htmlFor="register-hours">Часы работы</label>
                <input
                  id="register-hours"
                  name="hours"
                  type="text"
                  value={hours}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === '' || HOURS_PATTERN.test(next)) {
                      setHours(next);
                    }
                  }}
                  placeholder="09:00–20:00"
                  maxLength={50}
                  disabled={isLoading}
                />
                <small>Необязательно — можно заполнить позже в кабинете.</small>
              </div>
            </>
          ) : (
            <div className="auth-field">
              <label htmlFor="register-name">Имя</label>
              <input
                id="register-name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Введите имя"
                autoComplete="name"
                maxLength={100}
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              inputMode="email"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              value={email}
              onChange={(event) => {
                setEmail(normalizeEmail(event.target.value));
              }}
              placeholder="name@gmail.com"
              autoComplete="email"
              maxLength={254}
              title="Только латиница, цифры и символы . _ -"
              disabled={isLoading}
              required
            />
            <small>
              Только латиница, цифры и символы . _ - . Пример: name@gmail.com
            </small>
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Пароль</label>
            <input
              id="register-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 8 символов, буква и цифра"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              disabled={isLoading}
              required
            />
            <small>Минимум 8 символов, хотя бы одна буква и одна цифра.</small>
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
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="Повторите пароль"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              disabled={isLoading}
              required
            />
          </div>

          <fieldset className="auth-consents" disabled={isLoading}>
            <legend>Согласия</legend>

            <label className="auth-consent">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => {
                  setAcceptTerms(event.target.checked);
                  setError('');
                }}
                required
              />
              <span>
                Я принимаю
                {' '}
                <a
                  href="/#terms"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  пользовательское соглашение
                </a>
              </span>
            </label>

            <label className="auth-consent">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(event) => {
                  setAcceptPrivacy(event.target.checked);
                  setError('');
                }}
                required
              />
              <span>
                Даю согласие на обработку персональных данных
                в соответствии с
                {' '}
                <a
                  href="/#privacy"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  политикой конфиденциальности
                </a>
                {' '}
                (152-ФЗ)
              </span>
            </label>

            <label className="auth-consent auth-consent-optional">
              <input
                type="checkbox"
                checked={acceptMarketing}
                onChange={(event) => setAcceptMarketing(event.target.checked)}
              />
              <span>
                Согласен получать информационные и рекламные сообщения
                (необязательно)
              </span>
            </label>
          </fieldset>

          {(error || (!canSubmit && (name || email || password))) && (
            <p className="auth-error" role="alert">
              {error || validationError}
            </p>
          )}

          {success && (
            <p className="auth-success" role="status">
              {success}
            </p>
          )}

          <button
            type="submit"
            className={`auth-submit${!canSubmit ? ' is-disabled' : ''}`}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
          >
            {isLoading
              ? 'Регистрация...'
              : isExecutor
                ? 'Зарегистрировать автосервис'
                : 'Зарегистрироваться'}
          </button>
        </form>

        {onSwitchToLogin && (
          <div className="auth-switch">
            <span>Уже есть аккаунт?</span>

            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={isLoading}
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
