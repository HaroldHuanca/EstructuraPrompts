from datetime import datetime

from sqlalchemy import ForeignKey, TIMESTAMP, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Experiment(Base):
    __tablename__ = "experimentos"

    id_experimento: Mapped[int] = mapped_column(primary_key=True, index=True)
    id_problema: Mapped[int] = mapped_column(ForeignKey("problemas.id_problema"), nullable=False)
    id_tecnica: Mapped[int] = mapped_column(ForeignKey("tecnicas.id_tecnica"), nullable=False)
    prompt_generado: Mapped[str] = mapped_column(Text, nullable=False)
    codigo_generado: Mapped[str] = mapped_column(Text, nullable=False)
    fecha_ejecucion: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.current_timestamp())

    problema = relationship("Problem", back_populates="experimentos")
    tecnica = relationship("Technique", back_populates="experimentos")
    resultado = relationship("Result", back_populates="experimento", uselist=False, cascade="all, delete-orphan")
