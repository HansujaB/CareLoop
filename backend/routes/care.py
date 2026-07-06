from fastapi import APIRouter, HTTPException

from models.schemas import ChatRequest, ChatResponse, EmergencyCardResponse, HandoverResponse
from services import care_memory, firebase
from services.mem0 import Mem0Error
from services.firebase import FirestoreError
from services.groq import GroqError

router = APIRouter(prefix="/profiles/{profile_id}", tags=["care"])


async def _require_profile(profile_id: str) -> None:
    try:
        profile = await firebase.get_profile(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")


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
    try:
        content = await care_memory.generate_emergency_card(profile_id)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return EmergencyCardResponse(content=content)
