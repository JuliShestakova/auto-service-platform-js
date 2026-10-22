"""Add cars, orders and executor profile fields

Revision ID: c3a1f0b9e2d4
Revises: 7ac64baf93f6
Create Date: 2026-10-20 20:55:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "c3a1f0b9e2d4"
down_revision: Union[str, Sequence[str], None] = "7ac64baf93f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS cars (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            brand VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            year INTEGER,
            mileage INTEGER,
            vin VARCHAR(32)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            executor_id INTEGER REFERENCES executors(id) ON DELETE SET NULL,
            car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
            title VARCHAR(200) NOT NULL,
            description VARCHAR(2000) NOT NULL DEFAULT '',
            visit_date DATE,
            visit_time VARCHAR(10),
            status VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    op.execute(
        """
        ALTER TABLE executors
        ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE
        REFERENCES users(id) ON DELETE SET NULL
        """
    )
    op.execute(
        """
        ALTER TABLE executors
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50)
        """
    )
    op.execute(
        """
        ALTER TABLE executors
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION
        """
    )
    op.execute(
        """
        ALTER TABLE executors
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE executors DROP COLUMN IF EXISTS longitude")
    op.execute("ALTER TABLE executors DROP COLUMN IF EXISTS latitude")
    op.execute("ALTER TABLE executors DROP COLUMN IF EXISTS phone")
    op.execute("ALTER TABLE executors DROP COLUMN IF EXISTS user_id")
    op.execute("DROP TABLE IF EXISTS orders")
    op.execute("DROP TABLE IF EXISTS cars")
