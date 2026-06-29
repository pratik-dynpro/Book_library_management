# D13 · Infrastructure

## 1. Environments

| Env | Frontend | Backend | DB | Notes |
|-----|----------|---------|-----|-------|
| Dev | Vite dev server `:5173` | uvicorn `:8000` | **Postgres 16 via docker-compose** (`localhost:5432`, db `books_dev`) | One developer |
| Test (local + CI) | n/a | pytest | **Postgres 16** — docker-compose `db_test` service locally, GitHub Actions `services:` block in CI | Migrations apply once per session |
| Preview (PR) | Vercel preview URL | Render preview service | Render-managed Postgres (preview) | Per-PR, deleted on close |
| Prod | Vercel | Render | Render-managed Postgres | Hosting decision is OQ-001 |

No SQLite in any environment. The hosting decision (OQ-001) is still open; the DB engine (OQ-002) is closed — Postgres everywhere.

## 2. Frontend Deploy (Vercel)

- Build: `npm run build` → static output in `frontend/dist`.
- Env var: `VITE_API_BASE_URL` → backend public URL.
- Auto-deploy on push to `main`.
- Preview URL per PR.

## 3. Backend Deploy (Render)

- Service type: Web Service (Python).
- Build command: `pip install -r requirements.txt`.
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- Env vars: `DATABASE_URL` (Postgres connection string), `CORS_ORIGINS` (CSV of allowed origins).
- Health check: `GET /docs` → 200.

## 4. CI/CD (GitHub Actions)

Workflow file: `.github/workflows/ci.yml` (created in S-013).

| Job | OS | Steps |
|-----|----|-------|
| backend | ubuntu-latest, `services: postgres:16` | checkout → setup-python 3.11 → install → `alembic upgrade head` → `ruff check` → `pytest -q --cov` (against the Postgres service container) |
| frontend | ubuntu-latest | checkout → setup-node 20 → install → `npm run lint` → `npm test -- --run` → `npm run build` |
| security | ubuntu-latest | `pip-audit` (fail on high), `npm audit --omit=dev` (warn) |

Required to merge: backend + frontend jobs green. `security` blocks on highs; warns on mediums.

## 5. Cost Envelope

| Item | Provider | Tier | Monthly cost |
|------|----------|------|--------------|
| Frontend hosting | Vercel | Hobby | $0 |
| Backend hosting | Render | Free | $0 (sleeps after 15 min idle) |
| Postgres (prod) | Render | Free | $0 (90 days, then $7); local dev uses docker-compose at $0 indefinitely |
| CI | GitHub Actions | Free | $0 (2 000 min) |
| Domain | (optional) | n/a | $0 — use the provider subdomain |

Plan assumes $0/mo. If Postgres free tier expires, document the upgrade in `OQ-002`.

## 6. Observability

- Render exposes stdout logs; backend uses Python `logging` at `INFO`.
- No APM / tracing in v1.
- Frontend errors are logged to `console`; no Sentry in v1.

## 7. Secrets Hygiene

- `.env` is gitignored.
- `.env.example` is committed and lists every required var with a placeholder.
- Provider env-var UI is the source of truth for prod secrets.
