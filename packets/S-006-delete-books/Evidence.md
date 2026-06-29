# S-006 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-006-delete-books` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
backend/crud.py                       (extended — delete_book)
backend/main.py                       (modified — added Response import + DELETE /books/{id})
backend/tests/test_delete_book.py     (NEW — 3 tests)
```

---

## AC verification

### AC1 — `DELETE /books/{id}` → 204, empty body

```
$ curl -s -i -X DELETE http://127.0.0.1:8000/books/2
HTTP/1.1 204 No Content
date: Tue, 23 Jun 2026 11:04:41 GMT
server: uvicorn
```

No `Content-Length` header beyond what uvicorn auto-emits for 204, no body bytes. Test `test_delete_returns_204_empty_body` asserts both `r.status_code == 204` and `r.content == b""`.

✅ **PASS**.

---

### AC2 — Row is gone from the DB

Counts:
```
$ curl -s http://127.0.0.1:8000/books | python -c "import json,sys;print('rows:', len(json.load(sys.stdin)))"
rows: 2          ← before
rows: 1          ← after DELETE /books/2
```

`psql` confirms:
```
 id |   book_name
----+---------------
  1 | Atomic Habits
(1 row)
```

Test: `test_delete_removes_row` uses `db_session.expire_all()` + `db_session.get(Book, id)` and asserts `is None`.

✅ **PASS**.

---

### AC3 — Unknown id → 404 `{"detail":"Book not found"}`

```
$ curl -s -w "\n%{http_code}\n" -X DELETE http://127.0.0.1:8000/books/2
{"detail":"Book not found"}
404
```

Second DELETE on the same id correctly returns the documented 404.

Test: `test_delete_unknown_returns_404`.

✅ **PASS**.

---

## False-pass hunt

### FPH — Make `delete_book` return `True` without deleting; `test_delete_removes_row` must FAIL

```
$ # crud.delete_book mutated to skip db.delete/commit
$ pytest backend/tests/test_delete_book.py::test_delete_removes_row -q
FAILED — assert <Book> is None
```

The row stays in the DB, so `db.get(Book, id)` returns the row object rather than `None`, and the assertion bites. Restored — full suite back to green.

✅ **PASS**.

---

## Lint + suite

```
$ ruff check backend
All checks passed!
$ pytest backend/tests
27 passed, 1 warning in 2.09s
```

27 = 4 (S-002) + 7 (S-003) + 6 (S-004) + 7 (S-005) + 3 (S-006). No regression.

---

## Drop-1 backend gate

S-006 closes the backend CRUD half of Drop-1. All five endpoints from `D7-API-CONTRACTS.md` are live and tested:

| Method | Path           | Status |
|--------|----------------|--------|
| POST   | /books         | ✅ 201 / 422 |
| GET    | /books         | ✅ 200 (Book[]) |
| GET    | /books/{id}    | ✅ 200 / 404 |
| PUT    | /books/{id}    | ✅ 200 / 404 / 422 |
| DELETE | /books/{id}    | ✅ 204 / 404 |

Search + filter (`S-007`) extends `GET /books`; everything else is contract-complete.

---

## Verdict: **GREEN**

All 3 ACs proven; false-pass clean; lint green; live smoke confirms full create→update→delete lifecycle in `books_dev`. Ready for S-007 (search + filter query params).
