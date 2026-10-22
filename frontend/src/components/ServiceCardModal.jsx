import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceSuggest from './ServiceSuggest';
import ReviewsModal from './ReviewsModal';
import { useLocation } from '../contexts/LocationContext';

const BOOKING_TIMES = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00',
];

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled = true }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 3.6 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18.5l.9-5.4-3.9-3.8 5.4-.8L12 3.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 4.5h3l1.2 3.2-1.6 1.6a12 12 0 0 0 5.6 5.6l1.6-1.6 3.2 1.2v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 16h12l-1.2-1.4a6.5 6.5 0 0 1-1.3-4V9a4.5 4.5 0 1 0-9 0v1.6a6.5 6.5 0 0 1-1.3 4L6 16Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ServiceGlyph({ name }) {
  const key = String(name || '').toLowerCase();
  if (key.includes('масл') || key.includes('фильтр')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 10.5c0-1.5 1.2-3.2 2.4-4.2L12 5l1.6 1.3C14.8 7.3 16 9 16 10.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-7.5Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (key.includes('колод') || key.includes('тормоз')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (key.includes('шином') || key.includes('колёс') || key.includes('колес')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function serviceRows(executor) {
  return (executor?.services || [])
    .map((item) => (
      Array.isArray(item)
        ? [item[0], item[1]]
        : [item?.name, item?.price]
    ))
    .filter((item) => item[0]);
}

function reviewInitials(name) {
  return String(name || 'К')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatReviewDate(value) {
  if (!value) return '';
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

function StarsRow({ rating }) {
  const value = Math.round(Number(rating) || 0);
  return (
    <span className="scm-stars" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= value ? 'is-on' : ''}>
          <StarIcon filled={star <= value} />
        </span>
      ))}
    </span>
  );
}

export default function ServiceCardModal({
  executor,
  coverImage,
  reviews = [],
  reviewsLoading = false,
  focus = 'booking',
  serviceOptions = [],
  bookingService,
  bookingDate,
  bookingTime,
  bookingError = '',
  bookingSaving = false,
  bookingDone = false,
  user = null,
  ordersLink = '/customer',
  onClose,
  onSelectService,
  onChangeService,
  onChangeDate,
  onChangeTime,
  onSubmit,
  onFocusReviews,
  onSubmitReview,
  onDeleteReview,
}) {
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewsOpen, setReviewsOpen] = useState(focus === 'reviews');
  const { distanceTo, formatDistance } = useLocation();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const distanceKm = distanceTo?.(executor);

  const rows = serviceRows(executor);
  const reviewCount = reviews.length || Number(executor?.reviews) || 0;
  const ownReview = reviews.find((item) => Number(item.user_id) === Number(user?.id));
  const canWriteReview = Boolean(
    user && (user.role === 'customer' || user.role === 'executor') && !ownReview
  );
  useEffect(() => {
    setReviewRating(5);
    setReviewText('');
    setReviewError('');
    setReviewsOpen(focus === 'reviews');
  }, [executor?.id, focus]);

  const submitOwnReview = async (event) => {
    event.preventDefault();
    if (!canWriteReview) return;
    setReviewError('');
    setReviewSaving(true);
    try {
      const result = await onSubmitReview?.({
        rating: Number(reviewRating),
        text: reviewText.trim(),
      });
      if (result?.error) {
        setReviewError(result.error);
        return;
      }
      setReviewText('');
      setReviewRating(5);
    } finally {
      setReviewSaving(false);
    }
  };

  const deleteOwnReview = async (review) => {
    if (!review?.id) return;
    setDeletingReviewId(review.id);
    try {
      await onDeleteReview?.(review);
    } finally {
      setDeletingReviewId(null);
    }
  };

  useEffect(() => {
    if (!bookingService) return undefined;
    const timer = window.setTimeout(() => {
      document
        .querySelector('.service-modal-panel .scm-price-item.selected')
        ?.scrollIntoView({ block: 'nearest' });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [bookingService]);

  useEffect(() => {
    if (focus !== 'reviews') return undefined;
    const timer = window.setTimeout(() => {
      document
        .getElementById('service-modal-reviews')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [focus, executor?.id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (reviewsOpen) {
        setReviewsOpen(false);
        return;
      }
      onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [reviewsOpen]);

  const openReviews = () => {
    onFocusReviews?.();
    setReviewsOpen(true);
  };

  if (!executor) return null;

  return (
    <>
    <div
      className="booking-overlay service-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        id="service-details"
        className="booking-overlay-panel service-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="booking-overlay-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className={`service-details-card scm-card${
          focus === 'reviews' ? ' focus-reviews' : ''
        }`}
        >
          <div className="service-details-main">
            <div className="service-details-top scm-top">
              <div className="scm-cover">
                {coverImage ? (
                  <img src={coverImage} alt="" />
                ) : (
                  <span className="scm-cover-fallback" aria-hidden="true">🚗</span>
                )}
              </div>
              <div>
                <p className="service-details-label">Автосервис</p>
                <h2 id="service-modal-title">{executor.name}</h2>
                <button
                  type="button"
                  className="service-details-rating scm-rating-link"
                  onClick={openReviews}
                >
                  <span className="star-icon"><StarIcon /></span>
                  <strong>{executor.rating}</strong>
                  <span className="scm-reviews-link">
                    {reviewCount} отзывов →
                  </span>
                </button>
              </div>
            </div>

            <div className="service-info-grid">
              <div>
                <span className="info-icon"><LocationIcon /></span>
                <div>
                  <small>Адрес</small>
                  <strong>{executor.address}</strong>
                  {distanceKm != null ? (
                    <span className="scm-distance">{formatDistance(distanceKm)} от вас</span>
                  ) : null}
                </div>
              </div>
              <div>
                <span className="info-icon"><ClockIcon /></span>
                <div>
                  <small>Часы работы</small>
                  <strong>{executor.hours || 'Не указаны'}</strong>
                </div>
              </div>
              <div>
                <span className="info-icon"><StatusIcon /></span>
                <div>
                  <small>Статус</small>
                  <strong className={
                    executor.status === 'Закрыто'
                      ? 'closed-status'
                      : 'open-status'
                  }
                  >
                    {executor.status}
                  </strong>
                </div>
              </div>
            </div>

            {executor.description ? (
              <p className="service-details-description">
                {executor.description}
              </p>
            ) : null}

            <div className="price-section">
              <div className="price-section-header">
                <div>
                  <p className="section-label">Услуги и цены</p>
                  <h3>Выберите необходимую работу</h3>
                </div>
                {rows.length > 4 ? (
                  <span className="scm-price-hint">
                    {rows.length} услуг · прокрутите список
                  </span>
                ) : null}
              </div>
              <div className="price-list scm-price-list">
                {rows.map(([name, price]) => (
                  <button
                    type="button"
                    key={name}
                    className={
                      bookingService === name
                        ? 'price-item scm-price-item selected'
                        : 'price-item scm-price-item'
                    }
                    onClick={() => onSelectService?.(name)}
                  >
                    <span className="scm-price-main">
                      <span className="scm-price-icon"><ServiceGlyph name={name} /></span>
                      <span>{name}</span>
                    </span>
                    <strong>{price || 'по запросу'}</strong>
                    <span className="scm-price-chevron" aria-hidden="true">
                      <ChevronIcon />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <section
              id="service-modal-reviews"
              className="scm-reviews"
            >
              <div className="scm-reviews-heading">
                <div>
                  <p className="section-label">Отзывы клиентов</p>
                  <h3>
                    {reviewsLoading
                      ? 'Загрузка…'
                      : reviewCount
                        ? 'Оценки и впечатления'
                        : 'Пока нет отзывов'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="scm-all-reviews"
                  onClick={openReviews}
                >
                  {reviewCount > 0 ? `Все ${reviewCount} отзывов →` : 'Открыть отзывы →'}
                </button>
              </div>

              <div className="scm-reviews-summary">
                <strong>{executor.rating}</strong>
                <StarsRow rating={executor.rating} />
                <span>{reviewCount} отзывов</span>
              </div>

              {ownReview ? (
                <p className="review-login-hint">
                  Вы уже оставляли отзыв об этом сервисе.
                </p>
              ) : null}

              {!user ? (
                <p className="review-login-hint">
                  Чтобы оставить отзыв,{' '}
                  <Link to="/login">войдите в аккаунт</Link>.
                </p>
              ) : null}
            </section>
          </div>

          <aside className="booking-card">
            {bookingDone ? (
              <>
                <p className="booking-label">Личный кабинет</p>
                <h3>Заявка отправлена</h3>
                <p className="booking-description">
                  Заявка сохранена в вашем личном кабинете.
                  Статус подтверждения смотрите в разделе «Мои записи».
                </p>

                <div className="booking-success">
                  <p>
                    Заявка отправлена в автосервис «{executor.name}».
                    Статус подтверждения смотрите в разделе «Мои записи».
                  </p>
                  {user?.role === 'customer' ? (
                    <Link to={ordersLink} className="booking-success-link">
                      Перейти в личный кабинет →
                    </Link>
                  ) : (
                    <Link to="/login" className="booking-success-link">
                      Войти в кабинет →
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="booking-label">Запись онлайн</p>
                <h3>Запишитесь на обслуживание</h3>
                <p className="booking-description">
                  Выберите услугу, дату и удобное время.
                  После записи визит появится в личном кабинете.
                </p>

                <form className="booking-form" onSubmit={onSubmit}>
                  <div className="booking-field">
                    <label htmlFor="scm-booking-service">Услуга</label>
                    <ServiceSuggest
                      value={bookingService}
                      options={serviceOptions}
                      onChange={onChangeService}
                      placeholder="Начните вводить, например замена"
                    />
                  </div>

                  <div className="booking-field">
                    <label htmlFor="scm-booking-date">Дата</label>
                    <div
                      className="booking-date-wrap"
                      onClick={(event) => {
                        const input = event.currentTarget.querySelector('input');
                        if (!input) return;
                        if (typeof input.showPicker === 'function') {
                          try {
                            input.showPicker();
                          } catch {
                            input.focus();
                          }
                        } else {
                          input.focus();
                          input.click();
                        }
                      }}
                    >
                      <input
                        id="scm-booking-date"
                        type="date"
                        value={bookingDate}
                        onChange={(event) => onChangeDate?.(event.target.value)}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (typeof event.currentTarget.showPicker === 'function') {
                            try {
                              event.currentTarget.showPicker();
                            } catch {
                              // браузер сам откроет календарь
                            }
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="booking-field">
                    <label htmlFor="scm-booking-time">Время</label>
                    <select
                      id="scm-booking-time"
                      value={bookingTime}
                      onChange={(event) => onChangeTime?.(event.target.value)}
                      required
                    >
                      <option value="">Выберите время</option>
                      {BOOKING_TIMES.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {bookingError ? (
                    <p className="booking-error">{bookingError}</p>
                  ) : null}

                  <button
                    type="submit"
                    className="booking-submit"
                    disabled={bookingSaving}
                  >
                    {bookingSaving ? 'Сохраняем…' : 'Записаться'}
                    <span>→</span>
                  </button>
                </form>
              </>
            )}

            <ul className="scm-booking-perks">
              <li>
                <span><BoltIcon /></span>
                Быстрая и удобная онлайн-запись
              </li>
              <li>
                <span><PhoneIcon /></span>
                Подтверждение записи — мы свяжемся с вами
              </li>
              <li>
                <span><BellIcon /></span>
                Напоминание о визите в уведомлении
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
    {reviewsOpen ? (
      <ReviewsModal
        executor={executor}
        reviews={reviews}
        user={user}
        canWriteReview={canWriteReview}
        reviewRating={reviewRating}
        reviewText={reviewText}
        reviewError={reviewError}
        reviewSaving={reviewSaving}
        deletingReviewId={deletingReviewId}
        onChangeRating={setReviewRating}
        onChangeText={setReviewText}
        onSubmit={submitOwnReview}
        onDelete={onDeleteReview ? deleteOwnReview : undefined}
        onClose={() => setReviewsOpen(false)}
      />
    ) : null}
    </>
  );
}
