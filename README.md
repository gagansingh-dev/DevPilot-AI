# DevPilot AI: Career Edition

**From Code to Career** — a career intelligence app for students and early-career developers.

DevPilot combines a career profile, PDF resume analysis, public GitHub evidence, a personalized learning roadmap, and AI interview practice in one workflow.

## Current features

- Account registration and sign-in with JWT authentication
- Editable career profile with role, experience, skills, and GitHub username
- PDF upload and resume insights
- Career readiness, strengths, skill gaps, and project recommendations
- GitHub repository, language, activity, and role relevance analysis
- Personalized roadmap with locally saved task completion
- Role-specific interview questions and answer feedback

## Local setup

### 1. PostgreSQL and backend

Create a PostgreSQL database named `devpilot`. Copy `backend/.env.example` to `backend/.env` and set the database URL, a random secret key, a Gemini API key, and a GitHub token. Keep `.env` private and out of Git.

From `backend/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`; interactive API docs are at `http://127.0.0.1:8000/docs`.

### 2. Frontend

In another terminal, from `frontend/`:

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` requests to the local FastAPI service.

## Career loop

1. Create an account and fill in your profile.
2. Add a PDF resume and, optionally, a public GitHub username.
3. Run career analysis to create readiness insights and a five-phase roadmap.
4. Check roadmap tasks off as you complete them.
5. Practice interview questions and request feedback on your answers.
6. Re-analyze after you add new evidence to your resume or GitHub profile.

Career analysis sends the resume text and profile details to the configured Gemini provider. Interview answers are sent to that provider only when the user requests feedback. GitHub analysis reads public GitHub data using the configured token.
