from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.case_test import CaseTest
from app.schemas.case_test import CaseTestCreate, CaseTestUpdate


class CaseTestRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[CaseTest]:
        return list(self.db.scalars(select(CaseTest)).all())

    def list_by_problem(self, problem_id: int) -> list[CaseTest]:
        statement = select(CaseTest).where(CaseTest.id_problema == problem_id)
        return list(self.db.scalars(statement).all())

    def get(self, case_test_id: int) -> CaseTest | None:
        return self.db.get(CaseTest, case_test_id)

    def create(self, payload: CaseTestCreate) -> CaseTest:
        case_test = CaseTest(**payload.model_dump())
        self.db.add(case_test)
        self.db.commit()
        self.db.refresh(case_test)
        return case_test

    def update(self, case_test: CaseTest, payload: CaseTestUpdate) -> CaseTest:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(case_test, field, value)
        self.db.commit()
        self.db.refresh(case_test)
        return case_test

    def delete(self, case_test: CaseTest) -> None:
        self.db.delete(case_test)
        self.db.commit()
