from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.experiment import Experiment
from app.schemas.experiment import ExperimentCreate, ExperimentUpdate


class ExperimentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Experiment]:
        return list(self.db.scalars(select(Experiment)).all())

    def list_by_problem(self, problem_id: int) -> list[Experiment]:
        statement = select(Experiment).where(Experiment.id_problema == problem_id)
        return list(self.db.scalars(statement).all())

    def exists_for_problem(self, problem_id: int) -> bool:
        statement = select(Experiment.id_experimento).where(Experiment.id_problema == problem_id).limit(1)
        return self.db.execute(statement).first() is not None

    def get(self, experiment_id: int) -> Experiment | None:
        return self.db.get(Experiment, experiment_id)

    def create(self, payload: ExperimentCreate, prompt_generado: str, codigo_generado: str) -> Experiment:
        experiment = Experiment(
            id_problema=payload.id_problema,
            id_tecnica=payload.id_tecnica,
            prompt_generado=prompt_generado,
            codigo_generado=codigo_generado,
        )
        self.db.add(experiment)
        self.db.commit()
        self.db.refresh(experiment)
        return experiment

    def update(self, experiment: Experiment, payload: ExperimentUpdate) -> Experiment:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(experiment, field, value)
        self.db.commit()
        self.db.refresh(experiment)
        return experiment

    def delete(self, experiment: Experiment) -> None:
        self.db.delete(experiment)
        self.db.commit()
