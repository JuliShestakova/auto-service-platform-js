"""add executor city

Revision ID: d4e2b8c1a7f0
Revises: c3a1f0b9e2d4
Create Date: 2026-10-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e2b8c1a7f0"
down_revision: Union[str, None] = "c3a1f0b9e2d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            "ALTER TABLE executors "
            "ADD COLUMN IF NOT EXISTS city VARCHAR(100) "
            "NOT NULL DEFAULT 'Краснодар'"
        )
    )


def downgrade() -> None:
    op.drop_column("executors", "city")
