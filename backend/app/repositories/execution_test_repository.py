from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.execution_test import ExecutionTest
from app.schemas.execution_test import ExecutionTestCreate, ExecutionTestUpdate


class ExecutionTestRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[ExecutionTest]:
        return list(self.db.scalars(select(ExecutionTest)).all())

    def list_by_experiment(self, experiment_id: int) -> list[ExecutionTest]:
        statement = select(ExecutionTest).where(ExecutionTest.id_experimento == experiment_id)
        return list(self.db.scalars(statement).all())

    def get(self, execution_test_id: int) -> ExecutionTest | None:
        return self.db.get(ExecutionTest, execution_test_id)

    def create(self, payload: ExecutionTestCreate) -> ExecutionTest:
        execution_test = ExecutionTest(**payload.model_dump())
        self.db.add(execution_test)
        self.db.commit()
        self.db.refresh(execution_test)
        return execution_test

    def update(self, execution_test: ExecutionTest, payload: ExecutionTestUpdate) -> ExecutionTest:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(execution_test, field, value)
        self.db.commit()
        self.db.refresh(execution_test)
        return execution_test

    def delete(self, execution_test: ExecutionTest) -> None:
        self.db.delete(execution_test)
        self.db.commit()
