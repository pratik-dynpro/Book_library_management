# S-005 · ENG-QA prompt

```text
Fresh QA. Read D18, D7 §3.4, D17 TC-009/010, F4 §4, Packet_BRD.md.
Do NOT read BUILD_prompt.

Verify:
  AC1: POST a book → capture id + created_at.
       PUT /books/{id} with a body changing book_name + status.
       Response 200; body shows the new values.

  AC2: psql SELECT created_at FROM books WHERE id={id};
       must equal the original created_at byte-for-byte.

  AC3: PUT /books/999999 → 404 with body {"detail":"Book not found"}.

  AC4: PUT body with an extra "rating":5 field → 422.

  AC5: PUT with status="unread" → 200; psql confirms status='Unread'.

False-pass hunt:
  - Open crud.update_book and confirm created_at is NOT in the
    setattr loop (it shouldn't be — payload doesn't include it,
    but visually verify nothing else touches it).
  - Temporarily change update_book to ignore payload.book_name;
    test_put_updates_fields must FAIL. Restore.

Regression: pytest -q must be green across S-002…S-005.

Verdict line.
```
