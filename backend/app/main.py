
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from jwt.exceptions import InvalidTokenError

from app.auth.dependencies import get_current_user
from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.auth.refresh_tokens import (
    delete_refresh_token,
    get_refresh_token_user_id,
    save_refresh_token,
)
from app.auth.roles import require_role
from app.auth.security import hash_password, verify_password
from app.db.database import get_db
from app.middleware.request_logging import RequestLoggingMiddleware
from app.models import Executor, User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from app.schemas.executor import ExecutorResponse
from app.schemas.user import UserResponse


app = FastAPI(
    title="Найти сервис API",
    version="1.0.0",
)

# Middleware для логирования HTTP-запросов и времени ответа.
app.add_middleware(RequestLoggingMiddleware)


@app.get("/")
def root():
    return {"message": "Найти сервис API работает"}


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


@app.get(
    "/users",
    response_model=list[UserResponse],
)
async def get_users(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User))
    return result.scalars().all()


@app.get(
    "/executors",
    response_model=list[ExecutorResponse],
)
async def get_executors(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Executor))
    return result.scalars().all()


@app.post(
    "/auth/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@app.post(
    "/auth/login",
    response_model=TokenResponse,
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    await save_refresh_token(refresh_token, user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@app.post(
    "/auth/refresh",
    response_model=TokenResponse,
)
async def refresh_tokens(
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    refresh_token = data.get("refresh_token")

    if not isinstance(refresh_token, str) or not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is required",
        )

    try:
        payload = decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token type",
            )

        user_id = int(payload["sub"])

    except HTTPException:
        raise
    except (InvalidTokenError, ValueError, TypeError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        ) from None

    stored_user_id = await get_refresh_token_user_id(refresh_token)

    if stored_user_id is None or stored_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or revoked",
        )

    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        await delete_refresh_token(refresh_token)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Отзываем старый refresh-токен перед выдачей нового.
    await delete_refresh_token(refresh_token)

    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)

    await save_refresh_token(new_refresh_token, user.id)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


@app.post("/auth/logout")
async def logout(
    data: dict,
):
    refresh_token = data.get("refresh_token")

    if not isinstance(refresh_token, str) or not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required",
        )

    # Удаление из Redis делает refresh-токен недействительным.
    await delete_refresh_token(refresh_token)

    return {"message": "Logged out successfully"}


@app.get(
    "/auth/me",
    response_model=UserResponse,
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
