from datetime import datetime

from sqlalchemy import ForeignKey, Integer, Numeric, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Result(Base):
    __tablename__ = "resultados"

    id_resultado: Mapped[int] = mapped_column(primary_key=True, index=True)
    id_experimento: Mapped[int] = mapped_column(ForeignKey("experimentos.id_experimento"), unique=True, nullable=False)
    exactitud_funcional: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    maintainability_index: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    complejidad: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cognitive_complexity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    code_smells: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fecha_registro: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    experimento = relationship("Experiment", back_populates="resultado")
