from fastapi import APIRouter, Header, HTTPException, Request

from models.schemas import (
    CaregiverSessionRequest,
    ChatRequest,
    ChatResponse,
    EmergencyCardResponse,
    HandoverResponse,
)
from services import care_memory, firebase
from services.mem0 import Mem0Error
from services.firebase import FirestoreError
from services.groq import GroqError

router = APIRouter(prefix="/caregiver", tags=["caregiver"])


def _get_client_ip(request: Request) -> str | None:
    """Extract real client IP, respecting X-Forwarded-For from proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


async def _profile_from_token(
    x_caregiver_token: str | None,
    client_ip: str | None = None,
) -> str:
    if not x_caregiver_token:
        raise HTTPException(status_code=401, detail="Missing caregiver token.")
    try:
        link = await firebase.validate_caregiver_token(x_caregiver_token, client_ip)
    except FirestoreError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return link["profile_id"]


@router.post("/session")
async def start_session(
    request: Request,
    body: CaregiverSessionRequest,
    x_caregiver_token: str | None = Header(default=None),
) -> dict[str, str]:
    if not x_caregiver_token:
        raise HTTPException(status_code=401, detail="Missing caregiver token.")
    client_ip = _get_client_ip(request)
    try:
        link = await firebase.set_caregiver_name(
            x_caregiver_token, body.caregiver_name, client_ip
        )
    except FirestoreError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return {"ok": "true", "caregiver_name": link["caregiver_name"] or body.caregiver_name}


@router.get("/handover", response_model=HandoverResponse)
async def caregiver_handover(
    request: Request,
    x_caregiver_token: str | None = Header(default=None),
) -> HandoverResponse:
    profile_id = await _profile_from_token(x_caregiver_token, _get_client_ip(request))
    try:
        summary = await care_memory.generate_handover(profile_id)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return HandoverResponse(summary=summary)


@router.post("/chat", response_model=ChatResponse)
async def caregiver_chat(
    request: Request,
    body: ChatRequest,
    x_caregiver_token: str | None = Header(default=None),
) -> ChatResponse:
    profile_id = await _profile_from_token(x_caregiver_token, _get_client_ip(request))
    try:
        answer = await care_memory.answer_question(profile_id, body.question)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ChatResponse(answer=answer)


@router.get("/emergency", response_model=EmergencyCardResponse)
async def caregiver_emergency(
    request: Request,
    x_caregiver_token: str | None = Header(default=None),
) -> EmergencyCardResponse:
    profile_id = await _profile_from_token(x_caregiver_token, _get_client_ip(request))
    try:
        content = await care_memory.generate_emergency_card(profile_id)
    except (Mem0Error, GroqError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return EmergencyCardResponse(content=content)
