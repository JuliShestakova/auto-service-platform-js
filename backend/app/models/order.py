from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )
    guest_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    executor_id: Mapped[int | None] = mapped_column(
        ForeignKey("executors.id"),
        nullable=True,
    )
    car_id: Mapped[int | None] = mapped_column(
        ForeignKey("cars.id"),
        nullable=True,
    )
    staff_id: Mapped[int | None] = mapped_column(
        ForeignKey("staff.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(2000), default="")
    visit_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    visit_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[str] = mapped_column(String(50))
    cancel_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cancel_ack_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
