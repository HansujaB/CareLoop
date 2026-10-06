"""High-level care memory flows: recall from Mem0, phrase with Groq."""

from __future__ import annotations

from config import mem0_user_id
from services import firebase, mem0, groq

HANDOVER_QUERY = (
    "What should a caregiver know before starting a shift? Include allergies, "
    "medications and timings, routines, nap schedule, behavioral notes, and any "
    "recent updates or incidents."
)

HANDOVER_SYSTEM = (
    "You write shift handover briefings for caregivers. Use only the provided context. "
    "Write one coherent paragraph in a warm, spoken tone — like someone who knows them well "
    "briefing the caregiver. Do not use bullet points or headers. If something is "
    "missing from context, omit it rather than guessing."
)

CHAT_SYSTEM = (
    "You are a care assistant for a caregiver on shift. Answer using only the provided context. "
    "Be concise, practical, and friendly. Output plain text only — no bold, no asterisks, "
    "no headers, no markdown formatting of any kind. "
    "If the context does not contain the answer, say you do not have that information in the care profile."
)


async def remember_for_profile(profile_id: str, text: str) -> None:
    await mem0.remember_text(text, mem0_user_id(profile_id))
    # Bump the memory version so the handover cache is invalidated
    await firebase.bump_memory_version(profile_id)


async def answer_question(profile_id: str, question: str) -> str:
    context = await mem0.recall(question, mem0_user_id(profile_id))
    if not context:
        return "I don't have that information in the care profile yet."
    return await groq.phrase_response(
        system_prompt=CHAT_SYSTEM,
        user_prompt=f"Context:\n{context}\n\nQuestion: {question}",
    )


async def generate_handover(profile_id: str) -> str:
    # Return cached summary if no new memories have been added since last generation
    cached_summary, handover_version, memory_version = await firebase.get_handover_cache(profile_id)
    if cached_summary and handover_version == memory_version:
        return cached_summary

    context = await mem0.recall(HANDOVER_QUERY, mem0_user_id(profile_id))
    if not context:
        return (
            "No care information has been added to this profile yet. "
            "Ask your care admin to add details before your shift."
        )
    summary = await groq.phrase_response(
        system_prompt=HANDOVER_SYSTEM,
        user_prompt=f"Context:\n{context}",
        max_tokens=500,
    )
    # Cache the result at the current version
    await firebase.set_handover_cache(profile_id, summary, memory_version)
    return summary


async def get_emergency_card(profile_id: str) -> str | None:
    """Return the admin-written emergency card, or None if not written yet."""
    return await firebase.get_emergency_card(profile_id)


async def set_emergency_card(profile_id: str, content: str) -> None:
    """Save the admin-written emergency card to Firestore."""
    await firebase.set_emergency_card(profile_id, content)


MEDICAL_DRAFT_SYSTEM = (
    "You turn raw medical report extracts into a short parent-editable history card. "
    "Use ONLY facts explicitly stated in the reports — conditions, medications with dose/timing, "
    "allergies, and routine or follow-up appointments with dates. Do not infer, diagnose, or add "
    "advice. If an appointment date is stated, keep it verbatim. If something is missing, omit it. "
    "Output plain text only, no markdown, in this shape:\n"
    "Conditions: ...\n\nMedications: ...\n\nRoutine appointments:\n- ...\n\n"
    "Keep it under 250 words so a parent can quickly review and edit it."
)


async def draft_medical_history(profile_id: str) -> str:
    """
    Draft the medical history card from stored report extracts (Firestore only,
    never Mem0). Saves the draft to Firestore so the parent can edit it after.
    Raises ValueError if there are no reports, GroqError/FirestoreError otherwise.
    """
    reports = await firebase.list_medical_reports(profile_id, limit=10)
    chunks: list[str] = []
    total = 0
    for r in reports:
        text = (r.get("extracted_text") or "").strip()
        if not text:
            continue
        snippet = text[:1500]
        if total + len(snippet) > 12000:
            snippet = snippet[: max(0, 12000 - total)]
        chunks.append(f"[{r.get('filename', 'report')}]\n{snippet}")
        total += len(snippet)
        if total >= 12000:
            break
    if not chunks:
        raise ValueError("No uploaded reports to draft from yet.")

    draft = await groq.phrase_response(
        system_prompt=MEDICAL_DRAFT_SYSTEM,
        user_prompt="Reports:\n\n" + "\n\n---\n\n".join(chunks),
        max_tokens=800,
    )
    draft = draft.strip()[:4000]
    await firebase.set_medical_history_card(profile_id, draft)
    return draft
