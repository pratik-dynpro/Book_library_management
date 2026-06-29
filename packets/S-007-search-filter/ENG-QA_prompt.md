# S-007 · ENG-QA prompt

```text
Fresh QA. Read D18, D7 §3.2, D17 TC-020…028 & TC-083, F4 §4,
Packet_BRD.md. Do NOT read BUILD_prompt.

Seed via psql: 5 rows spanning two authors, three genres, both statuses,
two titles containing "atomic".

Verify each AC with curl + jq:

  AC1: ?search=atomic → 2 rows; ?search=ATOMIC → same 2 rows.
  AC2: ?search= (empty) → all 5 rows.
  AC3: ?search="'; DROP TABLE books;--" URL-encoded → returns []
       AND psql shows books table still exists.
  AC4: ?author=james%20clear → only rows with author 'James Clear'.
  AC5: ?genre=self%20help → exact case-insensitive match.
  AC6: ?status=Read → only Read rows. ?status=read same.
  AC7: ?status=foo → 422 with FastAPI Literal validation detail.
  AC8: ?author=james%20clear&status=Read → intersection. Try
       3-way combination too.
  AC9: pytest -q tests/test_perf.py — must pass under 50ms median.
       Record the benchmark output.

False-pass hunt:
  - Open crud.list_books; confirm all four params are checked with
    `if X:` guards (not `if X is not None:` — that would treat "" as
    a filter and break AC2).
  - Temporarily replace `or_(...)` with the title-only clause; AC1b
    must FAIL. Restore.
  - Run EXPLAIN ANALYZE on a search query in psql; confirm the
    functional indexes from S-001 are being hit (the plan should
    NOT be a Seq Scan against books for 1000 rows).

Regression: pytest -q across S-002…S-007 green.

Verdict line.
```
