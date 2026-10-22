from sqlalchemy import text

from app.db.database import engine


SCHEMA_STATEMENTS = (
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
    """,
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
        cancel_reason VARCHAR(500),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(500)
    """,
    """
    ALTER TABLE executors
    ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE
    REFERENCES users(id) ON DELETE SET NULL
    """,
    """
    ALTER TABLE executors
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50)
    """,
    """
    ALTER TABLE executors
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION
    """,
    """
    ALTER TABLE executors
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION
    """,
    """
    ALTER TABLE executors
    ADD COLUMN IF NOT EXISTS city VARCHAR(100) NOT NULL DEFAULT 'Краснодар'
    """,
    """
    CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        executor_id INTEGER NOT NULL REFERENCES executors(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        text TEXT NOT NULL DEFAULT '',
        author_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_reviews_executor_id ON reviews (executor_id)
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_reviews_user_id ON reviews (user_id)
    """,
    """
    CREATE TABLE IF NOT EXISTS service_catalog (
        id SERIAL PRIMARY KEY,
        category VARCHAR(120) NOT NULL,
        name VARCHAR(200) NOT NULL UNIQUE
    )
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_service_catalog_category
    ON service_catalog (category)
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_service_catalog_name
    ON service_catalog (name)
    """,
    """
    CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        executor_id INTEGER NOT NULL
            REFERENCES executors(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL DEFAULT 'Мастер',
        phone VARCHAR(50)
    )
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_staff_executor_id ON staff (executor_id)
    """,
    """
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS staff_id INTEGER
    REFERENCES staff(id) ON DELETE SET NULL
    """,
    """
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100)
    """,
    """
    ALTER TABLE orders
    ALTER COLUMN customer_id DROP NOT NULL
    """,
    """
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS cancel_ack_at TIMESTAMPTZ
    """,
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
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_notifications_executor_id
    ON notifications (executor_id)
    """,
    """
    CREATE INDEX IF NOT EXISTS ix_notifications_order_id
    ON notifications (order_id)
    """,
    """
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS address VARCHAR(255)
    """,
    """
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION
    """,
    """
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION
    """,
)


async def ensure_schema() -> None:
    async with engine.begin() as connection:
        for statement in SCHEMA_STATEMENTS:
            await connection.execute(text(statement))
