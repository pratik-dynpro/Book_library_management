# S-004 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-004-get-books` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
backend/crud.py                       (extended — list_books, get_book, HARD_LIMIT=1000)
backend/main.py                       (modified — added GET /books and GET /books/{id})
backend/tests/test_read_books.py      (NEW — 6 tests)
```

---

## AC verification

### AC1 — `GET /books` → 200 + `Book[]` ordered by `created_at DESC`

Live (against `books_dev`, which had 2 rows from S-003):
```
$ curl -s http://127.0.0.1:8000/books
[
  {"id":2,"book_name":"Deep Work",     "status":"Unread", "created_at":"2026-06-23T16:16:45.985881+05:30"},
  {"id":1,"book_name":"Atomic Habits","status":"Read",   "created_at":"2026-06-23T16:16:45.796696+05:30"}
]
```

Newest row first.

Test: `test_list_orders_by_created_at_desc` seeds rows with explicit `created_at` values and asserts the response order is `["Newest","Middle","Oldest"]`.

✅ **PASS**.

---

### AC2 — Empty DB → `[]`

Covered by `test_list_empty_returns_empty_array` against the per-test rolled-back Postgres session — when the SAVEPOINT is fresh and no rows exist, `GET /books` returns `200` with body `[]`.

✅ **PASS**.

---

### AC3 — 1001 rows → response length is 1000 (HARD_LIMIT, T-05)

`crud.py`:
```python
HARD_LIMIT = 1000  # T-05: cap GET /books to bound response size

def list_books(db: Session) -> list[Book]:
    stmt = select(Book).order_by(Book.created_at.desc()).limit(HARD_LIMIT)
    return list(db.scalars(stmt))
```

Test `test_list_capped_at_1000` bulk-inserts 1001 rows with staggered `created_at` and asserts `len(response) == 1000`. Passing.

✅ **PASS**.

---

### AC4 — `GET /books/{id}` found → 200 + Book

Live:
```
$ curl -s http://127.0.0.1:8000/books/1
{"book_name":"Atomic Habits","author":"James Clear","genre":"Self Help","status":"Read","id":1,"created_at":"2026-06-23T16:16:45.796696+05:30"}
```

Status: 200.

Test: `test_get_by_id_found`.

✅ **PASS**.

---

### AC5 — Unknown id → 404 `{"detail":"Book not found"}`

Live:
```
$ curl -s -w "\n%{http_code}\n" http://127.0.0.1:8000/books/999999
{"detail":"Book not found"}
404
```

Body matches the contract exactly.

Test: `test_get_by_id_not_found_returns_404`.

✅ **PASS**.

---

### AC6 — Response strictly matches `Book` schema (no extra keys)

`test_response_schema_strictly_matches_book` asserts `set(body[0].keys()) == {"id","book_name","author","genre","status","created_at"}`. FastAPI's `response_model=list[schemas.Book]` strips any extras the ORM might surface (none in v1, but the guard is in place for future fields).

✅ **PASS**.

---

## False-pass hunt (per `ENG-QA_prompt.md`)

### FPH-1 — Set `HARD_LIMIT=5`; `test_list_capped_at_1000` must FAIL

```
$ pytest backend/tests/test_read_books.py::test_list_capped_at_1000
FAILED — assert 5 == 1000
```

Restored to 1000 → green again.

### FPH-2 — Change `desc()` to `asc()`; ordering test must FAIL

```
$ pytest backend/tests/test_read_books.py::test_list_orders_by_created_at_desc
FAILED — assert ['Oldest','Middle','Newest'] == ['Newest','Middle','Oldest']
```

Restored to `desc()` → green again.

Both prove the tests are exercising the actual production code path, not just running through it.

✅ **PASS**.

---

## Lint + suite

```
$ ruff check backend
All checks passed!
$ pytest backend/tests
17 passed, 1 warning in 2.05s
```

17 = 4 (S-002) + 7 (S-003) + 6 (S-004). No regression in prior packets.

---

## Verdict: **GREEN**

All 6 acceptance criteria proven, false-pass hunt clean, lint green, live smoke confirms the contract end-to-end. Ready for S-005 (PUT /books/{id}).
