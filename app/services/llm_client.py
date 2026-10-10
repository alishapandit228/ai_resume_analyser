"""
Modular LLM provider layer.

The rest of the app (parsing, matching, ATS, skill gap, roadmap) works
entirely offline via NLP/rules. This module is an optional enhancement used
for:
  - the AI Chat Assistant (answering free-form questions using resume + JD
    as context)
  - lightly rewriting/polishing recommendation text

To swap providers, implement `generate()` for the new provider and add it to
`get_llm_client()`. Never invent facts about the user's resume — every
prompt built in this project instructs the model to only use the provided
context.
"""
import os
from abc import ABC, abstractmethod

from app.config import get_settings

settings = get_settings()


class LLMClient(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        ...


class AnthropicClient(LLMClient):
    def __init__(self, api_key: str, model: str):
        import anthropic
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        response = self.client.messages.create(
            model=self.model,
            max_tokens=800,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return "".join(block.text for block in response.content if block.type == "text")


class OpenAIClient(LLMClient):
    def __init__(self, api_key: str, model: str):
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content


class NullClient(LLMClient):
    """Fallback used when no LLM provider is configured. Returns a clearly
    labeled canned response instead of failing, so every endpoint still
    works end-to-end."""

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        return (
            "AI chat assistant is not connected to an LLM provider yet. "
            "Set LLM_PROVIDER and the matching API key in your .env file to enable "
            "free-form Q&A. In the meantime, use the ATS, Skill Gap and Roadmap "
            "tabs — those work fully offline."
        )


def get_llm_client() -> LLMClient:
    provider = settings.LLM_PROVIDER.lower()
    try:
        if provider == "anthropic" and settings.ANTHROPIC_API_KEY:
            return AnthropicClient(settings.ANTHROPIC_API_KEY, settings.LLM_MODEL)
        if provider == "openai" and settings.OPENAI_API_KEY:
            return OpenAIClient(settings.OPENAI_API_KEY, settings.LLM_MODEL)
    except ImportError:
        pass
    return NullClient()
