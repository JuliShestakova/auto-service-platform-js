from sqlalchemy import Float, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Executor(Base):
    __tablename__ = "executors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100))

    rating: Mapped[float] = mapped_column(Float)

    reviews: Mapped[int] = mapped_column()

    price: Mapped[str] = mapped_column(String(100))

    address: Mapped[str] = mapped_column(String(255))

    status: Mapped[str] = mapped_column(String(50))

    hours: Mapped[str] = mapped_column(String(50))

    description: Mapped[str] = mapped_column(String(1000))

    services: Mapped[list] = mapped_column(JSON)