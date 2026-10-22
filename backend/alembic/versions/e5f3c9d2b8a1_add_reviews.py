"""add reviews table

Revision ID: e5f3c9d2b8a1
Revises: d4e2b8c1a7f0
Create Date: 2026-10-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f3c9d2b8a1"
down_revision: Union[str, None] = "d4e2b8c1a7f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                executor_id INTEGER NOT NULL
                    REFERENCES executors(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL
                    CHECK (rating >= 1 AND rating <= 5),
                text TEXT NOT NULL DEFAULT '',
                author_name VARCHAR(100) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
    )
    op.execute(
        sa.text(
            "CREATE INDEX IF NOT EXISTS ix_reviews_executor_id "
            "ON reviews (executor_id)"
        )
    )
    op.execute(
        sa.text(
            "CREATE INDEX IF NOT EXISTS ix_reviews_user_id "
            "ON reviews (user_id)"
        )
    )


def downgrade() -> None:
    op.drop_table("reviews")
