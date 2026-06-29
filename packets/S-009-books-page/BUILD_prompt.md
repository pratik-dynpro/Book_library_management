# S-009 · BUILD prompt

```text
Builder for S-009. Branch packet/S-009-books-page. Mode: build.

Read D18 §0, D9 §3 & §6, D7 §3.2/§3.5, D15b US-02/US-04, D12 §T-02,
Packet_BRD + DESIGN.

STEP 0 — SKILL INVOCATIONS:
  - `frontend-design`: refine BookCard + ConfirmModal + Toast direction
    on top of the tokens chosen in S-008. Decide elevation, radii,
    badge styling, destructive-button color.
  - `ui-ux-pro-max`: confirm the catalog patterns for card, modal
    (focus trap, ESC-to-close, ARIA), and toast (live-region polite).
  - Update tokens.js if new tokens are added (e.g. `elevation`, `danger`).

STEP 1 — TDD:
  Author Books.test.jsx with MSW handlers for GET /books and DELETE /books/{id}:
    - test_lists_cards
    - test_empty_state_when_no_books
    - test_xss_payload_renders_as_text
    - test_delete_confirms_then_removes_card
    - test_delete_failure_shows_error_toast_and_keeps_card

STEP 2 — implement:
  - Extend services/api.js with deleteBook(id).
  - Author BookCard, ConfirmModal, Toast, ToastProvider.
  - Replace pages/Books.jsx stub with the real list page.
  - Mount <ToastProvider> in App.jsx around <Routes>.

STEP 3 — verify:
  - npm test -- --run → green.
  - npm run lint → 0.
  - Manual: with backend running and 3 seeded books, walk through
    list → delete (one) → confirm card removed + toast shown.
    Take 360 px and 1280 px screenshots; record paths.

STEP 4 — commit + HANDOVER.

Abort:
  - Modal not focus-trapped or missing ARIA → fix per ui-ux-pro-max;
    do not ship as-is.
  - Default Tailwind look on cards → re-invoke design skills; tokens
    are non-negotiable.
```
