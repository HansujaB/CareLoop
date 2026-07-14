from fastapi import APIRouter, File, HTTPException, UploadFile

from models.schemas import RememberResponse, TranscribeResponse
from services import care_memory, firebase, groq
from services.mem0 import Mem0Error
from services.firebase import FirestoreError
from services.groq import GroqError

router = APIRouter(prefix="/profiles/{profile_id}", tags=["voice"])


async def _require_profile(profile_id: str) -> None:
    try:
        profile = await firebase.get_profile(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")


@router.post("/voice", response_model=RememberResponse)
async def ingest_voice(
    profile_id: str,
    audio: UploadFile = File(...),
) -> RememberResponse:
    await _require_profile(profile_id)
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    filename = audio.filename or "recording.m4a"
    content_type = audio.content_type or "audio/m4a"

    try:
        text = await groq.transcribe_audio(
            audio_bytes,
            filename,
            content_type=content_type,
        )
        await care_memory.remember_for_profile(profile_id, text)
    except GroqError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Mem0Error as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return RememberResponse(message="Voice note saved to care memory.")


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_voice(
    profile_id: str,
    audio: UploadFile = File(...),
) -> TranscribeResponse:
    """Transcribe audio and return text without saving to memory.
    The frontend shows the text for review, then calls /remember to save it.
    """
    await _require_profile(profile_id)
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    filename = audio.filename or "recording.m4a"
    content_type = audio.content_type or "audio/m4a"

    try:
        text = await groq.transcribe_audio(audio_bytes, filename, content_type=content_type)
    except GroqError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return TranscribeResponse(text=text)
