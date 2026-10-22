"""add notifications and order cancel_ack_at

Revision ID: i9d7a3b6c1e5
Revises: h8c6f2a5d1e4
Create Date: 2026-10-22
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "i9d7a3b6c1e5"
down_revision: Union[str, None] = "h8c6f2a5d1e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text(
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_ack_at TIMESTAMPTZ"
    ))
    op.execute(sa.text(
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            executor_id INTEGER NOT NULL
                REFERENCES executors(id) ON DELETE CASCADE,
            order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
            kind VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            body TEXT NOT NULL DEFAULT '',
            read_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    ))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_notifications_executor_id "
        "ON notifications (executor_id)"
    ))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_notifications_order_id "
        "ON notifications (order_id)"
    ))


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS notifications"))
    op.execute(sa.text("ALTER TABLE orders DROP COLUMN IF EXISTS cancel_ack_at"))
