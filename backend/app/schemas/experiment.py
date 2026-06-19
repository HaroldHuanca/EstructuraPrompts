from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ExperimentCreate(BaseModel):
    id_problema: int
    id_tecnica: int


class ExperimentUpdate(BaseModel):
    id_problema: int | None = None
    id_tecnica: int | None = None
    prompt_generado: str | None = None
    codigo_generado: str | None = None


class ExperimentRead(BaseModel):
    id_experimento: int
    id_problema: int
    id_tecnica: int
    prompt_generado: str
    codigo_generado: str
    fecha_ejecucion: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class ExperimentExecution(BaseModel):
    problem_id: int
    technique_id: int
