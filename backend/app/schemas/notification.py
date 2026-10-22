from datetime import date, datetime

from pydantic import BaseModel


class NotificationUpdate(BaseModel):
    read: bool = True


class NotificationResponse(BaseModel):
    id: int
    executor_id: int
    order_id: int | None = None
    kind: str
    title: str
    body: str
    read_at: datetime | None = None
    created_at: datetime
    cancel_reason: str | None = None
    visit_date: date | None = None
    visit_time: str | None = None
    customer_name: str | None = None
    status: str | None = None
