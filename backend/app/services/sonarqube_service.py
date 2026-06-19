class SonarQubeService:
    def analyze(self, code: str) -> dict[str, str | int | float]:
        return {
            "status": "pending",
            "code_smells": 0,
            "technical_debt": 0.0,
        }
