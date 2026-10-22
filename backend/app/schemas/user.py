from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    model_config = {
        "from_attributes": True
    }