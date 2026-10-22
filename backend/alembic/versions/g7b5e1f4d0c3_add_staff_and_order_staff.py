"""add staff and order staff_id

Revision ID: g7b5e1f4d0c3
Revises: f6a4d0e3c9b2
Create Date: 2026-10-22
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "g7b5e1f4d0c3"
down_revision: Union[str, None] = "f6a4d0e3c9b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            CREATE TABLE IF NOT EXISTS staff (
                id SERIAL PRIMARY KEY,
                executor_id INTEGER NOT NULL
                    REFERENCES executors(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                position VARCHAR(100) NOT NULL DEFAULT 'Мастер',
                phone VARCHAR(50)
            )
            """
        )
    )
    op.execute(
        sa.text("CREATE INDEX IF NOT EXISTS ix_staff_executor_id ON staff (executor_id)")
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS staff_id INTEGER
            REFERENCES staff(id) ON DELETE SET NULL
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE orders DROP COLUMN IF EXISTS staff_id"))
    op.execute(sa.text("DROP TABLE IF EXISTS staff"))
