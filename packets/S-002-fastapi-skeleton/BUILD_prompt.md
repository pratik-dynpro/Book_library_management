# S-002 · BUILD prompt

```text
Builder for S-002. Read in order:
  docs/product/D18-CLAUDE.md, D5-ARCHITECTURE.md, D7-API-CONTRACTS.md,
  D11-TESTING.md, D12-SECURITY.md §T-07,
  packets/S-002-fastapi-skeleton/Packet_BRD.md and Packet_DESIGN.md.

Branch: packet/S-002-fastapi-skeleton. Mode: build.

TDD order:

  1. Write backend/tests/conftest.py with the four fixtures per
     D11 §2 (engine, apply_migrations autouse, db_session SAVEPOINT,
     client with get_db override).

  2. Write backend/tests/test_health.py:
        - test_healthz_ok       → GET /healthz returns 200 and
                                   body == {"status":"ok","db":"ok"}.
        - test_openapi          → GET /openapi.json returns 200, JSON.
        - test_cors_allows_5173 → preflight with Origin
                                   http://localhost:5173 → header present.
        - test_cors_denies_evil → preflight with Origin
                                   http://evil.example → no ACAO header.

  3. Run pytest → all four red.

  4. Implement backend/main.py:
        - FastAPI() app, CORSMiddleware with allow_origins from env
          (default "http://localhost:5173"), allow_methods=["*"],
          allow_headers=["*"], allow_credentials=False.
        - /healthz handler depends on get_db, runs SELECT 1.
        - Wire pyproject.toml with ruff [tool.ruff] rules E,F,I,B,UP
          and pytest [tool.pytest.ini_options] testpaths=tests.

  5. Run pytest → all green. Run ruff check → 0.

  6. Manual smoke: uvicorn main:app, hit /docs in a browser; record
     the screenshot path in the session report (NOT Evidence.md).

  7. Commit and update HANDOVER.md.

Abort:
  - TEST_DATABASE_URL not set in env → stop, ask.
  - alembic upgrade head fails in the test fixture → likely env.py path
    bug from S-001; stop, do not mutate models.
```
