# S-011 · ENG-QA prompt

```text
Fresh QA. Read D18 §0, D9 §5, D7 §3.3/§3.4, F4 §4, Packet_BRD.
Do NOT read BUILD_prompt.

Verify:
  AC1: POST a book; navigate to /edit/{id}; form is prefilled exactly
       with the GET response values.
  AC2: Throttle network to "Slow 3G"; reload /edit/{id}; skeleton is
       visible during the load; no layout jump on swap.
  AC3: Change book_name; Save → 200 → toast → /books; psql confirms
       update.
  AC4: Navigate to /edit/999999 → toast error + redirect to /books.
  AC5: Edit with book_name = "x" * 300 → 422 → inline error on
       book_name; rest of form preserved.
  AC6: git diff in BookForm.jsx vs. previous green commit must be EMPTY
       (no edits). Run `git log -p frontend/src/components/BookForm.jsx`
       and confirm last commit is from S-010.

False-pass hunt:
  - Pre-fill values must come from the API, not from a mock literal.
    Confirm Network shows GET /books/{id}.
  - Skeleton must actually render: pause MSW response 2s and watch.

Regression: pytest backend + npm test frontend → all green
across S-002…S-011.

Verdict.
```
