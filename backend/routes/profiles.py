from fastapi import APIRouter, HTTPException

from models.schemas import CreateProfileRequest, ProfileResponse
from services import firebase
from services.firebase import FirestoreError

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=ProfileResponse)
async def create_profile(body: CreateProfileRequest) -> ProfileResponse:
    try:
        profile = await firebase.create_profile(name=body.name)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ProfileResponse(profile_id=profile["profile_id"], name=profile["name"])


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: str) -> ProfileResponse:
    profile = await firebase.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return ProfileResponse(profile_id=profile["profile_id"], name=profile["name"])
