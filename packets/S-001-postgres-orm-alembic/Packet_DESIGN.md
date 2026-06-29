# S-001 · Packet DESIGN

## Files In (read-only references)

- `docs/product/D5-ARCHITECTURE.md`
- `docs/product/D6-DATA-MODEL.md`
- `docs/product/D11-TESTING.md` §2

## Files Out (this packet writes)

- `docker-compose.yml`
- `backend/requirements.txt`
- `backend/database.py`
- `backend/models.py`
- `backend/alembic.ini`
- `backend/alembic/env.py`
- `backend/alembic/script.py.mako`
- `backend/alembic/versions/0001_baseline_books.py`
- `backend/.env.example`

## AC-to-code Map

| AC | Code location |
|----|---------------|
| AC1 / AC2 | `docker-compose.yml` services `db` and `db_test` |
| AC3 | `backend/models.py` → `class Book(Base)` matching D6 §3 |
| AC4 | `backend/database.py` → `engine`, `SessionLocal`, `get_db()` |
| AC5 | `backend/alembic/versions/0001_baseline_books.py` |
| AC6 | Same file's `downgrade()` symmetric to `upgrade()` |
| AC7 | Functional `LOWER(...)` indexes inside `upgrade()` (autogenerate misses these — author by hand) |

## Approach

1. Compose file: two `postgres:16-alpine` services on ports 5432 / 5433, separate named volumes.
2. `requirements.txt`: `fastapi`, `uvicorn[standard]`, `sqlalchemy>=2`, `psycopg[binary]>=3`, `alembic`, `pydantic>=2`, `python-dotenv`, plus dev: `pytest`, `httpx`, `ruff`, `pip-audit`.
3. `database.py`: read `DATABASE_URL` from env; `create_engine(..., pool_pre_ping=True, pool_recycle=300)`; `SessionLocal = sessionmaker(...)`; `get_db()` yields and closes.
4. `models.py`: single `Book` model per D6 §3, including `__table_args__` with `CheckConstraint`.
5. `alembic init alembic` then point `script_location` to `alembic` and `sqlalchemy.url = ${DATABASE_URL}` (read from env in `env.py`).
6. Baseline revision generated with autogenerate; then manually added: `CHECK` constraint name, four functional/plain indexes.

## Rollback

`docker compose down -v && rm -rf backend/alembic` reverts the substrate; commits revert via `git reset --keep` to the last green tag.

## Alternatives Considered

- **testcontainers-python** instead of a docker-compose `db_test` service. Rejected for v1: extra dep, slower first run, and the compose file already starts the dev DB; reusing the same image is simpler.
- **psycopg2** instead of psycopg 3. Rejected: psycopg 3 is the current line, ships an async path we may use later, and SQLAlchemy 2 supports it cleanly.
