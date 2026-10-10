"""
Centralized application configuration.
All values are read from environment variables so secrets never live in code.
"""
import os
from functools import lru_cache


class Settings:
    # --- Database ---
    # Falls back to a local SQLite file when DATABASE_URL is not set, so the
    # project runs out of the box for local development / grading demos.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resume_analyzer.db")

    # --- LLM provider (optional, modular) ---
    # If no key is configured, the app automatically falls back to the
    # rule-based / TF-IDF pipeline so every feature still works offline.
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "none")  # "anthropic" | "openai" | "none"
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "claude-sonnet-4-6")

    # --- Uploads ---
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "5"))
    ALLOWED_EXTENSIONS = {".pdf", ".docx"}

    # --- Auth (simple API-key based auth for demo purposes) ---
    API_KEY: str = os.getenv("APP_API_KEY", "")  # empty => auth disabled for local dev

    # --- CORS ---
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
