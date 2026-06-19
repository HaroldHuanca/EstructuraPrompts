from pydantic import BaseModel, ConfigDict


class CaseTestBase(BaseModel):
    id_problema: int
    datos_entrada: dict
    salida_esperada: dict
    descripcion: str | None = None


class CaseTestCreate(CaseTestBase):
    pass


class CaseTestUpdate(BaseModel):
    id_problema: int | None = None
    datos_entrada: dict | None = None
    salida_esperada: dict | None = None
    descripcion: str | None = None


class CaseTestRead(CaseTestBase):
    id_caso_prueba: int
    model_config = ConfigDict(from_attributes=True)
