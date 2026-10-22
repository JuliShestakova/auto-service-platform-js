"""Сид демо-автосервисов по 10 городам.

Запуск из папки backend:
  python -m app.db.seed_cities
"""

from __future__ import annotations

import asyncio

from sqlalchemy import select

from app.db.database import AsyncSessionLocal
from app.db.schema import ensure_schema
from app.models import Executor

CITIES = [
    "Москва",
    "Санкт-Петербург",
    "Новосибирск",
    "Екатеринбург",
    "Казань",
    "Нижний Новгород",
    "Ростов-на-Дону",
    "Краснодар",
    "Самара",
    "Сочи",
]

CITY_COORDS = {
    "Москва": (55.7558, 37.6173),
    "Санкт-Петербург": (59.9311, 30.3609),
    "Новосибирск": (55.0084, 82.9357),
    "Екатеринбург": (56.8389, 60.6057),
    "Казань": (55.7961, 49.1064),
    "Нижний Новгород": (56.2965, 43.9361),
    "Ростов-на-Дону": (47.2357, 39.7015),
    "Краснодар": (45.0355, 38.9753),
    "Самара": (53.1959, 50.1002),
    "Сочи": (43.6028, 39.7342),
}

BASE_SERVICES = [
    ["Компьютерная диагностика", "от 900 ₽"],
    ["Замена моторного масла", "от 1 200 ₽"],
    ["Шиномонтаж легкового автомобиля", "от 800 ₽"],
    ["Замена передних тормозных колодок", "от 2 500 ₽"],
    ["Заправка автокондиционера", "от 2 000 ₽"],
    ["Диагностика ходовой части", "от 1 000 ₽"],
]

SHOP_TEMPLATES = (
    {
        "suffix": "АвтоПро",
        "rating": 4.9,
        "reviews": 128,
        "price": "от 900 ₽",
        "status": "Открыто",
        "hours": "09:00–20:00",
        "street": "ул. Сервисная, 12",
        "phone": "+7 (900) 100-10-01",
    },
    {
        "suffix": "МастерАвто",
        "rating": 4.7,
        "reviews": 86,
        "price": "от 1 100 ₽",
        "status": "Открыто",
        "hours": "08:00–21:00",
        "street": "пр. Центральный, 45",
        "phone": "+7 (900) 100-10-02",
    },
    {
        "suffix": "СТО Гарант",
        "rating": 4.8,
        "reviews": 64,
        "price": "от 1 000 ₽",
        "status": "Открыто",
        "hours": "10:00–19:00",
        "street": "ул. Гаражная, 7",
        "phone": "+7 (900) 100-10-03",
    },
    {
        "suffix": "АвтоСити",
        "rating": 4.6,
        "reviews": 51,
        "price": "от 950 ₽",
        "status": "Открыто",
        "hours": "09:00–21:00",
        "street": "ул. Мастерская, 21",
        "phone": "+7 (900) 100-10-04",
    },
    {
        "suffix": "ДрайвСервис",
        "rating": 4.8,
        "reviews": 73,
        "price": "от 1 050 ₽",
        "status": "Открыто",
        "hours": "08:30–20:30",
        "street": "ул. Индустриальная, 18",
        "phone": "+7 (900) 100-10-05",
    },
    {
        "suffix": "МоторЛаб",
        "rating": 4.5,
        "reviews": 42,
        "price": "от 1 200 ₽",
        "status": "Открыто",
        "hours": "09:00–19:00",
        "street": "пр. Автомобильный, 33",
        "phone": "+7 (900) 100-10-06",
    },
    {
        "suffix": "ПилотСТО",
        "rating": 4.7,
        "reviews": 58,
        "price": "от 980 ₽",
        "status": "Открыто",
        "hours": "10:00–22:00",
        "street": "ул. Ремонтная, 9",
        "phone": "+7 (900) 100-10-07",
    },
    {
        "suffix": "ТехноДрайв",
        "rating": 4.6,
        "reviews": 39,
        "price": "от 1 150 ₽",
        "status": "Открыто",
        "hours": "08:00–20:00",
        "street": "ш. Объездное, 4",
        "phone": "+7 (900) 100-10-08",
    },
)


async def seed_city_executors() -> None:
    await ensure_schema()

    async with AsyncSessionLocal() as db:
        created = 0

        for city in CITIES:
            lat0, lon0 = CITY_COORDS[city]

            for index, template in enumerate(SHOP_TEMPLATES):
                name = f"{template['suffix']} · {city}"
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
                    address=f"{city}, {template['street']}",
                    city=city,
                    status=template["status"],
                    hours=template["hours"],
                    description=(
                        f"Проверенный автосервис в городе {city}. "
                        "Диагностика, ремонт и запись онлайн."
                    ),
                    services=list(BASE_SERVICES),
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
