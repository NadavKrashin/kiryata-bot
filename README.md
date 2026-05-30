# Kiryata Bot 🤖

A Hebrew, RTL, mobile-first chat web app for **קריית התקשוב**. Users ask questions
and an avatar (the Kiryat HaTikshuv VR character) *thinks* while the backend works,
then *types out* the answer gradually.

- **Frontend**: React (Vite), RTL, responsive (phone-first, looks good on desktop too).
- **Backend**: FastAPI. A single hook (`get_answer`) is where the existing
  LLM + Word-docs logic plugs in. Single-turn Q&A (stateless).

## Project structure

```
kiryata-bot/
├── backend/      # FastAPI app + the LLM hook
├── frontend/     # Vite + React app
└── docker-compose.yml
```

## Quick start (local dev)

### Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # adjust if needed
uvicorn app.main:app --reload --port 8000
```
API runs at http://localhost:8000 (docs at `/docs`).

### Frontend
```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
App runs at http://localhost:5173.

### Docker (local, both services)
```bash
docker compose up --build
```

## Environments

Configuration is environment-driven (no code changes between envs):

| Env        | Backend config        | Frontend config            |
|------------|-----------------------|----------------------------|
| local      | `backend/.env`        | `frontend/.env`            |
| staging    | `backend/.env.staging`| `frontend/.env.staging`    |
| production | `backend/.env.production` | `frontend/.env.production` |

See `backend/.env.example` and `frontend/.env.example` for the available keys.

## Staging / production (Docker)

Both services have a `Dockerfile` (backend: uvicorn; frontend: built static
files served by nginx). Configure via a root env file and bring it up:

```bash
cp .env.example .env.production   # edit URLs/origins
docker compose --env-file .env.production up -d --build
```

Key knobs (see `.env.example`): `CORS_ORIGINS` (backend), `FRONTEND_API_URL`
(baked into the frontend build), and the host ports. Health check at
`GET /api/health`.

## Wiring in the LLM

Open [`backend/app/services/llm.py`](backend/app/services/llm.py) and implement
`get_answer(question: str) -> str` with the existing `telegram_bot.py` logic
(LLM call + Word-docs context). Nothing else needs to change.
