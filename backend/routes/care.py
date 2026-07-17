from fastapi import APIRouter, Depends, HTTPException

from deps.profile_auth import require_owned_profile
from models.schemas import (
    ChatRequest,
    ChatResponse,
    EmergencyCardResponse,
    HandoverResponse,
    SetEmergencyCardRequest,
)
from services import care_memory
from services.mem0 import Mem0Error
from services.firebase import FirestoreError
from services.groq import GroqError

router = APIRouter(prefix="/profiles/{profile_id}", tags=["care"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    profile_id: str,
    body: ChatRequest,
    _profile: dict = Depends(require_owned_profile),
) -> ChatResponse:
    try:
        answer = await care_memory.answer_question(profile_id, body.question)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ChatResponse(answer=answer)


@router.get("/handover", response_model=HandoverResponse)
async def handover(
    profile_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> HandoverResponse:
    try:
        summary = await care_memory.generate_handover(profile_id)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return HandoverResponse(summary=summary)


@router.get("/emergency", response_model=EmergencyCardResponse)
async def emergency(
    profile_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> EmergencyCardResponse:
    content = await care_memory.get_emergency_card(profile_id)
    return EmergencyCardResponse(content=content or "")


@router.put("/emergency", response_model=EmergencyCardResponse)
async def set_emergency(
    profile_id: str,
    body: SetEmergencyCardRequest,
    _profile: dict = Depends(require_owned_profile),
) -> EmergencyCardResponse:
    """Parent-only: write (or overwrite) the emergency card."""
    try:
        await care_memory.set_emergency_card(profile_id, body.content)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return EmergencyCardResponse(content=body.content.strip())
