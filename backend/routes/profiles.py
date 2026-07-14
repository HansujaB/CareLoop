from fastapi import APIRouter, Header, HTTPException

from models.schemas import CreateProfileRequest, ProfileResponse
from services import firebase
from services.firebase import FirestoreError

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=ProfileResponse)
async def create_profile(
    body: CreateProfileRequest,
    x_firebase_uid: str | None = Header(default=None),
) -> ProfileResponse:
    try:
        profile = await firebase.create_profile(name=body.name, admin_uid=x_firebase_uid)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ProfileResponse(profile_id=profile["profile_id"], name=profile["name"])


@router.get("/mine", response_model=ProfileResponse | None)
async def get_my_profile(
    x_firebase_uid: str | None = Header(default=None),
) -> ProfileResponse | None:
    """Return the existing profile for this Firebase UID, or null if none exists."""
    if not x_firebase_uid:
        raise HTTPException(status_code=401, detail="X-Firebase-UID header required.")
    profile = await firebase.get_profile_by_uid(x_firebase_uid)
    if not profile:
        return None
    return ProfileResponse(profile_id=profile["profile_id"], name=profile["name"])


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: str) -> ProfileResponse:
    profile = await firebase.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return ProfileResponse(profile_id=profile["profile_id"], name=profile["name"])
