from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    executor_id: Mapped[int] = mapped_column(
        ForeignKey("executors.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100))
    position: Mapped[str] = mapped_column(String(800), default="Мастер")
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
