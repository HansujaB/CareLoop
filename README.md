<div align="center">

# 🫶 CareLoop

**AI-powered care memory for families and caregivers.**

CareLoop lets parents build a living, searchable knowledge base about their child's care — medications, allergies, routines, behavioral notes — and share it instantly with any caregiver via a one-tap link. No login required for caregivers.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Expo](https://img.shields.io/badge/Mobile-Expo%20SDK%2056-000020?style=flat-square&logo=expo)](https://expo.dev)
[![Mem0](https://img.shields.io/badge/Memory-Mem0%20Cloud-6366F1?style=flat-square)](https://mem0.ai)
[![Groq](https://img.shields.io/badge/LLM-Groq%20%2B%20Llama%203.3-F55036?style=flat-square)](https://groq.com)
[![Firebase](https://img.shields.io/badge/DB-Firebase%20%2B%20Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI care memory** | Add care notes via text or voice. Mem0 stores and connects the facts. |
| 💬 **Natural Q&A** | Ask "What time is the inhaler?" — get a precise, contextual answer. |
| 📋 **Shift handover** | Auto-generated caregiver briefing from everything stored in the profile. |
| 🚨 **Emergency card** | Critical allergies, meds, and contacts surfaced instantly. |
| 🔗 **Link-based access** | Share access with caregivers via a token link — no account needed. |
| 🔒 **Revocable access** | Instantly cut off a caregiver's access from the app. |
| 🎙 **Voice input** | Record care updates; Groq Whisper transcribes and saves them. |
| 📄 **Medical record upload** | PDF/image → OCR → cleaned by Groq → saved to care memory. |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Expo App (React Native)                                │
│  Admin: add memory / manage links / chat / handover     │
│  Caregiver: link-in welcome / shift handover / chat     │
└──────────────────┬──────────────────────────────────────┘
                   │ REST (EXPO_PUBLIC_API_URL)
┌──────────────────▼──────────────────────────────────────┐
│  FastAPI Backend                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  services/  │  │  services/   │  │  services/    │  │
│  │  mem0.py    │  │  groq.py     │  │  firebase.py  │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬────────┘  │
└─────────│────────────────│─────────────────│───────────┘
          │                │                 │
    ┌─────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │ Mem0 Cloud │  │  Groq API   │  │  Firestore  │
    │ (memory)   │  │ (LLM+STT)   │  │ (profiles + │
    └────────────┘  └─────────────┘  │  cg tokens) │
                                     └─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Expo Go app on your phone (iOS or Android)
- A Firebase project with Firestore enabled
- API keys for Mem0 Cloud and Groq

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → Edit .env with your keys (see ENV table below)

# Add your Firebase service account JSON
# Download from Firebase Console → Project Settings → Service Accounts
# Save as: backend/firebase-service-account.json

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create your frontend env file
echo "EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000" > .env

# Start Expo dev server
npx expo start --clear

# Scan the QR code with Expo Go on your phone
```

> **Tip:** Use your machine's local network IP (e.g. `192.168.1.x`), not `localhost`, so your phone can reach the backend.

---

## 🔑 Environment Variables

### `backend/.env`

| Variable | Required | Description | Where to get it |
|---|---|---|---|
| `MEM0_API_KEY` | ✅ | Mem0 Cloud API key for care memory storage & search | [app.mem0.ai](https://app.mem0.ai) → API Keys |
| `GROQ_API_KEY` | ✅ | Groq API key for Whisper transcription + Llama LLM | [console.groq.com](https://console.groq.com) → API Keys |
| `GROQ_LLM_MODEL` | ⬜ | LLM model for phrasing responses | Default: `llama-3.3-70b-versatile` |
| `GROQ_WHISPER_MODEL` | ⬜ | Whisper model for voice transcription | Default: `whisper-large-v3-turbo` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ✅ | Path to Firebase service account JSON | Firebase Console → Project Settings → Service Accounts → Generate new private key |
| `CAREGIVER_LINK_BASE_URL` | ⬜ | Deep link base for caregiver URLs | Default: `careloop://c` |

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | URL of your running FastAPI backend (e.g. `http://192.168.1.10:8000`) |

---

## 📱 App Flow

### Admin (Parent)

1. **Onboard** → create a care profile for your child
2. **Add memory** → type or record care notes (allergies, medications, routines)
3. **Upload records** → medical PDFs/images get OCR'd and saved to memory
4. **Share link** → generate a one-tap link for your caregiver
5. **Review** → preview the shift handover, test the assistant, check emergency card

### Caregiver

1. **Receive link** → tap the link the parent shared
2. **Welcome screen** → enter your name, get the shift briefing instantly
3. **Chat** → ask questions about the child's care during shift
4. **Emergency** → tap to see critical allergies and contacts

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | Expo SDK 56 (React Native) |
| Navigation | Expo Router v4 (file-based) |
| Backend | FastAPI + Uvicorn |
| Care memory | **Mem0 Cloud** — semantic memory storage & search |
| LLM phrasing | **Groq** — Llama 3.3 70B Versatile |
| Voice STT | **Groq** — Whisper Large v3 Turbo |
| Auth / DB | Firebase Authentication + Firestore |
| File storage | Firebase Storage (medical record originals) |

---

## 📂 Project Structure

```
careloop/
├── backend/
│   ├── config.py               # Settings from .env
│   ├── main.py                 # FastAPI app + CORS
│   ├── requirements.txt
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── routes/
│   │   ├── profiles.py         # Create/get care profiles
│   │   ├── memory.py           # POST /remember (text)
│   │   ├── voice.py            # POST /voice (audio → STT → memory)
│   │   ├── care.py             # GET /handover, /chat, /emergency
│   │   ├── links.py            # Caregiver link CRUD
│   │   └── caregiver.py        # Caregiver-facing endpoints (token auth)
│   └── services/
│       ├── mem0.py             # All Mem0 Cloud calls
│       ├── groq.py             # All Groq calls (Whisper + LLM)
│       └── firebase.py         # Firestore + Auth helpers
│
└── frontend/
    └── src/
        ├── app/
        │   ├── (admin)/        # Parent screens
        │   ├── (caregiver)/    # Caregiver screens
        │   ├── (auth)/         # Login / signup
        │   └── onboarding/     # First-run flow
        ├── components/         # Reusable UI components
        ├── constants/          # Theme, typography
        ├── context/            # SessionContext (auth state)
        └── services/
            └── api.ts          # All backend API calls
```

---

## 🔐 Security Notes

- **Caregiver tokens** are validated server-side on every request — revoked tokens fail immediately
- **Admin auth** uses Firebase Authentication
- **API keys** are never committed — use `.env` (gitignored)
- Firebase service account JSON is gitignored

---

## 📄 License

MIT — built for the hackathon. See [LICENSE](frontend/LICENSE).
