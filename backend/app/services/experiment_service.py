from sqlalchemy.orm import Session

from app.repositories.experiment_repository import ExperimentRepository
from app.repositories.execution_test_repository import ExecutionTestRepository
from app.repositories.problem_repository import ProblemRepository
from app.repositories.result_repository import ResultRepository
from app.repositories.technique_repository import TechniqueRepository
from app.schemas.experiment import ExperimentCreate
from app.schemas.result import ResultCreate
from app.services.llm_service import LLMService
from app.services.prompt_service import PromptService
from app.services.pytest_service import PytestService
from app.services.radon_service import RadonService
from app.services.sonarqube_service import SonarQubeService


class ExperimentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.experiment_repository = ExperimentRepository(db)
        self.execution_test_repository = ExecutionTestRepository(db)
        self.result_repository = ResultRepository(db)
        self.problem_repository = ProblemRepository(db)
        self.technique_repository = TechniqueRepository(db)
        self.prompt_service = PromptService()
        self.llm_service = LLMService()
        self.radon_service = RadonService()
        self.pytest_service = PytestService()
        self.sonarqube_service = SonarQubeService()

    def _run_experiment_for_problem(self, problem_id: int, technique_id: int):
        payload = ExperimentCreate(id_problema=problem_id, id_tecnica=technique_id)
        problem = self.problem_repository.get(payload.id_problema)
        technique = self.technique_repository.get(payload.id_tecnica)

        if problem is None:
            raise ValueError("Problem not found")
        if technique is None:
            raise ValueError("Technique not found")

        prompt = self.prompt_service.build_prompt(problem, technique)
        generated_code = self.llm_service.generate_code(prompt, technique.nombre)
        experiment = self.experiment_repository.create(payload, prompt, generated_code)

        metrics = self.radon_service.analyze(generated_code)
        self.pytest_service.run_tests(generated_code)
        self.sonarqube_service.analyze(generated_code)

        result = self.result_repository.create(
            ResultCreate(
                id_experimento=experiment.id_experimento,
                exactitud_funcional=100.0,
                maintainability_index=metrics["maintainability_index"],
                complejidad=metrics["complejidad"],
                cognitive_complexity=metrics["cognitive_complexity"],
                code_smells=metrics["code_smells"],
            )
        )

        return experiment, result

    def run_experiment(self, payload: ExperimentCreate):
        return self._run_experiment_for_problem(payload.id_problema, payload.id_tecnica)

    def run_experiment_for_problem(self, problem_id: int, technique_id: int):
        return self._run_experiment_for_problem(problem_id, technique_id)

    def run_experiments_for_problem_ids(self, problem_ids: list[int], technique_id: int):
        experiments = []
        for problem_id in problem_ids:
            experiment, _ = self._run_experiment_for_problem(problem_id, technique_id)
            experiments.append(experiment)
        return experiments

    def run_experiments_for_pending_problems(self, technique_id: int):
        experiments = []
        for problem in self.problem_repository.list():
            if not self.experiment_repository.exists_for_problem(problem.id_problema):
                experiment, _ = self._run_experiment_for_problem(problem.id_problema, technique_id)
                experiments.append(experiment)
        return experiments
