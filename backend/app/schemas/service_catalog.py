from pydantic import BaseModel


class ServiceCatalogResponse(BaseModel):
    id: int
    category: str
    name: str

    model_config = {
        "from_attributes": True,
    }
