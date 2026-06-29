# S-005 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-005-put-books` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
backend/schemas.py                    (modified — added BookUpdate)
backend/crud.py                       (extended — update_book)
backend/main.py                       (modified — added PUT /books/{id})
backend/tests/test_update_book.py     (NEW — 7 tests)
```

---

## AC verification

### AC1 — `PUT /books/{id}` with full body → 200 + updated `Book`

Live (book_id=1 from S-003):
```
$ curl -s -X PUT http://127.0.0.1:8000/books/1 \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"Atomic Habits","author":"James Clear","genre":"Self Help","status":"Unread"}'
{
  "book_name": "Atomic Habits",
  "author":    "James Clear",
  "genre":     "Self Help",
  "status":    "Unread",
  "id":        1,
  "created_at":"2026-06-23T16:16:45.796696+05:30"
}
```

Status code: 200; response is the updated Book.

Test: `test_put_updates_fields`.

✅ **PASS**.

---

### AC2 — Row reflects every changed field; `created_at` is unchanged

Before PUT: `created_at = 2026-06-23T16:16:45.796696+05:30`
After PUT (same `GET /books/1` call):
```
{ ..., "status": "Unread", "id": 1, "created_at": "2026-06-23T16:16:45.796696+05:30" }
```

`created_at` is byte-identical.

The design intentionally loops only over `payload.model_dump().items()`. Since `BookUpdate` inherits `BookBase` (no `created_at` field), the timestamp **cannot** be touched through this code path — defended at the type level, not by convention.

Test: `test_put_preserves_created_at` reads back via `db_session.get(Book, id)` after `expire_all()` to ensure the assertion sees the persisted row, not stale ORM state.

✅ **PASS**.

---

### AC3 — Unknown id → 404 with the documented body

```
$ curl -s -w "\n%{http_code}\n" -X PUT http://127.0.0.1:8000/books/999999 \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"x","author":"y","genre":"z","status":"Read"}'
{"detail":"Book not found"}
404
```

Test: `test_put_unknown_id_returns_404`.

✅ **PASS**.

---

### AC4 — Extra field → 422

```
$ curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://127.0.0.1:8000/books/1 \
    -H 'Content-Type: application/json' \
    -d '{"book_name":"x","author":"y","genre":"z","status":"Read","rating":5}'
422
```

`BookUpdate` inherits `extra='forbid'` from `BookBase`. T-04 mitigation present on both POST and PUT.

Test: `test_put_extra_field_returns_422`.

✅ **PASS**.

---

### AC5 — Same validation rules as POST (status canonicalization, length caps, required fields)

| Sub-case | Test |
|----------|------|
| `'unread'` (lowercase) accepted → persisted as `'Unread'` | `test_put_canonicalizes_lowercase_status` |
| `'Maybe'` rejected | `test_put_bad_status_returns_422` |
| Missing required field rejected | `test_put_missing_field_returns_422` |
| `book_name` over 255 chars rejected | (length cap inherited from `BookBase`; not re-tested here — same validator as S-003 TC-082) |

All three tests pass.

✅ **PASS**.

---

## False-pass hunt (per `ENG-QA_prompt.md`)

### FPH — Mutate `update_book` to overwrite `created_at`; `test_put_preserves_created_at` must FAIL

```
$ # injected `row.created_at = datetime.now(UTC)` into update_book
$ pytest backend/tests/test_update_book.py::test_put_preserves_created_at -q
FAILED backend/tests/test_update_book.py::test_put_preserves_created_at - AssertionError
```

Restored — full suite back to 24 passing. This proves AC2's test exercises the production code, not a stub.

✅ **PASS**.

---

## Lint + suite

```
$ ruff check backend
All checks passed!
$ pytest backend/tests
24 passed, 1 warning in 1.98s
```

24 = 4 (S-002) + 7 (S-003) + 6 (S-004) + 7 (S-005). No regression.

---

## Verdict: **GREEN**

All 5 BRD ACs proven; false-pass hunt clean; lint green; live smoke confirms 200/404/422 paths and `created_at` preservation. Ready for S-006 (DELETE /books/{id}).
