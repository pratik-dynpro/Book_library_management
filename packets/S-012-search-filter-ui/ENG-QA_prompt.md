# S-012 · ENG-QA prompt

```text
Fresh QA. Read D18 §0, D9 §3 & §6, D7 §3.2, F4 §4, Packet_BRD.
Do NOT read BUILD_prompt.

Seed 6 rows spanning 3 authors, 3 genres, both statuses, two titles
with the substring "ato".

Verify:
  AC1: /books shows a sticky filter bar above the grid containing a
       SearchBar + three dropdowns.
  AC2: Type "ato" slowly; Network shows exactly one GET /books?search=ato
       fired after ~250ms.
  AC3: Pick Author=<one>, Status=Read. URL becomes
       /books?author=...&status=Read; Network fires one combined request.
  AC4: Author dropdown shows only the 3 authors present, sorted A-Z.
       Genre dropdown similarly. Status is the fixed Any/Read/Unread.
  AC5: × button visible when search non-empty; click clears and re-fetches.
  AC6: With filters set, navigate to /add, then Back. Filters preserved
       (URL still shows them; UI matches).
  AC7: 360 px → filter bar wraps; no horizontal scroll.

False-pass hunt:
  - Reduce debounce to 0 locally; test_debounces_250ms_before_onChange
    must FAIL. Restore.
  - Confirm getBooks(params) skips empty params (Network shouldn't show
    "?author=&genre=" — those keys should be absent).
  - Confirm BookForm, BookCard, EditBook are unchanged in this packet
    (git diff path-scope check).

Regression: full backend pytest + full frontend vitest → green.

Verdict.
```
