# D11 · Testing Strategy

## 1. Pyramid

```
                  ╱╲
                 ╱E2╲           Playwright smoke (1–2 flows)
                ╱────╲
               ╱ Integ ╲        FastAPI TestClient + Vitest+RTL
              ╱────────╲
             ╱   Unit   ╲       Pydantic validators, pure functions
            ╱────────────╲
```

## 2. Backend

- **Framework:** `pytest` + `httpx.TestClient`.
- **DB isolation:** every test runs against a **real PostgreSQL** instance (the local docker-compose `db_test` service, or a `pytest-postgresql`/`testcontainers` ephemeral DB in CI). Alembic migrations apply once per test session; each test runs inside a SAVEPOINT that is rolled back at teardown — no inter-test bleed, no schema reset between tests.
- **Fixtures (`backend/tests/conftest.py`):**
  - `engine` — session-scoped Postgres engine bound to `TEST_DATABASE_URL`.
  - `apply_migrations` — session-scoped autouse: runs `alembic upgrade head`.
  - `db_session` — function-scoped: opens a connection, begins an outer transaction, yields a session bound to a SAVEPOINT, rolls back at teardown.
  - `client` — function-scoped TestClient with `get_db` overridden to use `db_session`.
- **No SQLite anywhere.** A Postgres-only stack means the test database must also be Postgres; testing against SQLite would mask dialect differences (`TIMESTAMPTZ`, functional indexes, `LOWER(...)` semantics).
- **Coverage target:** ≥ 90 % on `crud.py`, `schemas.py`, route handlers (Q-004).
- **Run:** `pytest -q --cov=backend --cov-report=term-missing`.
- **Naming:** `tests/test_<area>.py`, e.g. `test_create_book.py`, `test_search_filter.py`.

## 3. Frontend

- **Framework:** Vitest + React Testing Library + `@testing-library/user-event`.
- **MSW (Mock Service Worker):** intercepts axios calls in component tests; no live backend dependency.
- **Smoke test per page:**
  - Home: renders stat cards with mocked counts.
  - Books: renders cards from mocked `GET /books`; delete confirm flow.
  - AddBook: required-field error; success path navigates.
  - EditBook: prefills from mocked `GET /books/{id}`; PUT on submit.
- **Run:** `npm test -- --run` (CI) / `npm test` (watch).

## 4. End-to-End (one flow, manual or Playwright)

Single E2E happy path: open `/`, click **Add Book**, submit form, see card on `/books`, edit it, delete it. May be scripted with Playwright as a stretch goal; manual checklist in S-013 evidence is acceptable for v1.

## 5. Test Data

- Backend tests use `factories.py` (in `backend/tests/`) — a tiny helper that returns valid book payloads with a counter so titles are unique within a test.
- Frontend mocks live in `frontend/src/test/handlers.js`.

## 6. Linting

- `ruff check backend` exits 0.
- `cd frontend && npm run lint -- --max-warnings 0` exits 0.
- These are gates, not warnings.

## 7. Regression

- Every packet's `ENG-QA_prompt.md` re-runs the **entire** test suite, not just new tests. A green packet must not break a previously green packet.

## 8. Performance Tests

- `pytest-benchmark` opt-in: only S-007 includes one benchmark, asserting Q-005 (`GET /books` median < 50 ms with 1 000 rows).

## 9. Failure Triage

If a test goes red mid-cycle:

1. Invoke `superpowers:systematic-debugging`.
2. Reproduce, isolate, fix; do not delete or skip the test.
3. If skip is genuinely correct (e.g., upstream lib has a CVE workaround), it must include a `# xfail(reason=…)` and a packet to remove it later.
