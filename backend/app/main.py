from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import case, func, or_, select, text, update
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
from app.db.schema import ensure_schema
from app.middleware.request_logging import RequestLoggingMiddleware
from app.models import (
    Car,
    Executor,
    Notification,
    Order,
    Review,
    ServiceCatalogItem,
    Staff,
    User,
)
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from app.schemas.car import CarCreate, CarResponse
from app.schemas.executor import ExecutorResponse
from app.schemas.notification import NotificationResponse, NotificationUpdate
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate
from app.schemas.staff import StaffCreate, StaffResponse, StaffUpdate
from app.schemas.profile import ExecutorProfileUpdate, ProfileUpdate
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.service_catalog import ServiceCatalogResponse
from app.schemas.user import UserResponse


@asynccontextmanager
async def lifespan(_app):
    await ensure_schema()
    yield


app = FastAPI(
    title="Найти сервис API",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(RequestLoggingMiddleware)


@app.get("/")
def root():
    return {"message": "Найти сервис API работает"}


@app.get("/db-test")
async def db_test(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(text("SELECT 1"))
    return {"database": "connected", "result": result.scalar_one()}


@app.get("/users", response_model=list[UserResponse])
async def get_users(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User))
    return result.scalars().all()


@app.get("/services", response_model=list[ServiceCatalogResponse])
async def list_service_catalog(
    q: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(ServiceCatalogItem).order_by(
        ServiceCatalogItem.category,
        ServiceCatalogItem.name,
    )
    if q:
        query = query.where(ServiceCatalogItem.name.ilike(f"%{q.strip()}%"))
    result = await db.execute(query)
    return result.scalars().all()


@app.get("/executors", response_model=list[ExecutorResponse])
async def get_executors(
    city: str | None = None,
    pending: bool = False,
    db: AsyncSession = Depends(get_db),
):
    query = select(Executor)
    if not pending:
        query = query.where(Executor.status != "На проверке")
    if city:
        query = query.where(Executor.city == city)
    query = query.order_by(
        case((Executor.user_id.isnot(None), 0), else_=1),
        Executor.rating.desc(),
        Executor.id.desc(),
    )
    result = await db.execute(query)
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
    if result.scalar_one_or_none():
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

    if user.role == "executor":
        shop_city = (data.city or "").strip() or "Краснодар"
        shop_address = (data.address or "").strip() or "Адрес не указан"
        shop_hours = (data.hours or "").strip() or "Уточняется"
        shop_phone = (data.phone or "").strip() or None

        executor = Executor(
            user_id=user.id,
            name=user.name,
            rating=0,
            reviews=0,
            price="по запросу",
            address=shop_address,
            city=shop_city,
            status="На проверке",
            hours=shop_hours,
            description="Профиль автосервиса ещё не заполнен.",
            services=[],
            phone=shop_phone,
        )
        db.add(executor)
        await db.commit()

    return user


@app.post("/auth/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    user = result.scalar_one_or_none()

    if (
        not user
        or not user.password_hash
        or not verify_password(data.password, user.password_hash)
    ):
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


@app.post("/auth/refresh", response_model=TokenResponse)
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

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        await delete_refresh_token(refresh_token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    await delete_refresh_token(refresh_token)

    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    await save_refresh_token(new_refresh_token, user.id)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


@app.post("/auth/logout")
async def logout(data: dict):
    refresh_token = data.get("refresh_token")
    if not isinstance(refresh_token, str) or not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required",
        )

    await delete_refresh_token(refresh_token)
    return {"message": "Logged out successfully"}


@app.get("/auth/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


def _car_label(car: Car | None) -> str:
    if car is None:
        return "Автомобиль не указан"

    parts = [car.brand, car.model]
    if car.year:
        parts.append(str(car.year))
    return " ".join(part for part in parts if part)


def _order_response(
    order: Order,
    customer: User,
    executor: Executor | None,
    car: Car | None,
    staff: Staff | None = None,
) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        title=order.title,
        description=order.description,
        status=order.status,
        cancel_reason=order.cancel_reason,
        cancel_ack_at=order.cancel_ack_at,
        visit_date=order.visit_date,
        visit_time=order.visit_time,
        customer_id=order.customer_id,
        customer_name=(
            customer.name if customer and customer.name else None
        ) or order.guest_name or "Клиент",
        executor_id=executor.id if executor else None,
        executor_name=executor.name if executor else None,
        executor_rating=executor.rating if executor else None,
        staff_id=staff.id if staff else None,
        staff_name=staff.name if staff else None,
        staff_position=staff.position if staff else None,
        car_id=car.id if car else None,
        car_label=_car_label(car),
        created_at=order.created_at,
    )


def _visit_label(order: Order) -> str:
    parts = []
    if order.visit_date:
        parts.append(order.visit_date.isoformat())
    if order.visit_time:
        parts.append(order.visit_time)
    return " ".join(parts) if parts else "дата не указана"


def _order_customer_name(order: Order, customer: User | None) -> str:
    if customer and customer.name:
        return customer.name
    return order.guest_name or "Клиент"


def _add_notification(
    db: AsyncSession,
    *,
    executor_id: int,
    kind: str,
    title: str,
    body: str,
    order: Order | None = None,
) -> None:
    db.add(
        Notification(
            executor_id=executor_id,
            order_id=order.id if order is not None else None,
            kind=kind,
            title=title,
            body=body,
            created_at=datetime.now(timezone.utc),
        )
    )


def _notification_response(
    item: Notification,
    order: Order | None,
    customer: User | None,
) -> NotificationResponse:
    return NotificationResponse(
        id=item.id,
        executor_id=item.executor_id,
        order_id=item.order_id,
        kind=item.kind,
        title=item.title,
        body=item.body,
        read_at=item.read_at,
        created_at=item.created_at,
        cancel_reason=order.cancel_reason if order else None,
        visit_date=order.visit_date if order else None,
        visit_time=order.visit_time if order else None,
        customer_name=_order_customer_name(order, customer) if order else None,
        status=order.status if order else None,
    )


async def _staff_by_id(db: AsyncSession, staff_id: int | None) -> Staff | None:
    if staff_id is None:
        return None
    result = await db.execute(select(Staff).where(Staff.id == staff_id))
    return result.scalar_one_or_none()


async def _staff_slot_taken(
    db: AsyncSession,
    *,
    executor_id: int,
    staff_id: int,
    visit_date,
    visit_time: str,
    exclude_order_id: int | None = None,
) -> bool:
    stmt = select(Order.id).where(
        Order.executor_id == executor_id,
        Order.staff_id == staff_id,
        Order.visit_date == visit_date,
        Order.visit_time == visit_time,
        Order.status != "Отменён",
    )
    if exclude_order_id is not None:
        stmt = stmt.where(Order.id != exclude_order_id)
    result = await db.execute(stmt.limit(1))
    return result.scalar_one_or_none() is not None


def _staff_response(item: Staff) -> StaffResponse:
    return StaffResponse(
        id=item.id,
        executor_id=item.executor_id,
        name=item.name,
        position=item.position,
        phone=item.phone,
    )


async def _executor_for_user(
    db: AsyncSession,
    user: User,
) -> Executor | None:
    result = await db.execute(
        select(Executor).where(Executor.user_id == user.id)
    )
    return result.scalar_one_or_none()


@app.patch("/auth/me", response_model=UserResponse)
async def update_me(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.new_password:
        if (
            not data.current_password
            or not current_user.password_hash
            or not verify_password(
                data.current_password,
                current_user.password_hash,
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Текущий пароль указан неверно",
            )
        current_user.password_hash = hash_password(data.new_password)

    if data.email and data.email != current_user.email:
        existing = await db.execute(
            select(User).where(User.email == data.email)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже есть",
            )
        current_user.email = str(data.email)

    if data.name:
        current_user.name = data.name.strip()

    if data.address is not None:
        current_user.address = data.address.strip() or None
    if data.latitude is not None:
        current_user.latitude = data.latitude
    if data.longitude is not None:
        current_user.longitude = data.longitude

    await db.commit()
    await db.refresh(current_user)
    return current_user


@app.get("/cars", response_model=list[CarResponse])
async def get_cars(
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Car)
        .where(Car.user_id == current_user.id)
        .order_by(Car.id)
    )
    return result.scalars().all()


@app.post(
    "/cars",
    response_model=CarResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_car(
    data: CarCreate,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db),
):
    car = Car(
        user_id=current_user.id,
        brand=data.brand.strip(),
        model=data.model.strip(),
        year=data.year,
        mileage=data.mileage,
        vin=data.vin.strip() if data.vin else None,
    )
    db.add(car)
    await db.commit()
    await db.refresh(car)
    return car


@app.delete("/cars/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car(
    car_id: int,
    current_user: User = Depends(require_role("customer")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Car).where(
            Car.id == car_id,
            Car.user_id == current_user.id,
        )
    )
    car = result.scalar_one_or_none()
    if car is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Автомобиль не найден",
        )

    await db.delete(car)
    await db.commit()


@app.get("/orders", response_model=list[OrderResponse])
async def get_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order, User, Executor, Car, Staff).outerjoin(
        User,
        User.id == Order.customer_id,
    ).outerjoin(
        Executor,
        Executor.id == Order.executor_id,
    ).outerjoin(
        Car,
        Car.id == Order.car_id,
    ).outerjoin(
        Staff,
        Staff.id == Order.staff_id,
    )

    if current_user.role == "customer":
        query = query.where(Order.customer_id == current_user.id)
    elif current_user.role == "executor":
        executor = await _executor_for_user(db, current_user)
        if executor is None:
            return []
        query = query.where(
            or_(
                Order.executor_id == executor.id,
                (Order.executor_id.is_(None))
                & (Order.status == "Поиск исполнителя"),
            )
        )
    elif current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для выполнения этого действия",
        )

    result = await db.execute(query.order_by(Order.id.desc()))
    return [
        _order_response(order, customer, executor, car, staff)
        for order, customer, executor, car, staff in result.all()
    ]


@app.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role not in {"customer", "executor"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для создания записи",
        )

    car = None
    executor = None
    staff = None
    guest_name = None
    customer = current_user if current_user.role == "customer" else None

    if current_user.role == "customer":
        if data.car_id is not None:
            car_result = await db.execute(
                select(Car).where(
                    Car.id == data.car_id,
                    Car.user_id == current_user.id,
                )
            )
            car = car_result.scalar_one_or_none()
            if car is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Автомобиль не найден",
                )
        if data.executor_id is not None:
            executor_result = await db.execute(
                select(Executor).where(Executor.id == data.executor_id)
            )
            executor = executor_result.scalar_one_or_none()
            if executor is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Автосервис не найден",
                )
        status_value = (
            "Ожидает подтверждения"
            if executor is not None
            else "Поиск исполнителя"
        )
    else:
        executor = await _executor_for_user(db, current_user)
        if executor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль автосервиса не найден",
            )
        guest_name = (data.guest_name or "").strip()
        if not guest_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Укажите имя клиента",
            )
        if not data.visit_date or not data.visit_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Укажите дату и время",
            )
        if data.staff_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Назначьте сотрудника",
            )
        staff = await _staff_by_id(db, data.staff_id)
        if staff is None or staff.executor_id != executor.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Сотрудник не найден",
            )
        if await _staff_slot_taken(
            db,
            executor_id=executor.id,
            staff_id=staff.id,
            visit_date=data.visit_date,
            visit_time=data.visit_time,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Этот мастер уже занят в выбранное время. Выберите другого.",
            )
        status_value = "Запланирован"

    order = Order(
        customer_id=customer.id if customer else None,
        executor_id=executor.id if executor else None,
        car_id=car.id if car else None,
        staff_id=staff.id if staff else None,
        guest_name=guest_name,
        title=data.title.strip(),
        description=data.description.strip(),
        visit_date=data.visit_date,
        visit_time=data.visit_time,
        status=status_value,
        created_at=datetime.now(timezone.utc),
    )
    db.add(order)
    await db.flush()
    if current_user.role == "customer" and executor is not None:
        _add_notification(
            db,
            executor_id=executor.id,
            order=order,
            kind="new_booking",
            title="Новая запись",
            body=(
                f"{_order_customer_name(order, current_user)} записался на "
                f"«{order.title}» ({_visit_label(order)})."
            ),
        )
    await db.commit()
    await db.refresh(order)
    return _order_response(order, customer, executor, car, staff)


@app.patch("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    data: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заказ не найден",
        )

    allowed_statuses = {
        "Поиск исполнителя",
        "Ожидает подтверждения",
        "Запланирован",
        "В работе",
        "Завершён",
        "Отменён",
    }

    if current_user.role == "executor":
        executor = await _executor_for_user(db, current_user)
        if executor is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Профиль автосервиса не найден",
            )
        if data.accept:
            if order.executor_id not in (None, executor.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Заказ уже взят другим автосервисом",
                )
            order.executor_id = executor.id
            if order.status == "Поиск исполнителя":
                order.status = "Ожидает подтверждения"
        elif data.ack_cancel:
            if order.executor_id != executor.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Этот заказ вам не назначен",
                )
            if order.status != "Отменён":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Подтвердить можно только отмену записи",
                )
            order.cancel_ack_at = datetime.now(timezone.utc)
            await db.execute(
                update(Notification)
                .where(
                    Notification.executor_id == executor.id,
                    Notification.order_id == order.id,
                    Notification.kind == "cancelled",
                    Notification.read_at.is_(None),
                )
                .values(read_at=datetime.now(timezone.utc))
            )
        elif order.executor_id != executor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Этот заказ вам не назначен",
            )

        if data.confirm:
            if order.status != "Ожидает подтверждения":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Подтвердить можно только заявку в ожидании",
                )
            if data.staff_id is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Назначьте сотрудника, который выполнит работу",
                )
            staff = await _staff_by_id(db, data.staff_id)
            if staff is None or staff.executor_id != executor.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Сотрудник не найден",
                )
            if order.visit_date and order.visit_time and await _staff_slot_taken(
                db,
                executor_id=executor.id,
                staff_id=staff.id,
                visit_date=order.visit_date,
                visit_time=order.visit_time,
                exclude_order_id=order.id,
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Этот мастер уже занят в выбранное время. Выберите другого.",
                )
            order.staff_id = staff.id
            order.status = "Запланирован"
        elif data.status:
            if data.status not in allowed_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Неизвестный статус заказа",
                )
            if data.status == "Отменён":
                reason = (data.cancel_reason or "").strip()
                if not reason:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Укажите причину отмены",
                    )
                order.cancel_reason = reason
                order.cancel_ack_at = datetime.now(timezone.utc)
            order.status = data.status
    elif current_user.role == "admin":
        if data.status:
            if data.status not in allowed_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Неизвестный статус заказа",
                )
            order.status = data.status
            if data.status == "Отменён" and data.cancel_reason:
                order.cancel_reason = data.cancel_reason.strip()
            if data.status == "Отменён" and order.executor_id:
                _add_notification(
                    db,
                    executor_id=order.executor_id,
                    order=order,
                    kind="cancelled",
                    title="Отмена записи",
                    body=(
                        f"Запись «{order.title}» отменена администратором"
                        f" ({_visit_label(order)})."
                        + (
                            f" Причина: {order.cancel_reason}"
                            if order.cancel_reason
                            else ""
                        )
                    ),
                )
    elif current_user.role == "customer":
        if order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Это не ваш заказ",
            )
        if data.status != "Отменён":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Клиент может только отменить заказ",
            )
        if order.status in {"Завершён", "Отменён"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Этот заказ уже нельзя отменить",
            )
        reason = (data.cancel_reason or "").strip()
        if not reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Укажите причину отмены",
            )
        order.cancel_reason = reason
        order.status = "Отменён"
        order.cancel_ack_at = None
        if order.executor_id:
            _add_notification(
                db,
                executor_id=order.executor_id,
                order=order,
                kind="cancelled",
                title="Отмена записи",
                body=(
                    f"{current_user.name or 'Клиент'} отменил(а) «{order.title}»"
                    f" ({_visit_label(order)}). Причина: {reason}"
                ),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для выполнения этого действия",
        )

    await db.commit()
    await db.refresh(order)

    customer = None
    if order.customer_id is not None:
        customer_result = await db.execute(
            select(User).where(User.id == order.customer_id)
        )
        customer = customer_result.scalar_one_or_none()
    executor = None
    if order.executor_id is not None:
        executor_result = await db.execute(
            select(Executor).where(Executor.id == order.executor_id)
        )
        executor = executor_result.scalar_one_or_none()
    car = None
    if order.car_id is not None:
        car_result = await db.execute(
            select(Car).where(Car.id == order.car_id)
        )
        car = car_result.scalar_one_or_none()
    staff = await _staff_by_id(db, order.staff_id)

    return _order_response(order, customer, executor, car, staff)


async def _backfill_executor_notices(db: AsyncSession, executor_id: int) -> None:
    rows = (
        await db.execute(
            select(Order, User)
            .outerjoin(User, User.id == Order.customer_id)
            .where(
                Order.executor_id == executor_id,
                or_(
                    (Order.status == "Отменён") & Order.cancel_ack_at.is_(None),
                    Order.status == "Ожидает подтверждения",
                ),
            )
        )
    ).all()
    if not rows:
        return
    existing = (
        await db.execute(
            select(Notification.order_id, Notification.kind).where(
                Notification.executor_id == executor_id,
                Notification.order_id.in_([order.id for order, _ in rows]),
            )
        )
    ).all()
    have = {(order_id, kind) for order_id, kind in existing}
    created = False
    for order, customer in rows:
        name = _order_customer_name(order, customer)
        if order.status == "Отменён" and (order.id, "cancelled") not in have:
            reason = order.cancel_reason or "не указана"
            _add_notification(
                db,
                executor_id=executor_id,
                order=order,
                kind="cancelled",
                title="Отмена записи",
                body=(
                    f"{name} отменил(а) «{order.title}» ({_visit_label(order)})."
                    f" Причина: {reason}"
                ),
            )
            created = True
        elif (
            order.status == "Ожидает подтверждения"
            and (order.id, "new_booking") not in have
        ):
            _add_notification(
                db,
                executor_id=executor_id,
                order=order,
                kind="new_booking",
                title="Новая запись",
                body=(
                    f"{name} записался на «{order.title}» ({_visit_label(order)})."
                ),
            )
            created = True
    if created:
        await db.commit()


@app.get("/notifications", response_model=list[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        return []
    await _backfill_executor_notices(db, executor.id)
    result = await db.execute(
        select(Notification, Order, User)
        .outerjoin(Order, Order.id == Notification.order_id)
        .outerjoin(User, User.id == Order.customer_id)
        .where(Notification.executor_id == executor.id)
        .order_by(Notification.id.desc())
        .limit(80)
    )
    return [
        _notification_response(item, order, customer)
        for item, order, customer in result.all()
    ]


@app.patch("/notifications/{notice_id}", response_model=NotificationResponse)
async def update_notification(
    notice_id: int,
    data: NotificationUpdate,
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль автосервиса не найден",
        )
    result = await db.execute(
        select(Notification).where(
            Notification.id == notice_id,
            Notification.executor_id == executor.id,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Уведомление не найдено",
        )
    if data.read and item.read_at is None:
        item.read_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(item)
    order = None
    customer = None
    if item.order_id is not None:
        order_result = await db.execute(select(Order).where(Order.id == item.order_id))
        order = order_result.scalar_one_or_none()
        if order and order.customer_id is not None:
            customer_result = await db.execute(
                select(User).where(User.id == order.customer_id)
            )
            customer = customer_result.scalar_one_or_none()
    return _notification_response(item, order, customer)


@app.get("/executors/me", response_model=ExecutorResponse)
async def get_my_executor(
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        executor = Executor(
            user_id=current_user.id,
            name=current_user.name,
            rating=0,
            reviews=0,
            price="по запросу",
            address="Адрес не указан",
            city="Краснодар",
            status="На проверке",
            hours="Уточняется",
            description="Профиль автосервиса ещё не заполнен.",
            services=[],
        )
        db.add(executor)
        await db.commit()
        await db.refresh(executor)
    if executor.name and current_user.name != executor.name:
        current_user.name = executor.name
        await db.commit()
    return executor


@app.patch("/executors/me", response_model=ExecutorResponse)
async def update_my_executor(
    data: ExecutorProfileUpdate,
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль автосервиса не найден",
        )

    for field in (
        "name",
        "phone",
        "address",
        "city",
        "hours",
        "description",
        "status",
        "services",
    ):
        value = getattr(data, field)
        if value is not None:
            setattr(executor, field, value)

    if data.name:
        current_user.name = data.name.strip()

    await db.commit()
    await db.refresh(executor)
    return executor


@app.get("/staff", response_model=list[StaffResponse])
async def get_staff(
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        return []
    result = await db.execute(
        select(Staff).where(Staff.executor_id == executor.id).order_by(Staff.id)
    )
    return [_staff_response(item) for item in result.scalars().all()]


@app.post("/staff", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
    data: StaffCreate,
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль автосервиса не найден",
        )
    item = Staff(
        executor_id=executor.id,
        name=data.name.strip(),
        position=(data.position or "Мастер").strip() or "Мастер",
        phone=(data.phone or "").strip() or None,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _staff_response(item)


@app.patch("/staff/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: int,
    data: StaffUpdate,
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль автосервиса не найден",
        )
    result = await db.execute(
        select(Staff).where(Staff.id == staff_id, Staff.executor_id == executor.id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сотрудник не найден",
        )
    if data.name is not None:
        item.name = data.name.strip()
    if data.position is not None:
        item.position = data.position.strip() or "Мастер"
    if data.phone is not None:
        item.phone = data.phone.strip() or None
    await db.commit()
    await db.refresh(item)
    return _staff_response(item)


@app.delete("/staff/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    staff_id: int,
    current_user: User = Depends(require_role("executor")),
    db: AsyncSession = Depends(get_db),
):
    executor = await _executor_for_user(db, current_user)
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль автосервиса не найден",
        )
    result = await db.execute(
        select(Staff).where(Staff.id == staff_id, Staff.executor_id == executor.id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сотрудник не найден",
        )
    await db.delete(item)
    await db.commit()


@app.get("/executors/{executor_id}", response_model=ExecutorResponse)
async def get_executor(
    executor_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Executor).where(Executor.id == executor_id)
    )
    executor = result.scalar_one_or_none()
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Автосервис не найден",
        )
    return executor


async def _recalc_executor_rating(
    db: AsyncSession,
    executor: Executor,
) -> None:
    stats = await db.execute(
        select(
            func.count(Review.id),
            func.coalesce(func.avg(Review.rating), 0.0),
        ).where(Review.executor_id == executor.id)
    )
    count, avg_rating = stats.one()
    executor.reviews = int(count or 0)
    executor.rating = round(float(avg_rating or 0), 1)


@app.get(
    "/executors/{executor_id}/reviews",
    response_model=list[ReviewResponse],
)
async def list_executor_reviews(
    executor_id: int,
    db: AsyncSession = Depends(get_db),
):
    executor = await db.execute(
        select(Executor.id).where(Executor.id == executor_id)
    )
    if executor.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Автосервис не найден",
        )

    result = await db.execute(
        select(Review)
        .where(Review.executor_id == executor_id)
        .order_by(Review.created_at.desc())
    )
    return result.scalars().all()


@app.get(
    "/reviews/me",
    response_model=list[ReviewResponse],
)
async def list_my_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Review)
        .where(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
    )
    return result.scalars().all()


@app.post(
    "/executors/{executor_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_executor_review(
    executor_id: int,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Отзывы могут оставлять только клиенты",
        )

    result = await db.execute(
        select(Executor).where(Executor.id == executor_id)
    )
    executor = result.scalar_one_or_none()
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Автосервис не найден",
        )

    existing = await db.execute(
        select(Review).where(
            Review.executor_id == executor_id,
            Review.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже оставляли отзыв об этом сервисе",
        )

    author_name = (
        current_user.name
        or current_user.email.split("@")[0]
    )
    review = Review(
        executor_id=executor_id,
        user_id=current_user.id,
        rating=data.rating,
        text=(data.text or "").strip(),
        author_name=author_name,
    )
    db.add(review)
    await db.flush()
    await _recalc_executor_rating(db, executor)
    snippet = review.text.strip()
    if len(snippet) > 160:
        snippet = f"{snippet[:157]}..."
    _add_notification(
        db,
        executor_id=executor.id,
        kind="new_review",
        title="Новый отзыв",
        body=(
            f"{author_name} оценил(а) сервис на {data.rating} из 5"
            + (f": «{snippet}»" if snippet else ".")
        ),
    )
    await db.commit()
    await db.refresh(review)
    return review


@app.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отзыв не найден",
        )
    if current_user.role != "admin" and review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можно удалить только свой отзыв",
        )

    executor_id = review.executor_id
    await db.delete(review)
    executor_result = await db.execute(
        select(Executor).where(Executor.id == executor_id)
    )
    executor = executor_result.scalar_one_or_none()
    if executor is not None:
        await _recalc_executor_rating(db, executor)
    await db.commit()


@app.patch(
    "/executors/{executor_id}",
    response_model=ExecutorResponse,
)
async def update_executor(
    executor_id: int,
    data: ExecutorProfileUpdate,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Executor).where(Executor.id == executor_id)
    )
    executor = result.scalar_one_or_none()
    if executor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Автосервис не найден",
        )

    for field in (
        "name",
        "phone",
        "address",
        "hours",
        "description",
        "status",
        "services",
    ):
        value = getattr(data, field)
        if value is not None:
            setattr(executor, field, value)

    await db.commit()
    await db.refresh(executor)
    return executor
