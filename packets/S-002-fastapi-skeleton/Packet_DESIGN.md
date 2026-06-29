# S-002 · Packet DESIGN

## Files In
- `docs/product/D5-ARCHITECTURE.md`, `D7-API-CONTRACTS.md`, `D12-SECURITY.md` §T-07, `D11-TESTING.md`
- `backend/database.py`, `backend/models.py` (from S-001, read-only here)

## Files Out
- `backend/main.py`
- `backend/tests/__init__.py`
- `backend/tests/conftest.py`
- `backend/tests/test_health.py`
- `backend/pyproject.toml` (ruff + pytest config)

## AC-to-code Map

| AC | Code |
|----|------|
| AC1, AC2, AC3 | `main.py`: `app = FastAPI(title="Book Library")` + uvicorn entry |
| AC4 | `main.py`: `/healthz` handler does `session.execute(text("SELECT 1"))` via `get_db` |
| AC5 | `main.py`: `CORSMiddleware` with `allow_origins=[os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]` |
| AC6 | `tests/conftest.py` per D11 §2 — `engine`, `apply_migrations`, `db_session`, `client` fixtures |
| AC7 | `pyproject.toml` configures ruff rules `E, F, I, B, UP` |

## Approach

1. `main.py` adds CORS middleware before any routers; declares `/healthz` inline (will move to a router only if route count grows).
2. `conftest.py`:
   - Module-scoped `engine` bound to `TEST_DATABASE_URL`.
   - Session-scoped autouse `apply_migrations` runs `alembic upgrade head`.
   - Function-scoped `db_session` opens a connection, begins outer transaction, yields a session bound to a SAVEPOINT, rolls back at teardown.
   - Function-scoped `client` uses `app.dependency_overrides[get_db] = lambda: db_session`.
3. `test_health.py` asserts `GET /healthz` → 200 with the expected body.
4. `pyproject.toml` declares ruff config + pytest's `testpaths = ["tests"]`.

## Rollback

`git revert` the packet's commits; the `db` substrate from S-001 is untouched.

## Alternatives Considered

- Putting `/healthz` in a router file. Skipped — premature for one endpoint.
- Using `httpx.AsyncClient` for tests. Skipped — sync TestClient is enough and matches D11.
