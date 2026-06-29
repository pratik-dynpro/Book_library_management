# S-001 · BUILD prompt

```text
You are the builder for packet S-001 — Postgres + ORM + Alembic baseline.

Read first, in order:
  1. docs/product/D18-CLAUDE.md
  2. docs/product/D5-ARCHITECTURE.md
  3. docs/product/D6-DATA-MODEL.md
  4. packets/S-001-postgres-orm-alembic/Packet_BRD.md
  5. packets/S-001-postgres-orm-alembic/Packet_DESIGN.md

Branch: packet/S-001-postgres-orm-alembic
Session mode: build.

Tasks (in order):

  1. Author docker-compose.yml with services:
        db       → postgres:16-alpine, port 5432, db books_dev,
                   volume books_pg_data, healthcheck pg_isready.
        db_test  → postgres:16-alpine, port 5433, db books_test,
                   volume books_pg_test_data, healthcheck.
     Both use POSTGRES_USER=books, POSTGRES_PASSWORD=books.

  2. Author backend/requirements.txt with the deps listed in
     Packet_DESIGN §Approach step 2.

  3. Author backend/database.py: engine, SessionLocal, get_db().
     DATABASE_URL is required; raise on missing.

  4. Author backend/models.py: a single SQLAlchemy 2.x style Book
     model exactly per D6 §3.

  5. Initialize Alembic under backend/alembic/.
     Patch alembic/env.py to import Base from backend.models and
     read sqlalchemy.url from DATABASE_URL.
     Generate the baseline revision and rename to
     0001_baseline_books.py. Edit it to include:
        - the CHECK constraint named ck_books_status,
        - four indexes per D6 §2 (three functional LOWER(...) and one plain).
     Symmetric downgrade.

  6. Author backend/.env.example with DATABASE_URL and TEST_DATABASE_URL
     placeholders (postgresql+psycopg://books:books@localhost:5432/books_dev
     and the :5433/books_test counterpart).

  7. Run, in order:
        docker compose up -d db
        DATABASE_URL=postgresql+psycopg://books:books@localhost:5432/books_dev \
          (cd backend && alembic upgrade head)
        psql $DATABASE_URL -c "\d books"
     Capture the \d output in the session report (NOT in Evidence.md).

  8. Run alembic downgrade base then alembic upgrade head; confirm
     pg_dump --schema-only diff is empty between two consecutive
     upgrade-head states.

  9. Lint: ruff check backend.

 10. Commit in small steps. End with a session report and HANDOVER.md
     update. Do NOT write Evidence.md.

Abort conditions:
  - DATABASE_URL not present in env when needed → stop, ask.
  - Autogenerate misses CHECK / indexes → expected; add by hand.
  - Any docker / psql failure → diagnose, do not silently retry.
```
