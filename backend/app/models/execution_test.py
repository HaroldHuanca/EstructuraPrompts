from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ExecutionTest(Base):
    __tablename__ = "ejecuciones_prueba"

    id_ejecucion_prueba: Mapped[int] = mapped_column(primary_key=True, index=True)
    id_experimento: Mapped[int] = mapped_column(ForeignKey("experimentos.id_experimento", ondelete="CASCADE"), nullable=False)
    id_caso_prueba: Mapped[int] = mapped_column(ForeignKey("casos_prueba.id_caso_prueba", ondelete="CASCADE"), nullable=False)
    prueba_superada: Mapped[bool] = mapped_column(Boolean, nullable=False)
    tiempo_ejecucion: Mapped[float | None] = mapped_column(Numeric(10, 4), nullable=True)
    mensaje_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    experimento = relationship("Experiment", back_populates="ejecuciones_prueba")
    caso_prueba = relationship("CaseTest", back_populates="ejecuciones_prueba")
