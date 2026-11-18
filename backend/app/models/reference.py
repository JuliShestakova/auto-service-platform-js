from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class StaffPosition(Base):
    __tablename__ = "staff_positions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ServiceAlias(Base):
    __tablename__ = "service_aliases"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ServiceSearchSynonym(Base):
    __tablename__ = "service_search_synonyms"

    id: Mapped[int] = mapped_column(primary_key=True)
    keys: Mapped[list] = mapped_column(JSONB)
    hint: Mapped[str] = mapped_column(String(200))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class BookingTimeSlot(Base):
    __tablename__ = "booking_time_slots"

    id: Mapped[int] = mapped_column(primary_key=True)
    time: Mapped[str] = mapped_column(String(5), unique=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    short_label: Mapped[str] = mapped_column(String(80))
    icon: Mapped[str] = mapped_column(String(40), default="more")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class FeaturedService(Base):
    __tablename__ = "featured_services"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    image_key: Mapped[str] = mapped_column(String(80))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
