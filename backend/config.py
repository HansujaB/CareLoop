from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mem0_api_key: str = ""

    groq_api_key: str = ""
    groq_llm_model: str = "gemma2-9b-it"
    groq_whisper_model: str = "whisper-large-v3-turbo"

    firebase_service_account_path: str = "firebase-service-account.json"
    caregiver_link_base_url: str = "careloop://c"


settings = Settings()


def mem0_user_id(profile_id: str) -> str:
    """Returns the Mem0 user_id to scope memories to a care profile."""
    return f"profile_{profile_id}"
