from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Investigacion API"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg2://postgres@localhost/investigacion"
    echo_sql: bool = False
    llm_provider: str = "openai"
    llm_model: str = "gpt-4o"
    llm_api_key: str | None = None
    llm_api_base: str | None = None
    llm_timeout_seconds: float = 60.0
    llm_temperature: float = 0.2

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
