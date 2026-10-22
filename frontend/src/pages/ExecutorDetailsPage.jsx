import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { DEFAULT_CITY } from '../data/cities';

function formatReviewDate(value) {
  if (!value) {
    return '';
  }

  try {
    return new Date(value).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function ExecutorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { city } = useCity();
  const { user, authFetch, isLoading: authLoading } = useAuth();
  const searchCity = city || DEFAULT_CITY;

  const [executor, setExecutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const canLeaveReview = Boolean(
    user && (user.role === 'customer' || user.role === 'executor')
  );
  const alreadyReviewed = Boolean(
    user && reviews.some((item) => item.user_id === user.id)
  );

  const loadReviews = async () => {
    const response = await fetch(`/api/executors/${id}/reviews`);
    if (!response.ok) {
      throw new Error('Не удалось загрузить отзывы');
    }
    setReviews(await response.json());
  };

  useEffect(() => {
    const loadExecutor = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/executors/${id}`);

        if (response.status === 404) {
          setExecutor(null);
          return;
        }

        if (!response.ok) {
          throw new Error('Не удалось загрузить автосервис');
        }

        setExecutor(await response.json());
        await loadReviews();

        if (window.location.hash === '#reviews') {
          requestAnimationFrame(() => {
            document
              .getElementById('reviews')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить автосервис'
        );
      } finally {
        setLoading(false);
      }
    };

    loadExecutor();
  }, [id]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!canLeaveReview) {
      navigate('/login', {
        state: { from: `/executors/${id}` },
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await authFetch(`/api/executors/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: Number(rating),
          text: text.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data?.detail;
        throw new Error(
          typeof detail === 'string'
            ? detail
            : 'Не удалось отправить отзыв'
        );
      }

      setText('');
      setRating(5);
      setSuccessMessage('Спасибо! Ваш отзыв сохранён.');
      await loadReviews();

      const executorResponse = await fetch(`/api/executors/${id}`);
      if (executorResponse.ok) {
        setExecutor(await executorResponse.json());
      }
    } catch (submitErr) {
      setSubmitError(
        submitErr instanceof Error
          ? submitErr.message
          : 'Не удалось отправить отзыв'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!review?.id) return;
    setDeletingReviewId(review.id);
    setSubmitError('');
    try {
      const response = await authFetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Не удалось удалить отзыв');
      }
      setReviews((current) => current.filter((item) => item.id !== review.id));
      const executorResponse = await fetch(`/api/executors/${id}`);
      if (executorResponse.ok) {
        setExecutor(await executorResponse.json());
      }
    } catch (deleteErr) {
      setSubmitError(
        deleteErr instanceof Error
          ? deleteErr.message
          : 'Не удалось удалить отзыв'
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading || authLoading) {
    return (
      <main>
        <p>Загрузка автосервиса...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Автосервис</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!executor) {
    return (
      <main>
        <h1>Исполнитель не найден</h1>
        <p>
          Автосервис с таким идентификатором не найден.
        </p>
      </main>
    );
  }

  const services = Array.isArray(executor.services)
    ? executor.services
    : [];

  const handleSelectExecutor = () => {
    localStorage.setItem(
      'selectedExecutor',
      JSON.stringify({
        id: executor.id,
        name: executor.name,
      })
    );

    navigate(
      `/search?book=${executor.id}&city=${encodeURIComponent(
        executor.city || searchCity
      )}`
    );
  };

  return (
    <main className="search-main executor-details">
      <Link
        to={`/search?city=${encodeURIComponent(executor?.city || searchCity)}`}
        className="popular-heading"
      >
        ← К результатам поиска
      </Link>

      <article className="result-card executor-details-card">
        <div>
          <p className="result-rating">
            ★ {executor.rating}
            {executor.reviews ? (
              <span className="result-reviews-count">
                {' '}
                · {executor.reviews} отзывов
              </span>
            ) : null}
          </p>
          <h1>{executor.name}</h1>
          <p>{executor.address}</p>
          <p className={
            executor.status === 'Закрыто'
              ? 'result-status closed'
              : 'result-status'
          }>
            {executor.status}
            {executor.hours ? ` · ${executor.hours}` : ''}
          </p>
          <p>Телефон: {executor.phone || 'Не указан'}</p>
          {executor.description && <p>{executor.description}</p>}
        </div>
        <div className="result-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleSelectExecutor}
          >
            Записаться
          </button>
        </div>
      </article>

      <section className="search-summary">
        <h2>Услуги и цены</h2>
        {services.length === 0 && <p>Услуги пока не указаны</p>}
        {services.map((service) => {
          const name = Array.isArray(service) ? service[0] : service.name;
          const price = Array.isArray(service) ? service[1] : service.price;

          return (
            <p className="result-price" key={name}>
              {name}
              <strong>{price || 'по запросу'}</strong>
            </p>
          );
        })}
      </section>

      <section className="reviews-section" id="reviews">
        <div className="reviews-heading">
          <h2>Отзывы</h2>
          <p>
            {reviews.length
              ? `Всего ${reviews.length}`
              : 'Пока нет отзывов — будьте первым'}
          </p>
        </div>

        {canLeaveReview && !alreadyReviewed ? (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Оставить отзыв</h3>
            <label className="review-rating-label">
              Оценка
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                <option value={5}>5 — отлично</option>
                <option value={4}>4 — хорошо</option>
                <option value={3}>3 — нормально</option>
                <option value={2}>2 — плохо</option>
                <option value={1}>1 — ужасно</option>
              </select>
            </label>
            <label>
              Комментарий
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Расскажите о визите в автосервис"
              />
            </label>
            {submitError ? (
              <p className="review-form-error">{submitError}</p>
            ) : null}
            {successMessage ? (
              <p className="review-form-success">{successMessage}</p>
            ) : null}
            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? 'Отправка…' : 'Отправить отзыв'}
            </button>
          </form>
        ) : null}

        {!user ? (
          <p className="review-login-hint">
            Чтобы оставить отзыв,{' '}
            <Link to="/login" state={{ from: `/executors/${id}` }}>
              войдите в аккаунт
            </Link>
            {' '}или{' '}
            <Link to="/register">зарегистрируйтесь</Link>.
          </p>
        ) : null}

        {canLeaveReview && alreadyReviewed ? (
          <p className="review-login-hint">
            Вы уже оставляли отзыв об этом сервисе.
          </p>
        ) : null}

        <div className="reviews-list">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card-top">
                <strong>{review.author_name}</strong>
                <span className="result-rating">★ {review.rating}</span>
              </div>
              <p className="review-card-date">
                {formatReviewDate(review.created_at)}
              </p>
              {review.text ? (
                <p className="review-card-text">{review.text}</p>
              ) : (
                <p className="review-card-text muted">Без комментария</p>
              )}
              {Number(review.user_id) === Number(user?.id) ? (
                <button
                  type="button"
                  className="scm-review-delete"
                  disabled={deletingReviewId === review.id}
                  onClick={() => handleDeleteReview(review)}
                >
                  {deletingReviewId === review.id ? 'Удаляем…' : 'Удалить отзыв'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ExecutorDetailsPage;
