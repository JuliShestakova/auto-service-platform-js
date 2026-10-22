from pydantic import BaseModel


class ExecutorResponse(BaseModel):
    id: int
    name: str
    rating: float
    reviews: int
    price: str
    address: str
    city: str
    status: str
    hours: str
    description: str
    services: list[list[str]]
    phone: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    model_config = {
        "from_attributes": True
    }