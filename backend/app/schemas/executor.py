from pydantic import BaseModel


class ExecutorResponse(BaseModel):
    id: int
    name: str
    rating: float
    reviews: int
    price: str
    address: str
    status: str
    hours: str
    description: str
    services: list[list[str]]

    model_config = {
        "from_attributes": True
    }