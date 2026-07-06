"""All Cognee Cloud calls go through this module."""

from __future__ import annotations

import io
import logging
from typing import Any

import httpx

from config import settings

logger = logging.getLogger(__name__)


class CogneeError(Exception):
    pass


def _headers() -> dict[str, str]:
    if not settings.cognee_api_key:
        raise CogneeError("COGNEE_API_KEY is not configured")
    return {"X-Api-Key": settings.cognee_api_key}


def _extract_recall_text(payload: Any) -> str:
    if isinstance(payload, str):
        return payload.strip()
    if not isinstance(payload, list):
        return str(payload).strip()

    parts: list[str] = []
    for item in payload:
        if not isinstance(item, dict):
            parts.append(str(item))
            continue
        if item.get("source") == "graph" and item.get("text"):
            parts.append(str(item["text"]))
        elif item.get("source") == "graph_context" and item.get("content"):
            parts.append(str(item["content"]))
        elif item.get("answer"):
            parts.append(str(item["answer"]))
        elif item.get("text"):
            parts.append(str(item["text"]))
    return "\n".join(part for part in parts if part).strip()


async def remember_text(text: str, dataset: str) -> dict[str, Any]:
    """Ingest text into a profile dataset (add + cognify in one call)."""
    url = f"{settings.cognee_base_url}/api/v1/remember"
    files = {"data": ("care_note.txt", io.BytesIO(text.encode("utf-8")), "text/plain")}
    data = {"datasetName": dataset}

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, headers=_headers(), files=files, data=data)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as exc:
        logger.exception("Cognee remember failed: %s", exc.response.text)
        raise CogneeError("Could not save to care memory. Try again.") from exc
    except httpx.HTTPError as exc:
        logger.exception("Cognee remember request failed")
        raise CogneeError("Could not reach care memory. Try again.") from exc


async def recall(
    query: str,
    dataset: str,
    *,
    search_type: str = "GRAPH_COMPLETION",
) -> str:
    """Query a profile dataset and return raw retrieved text."""
    url = f"{settings.cognee_base_url}/api/v1/recall"
    body = {
        "query": query,
        "searchType": search_type,
        "datasets": [dataset],
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                url,
                headers={**_headers(), "Content-Type": "application/json"},
                json=body,
            )
            response.raise_for_status()
            return _extract_recall_text(response.json())
    except httpx.HTTPStatusError as exc:
        logger.exception("Cognee recall failed: %s", exc.response.text)
        raise CogneeError("Could not read care memory. Try again.") from exc
    except httpx.HTTPError as exc:
        logger.exception("Cognee recall request failed")
        raise CogneeError("Could not reach care memory. Try again.") from exc
