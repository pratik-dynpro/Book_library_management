# commands.md — quick reference

Every terminal command for running, testing, and operating this project. **Always run commands from the project root** (`C:\Users\Pratik Mali\Desktop\Claude Ai\Book_library_management`), never from inside `backend/.venv` or any subdirectory unless a step explicitly tells you to `cd` somewhere.

> **Shell matters on Windows.** This file shows examples in Git Bash style (forward slashes, bare relative paths). **PowerShell users:** see §0 below before running anything — PowerShell does not execute relative-path executables without the `&` call operator. Easiest fix: activate the venv once per terminal and just type `python` / `alembic` / `ruff`.
>
> macOS/Linux: replace `.venv/Scripts/` with `.venv/bin/` throughout.

> **Authentication note:** This app has **no login screen, no users, no sessions**. Auth is explicitly out-of-scope for v1 (see `CLAUDE.md` §11). The only credentials that exist are local Postgres credentials — they are listed in §Credentials below.

---

## 0. PowerShell vs Git Bash — pick one pattern

### PowerShell — activate the venv (recommended)
```powershell
cd "C:\Users\Pratik Mali\Desktop\Claude Ai\Book_library_management"
backend\.venv\Scripts\Activate.ps1
# Prompt now shows (.venv) — `python`, `alembic`, `ruff`, `pytest` all resolve to the venv automatically.
python -m uvicorn backend.main:app --reload --port 8000
deactivate   # when done
```
**One-time fix** if `Activate.ps1` errors with execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### PowerShell — without activating (use `&`)
```powershell
cd "C:\Users\Pratik Mali\Desktop\Claude Ai\Book_library_management"
& "backend\.venv\Scripts\python.exe" -m uvicorn backend.main:app --reload --port 8000
```

### Git Bash / WSL / macOS / Linux
Bare relative paths work as written in this file:
```bash
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000
```

The rest of this document uses the Git Bash style. To translate any line for PowerShell, either activate the venv first (and drop the `backend/.venv/Scripts/` prefix) or wrap the path in `& "..."`.

---

## 1. First-time setup

### Prerequisites
- PostgreSQL 17 running locally on `:5432` (native install — not Docker).
- Python 3.11+ (3.14 is what this project was built on).
- Node 20+.

### Create the database role and two databases
Run once, as the Postgres superuser:
```bash
psql -U postgres -h localhost -d postgres -c "CREATE ROLE books LOGIN PASSWORD 'books' CREATEDB;"
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE books_dev OWNER books;"
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE books_test OWNER books;"
```

### Copy env files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Defaults are already wired for local dev — no edits needed.

### Install backend + run migrations
```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/alembic.exe -c alembic.ini upgrade head
cd ..
```

### Install frontend
```bash
cd frontend
npm install
cd ..
```

---

## 2. Daily run

Open two terminals from the project root.

### Terminal 1 — backend (uvicorn on :8000)
```bash
# Git Bash
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --port 8000
```
```powershell
# PowerShell (after Activate.ps1)
python -m uvicorn backend.main:app --reload --port 8000
```
- Swagger UI: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/healthz>

### Terminal 2 — frontend (Vite dev on :5173)
```bash
cd frontend
npm run dev
```
App: <http://localhost:5173>

---

## 3. Tests

```bash
# Backend — 37 tests, Postgres-backed (uses books_test DB)
backend/.venv/Scripts/python.exe -m pytest backend/tests

# Backend, quiet mode
backend/.venv/Scripts/python.exe -m pytest backend/tests -q

# Frontend — 35 tests, MSW-mocked (no backend needed)
cd frontend && npm test -- --run

# Frontend, watch mode (re-runs on save)
cd frontend && npm test
```

### Lint
```bash
backend/.venv/Scripts/ruff.exe check backend
cd frontend && npm run lint
```

### Production build (frontend)
```bash
cd frontend && npm run build
# Output: frontend/dist/   (~80 KB gzip)
```

---

## 4. Database management

### Connect with psql
```bash
psql -U books -d books_dev
# password: books
```

### Reset the dev DB to a known empty state
```bash
psql -U books -d books_dev -c "TRUNCATE books RESTART IDENTITY;"
```

### Rebuild schema from scratch (if drift suspected)
```bash
cd backend
.venv/Scripts/alembic.exe -c alembic.ini downgrade base
.venv/Scripts/alembic.exe -c alembic.ini upgrade head
cd ..
```

### Inspect the schema
```bash
psql -U books -d books_dev -c "\d books"
```

### Common ad-hoc queries
```bash
psql -U books -d books_dev -c "SELECT id, book_name, author, status FROM books ORDER BY created_at DESC;"
psql -U books -d books_dev -c "SELECT status, COUNT(*) FROM books GROUP BY status;"
psql -U books -d books_dev -c "SELECT COUNT(*) FROM books WHERE status = 'Read';"
```

---

## 5. Credentials

All credentials below are **local-only**. They never get deployed; production secrets will live in provider env-var UIs (per `docs/product/D13-INFRA.md` §7).

### Postgres roles

| Role | Password | Owns | Purpose |
|------|----------|------|---------|
| `postgres` | `1234` | `postgres` superuser | Bootstrap only — create role/databases once, then never used by the app. |
| `books` | `books` | `books_dev`, `books_test` | The app's runtime user. Used by backend, pytest, and psql examples in this file. |

### Connection strings (already in `backend/.env`)
```
DATABASE_URL=postgresql+psycopg://books:books@localhost:5432/books_dev
TEST_DATABASE_URL=postgresql+psycopg://books:books@localhost:5432/books_test
CORS_ORIGINS=http://localhost:5173
```

### Frontend (already in `frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```

### App-user login
**None.** The app has no auth. Anyone with network access to the backend can read/write the library. This is by design for v1 — the project is a single-user portfolio piece.

---

## 6. Sample data for testing

Use these against a running backend (`:8000`). Each command POSTs one book.

### Via curl (Bash)
```bash
curl -X POST http://localhost:8000/books \
  -H "Content-Type: application/json" \
  -d '{"book_name":"Atomic Habits","author":"James Clear","genre":"Self Help","status":"Read"}'

curl -X POST http://localhost:8000/books \
  -H "Content-Type: application/json" \
  -d '{"book_name":"Deep Work","author":"Cal Newport","genre":"Productivity","status":"Unread"}'

curl -X POST http://localhost:8000/books \
  -H "Content-Type: application/json" \
  -d '{"book_name":"The Pragmatic Programmer","author":"Andy Hunt","genre":"Tech","status":"Read"}'

curl -X POST http://localhost:8000/books \
  -H "Content-Type: application/json" \
  -d '{"book_name":"Designing Data-Intensive Applications","author":"Martin Kleppmann","genre":"Tech","status":"Unread"}'

curl -X POST http://localhost:8000/books \
  -H "Content-Type: application/json" \
  -d '{"book_name":"The Lean Startup","author":"Eric Ries","genre":"Business","status":"Read"}'
```

### Via PowerShell
```powershell
$body = '{"book_name":"Atomic Habits","author":"James Clear","genre":"Self Help","status":"Read"}'
Invoke-RestMethod -Uri http://localhost:8000/books -Method Post -ContentType "application/json" -Body $body
```

### Seed in bulk via psql
```bash
psql -U books -d books_dev <<'SQL'
INSERT INTO books (book_name, author, genre, status) VALUES
  ('Atomic Habits',                       'James Clear',      'Self Help',     'Read'),
  ('Deep Work',                           'Cal Newport',      'Productivity',  'Unread'),
  ('The Pragmatic Programmer',            'Andy Hunt',        'Tech',          'Read'),
  ('Designing Data-Intensive Applications','Martin Kleppmann','Tech',          'Unread'),
  ('The Lean Startup',                    'Eric Ries',        'Business',      'Read'),
  ('Sapiens',                             'Yuval Noah Harari','History',       'Read'),
  ('Thinking, Fast and Slow',             'Daniel Kahneman',  'Psychology',    'Unread'),
  ('Clean Code',                          'Robert Martin',    'Tech',          'Read'),
  ('Range',                               'David Epstein',    'Self Help',     'Read'),
  ('The Phoenix Project',                 'Gene Kim',         'Tech',          'Unread')
ON CONFLICT DO NOTHING;
SQL
```

### Read everything back
```bash
curl http://localhost:8000/books
curl "http://localhost:8000/books?search=atomic"
curl "http://localhost:8000/books?status=Read"
curl "http://localhost:8000/books?author=James%20Clear&status=Read"
```

### Delete a single row
```bash
curl -X DELETE http://localhost:8000/books/1
```

---

## 7. Git / GitHub workflow

```bash
# Status of your working tree
git status
git diff
git log --oneline -10

# Standard packet flow
git checkout -b packet/S-NNN-slug
# ... do work ...
git add <files>
git commit -m "S-NNN: <one-line summary>"
git push -u origin packet/S-NNN-slug
gh pr create --fill
gh run watch                 # wait for CI to finish
gh pr merge --squash --delete-branch

# After merge, refresh local
git checkout main
git pull --ff-only
git fetch --prune
```

### Operating on the live repo
```bash
gh repo view --web                          # open the repo in browser
gh run list --limit 5                       # last 5 CI runs
gh run watch <run-id>                       # block until a run finishes
gh run view <run-id> --log-failed           # show only failed-job logs
gh pr list                                  # open PRs
gh pr checks <pr-num>                       # status of CI on a PR
```

---

## 8. Troubleshooting

### Backend won't start: `OperationalError` or "could not connect"
Check Postgres is running, then test the connection manually:
```bash
psql -U books -d books_dev -c "SELECT 1;"
```
If that fails, re-create the role per §1.

### Pytest hangs or all tests fail with DB errors
Reset the test DB:
```bash
psql -U postgres -h localhost -d postgres -c "DROP DATABASE books_test;"
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE books_test OWNER books;"
cd backend && .venv/Scripts/alembic.exe -c alembic.ini upgrade head
```

### Frontend can't reach backend (`Network error` in console)
- Confirm backend is on `:8000` and `curl http://localhost:8000/healthz` returns `{"status":"ok","db":"ok"}`.
- Confirm `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000`.
- Confirm `backend/.env` has `CORS_ORIGINS=http://localhost:5173`.
- After changing `frontend/.env`, restart `npm run dev` — Vite reads env on boot only.

### Vitest hangs on a single test
Almost always an infinite-render loop. Common cause: `useEffect` with an object-literal dependency. Run with a short timeout to fail fast:
```bash
cd frontend && npm test -- --run --testTimeout=8000
```

### "books page is empty but backend has rows"
Filters in the URL persist. Open <http://localhost:5173/books> with no query string, or click the × on the search bar.

---

## 9. Deploy (illustrative — OQ-001 still open)

Not run yet. See `README.md` §Deploy for the Render + Vercel walk-through. The choice of hosting target is deferred — when you pick one, update `docs/product/OQ-OPEN-QUESTIONS.md` OQ-001 and add the actual deploy commands to this file.
