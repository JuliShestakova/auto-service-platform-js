from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str = Field(default="", max_length=2000)


class ReviewResponse(BaseModel):
    id: int
    executor_id: int
    user_id: int
    rating: int
    text: str
    author_name: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
