class RadonService:
    def analyze(self, code: str) -> dict[str, float | int]:
        line_count = max(code.count("\n") + 1, 1)
        return {
            "maintainability_index": max(0.0, 100.0 - float(line_count)),
            "complejidad": 1,
            "cognitive_complexity": 1,
            "code_smells": 0,
        }
