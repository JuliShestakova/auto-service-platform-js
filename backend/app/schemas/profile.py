from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.auth import normalize_shop_hours


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    current_password: str | None = Field(default=None, max_length=128)
    new_password: str | None = Field(default=None, min_length=8, max_length=128)
    address: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None


class ExecutorProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    hours: str | None = Field(default=None, max_length=50)
    description: str | None = Field(default=None, max_length=1000)
    status: str | None = Field(default=None, max_length=50)
    services: list[list[str]] | None = None

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, value: str | None) -> str | None:
        text = (value or "").strip()
        if not text or text == "Уточняется":
            return text or None
        return normalize_shop_hours(text)
