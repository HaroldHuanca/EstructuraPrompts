from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.problem import Problem
from app.schemas.problem import ProblemCreate, ProblemUpdate


class ProblemRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Problem]:
        return list(self.db.scalars(select(Problem)).all())

    def get(self, problem_id: int) -> Problem | None:
        return self.db.get(Problem, problem_id)

    def create(self, payload: ProblemCreate) -> Problem:
        problem = Problem(**payload.model_dump())
        self.db.add(problem)
        self.db.commit()
        self.db.refresh(problem)
        return problem

    def update(self, problem: Problem, payload: ProblemUpdate) -> Problem:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(problem, field, value)
        self.db.commit()
        self.db.refresh(problem)
        return problem

    def delete(self, problem: Problem) -> None:
        self.db.delete(problem)
        self.db.commit()
