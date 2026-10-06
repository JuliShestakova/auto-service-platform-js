from app.db.redis import redis_client
from app.auth.jwt import REFRESH_TOKEN_EXPIRE_DAYS


def refresh_token_key(token: str) -> str:
    return f"refresh_token:{token}"


async def save_refresh_token(token: str, user_id: int) -> None:
    key = refresh_token_key(token)

    await redis_client.set(
        key,
        str(user_id),
        ex=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


async def get_refresh_token_user_id(token: str) -> int | None:
    key = refresh_token_key(token)

    value = await redis_client.get(key)

    if value is None:
        return None

    return int(value)


async def delete_refresh_token(token: str) -> None:
    key = refresh_token_key(token)

    await redis_client.delete(key)