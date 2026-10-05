from fastapi import Depends, FastAPI

from sqlalchemy import select, text

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db

from app.models import User, Executor

from app.schemas.user import UserResponse

from app.schemas.executor import ExecutorResponse


app = FastAPI(
    title="Найти сервис API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Найти сервис API работает"
    }


@app.get("/db-test")
async def db_test(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(text("SELECT 1"))
    value = result.scalar_one()

    return {
        "database": "connected",
        "result": value,
    }


@app.get("/users", response_model=list[UserResponse])
async def get_users(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
    )

    users = result.scalars().all()

    return users


@app.get("/executors", response_model=list[ExecutorResponse])
async def get_executors(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Executor)
    )

    executors = result.scalars().all()

    return executors