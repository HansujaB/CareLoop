from pydantic import BaseModel, Field


class CreateProfileRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class ProfileResponse(BaseModel):
    profile_id: str
    name: str


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
    locked_ip: str | None = None


class CaregiverSessionRequest(BaseModel):
    caregiver_name: str = Field(min_length=1, max_length=80)


class ErrorResponse(BaseModel):
    detail: str
