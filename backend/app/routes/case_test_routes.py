from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.repositories.case_test_repository import CaseTestRepository
from app.schemas.case_test import CaseTestCreate, CaseTestRead, CaseTestUpdate

router = APIRouter(prefix="/cases-prueba", tags=["CasesTest"])


@router.get("/", response_model=list[CaseTestRead])
def list_case_tests(db: Session = Depends(get_db)):
    return CaseTestRepository(db).list()


@router.get("/{case_test_id}", response_model=CaseTestRead)
def get_case_test(case_test_id: int, db: Session = Depends(get_db)):
    case_test = CaseTestRepository(db).get(case_test_id)
    if case_test is None:
        raise HTTPException(status_code=404, detail="Case test not found")
    return case_test


@router.post("/", response_model=CaseTestRead, status_code=201)
def create_case_test(payload: CaseTestCreate, db: Session = Depends(get_db)):
    return CaseTestRepository(db).create(payload)


@router.put("/{case_test_id}", response_model=CaseTestRead)
def update_case_test(case_test_id: int, payload: CaseTestUpdate, db: Session = Depends(get_db)):
    repo = CaseTestRepository(db)
    case_test = repo.get(case_test_id)
    if case_test is None:
        raise HTTPException(status_code=404, detail="Case test not found")
    return repo.update(case_test, payload)


@router.delete("/{case_test_id}", status_code=204)
def delete_case_test(case_test_id: int, db: Session = Depends(get_db)):
    repo = CaseTestRepository(db)
    case_test = repo.get(case_test_id)
    if case_test is None:
        raise HTTPException(status_code=404, detail="Case test not found")
    repo.delete(case_test)
