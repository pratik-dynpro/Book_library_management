# S-011 · BUILD prompt

```text
Builder for S-011. Branch packet/S-011-edit-book-page. Mode: build.
Read D18 §0, D9 §5, D7 §3.3/§3.4, D15b US-03, Packet_BRD + DESIGN.

STEP 0 — SKILLS:
  - frontend-design: decide the loading-state treatment (skeleton vs.
    spinner-only). Skeleton recommended; pattern from ui-ux-pro-max.
  - ui-ux-pro-max: pick the skeleton pattern; confirm content height
    matches the form so there is no layout jump on swap.

STEP 1 — TDD:
  EditBook.test.jsx (with MSW):
    - test_prefills_from_get_book
    - test_skeleton_visible_while_loading
    - test_404_navigates_to_books_with_toast
    - test_put_success_navigates_to_books
    - test_put_422_renders_server_errors

STEP 2 — implement:
  - Extend services/api.js with getBook(id), updateBook(id, values).
  - Author FormSkeleton.jsx matching BookForm vertical rhythm.
  - Replace pages/EditBook.jsx stub.

STEP 3 — verify:
  - npm test -- --run → green.
  - npm run lint → 0.
  - Manual: edit an existing book, change status, save → toast +
    list reflects change.

STEP 4 — commit + HANDOVER.

Abort:
  - Need to modify BookForm to support edit → STOP. The contract was
    designed in S-010; if it's insufficient, file a defect packet
    against S-010 — don't widen the scope here.
```
