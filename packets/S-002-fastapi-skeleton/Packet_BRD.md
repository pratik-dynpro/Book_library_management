# S-002 · Packet BRD — FastAPI skeleton + DB session + CORS

**Module:** backend
**Risk:** L1
**Depends on:** S-001

## Goal

A minimal but production-shaped FastAPI app: `/docs` works, the DB session dependency from S-001 is wired in, CORS is locked to the dev frontend origin, and a test scaffolding is in place that can be extended in S-003+.

## Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC1 | `uvicorn main:app` from `backend/` boots without error against a live `books_dev` Postgres. |
| AC2 | `GET /docs` returns 200 (Swagger UI). |
| AC3 | `GET /openapi.json` returns 200 and parses as JSON. |
| AC4 | `GET /healthz` returns 200 `{ "status": "ok", "db": "ok" }`. The `db` field is "ok" only if a `SELECT 1` round-trip succeeds. |
| AC5 | A request from `Origin: http://localhost:5173` succeeds; a preflight from `Origin: http://evil.example` is denied (no `Access-Control-Allow-Origin` header echoed). |
| AC6 | `pytest -q` runs against a Postgres test DB with a `db_session` fixture using transaction-per-test rollback per D11 §2. The suite is empty-but-green (1 placeholder test) so subsequent packets can extend it. |
| AC7 | `ruff check backend` exits 0. |

## Do-Not-Break

- S-001's Alembic baseline and the `Book` model — nothing in this packet should require a new migration.

## Out-of-Scope

- Any `/books` route — those belong to S-003 onward.
- Authentication.
- Rate limiting.
