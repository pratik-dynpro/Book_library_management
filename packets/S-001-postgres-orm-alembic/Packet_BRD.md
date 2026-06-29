# S-001 · Packet BRD — Postgres + ORM + Alembic baseline

**Module:** database
**Risk:** L1
**Depends on:** —

## Goal

Stand up the database substrate: a local Postgres instance via docker-compose, the SQLAlchemy `Book` ORM model, and the Alembic baseline migration that materializes the schema from `D6-DATA-MODEL.md`.

## Acceptance Criteria (binary)

| ID | Criterion |
|----|-----------|
| AC1 | `docker compose up db` starts a Postgres 16 service on `localhost:5432`, db `books_dev`, with a named volume `books_pg_data`. |
| AC2 | `docker compose up db_test` (separate service or db) provides a Postgres at `localhost:5433` (or db `books_test`) for tests. |
| AC3 | `backend/models.py` defines a `Book` ORM model that matches D6 exactly (columns, types, `CHECK` constraint, indexes). |
| AC4 | `backend/database.py` exposes `engine`, `SessionLocal`, and a `get_db` FastAPI dependency that yields then closes the session. |
| AC5 | `alembic upgrade head` against `DATABASE_URL` creates the `books` table with the DDL from D6 §2 verbatim (column names, types, `CHECK`, indexes). |
| AC6 | `alembic downgrade base` then `alembic upgrade head` is idempotent — a `pg_dump --schema-only` diff before/after is empty. |
| AC7 | `psql $DATABASE_URL -c "\d books"` shows the four indexes named exactly as in D6 §2. |

## Do-Not-Break

- (Nothing exists yet — this is S-001.)

## Out-of-Scope

- Seed data.
- Multi-tenant schemas / multiple databases beyond `_dev` and `_test`.
- FastAPI app wiring (S-002).
- Any route or schema.
