from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.problem import ProblemCreate, ProblemRead, ProblemUpdate
from app.services.problem_service import ProblemService

router = APIRouter(prefix="/problems", tags=["Problems"])


@router.get("/", response_model=list[ProblemRead])
def list_problems(db: Session = Depends(get_db)):
    return ProblemService(db).list_problems()


@router.post("/", response_model=ProblemRead, status_code=201)
def create_problem(payload: ProblemCreate, db: Session = Depends(get_db)):
    return ProblemService(db).create_problem(payload)


@router.get("/{problem_id}", response_model=ProblemRead)
def get_problem(problem_id: int, db: Session = Depends(get_db)):
    problem = ProblemService(db).get_problem(problem_id)
    if problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.put("/{problem_id}", response_model=ProblemRead)
def update_problem(problem_id: int, payload: ProblemUpdate, db: Session = Depends(get_db)):
    service = ProblemService(db)
    problem = service.get_problem(problem_id)
    if problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    return service.update_problem(problem, payload)


@router.delete("/{problem_id}", status_code=204)
def delete_problem(problem_id: int, db: Session = Depends(get_db)):
    service = ProblemService(db)
    problem = service.get_problem(problem_id)
    if problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    service.delete_problem(problem)
