from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.db.database import get_db


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