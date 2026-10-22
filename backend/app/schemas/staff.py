from pydantic import BaseModel, Field


class StaffCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    position: str = Field(default="Мастер", max_length=100)
    phone: str | None = Field(default=None, max_length=50)


class StaffUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    position: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=50)


class StaffResponse(BaseModel):
    id: int
    executor_id: int
    name: str
    position: str
    phone: str | None = None
