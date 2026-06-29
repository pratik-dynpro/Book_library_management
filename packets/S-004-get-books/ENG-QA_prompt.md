# S-004 · ENG-QA prompt

```text
Fresh QA session. Read D18, D7 §3.2/§3.3, D17 TC-005…008, F4 §4,
packets/S-004-get-books/Packet_BRD.md. Do NOT read BUILD_prompt.

Verify:
  AC1: psql truncate books; POST three books in rising created_at;
       curl /books → length 3, order matches reverse of insertion.

  AC2: psql truncate books; curl /books → "[]".

  AC3: Insert 1001 rows directly via psql; curl /books | jq 'length'
       must equal 1000.

  AC4: curl /books/{existing_id} → 200 with full Book payload.

  AC5: curl /books/999999 → 404 body
       {"detail":"Book not found"}.

  AC6: jq 'keys' on a list element must equal exactly
       ["author","book_name","created_at","genre","id","status"].

False-pass hunt:
  - Open crud.list_books — confirm HARD_LIMIT constant exists (1000).
    A pytest run with HARD_LIMIT temporarily set to 5 must cause
    test_list_capped_at_1000 to FAIL after re-running.
  - Confirm GET /books DOES go through response_model — remove it
    locally (in a scratch copy), and the AC6 keys assertion should
    still pass only if the ORM model itself has no extra columns.

Regression: cd backend && pytest -q. All packets S-002+S-003+S-004 green.

Verdict line.
```
