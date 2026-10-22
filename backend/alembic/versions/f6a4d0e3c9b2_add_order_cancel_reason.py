"""add order cancel_reason

Revision ID: f6a4d0e3c9b2
Revises: e5f3c9d2b8a1
Create Date: 2026-10-22
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f6a4d0e3c9b2"
down_revision: Union[str, None] = "e5f3c9d2b8a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(500)
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE orders DROP COLUMN IF EXISTS cancel_reason"))
