from fastapi import APIRouter, Depends, Header, HTTPException

from deps.profile_auth import require_owned_profile
from models.schemas import CreateProfileRequest, ProfileResponse
from services import firebase
from services.firebase import FirestoreError

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=ProfileResponse)
async def create_profile(
    body: CreateProfileRequest,
    x_firebase_uid: str | None = Header(default=None),
) -> ProfileResponse:
    if not x_firebase_uid:
        raise HTTPException(status_code=401, detail="X-Firebase-UID header required.")
    try:
        profile = await firebase.create_profile(
            name=body.name,
            admin_uid=x_firebase_uid,
            relationship=body.relationship,
        )
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ProfileResponse(
        profile_id=profile["profile_id"],
        name=profile["name"],
        relationship=profile.get("relationship", ""),
    )


@router.get("/mine", response_model=list[ProfileResponse])
async def get_my_profiles(
    x_firebase_uid: str | None = Header(default=None),
) -> list[ProfileResponse]:
    """Return ALL profiles for this Firebase UID (oldest first), or [] if none exists."""
    if not x_firebase_uid:
        raise HTTPException(status_code=401, detail="X-Firebase-UID header required.")
    profiles = await firebase.get_profiles_by_uid(x_firebase_uid)
    return [
        ProfileResponse(
            profile_id=p["profile_id"],
            name=p["name"],
            relationship=p.get("relationship", ""),
        )
        for p in profiles
    ]


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(
    profile_id: str,
    profile: dict = Depends(require_owned_profile),
) -> ProfileResponse:
    return ProfileResponse(
        profile_id=profile["profile_id"],
        name=profile["name"],
        relationship=profile.get("relationship", ""),
    )
