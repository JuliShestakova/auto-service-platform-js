from pydantic import BaseModel


class CityResponse(BaseModel):
    id: int
    name: str
    name_genitive: str = ""
    latitude: float
    longitude: float
    is_default: bool = False

    model_config = {
        "from_attributes": True,
    }
