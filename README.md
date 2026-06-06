# AI Context-Aware Notification System

Production-like, hackathon-friendly full-stack system that tracks browsing activity, infers user context, decides notification delivery strategy, and streams live updates to a dashboard.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI (Python)
- Database: MongoDB
- Cache/Queue: Redis
- AI: Google Gemini API
- Real-time: WebSockets
- Extension: Chrome Extension (Manifest V3)

## Root Structure

```text
/project-root
  /extension
  /backend
  /webapp
  /docs
  .env.example
  README.md
```

## Real-time Flow

Extension -> Backend -> Redis -> WebSocket -> Frontend

## Backend Setup (FastAPI)

From `backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` from `backend/.env.example` and fill values.

Run backend:

```bash
python run.py
```

Equivalent explicit command:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Backend Environment Variables

- `MONGO_URI=`
- `MONGO_DB_NAME=context_notifier`
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`
- `REDIS_DB=0`
- `GEMINI_API_KEY=`
- `GEMINI_MODEL=gemini-1.5-flash`
- `BACKEND_HOST=0.0.0.0`
- `BACKEND_PORT=8000`

### Backend Routes

- `POST /activity`
- `GET /state`
- `GET /notifications`
- `GET /notifications/summary`
- `POST /notifications/simulate`
- `WS /ws/dashboard`

## Redis Setup

### Docker

```bash
docker run -d --name redis-local -p 6379:6379 redis
```

### Local Install

Install Redis locally and ensure it is running on `localhost:6379`.

## MongoDB Setup

Use either:

- Local MongoDB (`mongodb://localhost:27017`)
- MongoDB Atlas (`mongodb+srv://...`)

Put the connection string in `backend/.env` as `MONGO_URI`.

## Gemini API Setup

1. Create an API key from Google AI Studio.
2. Add it to `backend/.env`:

```text
GEMINI_API_KEY=your_key_here
```

If missing or invalid, backend falls back to deterministic summary text.

## Frontend Setup (React + Tailwind)

From `webapp/`:

```bash
npm install
```

Create `.env` from `webapp/.env.example`:

```text
VITE_API_URL=http://127.0.0.1:8000
VITE_WS_URL=ws://127.0.0.1:8000/ws/dashboard
```

Run frontend:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

## Chrome Extension Setup

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked and select `extension/`.
4. Default backend URL is `http://127.0.0.1:8000` (stored in extension sync storage key `backendBaseUrl`).

## How To Test End-to-End

1. Start MongoDB.
2. Start Redis.
3. Start backend (`python run.py`).
4. Start frontend (`npm run dev -- --host 0.0.0.0 --port 5173`).
5. Open dashboard in browser.
6. Load extension and browse/switch tabs.
7. Confirm:
   - state changes live (`focused`, `distracted`, `idle`)
   - delayed/delivered notifications update in real time
  - recent notifications appear at top of dashboard
  - snooze any notification directly from dashboard (5/10/15/30 min)
   - AI summary card updates
8. Optionally trigger manual notification:

```bash
curl -X POST http://127.0.0.1:8000/notifications/simulate
```

## Windows 11 LAN Access (Mobile on Same WiFi)

1. Find laptop Wi-Fi IPv4, e.g. `192.168.1.116`.
2. Set `webapp/.env`:

```text
VITE_API_URL=http://192.168.1.116:8000
VITE_WS_URL=ws://192.168.1.116:8000/ws/dashboard
```

3. Start frontend with host binding:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

4. Open from mobile:

```text
http://192.168.1.116:5173
```

5. Allow Windows Firewall inbound rules for ports `8000` and `5173` on Private networks.

## Notes

- Multi-user support is scaffolded through `user_id` in backend models and routes.
- MongoDB and Redis are the active persistence/queue layers (no in-memory primary path).
- Architecture is modular and ready for further production hardening (auth, retries, observability, rate limits).
