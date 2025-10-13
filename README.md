# StudyAid (Sunhacks)

A full‑stack AI-powered study platform built during Sunhacks. StudyAid (repo: Sunhacks) provides course generation, AI tutoring/chat, PDF parsing/ocr, slide & video generation, student progress tracking and teacher analytics.

## Table of contents
- Project overview
- Tech stack
- Repo layout
- Getting started (local)
  - Prerequisites
  - Environment variables (.env template)
  - Install & run (backend + frontend)
- API overview (key endpoints)
- Important implementation details
- Troubleshooting
- Contribution & notes

## Project overview

StudyAid is intended to make learning easier by combining:
- AI course generation from PDFs or short descriptions (Groq/Gemini)
- An AI chat/tutor backed by Lyzr (with fallback mock)
- PDF parsing and optional OCR (Google Vision)
- Automated slide + narrated video generation (Gemini + Unsplash + gTTS + ffmpeg)
- Course, student and achievement models stored in MongoDB

This README documents how to run the project locally, environment variables you must provide, and the most important endpoints used by the frontend.

## Tech stack

- Backend: Node.js (CommonJS), Express
- Database: MongoDB (mongoose)
- Frontend: React + Vite + Tailwind (see `frontend/`)
- AI / external services: Groq (groq-sdk), Lyzr agent, Google Vision (optional), Unsplash, Gemini (via Google generative language API)
- Media: canvas, gTTS, fluent-ffmpeg (ffmpeg-static used)

## Repo layout (top-level)

- `backend/` — Express server, controllers, routes, services, Mongoose models
  - `server.js` — app entry
  - `config/db.js` — MongoDB connection
  - `routes/` — route definitions (auth, courses, chat, video, pdf, etc.)
  - `controllers/` — request handlers and business logic
  - `services/` — external API wrappers (Groq, Lyzr, Unsplash, etc.)
  - `models/` — Mongoose schemas
  - `uploads/`, `outputs/` — runtime directories (created automatically)
- `frontend/` — React app (Vite)

Open the folders to explore more specific files (e.g. controllers and routes are wired in `backend/server.js`).

## Prerequisites

- Node.js (v18+ recommended)
- npm (or yarn)
- MongoDB database (local or cloud)
- (Optional) API keys for: Groq, Lyzr, Unsplash, Google Vision / Gemini

Notes:
- ffmpeg is provided via `ffmpeg-static` so you normally don't need a system ffmpeg. If you run into ffmpeg errors, installing ffmpeg with Homebrew (`brew install ffmpeg`) can help.

## Environment variables

Create a `.env` file in `backend/` (or set environment variables in your host). Example template:

```
# Mongo
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/studyaid?retryWrites=true&w=majority

# JWT for auth
JWT_SECRET=super_secret_jwt_key

# Optional: port to run backend
PORT=5000

# Groq API key (used by course generator / interview controllers)
GROQ_API_KEY=your_groq_api_key

# Lyzr chat agent credentials
LYZR_API_KEY=your_lyzr_api_key
LYZR_AGENT_ID=your_lyzr_agent_id

# Unsplash (image backgrounds)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# (Optional) Google Vision OCR key used by PDF OCR fallback
VISION_API_KEY=your_google_vision_api_key

# Gemini / Google generative language key (used for slide generation)
GEMINI_API_KEY=your_gemini_api_key

```

Only `MONGO_URI` is strictly required to start the app; other service integrations will run with fallbacks or be disabled if keys are missing (the README includes notes where fallbacks are used).

## Install & run

Open two terminals for backend and frontend.

Backend (from `backend/`):

```bash
cd backend
npm install
# copy .env with correct values
npm run start    # runs `npm run dev` -> nodemon server.js
```

Frontend (from `frontend/`):

```bash
cd frontend
npm install
npm run dev
```

Build frontend for production:

```bash
cd frontend
npm run build
```

Notes:
- Backend default port: `process.env.PORT` or 5000. The CORS config in `backend/server.js` allows the Vite dev servers and the deployed Vercel app origin.
- When running locally, point the frontend API base URL to `http://localhost:5000` (or whichever port you set).

## Key API endpoints

The backend mounts routes under `/api` (and a few exceptions). Here are the most important ones used by the frontend.

Auth
- POST /api/auth/signup — body: { name, email, password, language, role }
- POST /api/auth/login — body: { email, password }

Courses
- POST /api/courses (or /api/courses/create) — create course (multipart: pdf upload) — auth required
- GET /api/courses/public — list public courses — auth required
- GET /api/courses/enrolled — list student enrolled courses
- POST /api/courses/enroll — enroll a student
- GET /api/courses/:courseId/content — get course content tree
- PUT /api/courses/:courseId/progress — update progress
- PUT /api/courses/:courseId/complete — mark complete

Chat / Tutor
- POST /api/chat/message — send message to AI tutor (body: { message, courseId, conversationHistory }) — auth required
- GET /api/chat/history/:courseId — fetch recent chat history for a course — auth required

PDF
- POST /api/tools/parse-pdf — multipart form field `file` — returns extracted text (uses pdf-parse; tries Google Vision OCR if text is small and VISION_API_KEY is present)

Video / Slides
- POST /api/video/create-topic-video — body: { topic } — Generates narrated slide video (uses Gemini API key) — auth required
- POST /api/video/create-topic-video-progress — same, but streams Server-Sent Events progress during generation
- DELETE /api/video/delete-video — body: { videoUrl } — deletes a generated video file

Achievements / Student / Teacher analytics
- `/api/achievements`, `/api/student`, `/api/teacher` — see routes for more endpoints. Most require auth.

Public root & health
- GET / — basic JSON welcome
- GET /health — health check

Authentication
- Routes use JWT tokens returned at signup/login. The token is expected in the `Authorization` header as `Bearer <token>`.

## Important implementation notes

- Database: `backend/config/db.js` reads `process.env.MONGO_URI` and connects via mongoose.
- Auth: JWT tokens are generated using `process.env.JWT_SECRET` (fallback `'your-secret-key'` if not set — change for production).
- File handling: multer is used in-memory for PDF uploads in `pdfRoutes`.
- Media output: `backend/outputs/` stores generated images and videos and is served statically at `/outputs`.
- Video generation: slides are generated via Gemini text output; images are fetched from Unsplash (if key present) or using placeholders. Audio uses `gtts` (text-to-speech) and videos are assembled with `fluent-ffmpeg` + `ffmpeg-static`.
- External services have fallbacks where possible (e.g., Lyzr chat has a mock response generator when the API fails).

## Troubleshooting & common issues

- MongoDB connection error: verify `MONGO_URI` and network access. Look at server logs for `Database connection error:`.
- JWT auth failing: ensure `JWT_SECRET` is set the same across services and contains no multiline characters.
- Missing API key errors: controllers/services will throw or fall back. Example: `GEMINI API key not set` when generating slides — set `GEMINI_API_KEY` in `.env`.
- ffmpeg / video generation crashes: if `ffmpeg-static` is not compatible with your machine, install ffmpeg via Homebrew: `brew install ffmpeg`.
- CORS issues: `backend/server.js` config allows typical local dev origins (ports 3000, 5173, 4173) and the deployed Vercel domain. Adjust `corsOptions.origin` if you run frontend on a different origin.

## Contribution & notes

- Branching: this repo has `main`. Create PRs against `main` and keep changes scoped.
- Tests: there are currently no automated tests in the repo. Add unit tests in `backend/test` and `frontend/__tests__` as needed.
- Small improvements you can help with:
  - Add README sections per-controller to document request/response shapes.
  - Add CI to run basic lint/test and start servers.
  - Add TypeScript types for backend for safer refactor.

If you want, I can also:
- Add a short `.env.example` file to the `backend/` folder.
- Add a dev-compose (docker-compose) to run MongoDB + backend + frontend locally.

---

If you'd like, I can now add a `.env.example` file and a short CONTRIBUTING.md. What would you prefer next?

---
Generated: 2025-10-13
