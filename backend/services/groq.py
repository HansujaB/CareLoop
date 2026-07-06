"""All Groq calls (Whisper + LLM phrasing) go through this module."""

from __future__ import annotations

import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)

GROQ_BASE = "https://api.groq.com/openai/v1"


class GroqError(Exception):
    pass


def _auth_headers(*, json: bool = True) -> dict[str, str]:
    if not settings.groq_api_key:
        raise GroqError("GROQ_API_KEY is not configured")
    headers = {"Authorization": f"Bearer {settings.groq_api_key}"}
    if json:
        headers["Content-Type"] = "application/json"
    return headers


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str,
    *,
    content_type: str = "audio/m4a",
) -> str:
    url = f"{GROQ_BASE}/audio/transcriptions"
    files = {"file": (filename, audio_bytes, content_type)}
    data = {
        "model": settings.groq_whisper_model,
        "language": "en",
        "response_format": "json",
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                headers=_auth_headers(json=False),
                files=files,
                data=data,
            )
            response.raise_for_status()
            payload = response.json()
            text = payload.get("text", "").strip()
            if not text:
                raise GroqError("Transcription returned empty text.")
            return text
    except httpx.HTTPStatusError as exc:
        logger.exception("Groq transcription failed: %s", exc.response.text)
        raise GroqError("Could not transcribe audio. Try again.") from exc
    except httpx.HTTPError as exc:
        logger.exception("Groq transcription request failed")
        raise GroqError("Could not reach transcription service.") from exc


async def phrase_response(
    *,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 600,
) -> str:
    url = f"{GROQ_BASE}/chat/completions"
    body = {
        "model": settings.groq_llm_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.4,
        "max_tokens": max_tokens,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=_auth_headers(), json=body)
            response.raise_for_status()
            payload = response.json()
            return payload["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as exc:
        logger.exception("Groq chat failed: %s", exc.response.text)
        raise GroqError("Could not generate response. Try again.") from exc
    except httpx.HTTPError as exc:
        logger.exception("Groq chat request failed")
        raise GroqError("Could not reach language model.") from exc
