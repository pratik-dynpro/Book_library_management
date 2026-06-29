# S-005 · BUILD prompt

```text
Builder for S-005. Branch: packet/S-005-put-books. Mode: build.
Read: D18, D7 §3.4, D15b US-03, D17 TC-009/010, D12 §T-04,
packets/S-005-put-books/Packet_BRD.md and Packet_DESIGN.md.

TDD:

  1. Author backend/tests/test_update_book.py with:
       test_put_updates_fields                      (AC1)
       test_put_preserves_created_at                (AC2)
       test_put_unknown_id_returns_404              (AC3)
       test_put_extra_field_returns_422             (AC4)
       test_put_canonicalizes_lowercase_status      (AC5)
     Each test seeds rows via BookModel directly.

  2. pytest → red.

  3. Add BookUpdate to schemas.py; add update_book to crud.py;
     add the PUT route to main.py.

  4. pytest → green. ruff → 0.

  5. Manual smoke: POST a book, PUT a change, GET the book back,
     verify the diff. Record commands.

  6. Commit + HANDOVER.md.

Abort:
  - test_put_preserves_created_at fails because the loop touches
    created_at → that's a real bug; fix update_book, do not delete
    the test.
```
