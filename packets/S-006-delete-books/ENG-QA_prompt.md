# S-006 · ENG-QA prompt

```text
Fresh QA. Read D18, D7 §3.5, D17 TC-011/012, F4 §4, Packet_BRD.

Verify:
  AC1: POST a book → id=N. curl -i -X DELETE /books/N → status 204
       and Content-Length: 0.

  AC2: psql SELECT COUNT(*) FROM books WHERE id=N; → 0.

  AC3: curl -i -X DELETE /books/999999 → 404 body
       {"detail":"Book not found"}.

False-pass hunt:
  - Confirm crud.delete_book actually issues an ORM delete (grep for
    db.delete(row); a soft-update bug would set a deleted_at column
    instead, which we don't have).
  - Temporarily make delete_book return True without deleting →
    test_delete_removes_row must FAIL. Restore.

Regression: pytest -q across S-002…S-006 green.

Verdict.
```
