from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.repositories.technique_repository import TechniqueRepository
from app.schemas.technique import TechniqueCreate, TechniqueRead, TechniqueUpdate

router = APIRouter(prefix="/techniques", tags=["Techniques"])


@router.get("/", response_model=list[TechniqueRead])
def list_techniques(db: Session = Depends(get_db)):
    return TechniqueRepository(db).list()


@router.post("/", response_model=TechniqueRead, status_code=201)
def create_technique(payload: TechniqueCreate, db: Session = Depends(get_db)):
    return TechniqueRepository(db).create(payload)


@router.get("/{technique_id}", response_model=TechniqueRead)
def get_technique(technique_id: int, db: Session = Depends(get_db)):
    technique = TechniqueRepository(db).get(technique_id)
    if technique is None:
        raise HTTPException(status_code=404, detail="Technique not found")
    return technique


@router.put("/{technique_id}", response_model=TechniqueRead)
def update_technique(technique_id: int, payload: TechniqueUpdate, db: Session = Depends(get_db)):
    repo = TechniqueRepository(db)
    technique = repo.get(technique_id)
    if technique is None:
        raise HTTPException(status_code=404, detail="Technique not found")
    return repo.update(technique, payload)


@router.delete("/{technique_id}", status_code=204)
def delete_technique(technique_id: int, db: Session = Depends(get_db)):
    repo = TechniqueRepository(db)
    technique = repo.get(technique_id)
    if technique is None:
        raise HTTPException(status_code=404, detail="Technique not found")
    repo.delete(technique)
