import re

from pydantic import BaseModel, Field, field_validator

from app.schemas.auth import _is_valid_phone


STAFF_POSITIONS = (
    "Мастер",
    "Моторист",
    "Автоэлектрик",
    "Мастер по ремонту АКПП",
    "Мастер по ремонту МКПП",
    "Мастер по ходовой части",
    "Мастер по рулевому управлению",
    "Мастер по ремонту двигателей",
    "Шиномонтажник",
    "Специалист по развал-схождению",
    "Кузовщик-жестянщик",
    "Автомаляр",
    "Мастер по полировке кузова",
    "Специалист по шумоизоляции",
    "Специалист по ГБО",
    "Выездной автомеханик",
    "Выездной автодиагност",
    "Мастер по эвакуации автомобилей",
)
ALLOWED_STAFF_POSITIONS = set(STAFF_POSITIONS)
POSITION_SEP = " · "
POSITION_SPLIT_RE = re.compile(r"\s*[·,;/|]\s*")


def normalize_staff_positions(value: str | None) -> str:
    parts = POSITION_SPLIT_RE.split((value or "").strip())
    cleaned: list[str] = []
    for item in parts:
        name = item.strip()
        if not name:
            continue
        if name not in ALLOWED_STAFF_POSITIONS:
            raise ValueError("Выберите должности из списка")
        if name not in cleaned:
            cleaned.append(name)
    return POSITION_SEP.join(cleaned) or "Мастер"


class StaffCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    position: str = Field(default="Мастер", max_length=800)
    phone: str | None = Field(default=None, max_length=50)

    @field_validator("position")
    @classmethod
    def validate_position(cls, value: str) -> str:
        return normalize_staff_positions(value)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        text = (value or "").strip()
        if not text:
            return None
        if not _is_valid_phone(text):
            raise ValueError("Укажите телефон в формате +7 (999) 123-45-67")
        return text


class StaffUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    position: str | None = Field(default=None, max_length=800)
    phone: str | None = Field(default=None, max_length=50)

    @field_validator("position")
    @classmethod
    def validate_position(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_staff_positions(value)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        text = value.strip()
        if not text:
            return None
        if not _is_valid_phone(text):
            raise ValueError("Укажите телефон в формате +7 (999) 123-45-67")
        return text


class StaffResponse(BaseModel):
    id: int
    executor_id: int
    name: str
    position: str
    phone: str | None = None
