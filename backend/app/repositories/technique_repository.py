from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.technique import Technique
from app.schemas.technique import TechniqueCreate, TechniqueUpdate


class TechniqueRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Technique]:
        return list(self.db.scalars(select(Technique)).all())

    def get(self, technique_id: int) -> Technique | None:
        return self.db.get(Technique, technique_id)

    def create(self, payload: TechniqueCreate) -> Technique:
        technique = Technique(**payload.model_dump())
        self.db.add(technique)
        self.db.commit()
        self.db.refresh(technique)
        return technique

    def update(self, technique: Technique, payload: TechniqueUpdate) -> Technique:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(technique, field, value)
        self.db.commit()
        self.db.refresh(technique)
        return technique

    def delete(self, technique: Technique) -> None:
        self.db.delete(technique)
        self.db.commit()
