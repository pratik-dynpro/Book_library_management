# S-007 · Packet BRD — Search + Filter query params

**Module:** backend · **Risk:** L1 · **Depends on:** S-006

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `GET /books?search=q` returns rows where `LOWER(book_name) LIKE %q%` OR `LOWER(author) LIKE %q%` (TC-020/021, US-05 AC1). |
| AC2 | Empty `search` behaves as no filter (TC-022, US-05 AC2). |
| AC3 | SQLi probe in `?search=` returns 0 rows; table still exists (TC-023, T-01). |
| AC4 | `?author=X` filters case-insensitive exact match (TC-024, US-06). |
| AC5 | `?genre=X` filters case-insensitive exact match (TC-025, US-07). |
| AC6 | `?status=Read` returns only `Read` rows (TC-026, US-08 AC1). |
| AC7 | `?status=foo` → 422 (TC-027, US-08 AC2). |
| AC8 | Combined `?author=&genre=&status=&search=` composes with AND (TC-028). |
| AC9 | NFR Q-005: median latency for `GET /books` with 1 000 rows < 50 ms (TC-083). |

## Do-Not-Break
The contract of `GET /books` without params (S-004) — same response shape, same ordering, same 1 000-row cap.

## Out-of-Scope
- Pagination, sorting other than `created_at DESC`.
- Full-text search.
