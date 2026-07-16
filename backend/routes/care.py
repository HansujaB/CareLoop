from fastapi import APIRouter, Header, HTTPException

from models.schemas import (
    ChatRequest,
    ChatResponse,
    EmergencyCardResponse,
    HandoverResponse,
    SetEmergencyCardRequest,
)
from services import care_memory, firebase
from services.mem0 import Mem0Error
from services.firebase import FirestoreError
from services.groq import GroqError

router = APIRouter(prefix="/profiles/{profile_id}", tags=["care"])


async def _require_owned_profile(profile_id: str, uid: str | None) -> None:
    """Verify profile exists. If uid provided, also verify ownership."""
    try:
        profile = await firebase.get_profile(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    if uid is not None and profile.get("admin_uid") != uid:
        raise HTTPException(status_code=403, detail="You do not own this profile.")


async def _require_profile(profile_id: str) -> None:
    await _require_owned_profile(profile_id, uid=None)


@router.post("/chat", response_model=ChatResponse)
async def chat(profile_id: str, body: ChatRequest) -> ChatResponse:
    await _require_profile(profile_id)
    try:
        answer = await care_memory.answer_question(profile_id, body.question)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ChatResponse(answer=answer)


@router.get("/handover", response_model=HandoverResponse)
async def handover(profile_id: str) -> HandoverResponse:
    await _require_profile(profile_id)
    try:
        summary = await care_memory.generate_handover(profile_id)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return HandoverResponse(summary=summary)


@router.get("/emergency", response_model=EmergencyCardResponse)
async def emergency(profile_id: str) -> EmergencyCardResponse:
    await _require_profile(profile_id)
    content = await care_memory.get_emergency_card(profile_id)
    return EmergencyCardResponse(content=content or "")


@router.put("/emergency", response_model=EmergencyCardResponse)
async def set_emergency(
    profile_id: str,
    body: SetEmergencyCardRequest,
    x_firebase_uid: str | None = Header(default=None),
) -> EmergencyCardResponse:
    """Parent-only: write (or overwrite) the emergency card."""
    await _require_owned_profile(profile_id, uid=x_firebase_uid)
    try:
        await care_memory.set_emergency_card(profile_id, body.content)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return EmergencyCardResponse(content=body.content.strip())
