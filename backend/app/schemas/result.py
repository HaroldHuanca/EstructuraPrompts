from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResultBase(BaseModel):
    exactitud_funcional: float | None = None
    maintainability_index: float | None = None
    complejidad: int | None = None
    cognitive_complexity: int | None = None
    code_smells: int | None = None


class ResultCreate(ResultBase):
    id_experimento: int


class ResultUpdate(ResultBase):
    pass


class ResultRead(ResultBase):
    id_resultado: int
    id_experimento: int
    fecha_registro: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
