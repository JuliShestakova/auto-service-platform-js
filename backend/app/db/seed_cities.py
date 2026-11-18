"""Сид демо-автосервисов по городам из таблицы cities.

Запуск из папки backend:
  python -m app.db.seed_cities
"""

from __future__ import annotations

import asyncio

from sqlalchemy import select

from app.db.database import AsyncSessionLocal
from app.db.reference_seed import (
    ensure_reference_data,
    load_demo_base_services,
    load_shop_templates,
)
from app.db.schema import ensure_schema
from app.models import City, Executor


async def seed_city_executors() -> None:
    await ensure_schema()
    await ensure_reference_data()

    shop_templates = load_shop_templates()
    base_services = load_demo_base_services()

    async with AsyncSessionLocal() as db:
        cities = (await db.execute(select(City).order_by(City.name))).scalars().all()
        created = 0

        for city in cities:
            lat0, lon0 = city.latitude, city.longitude

            for index, template in enumerate(shop_templates):
                name = f"{template['suffix']} · {city.name}"
                existing = await db.execute(
                    select(Executor).where(Executor.name == name)
                )
                if existing.scalar_one_or_none() is not None:
                    continue

                offset = (index - 3) * 0.01
                executor = Executor(
                    name=name,
                    rating=template["rating"],
                    reviews=template["reviews"] + index * 3,
                    price=template["price"],
                    address=f"{city.name}, {template['street']}",
                    city=city.name,
                    status=template["status"],
                    hours=template["hours"],
                    description=(
                        f"Проверенный автосервис в городе {city.name}. "
                        "Диагностика, ремонт и запись онлайн."
                    ),
                    services=list(base_services),
                    phone=template["phone"],
                    latitude=lat0 + offset,
                    longitude=lon0 + offset * 0.7,
                )
                db.add(executor)
                created += 1

        await db.commit()
        print(f"Создано автосервисов: {created}")


if __name__ == "__main__":
    asyncio.run(seed_city_executors())
