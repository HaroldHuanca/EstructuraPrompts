from sqlalchemy.orm import Session

from app.repositories.problem_repository import ProblemRepository
from app.schemas.problem import ProblemCreate, ProblemUpdate


class ProblemService:
    def __init__(self, db: Session) -> None:
        self.repository = ProblemRepository(db)

    def list_problems(self):
        return self.repository.list()

    def get_problem(self, problem_id: int):
        return self.repository.get(problem_id)

    def create_problem(self, payload: ProblemCreate):
        return self.repository.create(payload)

    def update_problem(self, problem, payload: ProblemUpdate):
        return self.repository.update(problem, payload)

    def delete_problem(self, problem):
        self.repository.delete(problem)
