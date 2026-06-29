# S-010 · ENG-QA prompt

```text
Fresh QA. Read D18 §0, D9 §4 & §6, D7 §3.1, D10 Q-002, F4 §4, Packet_BRD.
Do NOT read BUILD_prompt.

Verify:
  AC1: /add renders four labeled inputs (book_name, author, genre)
       + two-option status control + Save + Cancel.
  AC2: Click Save with all fields empty → three inline errors visible,
       no network request fired (DevTools Network confirms).
  AC3: Status radios labeled Read / Unread; only one selectable.
  AC4: Fill valid form, Save → 201 returned, toast success, URL
       becomes /books, new card visible.
  AC5: book_name = "x" * 300 → API returns 422 → inline error under
       book_name shows FastAPI's message (or a humanized version).
  AC6: Tab through inputs in visual order; Enter on last field submits;
       Esc on a focused input does not clear typed text but blurs.
  AC7: Click Save twice rapidly → only one POST (Network shows 1).
       Button disabled + spinner visible during the in-flight request.
  AC8: 360 px → form readable, no horizontal scroll.
  AC9: npm run lint → 0; npm test -- --run → all green.

False-pass hunt:
  - Invert test_disabled_while_loading; must FAIL. Restore.
  - In DevTools, throttle network to "Slow 3G"; submit; confirm button
    is visibly disabled for the duration (proves AC7 isn't a no-op).

Regression: backend pytest + frontend tests + S-008 + S-009 all green.

Verdict.
```
