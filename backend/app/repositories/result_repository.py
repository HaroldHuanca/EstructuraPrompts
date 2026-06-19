from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.result import Result
from app.schemas.result import ResultCreate, ResultUpdate


class ResultRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Result]:
        return list(self.db.scalars(select(Result)).all())

    def get(self, result_id: int) -> Result | None:
        return self.db.get(Result, result_id)

    def create(self, payload: ResultCreate) -> Result:
        result = Result(**payload.model_dump())
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def update(self, result: Result, payload: ResultUpdate) -> Result:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(result, field, value)
        self.db.commit()
        self.db.refresh(result)
        return result

    def delete(self, result: Result) -> None:
        self.db.delete(result)
        self.db.commit()
