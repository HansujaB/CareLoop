from fastapi import APIRouter, Depends, HTTPException

from deps.profile_auth import require_owned_profile
from models.schemas import (
    ChatRequest,
    ChatResponse,
    EmergencyCardResponse,
    HandoverResponse,
    MedicalHistoryResponse,
    MedicalReportResponse,
    SetEmergencyCardRequest,
    SetMedicalHistoryRequest,
)
from services import care_memory, firebase
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


@router.get("/medical-history", response_model=MedicalHistoryResponse)
async def medical_history(
    profile_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> MedicalHistoryResponse:
    """Parent-authored medical history card (curated summary + routine appointments)."""
    try:
        content = await firebase.get_medical_history_card(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return MedicalHistoryResponse(content=content or "")


@router.put("/medical-history", response_model=MedicalHistoryResponse)
async def set_medical_history(
    profile_id: str,
    body: SetMedicalHistoryRequest,
    _profile: dict = Depends(require_owned_profile),
) -> MedicalHistoryResponse:
    """Parent-only: write (or overwrite) the medical history card."""
    try:
        await firebase.set_medical_history_card(profile_id, body.content)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return MedicalHistoryResponse(content=body.content.strip())


@router.post("/medical-history/draft", response_model=MedicalHistoryResponse)
async def draft_medical_history(
    profile_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> MedicalHistoryResponse:
    """
    Parent-only: draft the history card from uploaded report extracts.
    Reads Firestore reports only (never Mem0), synthesizes with Groq, saves
    the draft so the parent can review and edit it. Reports stay untouched.
    """
    try:
        draft = await care_memory.draft_medical_history(profile_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except GroqError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return MedicalHistoryResponse(content=draft)


@router.get("/medical-reports", response_model=list[MedicalReportResponse])
async def list_reports(
    profile_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> list[MedicalReportResponse]:
    try:
        reports = await firebase.list_medical_reports(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return [MedicalReportResponse(**r) for r in reports]


@router.get("/medical-reports/{report_id}", response_model=MedicalReportResponse)
async def get_report(
    profile_id: str,
    report_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> MedicalReportResponse:
    try:
        report = await firebase.get_medical_report(profile_id, report_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return MedicalReportResponse(**report)
