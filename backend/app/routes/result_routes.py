from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.repositories.result_repository import ResultRepository
from app.schemas.result import ResultCreate, ResultRead, ResultUpdate

router = APIRouter(prefix="/results", tags=["Results"])


@router.get("/", response_model=list[ResultRead])
def list_results(db: Session = Depends(get_db)):
    return ResultRepository(db).list()


@router.get("/{result_id}", response_model=ResultRead)
def get_result(result_id: int, db: Session = Depends(get_db)):
    result = ResultRepository(db).get(result_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


@router.post("/", response_model=ResultRead, status_code=201)
def create_result(payload: ResultCreate, db: Session = Depends(get_db)):
    return ResultRepository(db).create(payload)


@router.put("/{result_id}", response_model=ResultRead)
def update_result(result_id: int, payload: ResultUpdate, db: Session = Depends(get_db)):
    repo = ResultRepository(db)
    result = repo.get(result_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    return repo.update(result, payload)


@router.delete("/{result_id}", status_code=204)
def delete_result(result_id: int, db: Session = Depends(get_db)):
    repo = ResultRepository(db)
    result = repo.get(result_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    repo.delete(result)