from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.repositories.execution_test_repository import ExecutionTestRepository
from app.schemas.execution_test import ExecutionTestCreate, ExecutionTestRead, ExecutionTestUpdate

router = APIRouter(prefix="/execution-tests", tags=["ExecutionTests"])


@router.get("/", response_model=list[ExecutionTestRead])
def list_execution_tests(db: Session = Depends(get_db)):
    return ExecutionTestRepository(db).list()


@router.get("/{execution_test_id}", response_model=ExecutionTestRead)
def get_execution_test(execution_test_id: int, db: Session = Depends(get_db)):
    execution_test = ExecutionTestRepository(db).get(execution_test_id)
    if execution_test is None:
        raise HTTPException(status_code=404, detail="Execution test not found")
    return execution_test


@router.post("/", response_model=ExecutionTestRead, status_code=201)
def create_execution_test(payload: ExecutionTestCreate, db: Session = Depends(get_db)):
    return ExecutionTestRepository(db).create(payload)


@router.put("/{execution_test_id}", response_model=ExecutionTestRead)
def update_execution_test(execution_test_id: int, payload: ExecutionTestUpdate, db: Session = Depends(get_db)):
    repo = ExecutionTestRepository(db)
    execution_test = repo.get(execution_test_id)
    if execution_test is None:
        raise HTTPException(status_code=404, detail="Execution test not found")
    return repo.update(execution_test, payload)


@router.delete("/{execution_test_id}", status_code=204)
def delete_execution_test(execution_test_id: int, db: Session = Depends(get_db)):
    repo = ExecutionTestRepository(db)
    execution_test = repo.get(execution_test_id)
    if execution_test is None:
        raise HTTPException(status_code=404, detail="Execution test not found")
    repo.delete(execution_test)
