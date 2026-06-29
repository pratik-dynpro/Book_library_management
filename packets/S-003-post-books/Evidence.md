# S-003 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-003-post-books` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
backend/schemas.py         (NEW — BookBase, BookCreate, Book; status canonicalization, extra='forbid')
backend/crud.py            (NEW — create_book)
backend/main.py            (modified — added POST /books)
backend/tests/test_create_book.py   (NEW — 7 tests: 6 BRD ACs + T-04 extra-field guard)
```

---

## AC verification

### AC1 — `POST /books` valid body → 201 + a `Book` (id + created_at populated)

Live curl:
```
$ curl -s -X POST http://127.0.0.1:8000/books \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"Atomic Habits","author":"James Clear","genre":"Self Help","status":"Read"}'
{
  "book_name": "Atomic Habits",
  "author":    "James Clear",
  "genre":     "Self Help",
  "status":    "Read",
  "id":        1,
  "created_at":"2026-06-23T16:16:45.796696+05:30"
}
```

Status code: 201. Response includes server-generated `id` and `created_at`.

Test: `test_create_201_returns_book` (pytest, against the test DB).

✅ **PASS**.

---

### AC2 — Row persists in DB; `id` + `created_at` server-generated

```
$ psql -c "SELECT id, book_name, status, created_at FROM books ORDER BY id;"
 id |   book_name   | status |            created_at
----+---------------+--------+----------------------------------
  1 | Atomic Habits | Read   | 2026-06-23 16:16:45.796696+05:30
  2 | Deep Work     | Unread | 2026-06-23 16:16:45.985881+05:30
```

Test: `test_create_persists_row` (queries `db_session` directly via `select(Book)`).

✅ **PASS**.

---

### AC3 — Missing required field → 422

```
$ curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8000/books \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"x","genre":"z","status":"Read"}'
422
```

Test: `test_create_missing_field_422`.

✅ **PASS**.

---

### AC4 — `status='Reading'` → 422; `status='read'` → 201 normalized to `'Read'`

`'Reading'`:
```
$ curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8000/books \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"x","author":"y","genre":"z","status":"Reading"}'
422
```

`'unread'` (lowercase):
```
$ curl -s -X POST http://127.0.0.1:8000/books \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"Deep Work","author":"Cal Newport","genre":"Self Help","status":"unread"}'
{ ... "status": "Unread", "id": 2, ... }
```

Persisted row in `books_dev` shows `status='Unread'` (canonical).

Tests: `test_create_bad_status_422`, `test_create_lowercase_status_normalized`.

✅ **PASS** (OQ-006 honored).

---

### AC5 — Length cap violation → 422

```
$ LONG=$(python -c "print('x'*300)")
$ curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8000/books \
    -H 'Content-Type: application/json' \
    -d "{\"book_name\":\"$LONG\",\"author\":\"y\",\"genre\":\"z\",\"status\":\"Read\"}"
422
```

Test: `test_create_max_length_violation_422`. Pydantic v2's `max_length=255` on `book_name` triggers 422 before the DB sees it. T-06 mitigation in place.

✅ **PASS**.

---

### AC6 — After creation, the row is visible via subsequent reads (DB-level)

Covered by AC2 + the `psql` output above. `GET /books` is implemented in S-004; for S-003 we read directly via `db_session.execute(select(Book)...)`.

✅ **PASS**.

---

### Bonus — T-04 extra-field guard

```
$ curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8000/books \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"x","author":"y","genre":"z","status":"Read","rating":5}'
422
```

`extra='forbid'` on `BookBase.model_config` blocks unknown fields. Test: `test_create_extra_field_forbidden_422`.

✅ **PASS** (T-04 mitigation in place — needed again for S-005 PUT).

---

## False-pass hunt (per `ENG-QA_prompt.md`)

### FPH-1 — Replace `crud.create_book` body with `raise NotImplementedError()`; affected tests must FAIL

```
$ pytest backend/tests/test_create_book.py -q
FAILED test_create_201_returns_book          - NotImplementedError
FAILED test_create_persists_row              - NotImplementedError
FAILED test_create_lowercase_status_normalized - NotImplementedError
```

Three tests that actually exercise the create code path fail; the four validation-only tests (`test_create_missing_field_422`, `test_create_bad_status_422`, `test_create_max_length_violation_422`, `test_create_extra_field_forbidden_422`) still pass because Pydantic rejects them at request parsing — they never reach `crud.create_book`. That's the **correct** behavior: validation happens at the schema, not the route body.

Restored — full suite back to green.

✅ **PASS**.

---

## Lint + suite

```
$ ruff check backend
All checks passed!
$ pytest backend/tests
11 passed, 1 warning in 1.68s
```

11 tests = 4 from S-002 + 7 from S-003. No regression in S-002.

---

## Verdict: **GREEN**

All 6 BRD ACs proven (plus T-04 bonus). False-pass hunt clean. Lint green. Ready for S-004 (GET /books + GET /books/{id}).
