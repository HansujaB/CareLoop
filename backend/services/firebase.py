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
        "memory_version": 0,
        "handover_cache": None,
        "handover_version": -1,
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


async def get_profile_by_uid(uid: str) -> dict[str, Any] | None:
    """Look up the first active profile owned by this Firebase UID."""
    if not uid:
        return None
    db = _db()
    query = db.collection(PROFILES).where("admin_uid", "==", uid).limit(1)
    matches = list(query.stream())
    if not matches:
        return None
    snap = matches[0]
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
    # Single-field query only — avoids composite index requirement.
    # Filter active status in Python.
    query = db.collection(LINKS).where("profile_id", "==", profile_id)
    links: list[dict[str, Any]] = []
    for snap in query.stream():
        data = snap.to_dict() or {}
        if data.get("status") == "active":
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


async def validate_caregiver_token(token: str, client_ip: str | None = None) -> dict[str, Any]:
    db = _db()
    query = db.collection(LINKS).where("token", "==", token).limit(1)
    matches = list(query.stream())
    if not matches:
        raise FirestoreError("Invalid or revoked caregiver link.")

    snap = matches[0]
    data = snap.to_dict() or {}
    if data.get("status") != "active":
        raise FirestoreError("Invalid or revoked caregiver link.")

    # IP enforcement: once a device has locked this token, reject other IPs
    locked_ip: str | None = data.get("locked_ip")
    if locked_ip and client_ip and locked_ip != client_ip:
        raise FirestoreError(
            "This care link is already in use from another device. "
            "Ask the parent to generate a new link."
        )

    doc_ref = db.collection(LINKS).document(snap.id)
    doc_ref.update({"last_used_at": _utcnow()})
    return {"link_id": snap.id, **data}


async def set_caregiver_name(token: str, caregiver_name: str, client_ip: str | None = None) -> dict[str, Any]:
    """Register the caregiver name and lock the token to the device IP (first use wins)."""
    link = await validate_caregiver_token(token, client_ip)
    db = _db()
    doc_ref = db.collection(LINKS).document(link["link_id"])
    updates: dict[str, Any] = {"caregiver_name": caregiver_name.strip()}
    # Lock the IP on first login — subsequent logins from a different IP are blocked
    if not link.get("locked_ip") and client_ip:
        updates["locked_ip"] = client_ip
    doc_ref.update(updates)
    link["caregiver_name"] = caregiver_name.strip()
    return link


async def bump_memory_version(profile_id: str) -> int:
    """Increment the memory_version counter. Returns the new version number."""
    db = _db()
    doc_ref = db.collection(PROFILES).document(profile_id)
    snap = doc_ref.get()
    current = (snap.to_dict() or {}).get("memory_version", 0)
    new_version = current + 1
    doc_ref.update({"memory_version": new_version})
    return new_version


async def get_handover_cache(profile_id: str) -> tuple[str | None, int, int]:
    """Returns (cached_summary, handover_version, memory_version)."""
    db = _db()
    snap = db.collection(PROFILES).document(profile_id).get()
    data = snap.to_dict() or {}
    return (
        data.get("handover_cache"),
        data.get("handover_version", -1),
        data.get("memory_version", 0),
    )


async def set_handover_cache(profile_id: str, summary: str, version: int) -> None:
    """Persist the generated handover and the version it was generated at."""
    db = _db()
    db.collection(PROFILES).document(profile_id).update({
        "handover_cache": summary,
        "handover_version": version,
    })


async def get_emergency_card(profile_id: str) -> str | None:
    """Return the parent-authored emergency card text, or None if not set."""
    db = _db()
    snap = db.collection(PROFILES).document(profile_id).get()
    data = snap.to_dict() or {}
    return data.get("emergency_card") or None


async def set_emergency_card(profile_id: str, content: str) -> None:
    """Persist the parent-authored emergency card text."""
    db = _db()
    db.collection(PROFILES).document(profile_id).update({
        "emergency_card": content.strip(),
    })
