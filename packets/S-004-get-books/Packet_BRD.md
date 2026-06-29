# S-004 · Packet BRD — GET /books & GET /books/{id}

**Module:** backend · **Risk:** L1 · **Depends on:** S-003

## Goal
Read endpoints per D7 §3.2 / §3.3. No query params yet — those land in S-007.

## Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC1 | `GET /books` returns 200 + `Book[]` ordered by `created_at DESC` (TC-005, TC-006). |
| AC2 | With 0 rows → `[]` (TC-005). |
| AC3 | With 1 001 rows inserted, response length is exactly 1 000 (TC-007 / T-05). |
| AC4 | `GET /books/{id}` returns 200 + the matching `Book`. |
| AC5 | `GET /books/{id}` for unknown id → 404 `{"detail":"Book not found"}` (TC-008). |
| AC6 | Response schema strictly matches `Book` from D7 §2 (no extra keys). |

## Do-Not-Break
S-002/S-003 endpoints and test suite.

## Out-of-Scope
- `search`, `author`, `genre`, `status` query params (S-007).
- Pagination (deferred).
