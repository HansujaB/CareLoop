"""
OCR service — extracts text from uploaded PDFs and images.

Strategy:
  PDF  → pypdf (pure-Python, no system dependencies)
  Image → Groq's vision-capable model via base64 inline image

After extraction, raw OCR text is cleaned by Groq (fixes garbled characters,
normalises formatting) before being handed to Mem0.  If OCR fails, the
original file is still saved; the error is surfaced to the caller so the
upload record can be flagged for manual review.
"""

from __future__ import annotations

import base64
import io
import logging
from typing import Literal

import httpx

from config import settings

logger = logging.getLogger(__name__)

# PDF support — optional; degrade gracefully if pypdf not installed
try:
    from pypdf import PdfReader  # type: ignore
    _PYPDF_AVAILABLE = True
except ImportError:
    _PYPDF_AVAILABLE = False
    logger.warning("pypdf not installed — PDF OCR disabled. Install with: pip install pypdf")


FileKind = Literal["pdf", "image"]


def _detect_kind(content_type: str, filename: str) -> FileKind:
    ct = content_type.lower()
    fn = filename.lower()
    if "pdf" in ct or fn.endswith(".pdf"):
        return "pdf"
    return "image"


def _pdf_to_text(data: bytes) -> str:
    """Extract raw text from a PDF using pypdf."""
    if not _PYPDF_AVAILABLE:
        raise OCRError("PDF support is not available on this server (pypdf not installed).")
    try:
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
        if not text:
            raise OCRError("PDF contained no extractable text. It may be a scanned image PDF.")
        return text
    except OCRError:
        raise
    except Exception as exc:
        raise OCRError(f"Failed to read PDF: {exc}") from exc


async def _image_to_text(data: bytes, content_type: str) -> str:
    """Send image to Groq vision model and extract text."""
    b64 = base64.b64encode(data).decode("utf-8")
    data_url = f"data:{content_type};base64,{b64}"

    url = "https://api.groq.com/openai/v1/chat/completions"
    body = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",  # Groq's vision model
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "This is a medical record or care document. "
                            "Extract ALL text from the image exactly as written. "
                            "Do not summarise or interpret — just transcribe every word you see."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": data_url},
                    },
                ],
            }
        ],
        "temperature": 0,
        "max_tokens": 2048,
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json=body,
            )
            response.raise_for_status()
            payload = response.json()
            text = payload["choices"][0]["message"]["content"].strip()
            if not text:
                raise OCRError("Vision model returned empty transcription.")
            return text
    except httpx.HTTPStatusError as exc:
        logger.exception("Groq vision OCR failed: %s", exc.response.text)
        raise OCRError("Could not extract text from image.") from exc
    except httpx.HTTPError as exc:
        logger.exception("Groq vision request failed")
        raise OCRError("Could not reach OCR service.") from exc


async def _clean_with_groq(raw_text: str) -> str:
    """
    Clean OCR output with Groq LLM:
    - Fix garbled characters / ligature artifacts
    - Normalise line breaks
    - Preserve all medical facts verbatim
    """
    from services.groq import phrase_response

    system = (
        "You are a medical document formatter. The text below was extracted from a scanned document. "
        "Fix any OCR errors (garbled characters, broken words, misread numbers), "
        "normalise whitespace and line breaks, and preserve ALL medical information exactly. "
        "Do not remove, summarise, or rewrite any clinical facts. "
        "Output only the cleaned text — no commentary, no preamble."
    )
    return await phrase_response(
        system_prompt=system,
        user_prompt=raw_text,
        max_tokens=2048,
    )


class OCRError(Exception):
    pass


async def extract_and_clean(
    file_bytes: bytes,
    content_type: str,
    filename: str,
) -> str:
    """
    Main entry point: extract text from file then clean with Groq.
    Returns cleaned text ready to be passed to Mem0.
    Raises OCRError on failure.
    """
    kind = _detect_kind(content_type, filename)
    logger.info("OCR: processing %s (%s, %d bytes)", filename, kind, len(file_bytes))

    if kind == "pdf":
        raw = _pdf_to_text(file_bytes)
    else:
        raw = await _image_to_text(file_bytes, content_type)

    logger.info("OCR: raw text extracted (%d chars), cleaning with Groq…", len(raw))
    cleaned = await _clean_with_groq(raw)
    logger.info("OCR: cleaned text ready (%d chars)", len(cleaned))
    return cleaned
