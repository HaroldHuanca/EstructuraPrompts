from app.models.problem import Problem
from app.models.technique import Technique


class PromptService:
    def build_prompt(self, problem: Problem, technique: Technique) -> str:
        return (
            f"Usa la tecnica {technique.nombre} para resolver el problema '{problem.titulo}'. "
            f"Descripcion: {problem.descripcion or 'Sin descripcion'}. "
            f"Restricciones: {problem.restricciones or 'Sin restricciones'}"
        )
