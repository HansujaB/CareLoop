from pydantic import BaseModel, Field


class CreateProfileRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    # Optional relationship of the admin to the person cared for
    # (e.g. "daughter", "spouse", "nurse"). Display-only, never validated.
    relationship: str = Field(default="", max_length=40)


class ProfileResponse(BaseModel):
    profile_id: str
    name: str
    relationship: str = ""


class RememberTextRequest(BaseModel):
    text: str = Field(min_length=1)


class RememberResponse(BaseModel):
    ok: bool = True
    message: str = "Saved to care memory."


class TranscribeResponse(BaseModel):
    text: str


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)


class ChatResponse(BaseModel):
    answer: str


class HandoverResponse(BaseModel):
    summary: str


class EmergencyCardResponse(BaseModel):
    content: str


class CaregiverLinkResponse(BaseModel):
    link_id: str
    token: str
    url: str
    status: str
    caregiver_name: str | None = None
    locked_device_id: str | None = None


class CaregiverSessionRequest(BaseModel):
    caregiver_name: str = Field(min_length=1, max_length=80)


class SetEmergencyCardRequest(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class MedicalHistoryResponse(BaseModel):
    content: str


class SetMedicalHistoryRequest(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class MedicalReportResponse(BaseModel):
    report_id: str
    filename: str
    content_type: str = ""
    extracted_text: str
    ocr_chars: int = 0
    created_at: str | None = None


class ErrorResponse(BaseModel):
    detail: str
