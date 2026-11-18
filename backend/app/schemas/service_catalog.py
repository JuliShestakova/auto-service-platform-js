from pydantic import BaseModel


class ServiceCatalogResponse(BaseModel):
    id: int
    category: str
    name: str
    is_featured: bool = False
    image_key: str | None = None

    model_config = {
        "from_attributes": True,
    }
