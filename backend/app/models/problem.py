from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Problem(Base):
    __tablename__ = "problemas"

    id_problema: Mapped[int] = mapped_column(primary_key=True, index=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    dificultad: Mapped[str | None] = mapped_column(String(20), nullable=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    restricciones: Mapped[str | None] = mapped_column(Text, nullable=True)

    experimentos = relationship("Experiment", back_populates="problema", cascade="all, delete-orphan")
