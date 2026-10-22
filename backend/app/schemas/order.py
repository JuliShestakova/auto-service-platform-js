from datetime import date, datetime

from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    car_id: int | None = None
    executor_id: int | None = None
    staff_id: int | None = None
    guest_name: str | None = Field(default=None, max_length=100)
    visit_date: date | None = None
    visit_time: str | None = Field(default=None, max_length=10)


class OrderUpdate(BaseModel):
    status: str | None = Field(default=None, max_length=50)
    cancel_reason: str | None = Field(default=None, max_length=500)
    staff_id: int | None = None
    accept: bool = False
    confirm: bool = False
    ack_cancel: bool = False


class OrderResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    cancel_reason: str | None = None
    cancel_ack_at: datetime | None = None
    visit_date: date | None
    visit_time: str | None
    customer_id: int | None = None
    customer_name: str
    executor_id: int | None
    executor_name: str | None
    executor_rating: float | None
    staff_id: int | None = None
    staff_name: str | None = None
    staff_position: str | None = None
    car_id: int | None
    car_label: str
    created_at: datetime
