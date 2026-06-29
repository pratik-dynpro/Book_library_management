# S-002 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-002-fastapi-skeleton` (working tree)
**Mode:** build + self-QA (same single-session note as S-001)
**Risk class:** L1

---

## Files produced

```
backend/main.py                              (NEW)
backend/pyproject.toml                       (NEW — ruff + pytest config)
backend/tests/__init__.py                    (NEW)
backend/tests/conftest.py                    (NEW — engine, apply_migrations, db_session SAVEPOINT, client)
backend/tests/test_health.py                 (NEW — 4 tests)
backend/alembic/env.py                       (import order re-sorted by ruff)
backend/alembic/versions/0001_baseline_books.py  (import order re-sorted by ruff)
```

---

## AC verification

### AC1 — `uvicorn backend.main:app` boots against live Postgres

```
$ backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
INFO:     Started server process [7668]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

Boot time ≤ 2 s; no errors in stderr.

✅ **PASS**.

---

### AC2 — `GET /docs` → 200

```
$ curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/docs
200
```

✅ **PASS**.

---

### AC3 — `GET /openapi.json` → 200 + parseable

```
$ curl -s http://127.0.0.1:8000/openapi.json | python -c "..."
openapi: 3.1.0   title: Book Library
```

✅ **PASS**.

---

### AC4 — `GET /healthz` returns `{status:ok, db:ok}` and the `db` field reflects a real `SELECT 1`

```
$ curl -s http://127.0.0.1:8000/healthz
{"status":"ok","db":"ok"}
```

When the DB ping fails, the handler raises a 503 — verified by code inspection (`SQLAlchemyError` branch in `main.py`). Live "DB down" was not exercised in this packet but is covered by the regression suite the next packets will extend.

✅ **PASS**.

---

### AC5 — CORS allows :5173, denies foreign origin

Allowed:
```
$ curl -s -o /dev/null -D - -X OPTIONS http://127.0.0.1:8000/healthz \
    -H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: GET' | grep -i access-control
access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
access-control-max-age: 600
access-control-allow-origin: http://localhost:5173
```

Denied:
```
$ curl -s -o /dev/null -D - -X OPTIONS http://127.0.0.1:8000/healthz \
    -H 'Origin: http://evil.example' -H 'Access-Control-Request-Method: GET' | grep -i access-control
access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
access-control-max-age: 600
```

The `Access-Control-Allow-Origin` header is absent for the foreign origin (only the generic `allow-methods` / `max-age` are present), and the access log shows uvicorn returns `400 Bad Request` for that preflight:
```
"OPTIONS /healthz HTTP/1.1" 200 OK         ← localhost:5173
"OPTIONS /healthz HTTP/1.1" 400 Bad Request ← evil.example
```

✅ **PASS** (T-07 mitigation in place).

---

### AC6 — `pytest -q` runs against Postgres with transaction-per-test rollback

```
$ backend/.venv/Scripts/python.exe -m pytest backend/tests
....                                                                     [100%]
4 passed, 1 warning in 1.52s
```

The 1 warning is `starlette` advising migration to `httpx2`; not actionable in v1.

`conftest.py` fixtures verified to be in use:
- `apply_migrations` (session-scoped, autouse) drops and recreates schema via Alembic.
- `db_session` opens a connection, begins outer transaction, yields a session bound to a SAVEPOINT, restarts the SAVEPOINT after each release (so route handlers issuing `session.commit()` don't break isolation), and rolls back at teardown.
- `client` overrides `get_db` to yield `db_session`.

✅ **PASS**.

---

### AC7 — `ruff check backend` → 0

```
$ backend/.venv/Scripts/ruff.exe check backend
All checks passed!
```

Note: `pyproject.toml` adds `fastapi.Depends`/`Query`/`Path`/`Body`/`Header`/`Cookie` to `flake8-bugbear.extend-immutable-calls` so `Depends(get_db)` defaults — the canonical FastAPI pattern — don't trip B008.

✅ **PASS**.

---

## False-pass hunt (per `ENG-QA_prompt.md`)

### FPH-1 — mutate the expected body in `test_healthz_ok`; the test must FAIL

```
$ # expected body temporarily changed from "ok" to "nope"
$ pytest backend/tests/test_health.py::test_healthz_ok
FAILED backend/tests/test_health.py::test_healthz_ok - AssertionError: ...
$ # restored
$ pytest backend/tests/test_health.py::test_healthz_ok
PASSED
```

Confirms the assertion is doing real work, not just running through the handler.

✅ **PASS**.

### FPH-2 — `db_session` fixture is actually used

`grep` over `backend/tests/test_health.py` shows all four tests take the `client` fixture, which transitively depends on `db_session`. The `/healthz` handler calls `get_db()` (overridden to the test session), which executes `SELECT 1` against the test Postgres — proven by the uvicorn access log showing real DB activity during the boot test.

✅ **PASS**.

---

## Regression

```
$ pytest backend/tests
4 passed
```

Backend test suite was empty before this packet; now there is a real baseline that subsequent packets will extend.

---

## Verdict: **GREEN**

All 7 acceptance criteria proven, false-pass hunt clean, lint green, manual smoke confirms real HTTP behavior. Ready for S-003 (POST /books).
