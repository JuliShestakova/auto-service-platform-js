from pydantic import BaseModel


class StaffPositionResponse(BaseModel):
    id: int
    name: str
    sort_order: int

    model_config = {"from_attributes": True}


class ServiceAliasResponse(BaseModel):
    id: int
    name: str
    sort_order: int

    model_config = {"from_attributes": True}


class ServiceSearchSynonymResponse(BaseModel):
    id: int
    keys: list[str]
    hint: str
    sort_order: int

    model_config = {"from_attributes": True}


class BookingTimeSlotResponse(BaseModel):
    id: int
    time: str
    sort_order: int

    model_config = {"from_attributes": True}


class ServiceCategoryResponse(BaseModel):
    id: int
    name: str
    short_label: str
    icon: str
    sort_order: int

    model_config = {"from_attributes": True}


class FeaturedServiceResponse(BaseModel):
    id: int
    name: str
    image_key: str
    sort_order: int

    model_config = {"from_attributes": True}
