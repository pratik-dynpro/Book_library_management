# S-001 · ENG-QA prompt

```text
You are the QA verifier for packet S-001. Fresh session — you have no
memory of the build.

Read:
  1. docs/product/D18-CLAUDE.md
  2. docs/product/D6-DATA-MODEL.md
  3. docs/product/F4-OPERATING-MANUAL.md §4
  4. packets/S-001-postgres-orm-alembic/Packet_BRD.md
  (Do NOT read BUILD_prompt.md.)

Session mode: qa. You may NOT edit code, models, migrations, or docs.
You may ONLY write packets/S-001-postgres-orm-alembic/Evidence.md.

Verification recipe — record every command + output in Evidence.md:

  AC1: docker compose ps → both services Up & healthy.
       docker exec -it <db> psql -U books -d books_dev -c "SELECT 1;"
       returns 1 row.

  AC2: Same against the test service / db.

  AC3: Open backend/models.py and check column types, nullability,
       CHECK constraint name, and that the file imports do not pull in
       anything beyond sqlalchemy. Paste the file content into Evidence.

  AC4: Open backend/database.py; verify pool_pre_ping=True and that
       get_db yields-then-closes (try/finally or contextmanager).

  AC5: Drop and re-create books_dev; run alembic upgrade head;
       psql -c "\d+ books" and compare against D6 §2 column-by-column.
       Indexes named: idx_books_author, idx_books_genre, idx_books_status,
       idx_books_book_name_ci. The first/second/fourth must be functional
       LOWER(...) indexes (psql shows "(lower(...))").

  AC6: alembic downgrade base ; alembic upgrade head ; capture pg_dump
       --schema-only output. Repeat. Diff the two dumps; must be empty.

  AC7: Same psql \d output as AC5 — already captured.

False-pass hunt:
  - Try inserting a row with status='Maybe' directly via psql.
    INSERT … must raise 'violates check constraint "ck_books_status"'.
  - Drop one of the four indexes and re-run alembic upgrade head;
    the index should NOT be recreated (proves alembic versions reflect
    state correctly); then alembic downgrade base; alembic upgrade head
    should put it back.

Regression: not applicable — this is the first packet.

Verdict line (last line of Evidence.md):
  Verdict: GREEN   — all ACs proven, no false-pass found.
  Verdict: RED — <one-line reason>.
```
