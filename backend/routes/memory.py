from fastapi import APIRouter, HTTPException

from models.schemas import RememberResponse, RememberTextRequest
from services import care_memory, firebase
from services.mem0 import Mem0Error
from services.firebase import FirestoreError

router = APIRouter(prefix="/profiles/{profile_id}", tags=["memory"])


async def _require_profile(profile_id: str) -> None:
    try:
        profile = await firebase.get_profile(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")


@router.post("/remember", response_model=RememberResponse)
async def remember_text(profile_id: str, body: RememberTextRequest) -> RememberResponse:
    await _require_profile(profile_id)
    try:
        await care_memory.remember_for_profile(profile_id, body.text)
    except Mem0Error as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return RememberResponse()
