"""Firestore access for app state (profiles + caregiver link tokens)."""

from __future__ import annotations

import logging
import secrets
from datetime import datetime, timezone
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore

from config import settings

logger = logging.getLogger(__name__)

PROFILES = "profiles"
LINKS = "caregiver_links"


class FirestoreError(Exception):
    pass


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_firebase() -> None:
    if firebase_admin._apps:
        return
    try:
        cred = credentials.Certificate(settings.firebase_service_account_path)
        firebase_admin.initialize_app(cred)
    except Exception as exc:
        logger.exception("Firebase init failed")
        raise FirestoreError(
            "Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH."
        ) from exc


def _db():
    _ensure_firebase()
    return firestore.client(database_id="careloop-db")


async def create_profile(*, name: str, admin_uid: str | None = None) -> dict[str, Any]:
    db = _db()
    doc_ref = db.collection(PROFILES).document()
    payload = {
        "name": name.strip(),
        "admin_uid": admin_uid,
        "created_at": _utcnow(),
    }
    doc_ref.set(payload)
    return {"profile_id": doc_ref.id, **payload}


async def get_profile(profile_id: str) -> dict[str, Any] | None:
    db = _db()
    snap = db.collection(PROFILES).document(profile_id).get()
    if not snap.exists:
        return None
    data = snap.to_dict() or {}
    return {"profile_id": snap.id, **data}


async def create_caregiver_link(profile_id: str) -> dict[str, Any]:
    profile = await get_profile(profile_id)
    if not profile:
        raise FirestoreError("Profile not found.")

    token = secrets.token_urlsafe(24)
    db = _db()
    doc_ref = db.collection(LINKS).document()
    payload = {
        "token": token,
        "profile_id": profile_id,
        "status": "active",
        "caregiver_name": None,
        "created_at": _utcnow(),
        "last_used_at": None,
    }
    doc_ref.set(payload)

    return {
        "link_id": doc_ref.id,
        "token": token,
        "url": f"{settings.caregiver_link_base_url}/{token}",
        **payload,
    }


async def list_caregiver_links(profile_id: str) -> list[dict[str, Any]]:
    db = _db()
    query = (
        db.collection(LINKS)
        .where("profile_id", "==", profile_id)
        .where("status", "==", "active")
    )
    links: list[dict[str, Any]] = []
    for snap in query.stream():
        data = snap.to_dict() or {}
        links.append({"link_id": snap.id, **data})
    return links


async def revoke_caregiver_link(profile_id: str, link_id: str) -> None:
    db = _db()
    doc_ref = db.collection(LINKS).document(link_id)
    snap = doc_ref.get()
    if not snap.exists:
        raise FirestoreError("Link not found.")
    data = snap.to_dict() or {}
    if data.get("profile_id") != profile_id:
        raise FirestoreError("Link does not belong to this profile.")
    doc_ref.update({"status": "revoked", "revoked_at": _utcnow()})


async def validate_caregiver_token(token: str) -> dict[str, Any]:
    db = _db()
    query = (
        db.collection(LINKS)
        .where("token", "==", token)
        .where("status", "==", "active")
        .limit(1)
    )
    matches = list(query.stream())
    if not matches:
        raise FirestoreError("Invalid or revoked caregiver link.")

    snap = matches[0]
    data = snap.to_dict() or {}
    doc_ref = db.collection(LINKS).document(snap.id)
    doc_ref.update({"last_used_at": _utcnow()})
    return {"link_id": snap.id, **data}


async def set_caregiver_name(token: str, caregiver_name: str) -> dict[str, Any]:
    link = await validate_caregiver_token(token)
    db = _db()
    doc_ref = db.collection(LINKS).document(link["link_id"])
    doc_ref.update({"caregiver_name": caregiver_name.strip()})
    link["caregiver_name"] = caregiver_name.strip()
    return link
