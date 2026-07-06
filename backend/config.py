from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    cognee_api_key: str = ""
    cognee_base_url: str = "https://api.cognee.ai"

    groq_api_key: str = ""
    groq_llm_model: str = "openai/gpt-oss-20b"
    groq_whisper_model: str = "whisper-large-v3-turbo"

    firebase_service_account_path: str = "firebase-service-account.json"
    caregiver_link_base_url: str = "careloop://c"


settings = Settings()


def dataset_name(profile_id: str) -> str:
    return f"{profile_id}_profile"
