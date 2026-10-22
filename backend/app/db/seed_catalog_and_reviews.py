"""Сид каталога услуг и демо-отзывов.

Запуск из папки backend:
  python -m app.db.seed_catalog_and_reviews
"""

from __future__ import annotations

import asyncio
import hashlib

from sqlalchemy import func, select

from app.auth.security import hash_password
from app.db.database import AsyncSessionLocal
from app.db.schema import ensure_schema
from app.db.service_catalog_data import SERVICE_CATALOG
from app.models import Executor, Review, ServiceCatalogItem, User

REVIEW_TEMPLATES = [
    (5, "Отличный сервис, всё сделали быстро и аккуратно. Рекомендую!"),
    (5, "Мастера вежливые, цены честные, качество на высоте."),
    (4, "Хороший автосервис, немного подождал, но результатом доволен."),
    (5, "Записался онлайн — очень удобно. Работу выполнили в срок."),
    (4, "Сделали диагностику грамотно, объяснили всё по полочкам."),
    (5, "Уже не первый раз обращаюсь — всегда доволен."),
    (3, "В целом нормально, но можно было бы чуть быстрее."),
    (5, "Чистый бокс, современное оборудование, приятные мастера."),
    (4, "Замена прошла без сюрпризов, цену назвали заранее."),
    (5, "Спасибо за оперативность и качественный ремонт!"),
]

REVIEWER_NAMES = [
    "Алексей",
    "Мария",
    "Игорь",
    "Елена",
    "Дмитрий",
    "Анна",
    "Сергей",
    "Ольга",
    "Павел",
    "Наталья",
    "Андрей",
    "Екатерина",
]


async def seed_service_catalog(db) -> int:
    existing = await db.execute(select(ServiceCatalogItem.name))
    known = {row[0] for row in existing.all()}
    created = 0

    for category, name in SERVICE_CATALOG:
        if name in known:
            continue
        db.add(ServiceCatalogItem(category=category, name=name))
        known.add(name)
        created += 1

    return created


async def ensure_reviewer(db, index: int) -> User:
    email = f"reviewer{index + 1}@demo.local"
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is not None:
        return user

    user = User(
        name=REVIEWER_NAMES[index % len(REVIEWER_NAMES)],
        email=email,
        password_hash=hash_password("demo1234"),
        role="customer",
    )
    db.add(user)
    await db.flush()
    return user


async def seed_reviews(db) -> int:
    executors = (await db.execute(select(Executor))).scalars().all()
    created = 0

    for executor in executors:
        count_result = await db.execute(
            select(func.count(Review.id)).where(
                Review.executor_id == executor.id
            )
        )
        existing_count = int(count_result.scalar_one() or 0)
        if existing_count > 0:
            continue

        # Стабильное число отзывов от рейтинга/id
        digest = hashlib.md5(str(executor.id).encode()).hexdigest()
        target = 4 + (int(digest[:2], 16) % 5)  # 4..8

        for index in range(target):
            reviewer = await ensure_reviewer(db, index)
            rating, text = REVIEW_TEMPLATES[
                (executor.id + index) % len(REVIEW_TEMPLATES)
            ]
            # Не дублируем отзыв того же пользователя на сервис
            dup = await db.execute(
                select(Review.id).where(
                    Review.executor_id == executor.id,
                    Review.user_id == reviewer.id,
                )
            )
            if dup.scalar_one_or_none() is not None:
                continue

            db.add(
                Review(
                    executor_id=executor.id,
                    user_id=reviewer.id,
                    rating=rating,
                    text=text,
                    author_name=reviewer.name,
                )
            )
            created += 1

        await db.flush()
        stats = await db.execute(
            select(
                func.count(Review.id),
                func.coalesce(func.avg(Review.rating), 0.0),
            ).where(Review.executor_id == executor.id)
        )
        count, avg_rating = stats.one()
        executor.reviews = int(count or 0)
        executor.rating = round(float(avg_rating or 0), 1)

    return created


async def main() -> None:
    await ensure_schema()

    async with AsyncSessionLocal() as db:
        catalog_created = await seed_service_catalog(db)
        reviews_created = await seed_reviews(db)
        await db.commit()
        print(f"Каталог услуг: добавлено {catalog_created}")
        print(f"Отзывы: добавлено {reviews_created}")


if __name__ == "__main__":
    asyncio.run(main())
