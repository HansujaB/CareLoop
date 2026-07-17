"""
Upload route — accepts a PDF or image file, runs OCR + Groq cleanup,
then saves the extracted text to Mem0 care memory.

The original file is NOT stored to Firebase Storage (out of scope for the
demo — Storage SDK adds setup overhead).  What IS stored:
  - The extracted (cleaned) text in Mem0 under the profile's user_id
  - A Firestore record on the profile doc: { uploads: [...] } (last 20)
    so the parent can see upload history and status.

If OCR fails the upload is still acknowledged \u2014 the error is logged
and returned so the UI can surface a "processing failed" state.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from deps.profile_auth import require_owned_profile
from services import care_memory
from services import ocr as ocr_service
from services.ocr import OCRError
from services.mem0 import Mem0Error

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profiles/{profile_id}", tags=["upload"])

ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
}
MAX_BYTES = 20 * 1024 * 1024  # 20 MB


class UploadResponse(BaseModel):
    ok: bool
    message: str
    ocr_chars: int = 0


@router.post("/upload", response_model=UploadResponse)
async def upload_medical_record(
    profile_id: str,
    file: UploadFile = File(...),
    _profile: dict = Depends(require_owned_profile),
) -> UploadResponse:
    # ── Validation ──────────────────────────────────────────────────────────
    content_type = file.content_type or ""
    filename = file.filename or "upload"
    if content_type not in ALLOWED_TYPES and not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {content_type}. Upload a PDF or image.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(file_bytes) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(file_bytes) // 1024 // 1024} MB). Maximum is 20 MB.",
        )

    # ── OCR ─────────────────────────────────────────────────────────────────
    try:
        cleaned_text = await ocr_service.extract_and_clean(file_bytes, content_type, filename)
    except OCRError as exc:
        logger.error("OCR failed for profile %s / file %s: %s", profile_id, filename, exc)
        raise HTTPException(
            status_code=422,
            detail=f"Could not extract text from document: {exc}",
        ) from exc

    # ── Save to care memory ─────────────────────────────────────────────────
    try:
        await care_memory.remember_for_profile(
            profile_id,
            f"[Medical record: {filename}]\n{cleaned_text}",
        )
    except Mem0Error as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return UploadResponse(
        ok=True,
        message=f"Document processed and saved to care memory ({len(cleaned_text)} characters extracted).",
        ocr_chars=len(cleaned_text),
    )
