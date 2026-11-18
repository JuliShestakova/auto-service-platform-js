"""Загрузка справочников в БД из JSON (только если таблицы пустые)."""

from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import func, select

from app.db.database import AsyncSessionLocal
from app.db.reference_cache import set_staff_positions
from app.models.city import City
from app.models.reference import (
    BookingTimeSlot,
    FeaturedService,
    ServiceAlias,
    ServiceCategory,
    ServiceSearchSynonym,
    StaffPosition,
)
from app.models.service_catalog import ServiceCatalogItem

SEED_DIR = Path(__file__).resolve().parent / "seed_data"


def _load_json(name: str):
    path = SEED_DIR / name
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


async def seed_cities(db) -> int:
    count = await db.scalar(select(func.count()).select_from(City))
    if count and count > 0:
        updated = 0
        by_name = {
            item["name"]: item
            for item in _load_json("cities.json")
            if item.get("name")
        }
        rows = (await db.execute(select(City))).scalars().all()
        for row in rows:
            item = by_name.get(row.name)
            if not item:
                continue
            genitive = str(item.get("name_genitive") or "")
            if genitive and row.name_genitive != genitive:
                row.name_genitive = genitive
                updated += 1
        return updated

    created = 0
    for item in _load_json("cities.json"):
        db.add(
            City(
                name=item["name"],
                name_genitive=str(item.get("name_genitive") or ""),
                latitude=float(item["latitude"]),
                longitude=float(item["longitude"]),
                is_default=bool(item.get("is_default", False)),
            )
        )
        created += 1
    return created


async def seed_service_catalog(db) -> int:
    count = await db.scalar(select(func.count()).select_from(ServiceCatalogItem))
    seed_items = _load_json("service_catalog.json")
    if count and count > 0:
        by_name = {item["name"]: item for item in seed_items if item.get("name")}
        updated = 0
        rows = (await db.execute(select(ServiceCatalogItem))).scalars().all()
        for row in rows:
            item = by_name.get(row.name)
            if not item:
                continue
            featured = bool(item.get("is_featured", False))
            image_key = item.get("image_key")
            if row.is_featured != featured or row.image_key != image_key:
                row.is_featured = featured
                row.image_key = image_key
                updated += 1
        return updated

    created = 0
    for item in seed_items:
        db.add(
            ServiceCatalogItem(
                category=item["category"],
                name=item["name"],
                is_featured=bool(item.get("is_featured", False)),
                image_key=item.get("image_key"),
            )
        )
        created += 1
    return created


async def seed_staff_positions(db) -> int:
    count = await db.scalar(select(func.count()).select_from(StaffPosition))
    if count and count > 0:
        return 0

    created = 0
    for index, name in enumerate(_load_json("staff_positions.json")):
        db.add(StaffPosition(name=str(name), sort_order=index))
        created += 1
    return created


async def seed_service_aliases(db) -> int:
    count = await db.scalar(select(func.count()).select_from(ServiceAlias))
    if count and count > 0:
        return 0

    created = 0
    for index, name in enumerate(_load_json("service_aliases.json")):
        db.add(ServiceAlias(name=str(name), sort_order=index))
        created += 1
    return created


async def seed_service_search_synonyms(db) -> int:
    count = await db.scalar(
        select(func.count()).select_from(ServiceSearchSynonym)
    )
    if count and count > 0:
        return 0

    created = 0
    for index, item in enumerate(_load_json("service_search_synonyms.json")):
        db.add(
            ServiceSearchSynonym(
                keys=list(item.get("keys") or []),
                hint=str(item["hint"]),
                sort_order=index,
            )
        )
        created += 1
    return created


async def seed_booking_time_slots(db) -> int:
    count = await db.scalar(select(func.count()).select_from(BookingTimeSlot))
    if count and count > 0:
        return 0

    created = 0
    for index, time_value in enumerate(_load_json("booking_time_slots.json")):
        db.add(BookingTimeSlot(time=str(time_value), sort_order=index))
        created += 1
    return created


async def seed_service_categories(db) -> int:
    count = await db.scalar(select(func.count()).select_from(ServiceCategory))
    if count and count > 0:
        return 0

    created = 0
    for index, item in enumerate(_load_json("service_categories.json")):
        db.add(
            ServiceCategory(
                name=item["name"],
                short_label=item.get("short_label") or item["name"],
                icon=item.get("icon") or "more",
                sort_order=index,
            )
        )
        created += 1
    return created


async def seed_featured_services(db) -> int:
    count = await db.scalar(select(func.count()).select_from(FeaturedService))
    if count and count > 0:
        return 0

    created = 0
    for item in _load_json("featured_services.json"):
        db.add(
            FeaturedService(
                name=item["name"],
                image_key=item["image_key"],
                sort_order=int(item.get("sort_order", 0)),
            )
        )
        created += 1
    return created


async def refresh_reference_cache(db) -> None:
    rows = (
        await db.execute(
            select(StaffPosition.name).order_by(StaffPosition.sort_order)
        )
    ).scalars().all()
    set_staff_positions(list(rows))


async def ensure_reference_data() -> None:
    async with AsyncSessionLocal() as db:
        created = [
            await seed_cities(db),
            await seed_service_catalog(db),
            await seed_staff_positions(db),
            await seed_service_aliases(db),
            await seed_service_search_synonyms(db),
            await seed_booking_time_slots(db),
            await seed_service_categories(db),
            await seed_featured_services(db),
        ]
        if any(created):
            await db.commit()
        await refresh_reference_cache(db)


def load_review_templates() -> list[tuple[int, str]]:
    items = _load_json("review_templates.json")
    return [(int(item["rating"]), str(item["text"])) for item in items]


def load_reviewer_names() -> list[str]:
    return [str(item) for item in _load_json("reviewer_names.json")]


def load_shop_templates() -> list[dict]:
    return list(_load_json("shop_templates.json"))


def load_demo_base_services() -> list[list[str]]:
    return [list(item) for item in _load_json("demo_base_services.json")]
