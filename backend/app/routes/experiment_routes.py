from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.experiment import (
    ExperimentBatchExecution,
    ExperimentCreate,
    ExperimentExecution,
    ExperimentRead,
    ExperimentUpdate,
    TechniqueExecution,
)
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/experiments", tags=["Experiments"])


@router.get("/", response_model=list[ExperimentRead])
def list_experiments(db: Session = Depends(get_db)):
    return ExperimentService(db).experiment_repository.list()


@router.get("/{experiment_id}", response_model=ExperimentRead)
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    experiment = ExperimentService(db).experiment_repository.get(experiment_id)
    if experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment


@router.post("/", response_model=ExperimentRead, status_code=201)
def create_experiment(payload: ExperimentCreate, db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        experiment, _ = service.run_experiment(payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return experiment


@router.put("/{experiment_id}", response_model=ExperimentRead)
def update_experiment(experiment_id: int, payload: ExperimentUpdate, db: Session = Depends(get_db)):
    service = ExperimentService(db)
    experiment = service.experiment_repository.get(experiment_id)
    if experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return service.experiment_repository.update(experiment, payload)


@router.delete("/{experiment_id}", status_code=204)
def delete_experiment(experiment_id: int, db: Session = Depends(get_db)):
    service = ExperimentService(db)
    experiment = service.experiment_repository.get(experiment_id)
    if experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    service.experiment_repository.delete(experiment)


@router.post("/execute", response_model=ExperimentRead, status_code=201)
def execute_experiment(payload: ExperimentExecution, db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        experiment, _ = service.run_experiment_for_problem(payload.problem_id, payload.technique_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return experiment


@router.post("/run/{problem_id}", response_model=ExperimentRead, status_code=201)
def run_single_problem(problem_id: int, payload: TechniqueExecution, db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        experiment, _ = service.run_experiment_for_problem(problem_id, payload.technique_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return experiment


@router.post("/run-batch", response_model=list[ExperimentRead], status_code=201)
def run_batch(payload: ExperimentBatchExecution, db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        return service.run_experiments_for_problem_ids(payload.problem_ids, payload.technique_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/run-pending", response_model=list[ExperimentRead], status_code=201)
def run_pending(payload: TechniqueExecution, db: Session = Depends(get_db)):
    service = ExperimentService(db)
    try:
        return service.run_experiments_for_pending_problems(payload.technique_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
