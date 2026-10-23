"""widen staff position for multiple roles

Revision ID: j0e8b4c7d2f6
Revises: i9d7a3b6c1e5
Create Date: 2026-10-23
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "j0e8b4c7d2f6"
down_revision: Union[str, None] = "i9d7a3b6c1e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text(
        "ALTER TABLE staff ALTER COLUMN position TYPE VARCHAR(800)"
    ))


def downgrade() -> None:
    op.execute(sa.text(
        "ALTER TABLE staff ALTER COLUMN position TYPE VARCHAR(100)"
    ))
