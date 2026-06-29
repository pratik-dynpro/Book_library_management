# S-003 · ENG-QA prompt

```text
Fresh QA session. Read: D18, D6, D7 §3.1, D15b US-01, D17 TC-001…004 & TC-082,
F4 §4, packets/S-003-post-books/Packet_BRD.md. Do NOT read BUILD_prompt.

You may write only Evidence.md.

For each AC, write a verification command and capture its output:

  AC1: curl POST /books valid body → 201. jq on response confirms keys
       id, book_name, author, genre, status='Read', created_at (ISO 8601).

  AC2: psql -c "SELECT id, book_name, status FROM books ORDER BY id DESC LIMIT 1"
       returns the row created above.

  AC3: curl POST /books with body missing 'author' → 422 with FastAPI
       'field required' detail.

  AC4: status='Reading' → 422.
       status='read' (lowercase) → 201 AND DB stores 'Read'
       (psql confirms).

  AC5: book_name = "x" * 300 → 422.

  AC6: From the same session, query the DB and confirm the row exists
       (already done in AC2; cross-link).

False-pass hunt:
  - Open backend/schemas.py: confirm Literal["Read","Unread"] AND a
    validator that capitalizes input. Either alone is insufficient
    for AC4b.
  - Confirm model_config has extra='forbid'. A POST with an extra
    'rating': 5 field must return 422.
  - Temporarily break the route to `raise NotImplementedError` and
    rerun the tests — every test above must FAIL. Restore.

Regression: cd backend && pytest -q. All tests across S-002+S-003 green.

Final line: Verdict: GREEN | RED — <reason>.
```
