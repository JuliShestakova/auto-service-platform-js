"""Сид каталога услуг и демо-отзывов.

Запуск из папки backend:
  python -m app.db.seed_catalog_and_reviews
"""

from __future__ import annotations

import asyncio
import hashlib
import os

from sqlalchemy import func, select

from app.auth.security import hash_password
from app.db.database import AsyncSessionLocal
from app.db.reference_seed import (
    ensure_reference_data,
    load_review_templates,
    load_reviewer_names,
    seed_service_catalog,
)
from app.db.schema import ensure_schema
from app.models import Executor, Review, User

# Пароль только для локальных демо-аккаунтов сида, не для продакшена.
DEMO_REVIEWER_PASSWORD = os.getenv("DEMO_REVIEWER_PASSWORD", "")


async def ensure_reviewer(db, index: int, reviewer_names: list[str]) -> User:
    email = f"reviewer{index + 1}@demo.local"
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is not None:
        return user

    if not DEMO_REVIEWER_PASSWORD:
        raise RuntimeError(
            "DEMO_REVIEWER_PASSWORD is not set (needed for demo reviewer seed)"
        )

    names = reviewer_names or ["Клиент"]
    user = User(
        name=names[index % len(names)],
        email=email,
        password_hash=hash_password(DEMO_REVIEWER_PASSWORD),
        role="customer",
    )
    db.add(user)
    await db.flush()
    return user


async def seed_reviews(db) -> int:
    templates = load_review_templates()
    reviewer_names = load_reviewer_names()
    if not templates:
        return 0

    executors = (
        await db.execute(select(Executor).order_by(Executor.id))
    ).scalars().all()
    if not executors:
        return 0

    created = 0
    name_count = max(len(reviewer_names), 1)
    for index, executor in enumerate(executors):
        existing = await db.scalar(
            select(func.count())
            .select_from(Review)
            .where(Review.executor_id == executor.id)
        )
        if existing and existing > 0:
            continue

        for offset in range(min(3, len(templates))):
            rating, text = templates[(index + offset) % len(templates)]
            reviewer = await ensure_reviewer(
                db,
                (index * 3 + offset) % name_count,
                reviewer_names,
            )
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

        digest = hashlib.md5(str(executor.id).encode("utf-8")).hexdigest()
        executor.rating = round(4.3 + (int(digest[:2], 16) % 7) / 10, 1)
        executor.reviews = max(executor.reviews or 0, 3)

    return created


async def main() -> None:
    await ensure_schema()
    await ensure_reference_data()

    async with AsyncSessionLocal() as db:
        catalog_created = await seed_service_catalog(db)
        reviews_created = await seed_reviews(db)
        await db.commit()
        print(f"Каталог: +{catalog_created}, отзывы: +{reviews_created}")


if __name__ == "__main__":
    asyncio.run(main())
