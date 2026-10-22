"""add order guest_name and nullable customer

Revision ID: h8c6f2a5d1e4
Revises: g7b5e1f4d0c3
Create Date: 2026-10-22
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "h8c6f2a5d1e4"
down_revision: Union[str, None] = "g7b5e1f4d0c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100)"))
    op.execute(sa.text("ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL"))


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE orders DROP COLUMN IF EXISTS guest_name"))
