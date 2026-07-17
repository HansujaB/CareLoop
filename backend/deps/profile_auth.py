"""Shared route dependencies for admin profile ownership checks."""

from __future__ import annotations

from typing import Any

from fastapi import Header, HTTPException

from services import firebase
from services.firebase import FirestoreError


async def require_owned_profile(
    profile_id: str,
    x_firebase_uid: str | None = Header(default=None),
) -> dict[str, Any]:
    """Verify the caller owns this profile. Claims legacy profiles with no admin_uid."""
    if not x_firebase_uid:
        raise HTTPException(status_code=401, detail="X-Firebase-UID header required.")

    try:
        profile = await firebase.get_profile(profile_id)
    except FirestoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    stored_uid = profile.get("admin_uid")
    if stored_uid is None:
        await firebase.assign_admin_uid(profile_id, x_firebase_uid)
    elif stored_uid != x_firebase_uid:
        raise HTTPException(status_code=403, detail="You do not own this profile.")

    return profile
