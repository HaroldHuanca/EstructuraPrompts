from pydantic import BaseModel, ConfigDict


class ExecutionTestBase(BaseModel):
    id_experimento: int
    id_caso_prueba: int
    prueba_superada: bool
    tiempo_ejecucion: float | None = None
    mensaje_error: str | None = None


class ExecutionTestCreate(ExecutionTestBase):
    pass


class ExecutionTestUpdate(BaseModel):
    id_experimento: int | None = None
    id_caso_prueba: int | None = None
    prueba_superada: bool | None = None
    tiempo_ejecucion: float | None = None
    mensaje_error: str | None = None


class ExecutionTestRead(ExecutionTestBase):
    id_ejecucion_prueba: int
    model_config = ConfigDict(from_attributes=True)
