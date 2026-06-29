# S-007 · BUILD prompt

```text
Builder for S-007. Branch packet/S-007-search-filter. Mode: build.
Read D18, D6, D7 §3.2, D17 TC-020…028 & TC-083, D12 §T-01,
Packet_BRD + DESIGN.

TDD:

  1. Author backend/tests/test_search_filter.py with:
       test_search_matches_title_substring_case_insensitive   (AC1a)
       test_search_matches_author_substring                   (AC1b)
       test_search_empty_returns_all                          (AC2)
       test_sql_injection_probe_safe                          (AC3)
       test_filter_by_author_case_insensitive                 (AC4)
       test_filter_by_genre_case_insensitive                  (AC5)
       test_filter_by_status                                  (AC6)
       test_invalid_status_returns_422                        (AC7)
       test_combined_filters_compose_AND                      (AC8)
     Each test seeds rows directly via BookModel.

  2. Author backend/tests/test_perf.py with one benchmark inserting
     1000 rows then measuring median latency of GET /books. Threshold
     50 ms.

  3. pytest -q → red on the new tests.

  4. Modify crud.list_books per DESIGN; modify the GET /books route
     to accept the four query params (use typing.Literal for status).

  5. pytest -q → green. ruff → 0.

  6. Smoke:
       curl 'localhost:8000/books?search=atomic'
       curl 'localhost:8000/books?genre=Self%20Help&status=Read'
     Record outputs.

  7. Commit + HANDOVER.

Abort:
  - Benchmark median > 50 ms → likely missing functional indexes
    (verify with EXPLAIN ANALYZE); stop, do NOT loosen the threshold.
  - AC8 fails because filters override rather than compose → that's
    a bug in list_books; fix it.
```
