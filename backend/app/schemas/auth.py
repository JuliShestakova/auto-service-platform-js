import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


STRICT_EMAIL_RE = re.compile(
    r"^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?@"
    r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
    r"(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$",
    re.IGNORECASE,
)
NAME_RE = re.compile(
    r"^[A-Za-zА-Яа-яЁё](?:[A-Za-zА-Яа-яЁё\s.'-]{0,98}[A-Za-zА-Яа-яЁё.])?$"
)
SHOP_NAME_RE = re.compile(
    r"^[A-Za-zА-Яа-яЁё0-9]"
    r"(?:[A-Za-zА-Яа-яЁё0-9\s.&«»\"'-]{0,98}"
    r"[A-Za-zА-Яа-яЁё0-9.«»\"'])?$"
)
ADDRESS_RE = re.compile(
    r"^[A-Za-zА-Яа-яЁё0-9][A-Za-zА-Яа-яЁё0-9\s.,/\-№#]{4,254}$"
)
PHONE_DIGITS_RE = re.compile(r"\D+")
HOURS_RE = re.compile(r"^[\d\s.:\-–—]{0,50}$")
ALLOWED_CITIES = {
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
}


def _phone_digits(value: str) -> str:
    return PHONE_DIGITS_RE.sub("", value or "")


def _is_valid_phone(value: str) -> bool:
    digits = _phone_digits(value)
    if len(digits) == 11 and digits[0] in {"7", "8"}:
        return True
    return len(digits) == 10 and digits.startswith("9")


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["customer", "executor"] = "customer"
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    hours: str | None = Field(default=None, max_length=50)
    accept_terms: bool = False
    accept_privacy: bool = False

    @field_validator("email")
    @classmethod
    def email_must_be_strict(cls, value: str) -> str:
        normalized = str(value).strip().lower()
        if (
            not STRICT_EMAIL_RE.fullmatch(normalized)
            or ".." in normalized
            or ".-" in normalized
            or "-." in normalized
            or "__" in normalized
        ):
            raise ValueError(
                "Укажите корректный email латиницей, "
                "например name@gmail.com"
            )
        return normalized

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, value: str) -> str:
        if " " in value:
            raise ValueError("Пароль не должен содержать пробелы")
        if not re.search(r"[A-Za-zА-Яа-яЁё]", value):
            raise ValueError("Пароль должен содержать хотя бы одну букву")
        if not re.search(r"\d", value):
            raise ValueError("Пароль должен содержать хотя бы одну цифру")
        return value

    @field_validator("accept_terms", "accept_privacy")
    @classmethod
    def consents_required(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError(
                "Необходимо принять условия и дать согласие "
                "на обработку персональных данных"
            )
        return value

    @model_validator(mode="after")
    def validate_by_role(self):
        name = self.name.strip()
        if len(name) < 2:
            raise ValueError("Имя слишком короткое")

        if self.role == "executor":
            if not SHOP_NAME_RE.fullmatch(name):
                raise ValueError("Название автосервиса содержит недопустимые символы")

            city = (self.city or "").strip()
            if city not in ALLOWED_CITIES:
                raise ValueError("Выберите город из списка")

            address = (self.address or "").strip()
            if len(address) < 5 or not ADDRESS_RE.fullmatch(address):
                raise ValueError("Укажите корректный адрес автосервиса")

            phone = (self.phone or "").strip()
            if not _is_valid_phone(phone):
                raise ValueError(
                    "Укажите телефон в формате +7 (999) 123-45-67"
                )

            hours = (self.hours or "").strip()
            if hours and not HOURS_RE.fullmatch(hours):
                raise ValueError("Часы работы указаны некорректно")

            self.name = name
            self.city = city
            self.address = address
            self.phone = phone
            self.hours = hours or None
        else:
            if not NAME_RE.fullmatch(name):
                raise ValueError(
                    "Имя может содержать только буквы, пробел, дефис и точку"
                )
            self.name = name
            self.phone = None
            self.address = None
            self.city = None
            self.hours = None

        return self


class RegisterResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
