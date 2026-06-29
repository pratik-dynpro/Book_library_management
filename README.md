# Book Library Management

A single-user personal book library — add, view, edit, delete, search, and filter your shelf. Built as a working portfolio piece for the AI-SDLC build process defined in [`AI-SDLC-Build-Process.md`](AI-SDLC-Build-Process.md): every change ships inside a five-file packet (BRD, DESIGN, BUILD prompt, ENG-QA prompt, Evidence) with binary acceptance criteria.

## Stack

| Layer | Choice |
|------|--------|
| Frontend | React 18 · Vite 6 · Tailwind 3 · React Router 6 · Axios |
| Backend | FastAPI · Pydantic v2 · SQLAlchemy 2.x · Alembic |
| Database | PostgreSQL 17 (native, local) |
| Tests | Vitest + Testing Library + MSW (frontend) · pytest (backend, Postgres-backed) |

## Prerequisites

- **PostgreSQL 17** installed locally and running on `:5432`. The default superuser is `postgres`. (See [`docs/product/D13-INFRA.md`](docs/product/D13-INFRA.md) for the rationale behind running native Postgres rather than docker-compose.)
- **Python 3.11+** (this repo has been built and tested on Python 3.14).
- **Node 20+**.

## Quickstart (≈ 5 minutes)

### 1. Create the database role and two databases

```bash
psql -U postgres -h localhost -d postgres -c "CREATE ROLE books LOGIN PASSWORD 'books' CREATEDB;"
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE books_dev OWNER books;"
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE books_test OWNER books;"
```

### 2. Configure environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

The defaults match the role and database names created in step 1; no edits needed for local development.

### 3. Install and migrate the backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/alembic.exe -c alembic.ini upgrade head
```

(On macOS/Linux replace `.venv/Scripts/` with `.venv/bin/`.)

### 4. Install the frontend

```bash
cd ../frontend
npm install
```

### 5. Run both services

```bash
# Terminal 1 — backend on :8000
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000

# Terminal 2 — frontend on :5173
cd frontend && npm run dev
```

Open <http://localhost:5173>.

## Environment variables

| Variable | Where | Default | Purpose |
|----------|-------|---------|---------|
| `DATABASE_URL` | `backend/.env` | `postgresql+psycopg://books:books@localhost:5432/books_dev` | Primary connection string. |
| `TEST_DATABASE_URL` | `backend/.env` | `postgresql+psycopg://books:books@localhost:5432/books_test` | Used by pytest with transaction-per-test rollback. |
| `CORS_ORIGINS` | `backend/.env` | `http://localhost:5173` | Comma-separated allowed origins. |
| `VITE_API_BASE_URL` | `frontend/.env` | `http://localhost:8000` | Backend base URL the frontend calls. |

`.env` files are gitignored. `.env.example` files are committed with placeholder values — never put a real secret in either.

## Tests

```bash
# Backend — 37 tests, Postgres-backed
backend/.venv/Scripts/python.exe -m pytest backend/tests

# Frontend — 35 tests, MSW-mocked
cd frontend && npm test -- --run

# Lint
backend/.venv/Scripts/ruff.exe check backend
cd frontend && npm run lint
```

## Project layout

```
Book_library_management/
├── AI-SDLC-Build-Process.md          # the framework
├── CLAUDE.md                         # resume guide for AI sessions
├── Project_Progress_Tracker.xlsx     # live status dashboard
├── README.md                         # this file
│
├── docs/product/                     # 24 planning docs (Stage 1)
├── packets/                          # 13 packets (Stage 2) — five-file cycle each
│
├── backend/
│   ├── alembic/                      # migrations
│   ├── tests/                        # 37 pytest tests
│   ├── database.py · models.py · schemas.py · crud.py · main.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── design/tokens.js          # single source of truth for color + type
        ├── components/               # SearchBar, FilterDropdown, BookCard, etc.
        ├── pages/                    # Home, Books, AddBook, EditBook
        └── services/api.js
```

Read [`docs/product/`](docs/product/) for the complete planning trail: BRD, PRD, architecture, data model, API contracts, design spec, user stories, test cases, NFRs, infra, and migration playbook.

## Deploy (illustrative — `OQ-001` still open)

The hosting target has not been finalised. The notes below sketch the **Render + Vercel** path documented in [`docs/product/D13-INFRA.md`](docs/product/D13-INFRA.md); they are illustrative until `OQ-001` resolves in [`docs/product/OQ-OPEN-QUESTIONS.md`](docs/product/OQ-OPEN-QUESTIONS.md).

### Backend on Render

- Service type: **Web Service** (Python).
- Build command: `pip install -r requirements.txt`.
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
- Add a Postgres add-on; Render injects `DATABASE_URL` into the service.
- Env vars to set manually: `CORS_ORIGINS` (your Vercel domain, comma-separated if multiple).
- Health check path: `/healthz`.
- Run `alembic upgrade head` once after the first deploy (Render shell or release command).

### Frontend on Vercel

- Framework preset: Vite.
- Build command: `npm run build` (default).
- Output directory: `dist`.
- Env var: `VITE_API_BASE_URL` → your Render service URL (no trailing slash).

Cost envelope on free tiers: $0/mo, with Render Postgres free for 90 days (then $7/mo). Render free-tier web services sleep after 15 minutes of idle traffic — acceptable for a portfolio piece, not for production.

## Contributing / how packets work

This project follows the AI-SDLC build process: every change is decomposed into a **packet** under `packets/S-NNN-slug/`. Each packet ships five files:

1. `Packet_BRD.md` — binary acceptance criteria + do-not-break + out-of-scope.
2. `Packet_DESIGN.md` — files in/out, AC↔code map, rollback strategy.
3. `BUILD_prompt.md` — paste-ready prompt for the build session.
4. `ENG-QA_prompt.md` — recipe for a fresh QA session.
5. `Evidence.md` — GREEN/RED verdict with command outputs (written after execution).

A packet merges to `main` only when its Evidence is GREEN and CI is fully green. See [`AI-SDLC-Build-Process.md`](AI-SDLC-Build-Process.md) for the full framework and [`CLAUDE.md`](CLAUDE.md) for the resume guide.

## License

Personal portfolio project. No license granted for redistribution. If you want to reuse parts of it, open an issue.
