# S-003 · Packet BRD — POST /books

**Module:** backend · **Risk:** L1 · **Depends on:** S-002

## Goal
Implement the create endpoint per `D7-API-CONTRACTS.md` §3.1, with Pydantic validation and Postgres persistence.

## Acceptance Criteria

| ID | Criterion (cites D15b / D17) |
|----|------------------------------|
| AC1 | `POST /books` with valid body returns 201 and a `Book` (TC-001 / US-01 AC1). |
| AC2 | A row in `books` matches the request; `id` and `created_at` are server-generated. |
| AC3 | Missing any required field → 422 (TC-002 / US-01 AC3). |
| AC4 | `status='Reading'` → 422 (TC-003). `status='read'` lowercase is accepted and persisted as `'Read'` (TC-004, OQ-006). |
| AC5 | Length cap violations (e.g. 300-char `book_name`) → 422 (TC-082 / T-06). |
| AC6 | After creation, `GET /books` (if it exists; otherwise direct DB read) lists the new row (US-01 AC5). |

## Do-Not-Break
- `/healthz`, `/docs`, CORS behavior, the `db_session` test fixture from S-002.

## Out-of-Scope
- GET endpoints (S-004), PUT (S-005), DELETE (S-006), search/filter (S-007), auth, rate-limit.
