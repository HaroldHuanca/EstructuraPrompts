from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from openai import OpenAI

from app.core.config import get_settings


class LLMProvider(Protocol):
    def generate_code(self, prompt: str, technique_name: str) -> str:
        ...


@dataclass
class OpenAIChatProvider:
    model: str
    api_key: str | None = None
    api_base: str | None = None
    temperature: float = 0.2
    timeout_seconds: float = 60.0

    def _client(self) -> OpenAI:
        client_kwargs: dict[str, object] = {"timeout": self.timeout_seconds}
        if self.api_key:
            client_kwargs["api_key"] = self.api_key
        if self.api_base:
            client_kwargs["base_url"] = self.api_base
        return OpenAI(**client_kwargs)

    def generate_code(self, prompt: str, technique_name: str) -> str:
        client = self._client()
        system_prompt = (
            "Eres un asistente que genera codigo Python limpio y ejecutable. "
            "Responde solo con el codigo final, sin explicaciones."
        )
        user_prompt = (
            f"Tecnica: {technique_name}\n"
            f"Instruccion: {prompt}\n\n"
            "Genera una solucion en Python dentro de una unica funcion solution()."
        )
        response = client.chat.completions.create(
            model=self.model,
            temperature=self.temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content or ""


def normalize_model_name(model_name: str) -> str:
    normalized = model_name.strip().lower()
    aliases = {
        "chatgpt4-o": "gpt-4o",
        "chatgpt-4o": "gpt-4o",
        "gpt4o": "gpt-4o",
    }
    return aliases.get(normalized, model_name)


class LLMService:
    def __init__(self) -> None:
        settings = get_settings()
        provider_name = settings.llm_provider.lower().strip()
        if provider_name in {"openai", "chatgpt", "gpt"}:
            self.provider: LLMProvider = OpenAIChatProvider(
                model=normalize_model_name(settings.llm_model),
                api_key=settings.llm_api_key,
                api_base=settings.llm_api_base,
                temperature=settings.llm_temperature,
                timeout_seconds=settings.llm_timeout_seconds,
            )
        elif provider_name in {"openai-compatible", "openai_compatible", "local", "local-openai"}:
            self.provider = OpenAIChatProvider(
                model=normalize_model_name(settings.llm_model),
                api_key=settings.llm_api_key,
                api_base=settings.llm_api_base,
                temperature=settings.llm_temperature,
                timeout_seconds=settings.llm_timeout_seconds,
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")

    def generate_code(self, prompt: str, technique_name: str) -> str:
        return self.provider.generate_code(prompt, technique_name)
