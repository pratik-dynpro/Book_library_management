# S-010 · Packet BRD — AddBook page + shared BookForm

**Module:** frontend · **Risk:** L1 · **Depends on:** S-003, S-009

## ACs

| ID | Criterion |
|----|-----------|
| AC1 | `/add` renders the 4-field form per D9 §4 using a new `BookForm` component (shared with S-011). |
| AC2 | All fields are required; submitting with any empty field shows an inline error under that field (US-12 AC1). |
| AC3 | `status` is presented as two radio buttons (or a select) with values `Read` / `Unread`. |
| AC4 | Submit calls `POST /books`; on 201 navigates to `/books` and shows a success toast. |
| AC5 | On API 422 the field-level error from FastAPI is shown under the offending field (US-12 AC2). |
| AC6 | Form is keyboard-navigable: Tab order matches visual order; Enter submits; Esc clears focus (NFR Q-002). |
| AC7 | Submit button is disabled and shows a spinner while in-flight; double-submits are impossible. |
| AC8 | Lint clean; smoke tests pass; 360 px layout intact. |
| AC9 | `frontend-design` + `ui-ux-pro-max` invoked for form treatment (input states, focus ring, error styling). |

## Do-Not-Break
S-008/S-009 (Home, Books). The new `BookForm` lives in `components/`.

## Out-of-Scope
- Edit page (S-011) — but the shared `BookForm` must accept `initialValues` so S-011 can reuse it.
- Cover image, ISBN lookup.
