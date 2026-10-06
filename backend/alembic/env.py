from logging.config import fileConfig
import os

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.db.database import Base
from app.models import User, Executor


config = context.config


if config.config_file_name is not None:
    fileConfig(config.config_file_name)


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""

    url = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@db:5432/find_service",
    )

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    configuration = config.get_section(config.config_ini_section)

    configuration["sqlalchemy.url"] = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@db:5432/find_service",
    )

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async def run_async_migrations():
        async with connectable.connect() as connection:
            await connection.run_sync(
                lambda sync_connection: context.configure(
                    connection=sync_connection,
                    target_metadata=target_metadata,
                )
            )

            async with connection.begin():
                await connection.run_sync(
                    lambda sync_connection: context.run_migrations()
                )

    import asyncio

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()