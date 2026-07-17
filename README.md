<div align="center">

# CareLoop

**AI-powered care memory for families and caregivers.**

CareLoop lets parents build a living, searchable knowledge base about their child's care — medications, allergies, routines, behavioral notes — and share it instantly with any caregiver via a secure token link. No login required for caregivers.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Expo](https://img.shields.io/badge/Mobile-Expo%20SDK%2056-000020?style=flat-square&logo=expo)](https://expo.dev)
[![Mem0](https://img.shields.io/badge/Memory-Mem0%20Cloud-6366F1?style=flat-square)](https://mem0.ai)
[![Groq](https://img.shields.io/badge/LLM-Groq%20%20-F55036?style=flat-square)](https://groq.com)
[![Firebase](https://img.shields.io/badge/DB-Firebase%20%2B%20Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)

</div>
<div align="center"> 
  Demo:  https://youtube.com/shorts/1BCZu9-OWrM?feature=share
</div>


## Features

| Feature | Description |
|---|---|
| AI care memory | Add care notes by voice or text. Mem0 stores and semantically indexes the facts. |
| Natural language Q&A | Ask "What time is the inhaler?" and get a precise, context-grounded answer. |
| Shift handover | Auto-generated briefing from everything stored in the profile, regenerated only when memory changes. |
| Emergency card | Parent-authored card — allergies, medications, emergency contacts — shown to caregivers exactly as written. |
| Link-based caregiver access | Share access via a one-tap token link. No caregiver account or password needed. |
| IP-locked sessions | A caregiver token is bound to the first device that uses it. A second device is rejected until the parent generates a new link. |
| Revocable access | Instantly cut off a caregiver's access from the parent dashboard. |
| Voice input | Record care updates; Groq Whisper transcribes and saves them to memory. |
| Medical record upload | PDF or image upload — OCR extracts text, Groq cleans it, Mem0 stores it. |

---

## Architecture

```
Expo App (React Native)
  Parent:    add memory / manage links / emergency card / handover preview
  Caregiver: token entry / shift handover / assistant chat / emergency card
       |
       | REST  (EXPO_PUBLIC_API_URL)
       v
FastAPI Backend
  routes/profiles.py    — profile create / lookup
  routes/memory.py      — POST /remember (text)
  routes/voice.py       — POST /transcribe (audio -> Whisper -> memory)
  routes/care.py        — GET /handover, GET+PUT /emergency, POST /chat
  routes/links.py       — caregiver link CRUD
  routes/caregiver.py   — caregiver-facing endpoints (token auth + IP lock)
  routes/upload.py      — file upload -> OCR -> memory
       |
       +-- services/mem0.py      ->  Mem0 Cloud   (care memory storage + search)
       +-- services/groq.py      ->  Groq API     (Whisper STT + Gemma LLM)
       +-- services/firebase.py  ->  Firestore    (profiles, links, caches)
       +-- services/ocr.py       ->  pypdf / Groq vision  (text extraction)
       +-- services/care_memory.py  (orchestration layer)
```

---

## Getting Started

### Prerequisites

- Python 3.11 or later
- Node.js 18 or later
- Expo Go on an iOS or Android device
- A Firebase project with Firestore enabled (database ID: `careloop-db`)
- API keys for Mem0 Cloud and Groq

### Backend

```bash
cd backend

python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt

cp .env.example .env
# Fill in all required values — see the Environment Variables table below

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

npm install

# Set the backend URL in the frontend environment file
# Use your machine's local network IP, not localhost, so the device can reach it
echo "EXPO_PUBLIC_API_URL=http://192.168.x.x:8000" > .env

npx expo start --clear
# Scan the QR code with Expo Go
```

---

## Environment Variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `MEM0_API_KEY` | Yes | Mem0 Cloud API key — [app.mem0.ai](https://app.mem0.ai) |
| `GROQ_API_KEY` | Yes | Groq API key — [console.groq.com](https://console.groq.com) |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Yes | Path to the Firebase service account JSON file |
| `GROQ_LLM_MODEL` | No | LLM model for response phrasing. Default: `openai/gpt-oss-20b` |
| `GROQ_WHISPER_MODEL` | No | Whisper model for voice transcription. Default: `whisper-large-v3-turbo` |
| `CAREGIVER_LINK_BASE_URL` | No | Deep link base for caregiver token URLs. Default: `careloop://c` |

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Yes | URL of the running FastAPI backend, e.g. `http://192.168.1.10:8000` |

---

## App Flows

### Parent

1. Create an account and set up a care profile for your child.
2. Add care memories by voice or text — medications, allergies, routines, incidents.
3. Upload medical records (PDF or image); text is extracted and saved to memory automatically.
4. Write the emergency card — exactly what caregivers will see, no AI paraphrasing.
5. Generate a caregiver link and share it. Revoke it at any time.
6. Review the shift handover summary and test the assistant from the dashboard.

### Caregiver

1. Tap the link the parent shared, or paste the token manually.
2. Enter your name — the session is registered and your device IP is locked to the token.
3. Read the shift handover briefing before starting.
4. Use the assistant to ask questions about the child's care during the shift.
5. Open the emergency card for instant access to critical information.
6. End shift from the profile screen or the side menu.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | Expo SDK 56 (React Native) |
| Navigation | Expo Router v4 (file-based) |
| Backend | FastAPI + Uvicorn |
| Care memory | Mem0 Cloud — semantic storage and search |
| LLM phrasing | Groq — openai/gpt-oss-20b |
| Voice transcription | Groq — Whisper Large v3 Turbo |
| Authentication | Firebase Authentication (admin users only) |
| App state | Firestore (profiles, caregiver links, handover cache) |
| OCR | pypdf (PDF text extraction) + Groq vision (image OCR) |

---

## Project Structure

```
careloop/
├── backend/
│   ├── config.py
│   ├── main.py
│   ├── requirements.txt
│   ├── models/
│   │   └── schemas.py
│   ├── routes/
│   │   ├── profiles.py
│   │   ├── memory.py
│   │   ├── voice.py
│   │   ├── care.py
│   │   ├── links.py
│   │   ├── caregiver.py
│   │   └── upload.py
│   └── services/
│       ├── mem0.py
│       ├── groq.py
│       ├── firebase.py
│       ├── ocr.py
│       └── care_memory.py
│
└── frontend/
    ├── assets/
    │   ├── logo.png
    │   └── logo_with_name.png
    └── src/
        ├── app/
        │   ├── (admin)/        — parent screens
        │   ├── (caregiver)/    — caregiver screens
        │   ├── (auth)/         — login and sign-up
        │   └── onboarding/     — first-run flow
        ├── components/
        ├── constants/          — design tokens (theme.ts)
        ├── context/            — SessionContext
        └── services/
            ├── api.ts          — all backend calls
            └── cache.ts        — AsyncStorage cache for handover and emergency card
```

---

## Security

- Caregiver tokens are validated server-side on every request. Revoked tokens fail immediately.
- A token is bound to the first IP address that uses it. Any subsequent request from a different IP is rejected with a clear error message.
- Admin authentication uses Firebase Authentication. Caregivers do not have accounts.
- API keys and the Firebase service account file are excluded from version control via `.gitignore`.

---

## License

MIT
