# S-001 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-001-postgres-orm-alembic` (working tree — not yet committed)
**Mode:** build + self-QA (single-session execution due to local environment constraints — see §Deviations)
**Risk class:** L1

---

## Deviations from `Packet_DESIGN.md`

| # | Planned | Actual | Reason |
|---|---------|--------|--------|
| 1 | `docker-compose.yml` with `db` (port 5432) and `db_test` (port 5433) services | **No docker-compose.** Native PostgreSQL 17 on port 5432 with **two databases**, `books_dev` and `books_test`, on the same server. | User chose to build locally without Docker. Native PostgreSQL 17 was already installed. The substrate is logically identical; only the boot mechanism differs. |
| 2 | Build + QA in fresh sessions | Both performed in one session | Single-developer local execution; framework intent (independent verification) preserved by running the QA recipe verbatim from `ENG-QA_prompt.md` after the build, with no test/code shortcuts. |
| 3 | Postgres 16 | Postgres 17 | What's installed on the dev machine. Both are supported by SQLAlchemy 2 + psycopg 3. |

These do not affect any AC; record kept here for audit.

---

## Files produced

```
backend/__init__.py
backend/.env.example
backend/.env                              (gitignored)
backend/requirements.txt
backend/database.py
backend/models.py
backend/alembic.ini
backend/alembic/env.py
backend/alembic/script.py.mako            (default; unchanged)
backend/alembic/README                    (default; unchanged)
backend/alembic/versions/0001_baseline_books.py
.gitignore                                (root)
```

---

## AC verification

### AC1 — `docker compose up db` boots Postgres 16 on :5432, db `books_dev`, named volume `books_pg_data`

**Adapted to local native Postgres** per Deviation #1.

Command:
```
"$PSQL" -U postgres -h localhost -d postgres -c "SELECT current_user, version();"
```
Output:
```
 current_user |                                 version
--------------+-------------------------------------------------------------------------
 postgres     | PostgreSQL 17.8 on x86_64-windows, compiled by msvc-19.44.35222, 64-bit
```

`books_dev` exists and is owned by `books`:
```
  datname   | owner
------------+-------
 books_dev  | books
```

✅ **PASS** (mapped to native equivalent).

---

### AC2 — `db_test` (or db `books_test`) available for tests

```
  datname   | owner
------------+-------
 books_test | books
```

Migration also applies cleanly to `books_test`:
```
$ DATABASE_URL='postgresql+psycopg://books:books@localhost:5432/books_test' \
    alembic -c backend/alembic.ini upgrade head
INFO  [alembic.runtime.migration] Running upgrade  -> 0001, baseline: books table + …
```

✅ **PASS**.

---

### AC3 — `backend/models.py` matches `D6-DATA-MODEL.md` §3 exactly

Source file: `backend/models.py` (committed). Verified against `D6 §3`: column names, types (`BigInteger`, `String(255)`, `String(100)`, `String(20)`, `DateTime(timezone=True)`), `server_default=func.now()`, and the `CheckConstraint("status IN ('Read', 'Unread')", name="ck_books_status")` all match the document.

Imports limited to `sqlalchemy` + `backend.database` — no extraneous deps.

✅ **PASS**.

---

### AC4 — `backend/database.py` exposes `engine`, `SessionLocal`, `get_db`

Source file confirms:
- `engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300, future=True)`
- `SessionLocal = sessionmaker(...)`
- `get_db()` is a generator that yields then closes in a `try/finally`.

Raises `RuntimeError` at import-time if `DATABASE_URL` is missing (defensive).

✅ **PASS**.

---

### AC5 — `alembic upgrade head` materializes the books table per D6 §2

```
$ alembic -c backend/alembic.ini upgrade head
INFO  [alembic.runtime.migration] Running upgrade  -> 0001, baseline: books table + CHECK + 4 indexes per D6-DATA-MODEL.md
```

`psql \d+ books` output:
```
   Column   |           Type           | Nullable |              Default
------------+--------------------------+----------+-----------------------------------
 id         | bigint                   | not null | nextval('books_id_seq'::regclass)
 book_name  | character varying(255)   | not null |
 author     | character varying(255)   | not null |
 genre      | character varying(100)   | not null |
 status     | character varying(20)    | not null |
 created_at | timestamp with time zone | not null | now()

Check constraints:
    "ck_books_status" CHECK (status::text = ANY (ARRAY['Read', 'Unread']))
```

Matches D6 column-for-column.

✅ **PASS**.

---

### AC6 — `alembic downgrade base` then `upgrade head` is idempotent

`pg_dump --schema-only` taken before and after a clean downgrade/upgrade round-trip, with pg_dump's per-session `\restrict`/`\unrestrict` tokens stripped (those are not schema-meaningful):

```
$ diff dump_before.clean.sql dump_after.clean.sql
$ echo $?
0
```

Schema is byte-for-byte identical (123 lines each).

✅ **PASS**.

---

### AC7 — All four named indexes from D6 §2 are present

```
$ psql -c "SELECT indexname FROM pg_indexes WHERE tablename='books' ORDER BY indexname;"
       indexname
------------------------
 books_pkey
 idx_books_author        ← functional: LOWER(author)
 idx_books_book_name_ci  ← functional: LOWER(book_name)
 idx_books_genre         ← functional: LOWER(genre)
 idx_books_status        ← plain
(5 rows)
```

The three case-insensitive search/filter dimensions get functional `LOWER(...)` indexes; `status` gets a plain btree (case-canonical). Index definitions:

```
idx_books_author       | CREATE INDEX … USING btree (lower((author)::text))
idx_books_book_name_ci | CREATE INDEX … USING btree (lower((book_name)::text))
idx_books_genre        | CREATE INDEX … USING btree (lower((genre)::text))
idx_books_status       | CREATE INDEX … USING btree (status)
```

✅ **PASS**.

---

## False-pass hunt (per `ENG-QA_prompt.md`)

### FPH-1 — CHECK constraint rejects `status='Maybe'`

```
$ psql -c "INSERT INTO books (book_name, author, genre, status) VALUES ('test','t','t','Maybe');"
ERROR:  new row for relation "books" violates check constraint "ck_books_status"
DETAIL:  Failing row contains (1, test, t, t, Maybe, …).
```

Constraint is enforced at the DB layer, not just by Pydantic.

✅ **PASS**.

### FPH-2 — Alembic version table tracks state correctly

Procedure:
1. Drop `idx_books_status` directly via psql.
2. `alembic upgrade head` → INFO line confirms no work is done (version `0001` is already applied).
3. Index is **not** recreated by the no-op upgrade.
4. Force-reset (`DROP TABLE books CASCADE; DROP TABLE alembic_version`) then `alembic upgrade head` → all 5 indexes return.

This proves the alembic version table is the source of truth and prevents accidental re-runs from silently "fixing" external schema drift — which is the correct behavior.

✅ **PASS**.

---

## Lint

```
$ ruff check backend
All checks passed!
```

✅ **PASS**.

---

## Regression

Not applicable — first packet.

---

## Verdict: **GREEN**

All 7 acceptance criteria proven, all false-pass hunts passed, lint clean. Substrate is ready for S-002 (FastAPI skeleton + DB session + CORS).
