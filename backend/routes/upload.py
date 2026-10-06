"""
Upload route — accepts a PDF or image file, runs OCR, and stores the
extracted text AS-IS in Firestore under the profile's medical reports.

Issue #4: OCR output is NEVER fed to Mem0 care memory. Reports are saved
verbatim so the parent can review them, and caregivers can read them via
the medical history endpoints. A separate parent-authored "medical history
card" (see routes/care.py) holds the curated summary + routine appointments.

The original binary is not persisted (no Storage SDK in the demo) — the
extracted text is the stored record. If OCR fails the upload is rejected
with 422 so the UI can surface a retry state.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from deps.profile_auth import require_owned_profile
from services import firebase
from services import ocr as ocr_service
from services.firebase import FirestoreError
from services.ocr import OCRError

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
    report_id: str = ""
    filename: str = ""
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

    # ── OCR (raw, stored as-is — never sent to Mem0) ────────────────────────
    try:
        raw_text = await ocr_service.extract_raw(file_bytes, content_type, filename)
    except OCRError as exc:
        logger.error("OCR failed for profile %s / file %s: %s", profile_id, filename, exc)
        raise HTTPException(
            status_code=422,
            detail=f"Could not extract text from document: {exc}",
        ) from exc

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Document contained no readable text.")

    # ── Save verbatim to Firestore ──────────────────────────────────────────
    try:
        record = await firebase.save_medical_report(
            profile_id,
            filename=filename,
            content_type=content_type,
            extracted_text=raw_text,
        )
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return UploadResponse(
        ok=True,
        message=(
            f"Report saved as-is ({len(raw_text)} characters). "
            "It is stored under Medical history and is not added to AI memory."
        ),
        report_id=record["report_id"],
        filename=filename,
        ocr_chars=len(raw_text),
    )
