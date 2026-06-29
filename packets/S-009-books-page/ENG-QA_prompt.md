# S-009 · ENG-QA prompt

```text
Fresh QA. Read D18 §0, D9 §3 & §6, D7 §3.2/§3.5, D12 §T-02, F4 §4,
Packet_BRD. Do NOT read BUILD_prompt.

Verify:
  AC1: Backend up + 3 seeded books. Visit /books. Three cards visible,
       laid out 1col / 2col / 3col across breakpoints.
  AC2: Truncate books in psql. Reload /books. Empty-state card with
       a link/button to /add is visible.
  AC3: Each card shows title, author, genre pill, status badge,
       Edit, Delete.
  AC4: Click Delete → modal opens, focus is trapped (Tab cycles within
       it), ESC closes it. Confirm → row disappears without a full reload
       (no page flash); psql confirms row gone.
  AC5: Stop the backend; click Delete → red toast with an error message;
       card remains.
  AC6: Click Edit → URL changes to /edit/{id}. (Stub page is fine.)
  AC7: POST a book with book_name = "<script>alert('x')</script>"
       via curl. Reload /books. The literal text appears in the card;
       no alert fires.
  AC8: Resize to 360 px; no horizontal scroll; cards stack 1 column.
       Run document.body.scrollWidth in console; <= 360.
  AC9: npm run lint exit 0; npm test -- --run all green.
  AC10: Open Evidence.md (in progress); confirm builder recorded
        invocation of frontend-design + ui-ux-pro-max for the card +
        modal + toast styling. tokens.js has been extended (diff vs
        S-008 shows new keys for elevation / danger / etc).

False-pass hunt:
  - Run npm test with one assertion intentionally inverted in the
    XSS test (assert script DID execute) → must FAIL. Restore.
  - Lighthouse a11y quick check on the modal: focus restoration on
    close, aria-modal=true on the dialog.

Regression: backend pytest still green; Home page (S-008) still loads
and shows stats.

Verdict.
```
