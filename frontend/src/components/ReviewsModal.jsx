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

function reviewInitials(name) {
  return String(name || 'К')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StarsRow({ rating }) {
  const value = Math.round(Number(rating) || 0);
  return (
    <span className="reviews-modal-stars" aria-label={`Оценка ${value} из 5`}>
      {'★'.repeat(value)}
      {'☆'.repeat(Math.max(0, 5 - value))}
    </span>
  );
}

export default function ReviewsModal({
  executor,
  reviews = [],
  user = null,
  canWriteReview = false,
  reviewRating,
  reviewText,
  reviewError,
  reviewSaving,
  deletingReviewId,
  onChangeRating,
  onChangeText,
  onSubmit,
  onDelete,
  onClose,
}) {
  const ownId = Number(user?.id);

  return (
    <div
      className="reviews-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="reviews-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reviews-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="reviews-modal-close"
          onClick={onClose}
          aria-label="Закрыть отзывы"
        >
          ×
        </button>

        <p className="reviews-modal-kicker">Отзывы клиентов</p>
        <h2 id="reviews-modal-title">{executor?.name || 'Автосервис'}</h2>
        <p className="reviews-modal-summary">
          <strong>{executor?.rating || 0}</strong>
          <StarsRow rating={executor?.rating} />
          <span>{reviews.length} отзывов</span>
        </p>

        {canWriteReview ? (
          <form className="review-form reviews-modal-form" onSubmit={onSubmit}>
            <h3>Оставить отзыв</h3>
            <label>
              Оценка
              <select
                value={reviewRating}
                onChange={(event) => onChangeRating?.(Number(event.target.value))}
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
                value={reviewText}
                onChange={(event) => onChangeText?.(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Как вам этот автосервис?"
              />
            </label>
            {reviewError ? <p className="review-form-error">{reviewError}</p> : null}
            <button type="submit" className="primary-button" disabled={reviewSaving}>
              {reviewSaving ? 'Отправка…' : 'Отправить отзыв'}
            </button>
          </form>
        ) : null}

        <div className="reviews-modal-list">
          {reviews.length === 0 ? (
            <p className="reviews-modal-empty">Пока нет отзывов — будьте первым.</p>
          ) : reviews.map((review) => {
            const mine = Number(review.user_id) === ownId;
            return (
              <article
                key={review.id}
                className={`reviews-modal-card${mine ? ' is-mine' : ''}`}
              >
                <div className="reviews-modal-head">
                  <span className="reviews-modal-avatar">{reviewInitials(review.author_name)}</span>
                  <div>
                    <strong>
                      {review.author_name || 'Клиент'}
                      {mine ? <em>Мой отзыв</em> : null}
                    </strong>
                    <p>{formatReviewDate(review.created_at)}</p>
                  </div>
                  <StarsRow rating={review.rating} />
                </div>
                {review.text ? (
                  <p>{review.text}</p>
                ) : (
                  <p className="muted">Без комментария</p>
                )}
                {mine && onDelete ? (
                  <button
                    type="button"
                    className="scm-review-delete"
                    disabled={deletingReviewId === review.id}
                    onClick={() => onDelete(review)}
                  >
                    {deletingReviewId === review.id ? 'Удаляем…' : 'Удалить отзыв'}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
