# S-010 · BUILD prompt

```text
Builder for S-010. Branch packet/S-010-add-book-page. Mode: build.
Read D18 §0, D9 §4 & §6, D7 §3.1, D15b US-01/US-12, D10 Q-002,
Packet_BRD + DESIGN.

STEP 0 — SKILLS:
  - frontend-design: refine form treatment — input states (rest, hover,
    focus, error, disabled), label position, required-marker style,
    error message typography.
  - ui-ux-pro-max: pick the form pattern; confirm WCAG focus-ring
    contrast (≥3:1); confirm field grouping pattern (fieldset/legend
    for radios). Update tokens.js if new tokens are added.

STEP 1 — TDD:
  Author BookForm.test.jsx:
    - test_renders_all_four_fields
    - test_required_field_inline_error
    - test_calls_onSubmit_with_values
    - test_disabled_while_loading
    - test_server_errors_render_per_field
  Author AddBook.test.jsx (with MSW):
    - test_successful_post_navigates_to_books
    - test_422_renders_field_errors_from_api

STEP 2 — implement:
  - Extend services/api.js with createBook(values).
  - Author BookForm.jsx (props: initialValues, onSubmit, submitLabel,
    loading, serverErrors).
  - Replace pages/AddBook.jsx stub with the real page.

STEP 3 — verify:
  - npm test -- --run → green.
  - npm run lint → 0.
  - Manual: fill out form correctly → toast + redirect; submit empty
    → inline errors; submit with 300-char title → see API 422 → inline
    error on book_name.

STEP 4 — commit + HANDOVER.

Abort:
  - BookForm coupled to AddBook (cannot accept initialValues) → fix
    now; S-011 depends on the reusable contract.
```
