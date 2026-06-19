from pydantic import BaseModel, ConfigDict


class TechniqueBase(BaseModel):
    nombre: str
    descripcion: str | None = None


class TechniqueCreate(TechniqueBase):
    pass


class TechniqueUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None


class TechniqueRead(TechniqueBase):
    id_tecnica: int
    model_config = ConfigDict(from_attributes=True)
