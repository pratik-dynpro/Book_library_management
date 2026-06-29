# S-006 · BUILD prompt

```text
Builder for S-006. Branch packet/S-006-delete-books. Mode: build.
Read D18, D7 §3.5, D15b US-04, D17 TC-011/012, Packet_BRD + DESIGN.

TDD:
  1. test_delete_book.py with:
       test_delete_returns_204_empty_body
       test_delete_removes_row
       test_delete_unknown_returns_404
  2. red → implement crud.delete_book + DELETE route → green.
  3. ruff → 0. Smoke via curl -X DELETE -i. Commit + HANDOVER.
```
