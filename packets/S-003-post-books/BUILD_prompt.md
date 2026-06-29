# S-003 · BUILD prompt

```text
Builder for S-003. Mode: build. Branch: packet/S-003-post-books.

Read: D18, D6, D7 §3.1, D12 §T-06/§T-04, D15b US-01, D17 TC-001…004 & TC-082,
packets/S-003-post-books/Packet_BRD.md and Packet_DESIGN.md.

TDD order:

  1. Author backend/tests/test_create_book.py with one test per AC:
       test_create_201_returns_book              (AC1)
       test_create_persists_row                  (AC2 — query db_session)
       test_create_missing_field_422             (AC3)
       test_create_bad_status_422                (AC4a)
       test_create_lowercase_status_normalized   (AC4b)
       test_create_max_length_violation_422      (AC5)
     Each test uses the `client` and `db_session` fixtures from S-002.

  2. pytest → all red.

  3. Author backend/schemas.py per Packet_DESIGN §Schemas.

  4. Author backend/crud.py per Packet_DESIGN §CRUD.

  5. Add the POST /books route in backend/main.py per
     Packet_DESIGN §Route. Import crud + schemas; nothing else.

  6. pytest → green. ruff check backend → 0.

  7. Manual smoke: curl POST /books with the example from D7 §4.
     Record the JSON response in the session report.

  8. Commit and update HANDOVER.md.

Abort:
  - Test goes green BEFORE the route handler is implemented → false-pass,
    investigate the test (likely it asserts only on status code).
  - Pydantic validator on `status` accepts 'Reading' → fix the Literal
    or validator; do not weaken the test.
```
