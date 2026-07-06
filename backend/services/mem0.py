"""All Mem0 Cloud calls go through this module."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)

MEM0_BASE = "https://api.mem0.ai/v1"


class Mem0Error(Exception):
    pass


def _headers() -> dict[str, str]:
    if not settings.mem0_api_key:
        raise Mem0Error("MEM0_API_KEY is not configured")
    return {
        "Authorization": f"Token {settings.mem0_api_key}",
        "Content-Type": "application/json",
    }


async def remember_text(text: str, user_id: str) -> dict[str, Any]:
    """Ingest text into Mem0 for the given user/profile."""
    url = f"{MEM0_BASE}/memories/"
    body = {
        "messages": [{"role": "user", "content": text}],
        "user_id": user_id,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=_headers(), json=body)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as exc:
        logger.exception("Mem0 remember failed: %s", exc.response.text)
        raise Mem0Error("Could not save to care memory. Try again.") from exc
    except httpx.HTTPError as exc:
        logger.exception("Mem0 remember request failed")
        raise Mem0Error("Could not reach care memory. Try again.") from exc


async def recall(query: str, user_id: str) -> str:
    """Search Mem0 for relevant memories and return them as plain text."""
    url = f"{MEM0_BASE}/memories/search/"
    body = {
        "query": query,
        "user_id": user_id,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=_headers(), json=body)
            response.raise_for_status()
            results = response.json()
            return _extract_text(results)
    except httpx.HTTPStatusError as exc:
        logger.exception("Mem0 recall failed: %s", exc.response.text)
        raise Mem0Error("Could not read care memory. Try again.") from exc
    except httpx.HTTPError as exc:
        logger.exception("Mem0 recall request failed")
        raise Mem0Error("Could not reach care memory. Try again.") from exc


def _extract_text(results: Any) -> str:
    """Pull the memory text out of Mem0 search results."""
    if not isinstance(results, list):
        return str(results).strip()

    parts: list[str] = []
    for item in results:
        if not isinstance(item, dict):
            parts.append(str(item))
            continue
        # Mem0 search returns items with a "memory" field
        if item.get("memory"):
            parts.append(str(item["memory"]))
        elif item.get("text"):
            parts.append(str(item["text"]))

    return "\n".join(p for p in parts if p).strip()
