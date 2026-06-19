from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class CaseTest(Base):
    __tablename__ = "casos_prueba"

    id_caso_prueba: Mapped[int] = mapped_column(primary_key=True, index=True)
    id_problema: Mapped[int] = mapped_column(ForeignKey("problemas.id_problema", ondelete="CASCADE"), nullable=False)
    datos_entrada: Mapped[dict] = mapped_column(JSONB, nullable=False)
    salida_esperada: Mapped[dict] = mapped_column(JSONB, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)

    problema = relationship("Problem", back_populates="casos_prueba")
    ejecuciones_prueba = relationship("ExecutionTest", back_populates="caso_prueba", cascade="all, delete-orphan")
