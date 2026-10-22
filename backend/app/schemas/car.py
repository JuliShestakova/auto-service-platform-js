from pydantic import BaseModel, Field


class CarCreate(BaseModel):
    brand: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    year: int | None = Field(default=None, ge=1900, le=2100)
    mileage: int | None = Field(default=None, ge=0)
    vin: str | None = Field(default=None, max_length=32)


class CarResponse(BaseModel):
    id: int
    brand: str
    model: str
    year: int | None
    mileage: int | None
    vin: str | None

    model_config = {"from_attributes": True}
