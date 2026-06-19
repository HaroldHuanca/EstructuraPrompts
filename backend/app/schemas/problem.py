from pydantic import BaseModel, ConfigDict


class ProblemBase(BaseModel):
    titulo: str
    dificultad: str | None = None
    descripcion: str | None = None
    restricciones: str | None = None


class ProblemCreate(ProblemBase):
    pass


class ProblemUpdate(BaseModel):
    titulo: str | None = None
    dificultad: str | None = None
    descripcion: str | None = None
    restricciones: str | None = None


class ProblemRead(ProblemBase):
    id_problema: int
    model_config = ConfigDict(from_attributes=True)
