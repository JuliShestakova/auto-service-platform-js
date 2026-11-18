"""Кэш справочников для синхронной валидации (Pydantic)."""

from __future__ import annotations

_staff_positions: set[str] = set()
_default_staff_position = "Мастер"


def set_staff_positions(names: list[str]) -> None:
    global _staff_positions, _default_staff_position
    cleaned = [str(item).strip() for item in names if str(item).strip()]
    _staff_positions = set(cleaned)
    if cleaned:
        _default_staff_position = cleaned[0]


def allowed_staff_positions() -> set[str]:
    return set(_staff_positions)


def default_staff_position() -> str:
    return _default_staff_position
