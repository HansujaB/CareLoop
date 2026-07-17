from fastapi import APIRouter, Depends, HTTPException

from config import settings
from deps.profile_auth import require_owned_profile
from models.schemas import CaregiverLinkResponse
from services import firebase
from services.firebase import FirestoreError

router = APIRouter(prefix="/profiles/{profile_id}/links", tags=["links"])


@router.post("", response_model=CaregiverLinkResponse)
async def create_link(
    profile_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> CaregiverLinkResponse:
    try:
        link = await firebase.create_caregiver_link(profile_id)
    except FirestoreError as exc:
        status = 404 if "not found" in str(exc).lower() else 503
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    return CaregiverLinkResponse(
        link_id=link["link_id"],
        token=link["token"],
        url=link["url"],
        status=link["status"],
    )


@router.get("", response_model=list[CaregiverLinkResponse])
async def list_links(
    profile_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> list[CaregiverLinkResponse]:
    try:
        links = await firebase.list_caregiver_links(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return [
        CaregiverLinkResponse(
            link_id=link["link_id"],
            token=link["token"],
            url=f"{settings.caregiver_link_base_url}/{link['token']}",
            status=link["status"],
            caregiver_name=link.get("caregiver_name"),
            locked_ip=link.get("locked_ip"),
        )
        for link in links
    ]


@router.delete("/{link_id}")
async def revoke_link(
    profile_id: str,
    link_id: str,
    _profile: dict = Depends(require_owned_profile),
) -> dict[str, bool]:
    try:
        await firebase.revoke_caregiver_link(profile_id, link_id)
    except FirestoreError as exc:
        status = 404 if "not found" in str(exc).lower() else 400
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    return {"ok": True}
