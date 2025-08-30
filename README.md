# Tone Picker Tool

A full‑stack app to rewrite text in different tones. Frontend (React + Vite + Tailwind v4) and Backend (Express). Uses Mistral API for rewriting.

## Quick Start
```bash
# From the repo root
npm install

# Create backend/.env with your Mistral key
cat > backend/.env <<'EOF'
MISTRAL_API_KEY=sk_live_xxx
PORT=4000
CORS_ORIGINS=http://localhost:5173
EOF

# Start both frontend and backend
npm run dev
```
- Frontend: http://localhost:5173
- Backend:  http://localhost:4000

## Project Structure
```
backend/               # Express API (ESM)
  src/
    app.js             # Express app & middleware
    route.js           # /api routes (POST /api/tone)
    services/
      mistralService.js# Mistral client + prompt
      cacheService.js  # LRU cache
  server.js            # Server bootstrap

frontend/              # React + Vite + Tailwind v4
  src/
    App.jsx, components/*, lib/*
  vite.config.js       # Vite + @tailwindcss/vite + /api proxy
  index.html, src/index.css
```

## Frontend
- React 19, Vite 6, Tailwind v4
- Tailwind configured via `@tailwindcss/vite` and `@import "tailwindcss";` in `src/index.css`.
- Dev server proxies `/api/*` → `http://localhost:4000`.

Scripts:
```bash
npm run dev -w frontend
npm run build -w frontend
```

## Backend
- Express (ESM), Mistral SDK, LRU cache
- Env: `backend/.env`
  - `MISTRAL_API_KEY` (required)
  - `PORT` (default 4000)
  - `CORS_ORIGINS` (default http://localhost:5173)

Scripts:
```bash
npm run dev -w backend
npm start -w backend
```

API:
- POST `/api/tone`
  - Body: `{ "text": string, "axes": { "formality": "formal"|"casual", "verbosity": "concise"|"elaborate" } }`
  - Success: `{ "text": string }`

## Formatting & Linting
```bash
npm run lint -w frontend
```
