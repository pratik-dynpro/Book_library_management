# S-004 · BUILD prompt

```text
Builder for S-004. Branch: packet/S-004-get-books. Mode: build.
Read: D18, D7 §3.2/§3.3, D17 TC-005…008, D12 §T-05,
packets/S-004-get-books/Packet_BRD.md and Packet_DESIGN.md.

TDD:

  1. Author backend/tests/test_read_books.py:
       test_list_empty_returns_empty_array
       test_list_orders_by_created_at_desc
       test_list_capped_at_1000
       test_get_by_id_found
       test_get_by_id_not_found_404
     Use db_session to insert rows via BookModel directly (bypassing
     POST to keep tests independent).

  2. pytest → red.

  3. Extend backend/crud.py with list_books, get_book, HARD_LIMIT=1000.

  4. Add the two GET routes in backend/main.py.

  5. pytest → green. ruff → 0.

  6. Smoke: insert 3 rows via curl POST (or psql), then
        curl localhost:8000/books | jq 'length'
        curl localhost:8000/books/1 | jq
     Record both outputs.

  7. Commit; update HANDOVER.md.

Abort:
  - The 1001-row test takes >5s → likely missing index from S-001;
    stop, do not patch tests to use a smaller threshold.
```
