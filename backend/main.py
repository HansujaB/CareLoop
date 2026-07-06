import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import care, caregiver, links, memory, profiles, voice

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="CareLoop API",
    description="Backend for CareLoop — care memory powered by Cognee Cloud.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profiles.router)
app.include_router(memory.router)
app.include_router(voice.router)
app.include_router(care.router)
app.include_router(links.router)
app.include_router(caregiver.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
