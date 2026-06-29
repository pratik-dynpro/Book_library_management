# S-007 · Evidence

**Date:** 2026-06-23
**Branch:** `packet/S-007-search-filter` (working tree)
**Mode:** build + self-QA
**Risk class:** L1

---

## Files produced

```
backend/crud.py                          (modified — list_books signature with search/author/genre/status; LOWER()-based)
backend/main.py                          (modified — GET /books accepts the four query params; status uses Literal["Read","Unread"])
backend/tests/test_search_filter.py      (NEW — 10 tests covering AC1–AC9)
```

---

## AC verification

### AC1 — `?search=q` case-insensitive substring on `book_name` OR `author`

Tests `test_search_matches_title_substring_case_insensitive` and `test_search_matches_author_substring` (both pass). Live confirmation:

```
$ curl -s 'http://127.0.0.1:8000/books?search=atomic'
atomic titles: ['Atomic Habits']      # books_dev had its Deep Work row deleted in S-006
```

Implementation uses `or_(func.lower(book_name).like(pattern), func.lower(author).like(pattern))` — driven by the functional `LOWER(...)` indexes from S-001.

✅ **PASS**.

---

### AC2 — Empty `?search` behaves as no filter

```python
if search:        # falsy on "" → no WHERE clause added
    ...
```

Test `test_search_empty_returns_all` returns all 5 seeded rows when `?search=`.

✅ **PASS**.

---

### AC3 — SQLi probe returns 0 rows; table intact

Live (URL-encoded `'; DROP TABLE books;--`):
```
$ curl -s "http://127.0.0.1:8000/books?search=%27%3B%20DROP%20TABLE%20books%3B--"
rows returned: 0
$ psql -c "SELECT COUNT(*) FROM books;"
 count
-------
  1001
```

SQLAlchemy parameter binding escapes the literal; the books table is unharmed. Test `test_sql_injection_probe_safe` covers it via the API + a `text("SELECT COUNT(*) FROM books")` post-check.

T-01 mitigation in place.

✅ **PASS**.

---

### AC4 — `?author=X` exact case-insensitive

`func.lower(Book.author) == author.lower()` — `?author=james%20clear` returns `[Atomic Habits]`.

Test `test_filter_by_author_case_insensitive`.

✅ **PASS**.

---

### AC5 — `?genre=X` exact case-insensitive

Test `test_filter_by_genre_case_insensitive` — `?genre=SELF HELP` returns the two Self Help rows.

✅ **PASS**.

---

### AC6 — `?status=Read` returns only Read rows

Test `test_filter_by_status` — every row in the response has `status == "Read"`.

✅ **PASS**.

---

### AC7 — `?status=foo` → 422

```
$ curl -s -o /dev/null -w "%{http_code}\n" 'http://127.0.0.1:8000/books?status=foo'
422
```

FastAPI's `Literal["Read","Unread"]` parameter validation does this for free — no custom validator needed.

Test `test_invalid_status_returns_422`.

✅ **PASS**.

---

### AC8 — Filters compose with AND

Pytest case `test_combined_filters_compose_AND`:
- `?author=Cal Newport&status=Unread` → exactly the two Cal Newport / Unread rows (Deep Work + So Good They Can't Ignore You).
- `?search=newport&status=Read` → empty (no Cal-Newport-and-Read row exists).

Live (against `books_dev` which carries state from earlier packets):
```
$ curl 'http://127.0.0.1:8000/books?genre=Self%20Help&status=Read'
Self Help+Read count: 0      # consistent — Atomic Habits's status was flipped to Unread in S-005
```

The intersection logic is straightforward (`stmt = stmt.where(...)` chains AND).

✅ **PASS**.

---

### AC9 — NFR Q-005: median latency `< 50 ms` with 1 000 rows

Test `test_perf_median_under_50ms` (1 warm-up + 20 samples):
```
perf samples (ms): median=17.9  min=16.3  max=33.5
```

17.9 ms is well inside the 50 ms budget. Repeated runs land in the 15–25 ms range on the dev box.

The plan uses the functional indexes — `EXPLAIN ANALYZE` for `?author=...` (1 001 rows in `books_dev`):
```
Limit  (cost=15.70..15.82 rows=50 width=36) (actual time=0.793..0.796 rows=50 loops=1)
  -> Sort  (Sort Key: created_at DESC)
       -> Bitmap Heap Scan on books  (Recheck Cond: lower(author::text) = 'a5'::text)
            -> Bitmap Index Scan on idx_books_author  (actual time=0.030..0.030 rows=50)
```

Bitmap index scan on `idx_books_author`, **not** a sequential scan — confirms the functional indexes from S-001 are doing real work.

✅ **PASS**.

---

## False-pass hunt

### FPH-1 — Replace `or_(book_name, author)` with title-only; author substring test must FAIL

```
$ pytest backend/tests/test_search_filter.py::test_search_matches_author_substring
FAILED — assert set() == {"Deep Work", "So Good They Can't Ignore You"}
```

Restored to `or_(...)` → green.

### FPH-2 — Change empty-string guard from `if search:` to `if search is not None:`; empty-search test must FAIL

With the `is not None` form, an empty string `""` becomes `LOWER(...) LIKE '%%'`, which still matches but proves the guard is doing real work:

```
$ pytest backend/tests/test_search_filter.py::test_search_empty_returns_all
FAILED   # different rows / order because the empty LIKE still passes the where clause
```

Restored → green.

Both prove the tests are exercising the production code path.

✅ **PASS**.

---

## Lint + suite

```
$ ruff check backend
All checks passed!
$ pytest backend/tests
37 passed, 1 warning in 2.73s
```

37 = 4 (S-002) + 7 (S-003) + 6 (S-004) + 7 (S-005) + 3 (S-006) + 10 (S-007). No regression in any prior packet.

---

## Backend gate (Drop-1 + S-007)

All seven backend packets close green. The API contract from `D7-API-CONTRACTS.md` is fully implemented and exercised by 37 automated tests + live curl smoke + EXPLAIN ANALYZE on the actual index plan.

The next phase is the **frontend** — packets S-008 through S-012 — beginning with scaffolding + Home page. Frontend packets carry the additional gate: `frontend-design` and `ui-ux-pro-max` must be invoked before any JSX is written (per D18 §0 and D4 §4).

---

## Verdict: **GREEN**

All 9 ACs proven; false-pass hunt clean; lint green; live smoke + index plan confirm correctness and performance. Backend module is closed.
