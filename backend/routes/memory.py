from fastapi import APIRouter, Depends, HTTPException

from deps.profile_auth import require_owned_profile
from models.schemas import RememberResponse, RememberTextRequest
from services import care_memory
from services.mem0 import Mem0Error

router = APIRouter(prefix="/profiles/{profile_id}", tags=["memory"])


@router.post("/remember", response_model=RememberResponse)
async def remember_text(
    profile_id: str,
    body: RememberTextRequest,
    _profile: dict = Depends(require_owned_profile),
) -> RememberResponse:
    try:
        await care_memory.remember_for_profile(profile_id, body.text)
    except Mem0Error as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return RememberResponse()
